#!/usr/bin/env python3
"""Prepare a "Trudność" judging run: pick unjudged questions, build the judges' files.

Selects questions from the built shards (browser/data.*.json — run `node build.mjs` first) that
are not judged yet, are not annulled and have an answer (official key or a corroborated model
answer). Exact reprints (`dup`) are judged once: a reprint of an already judged question, or of
another selected one, goes to rankings/aliasy.json instead of the run. Every selected question
gets an anonymous code (appended to rankings/kody.json) so judges cannot tell paper, stage or
year. Questions are grouped into sets of five — NEW_PER_SET new ones plus one anchor already on
the scale, spread across its whole range — never two from the same paper in one set; each new
question appears in about --appearances sets. Each judge gets --sets sets.

Writes into --out (default dev/work/difficulty/<name>/, gitignored):
    zadania-s<N>.json   the questions judge N needs (code, type, points, text, choices, key,
                        solution, figure paths) — MathML flattened to plain text
    zestawy-s<N>.txt    judge N's numbered sets
    zestawy.json        all judges' sets (difficulty-collect.py reads it)
    meta.json           run parameters

    python3 dev/scripts/difficulty-prepare.py --name szkolne-kraj --stage szkolny --exclude-woj wielkopolskie
    python3 dev/scripts/difficulty-prepare.py --name test --stage wojewodzki --limit 10 --dry-run

Then run dev/scripts/difficulty.workflow.mjs and dev/scripts/difficulty-collect.py
(see data/difficulty/README.md, "Jak ocenić kolejne zadania").
"""
import argparse
import hashlib
import html as htmllib
import json
import math
import os
import random
import re
from datetime import date
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DIFF = ROOT / "data" / "difficulty"
BROWSER = ROOT / "browser"
STAGES = ("szkolny", "rejonowy", "wojewodzki")
NEW_PER_SET = 4
TOKENS_PER_JUDGE = 110_000  # observed 2026-11-21 (Opus, 50 sets)


# --- MathML -> linear text ------------------------------------------------------------------

class _Node:
    def __init__(self, tag, parent=None):
        self.tag, self.children, self.parent = tag, [], parent


class _Parser(HTMLParser):
    VOID = {"br", "img", "hr", "mspace", "none", "mprescripts"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = self.cur = _Node("root")

    def handle_starttag(self, tag, attrs):
        node = _Node(tag, self.cur)
        self.cur.children.append(node)
        if tag not in self.VOID:
            self.cur = node

    def handle_endtag(self, tag):
        node = self.cur
        while node is not self.root and node.tag != tag:
            node = node.parent
        if node is not self.root:
            self.cur = node.parent

    def handle_data(self, data):
        self.cur.children.append(data)


def _group(x):
    x = x.strip()
    simple = re.fullmatch(r"[\w.,]+", x) or (x.startswith("√(") and x.endswith(")"))
    return x if simple else f"({x})"


def _render(node):
    if isinstance(node, str):
        return node
    kids = [c for c in node.children if not (isinstance(c, str) and not c.strip())]
    r = lambda c: _render(c)
    t = node.tag
    if t == "mfrac" and len(kids) >= 2:
        return f"{_group(r(kids[0]))}/{_group(r(kids[1]))}"
    if t == "msqrt":
        return f"√({''.join(r(c) for c in kids).strip()})"
    if t == "mroot" and len(kids) >= 2:
        return f"pierwiastek stopnia {r(kids[1]).strip()} z ({r(kids[0]).strip()})"
    if t == "msup" and len(kids) >= 2:
        return f"{_group(r(kids[0]))}^{_group(r(kids[1]))}"
    if t == "msub" and len(kids) >= 2:
        return f"{r(kids[0])}_{_group(r(kids[1]))}"
    if t == "msubsup" and len(kids) >= 3:
        return f"{r(kids[0])}_{_group(r(kids[1]))}^{_group(r(kids[2]))}"
    if t in ("p", "div", "br", "li", "tr"):
        return " " + "".join(r(c) for c in node.children) + " "
    if t in ("td", "th"):
        return " | " + "".join(r(c) for c in node.children)
    return "".join(r(c) for c in node.children)


def to_text(markup):
    p = _Parser()
    p.feed(markup or "")
    return re.sub(r"\s+", " ", htmllib.unescape(_render(p.root))).strip()


# --- selection and sets -----------------------------------------------------------------------

def judged_values():
    values = {}
    for f in DIFF.glob("*.json"):
        if f.name != "panel.json":
            values.update({q: v["logit"] for q, v in json.loads(f.read_text()).items()})
    return values


def item_text(q, code):
    a = q.get("answer") or {}
    figs = []
    for f in q.get("figures") or []:
        svg = BROWSER / "figures" / "svg" / (Path(f).stem + ".svg")
        figs.append(str(svg if svg.exists() else BROWSER / "figures" / f))
    key = a.get("correct") if a.get("correct") is not None else (a.get("model") or {}).get("answer")
    return {
        "kod": code,
        "typ": q["type"],
        "pkt": q["points"],
        "tresc": to_text(q["prompt_html"]),
        "odpowiedzi": " | ".join(f"{c.get('label')}: {to_text(c.get('html'))}" for c in (q.get("choices") or [])),
        "klucz": str(key),
        "rozwiazanie": to_text(a.get("solution_html") or q.get("sol_ai") or "")[:1200],
        "rysunki": figs,
    }


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--name", required=True, help="run name, e.g. szkolne-kraj (used in file names)")
    ap.add_argument("--stage", action="append", choices=STAGES, help="stage(s) to include (default: all)")
    ap.add_argument("--woj", action="append", help="only these voivodeships")
    ap.add_argument("--exclude-woj", action="append", default=[], help="skip these voivodeships")
    ap.add_argument("--from-year", type=int, help="first school year to include, e.g. 2020 for 2020/2021")
    ap.add_argument("--limit", type=int, help="take at most this many questions (for tests)")
    ap.add_argument("--appearances", type=int, default=8, help="sets per new question (default 8)")
    ap.add_argument("--sets", type=int, default=50, help="sets per judge (default 50)")
    ap.add_argument("--out", type=Path, help="work dir (default dev/work/difficulty/<name>)")
    ap.add_argument("--seed", type=int, default=0)
    ap.add_argument("--dry-run", action="store_true", help="do not touch kody.json / aliasy.json")
    args = ap.parse_args()

    questions = {}
    for stage in STAGES:
        shard = BROWSER / f"data.{stage}.json"
        if not shard.exists():
            raise SystemExit(f"missing {shard} — run: cd browser && node build.mjs")
        for q in json.loads(shard.read_text()):
            questions[q["id"]] = q

    codes_file = DIFF / "rankings" / "kody.json"
    aliases_file = DIFF / "rankings" / "aliasy.json"
    codes = json.loads(codes_file.read_text())
    aliases = json.loads(aliases_file.read_text()) if aliases_file.exists() else {}
    coded = set(codes.values())
    values = judged_values()
    by_hash = {q["hash"]: q["id"] for q in questions.values()}

    def wanted(q):
        a = q.get("answer") or {}
        return (q["id"] not in coded and q["id"] not in aliases and not q.get("annulled")
                and (a.get("correct") is not None or (a.get("model") or {}).get("corroborated"))
                and (not args.stage or q["stage"] in args.stage)
                and (not args.woj or q["wojewodztwo"] in args.woj)
                and q["wojewodztwo"] not in args.exclude_woj
                and (not args.from_year or int(q["school_year"][:4]) >= args.from_year))

    pool = sorted((q for q in questions.values() if wanted(q)), key=lambda q: q["id"])
    if args.limit:
        pool = pool[: args.limit]
    pool_ids = {q["id"] for q in pool}

    new_aliases = {}
    for q in pool:
        if q["id"] in new_aliases:
            continue
        dups = [by_hash[h] for h in (q.get("dup") or []) if h in by_hash]
        judged = next((d for d in dups if d in values), None)
        if judged:
            new_aliases[q["id"]] = judged
            continue
        for d in dups:
            if d in pool_ids and d > q["id"] and d not in new_aliases:
                new_aliases[d] = q["id"]
    new = [q for q in pool if q["id"] not in new_aliases]
    if not new:
        raise SystemExit("nothing to judge")

    width = max(4, len(str(len(codes) + len(new))))
    nxt = max((int(c[1:]) for c in codes), default=0) + 1
    new.sort(key=lambda q: hashlib.sha1(f"{args.name}{q['id']}".encode()).hexdigest())
    new_codes = {f"Z{nxt + i:0{width}d}": q["id"] for i, q in enumerate(new)}
    all_codes = codes | new_codes
    code_of = {v: k for k, v in all_codes.items()}

    anchors = sorted((code_of[q] for q in values if q in code_of), key=lambda c: values[all_codes[c]])
    if not anchors:
        raise SystemExit("no judged questions to anchor on")
    paper = lambda c: all_codes[c].rsplit("_q", 1)[0]

    rng = random.Random(args.seed or int(hashlib.sha1(args.name.encode()).hexdigest(), 16))
    new_list = list(new_codes)
    judges = math.ceil(len(new_list) * args.appearances / NEW_PER_SET / args.sets)
    sets, queue, anchor_i = [], [], 0
    while len(sets) < judges * args.sets:
        if len(queue) < 2 * NEW_PER_SET:
            queue += rng.sample(new_list, len(new_list))
        chosen, i = [], 0
        while len(chosen) < NEW_PER_SET and i < len(queue):
            c = queue[i]
            if c not in chosen and all(paper(c) != paper(x) for x in chosen):
                chosen.append(queue.pop(i))
            else:
                i += 1
        if len(chosen) < NEW_PER_SET:
            if len(new_list) < NEW_PER_SET * 2:
                raise SystemExit("too few questions from distinct papers to fill sets")
            queue += rng.sample(new_list, len(new_list))
            continue
        chosen.append(anchors[(anchor_i * 61) % len(anchors)])
        anchor_i += 1
        rng.shuffle(chosen)
        sets.append(chosen)

    out = args.out or ROOT / "dev" / "work" / "difficulty" / args.name
    out.mkdir(parents=True, exist_ok=True)
    per_judge = [sets[j * args.sets:(j + 1) * args.sets] for j in range(judges)]
    for j, js in enumerate(per_judge, 1):
        needed = sorted({c for s in js for c in s})
        (out / f"zadania-s{j}.json").write_text(json.dumps(
            [item_text(questions[all_codes[c]], c) for c in needed], ensure_ascii=False, indent=1))
        (out / f"zestawy-s{j}.txt").write_text("".join(f"{i}. {', '.join(s)}\n" for i, s in enumerate(js, 1)))
    (out / "zestawy.json").write_text(json.dumps(per_judge))
    (out / "meta.json").write_text(json.dumps({
        "name": args.name, "date": date.today().isoformat(), "new": len(new), "aliases": len(new_aliases),
        "judges": judges, "sets_per_judge": args.sets, "appearances": args.appearances,
        "argv": {k: (str(v) if isinstance(v, Path) else v) for k, v in vars(args).items()},
    }, ensure_ascii=False, indent=1))

    if not args.dry_run:
        codes_file.write_text(json.dumps(all_codes, ensure_ascii=False, indent=1, sort_keys=True))
        aliases_file.write_text(json.dumps(aliases | new_aliases, ensure_ascii=False, indent=1, sort_keys=True))
    print(f"{args.name}: {len(new)} questions to judge, {len(new_aliases)} reprints aliased, "
          f"{judges} judges x {args.sets} sets -> {out}")
    print(f"estimated cost: ~{judges * TOKENS_PER_JUDGE * args.sets / 50 / 1e6:.1f}M tokens (Opus)"
          + ("  [dry run: kody.json / aliasy.json untouched]" if args.dry_run else ""))


if __name__ == "__main__":
    main()
