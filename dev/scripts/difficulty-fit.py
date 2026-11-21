#!/usr/bin/env python3
"""Fit the "Trudność" difficulty scale and write the data/difficulty sidecars.

Reads every data/difficulty/rankings/*.json (lists of judges: {grupa, model, sedzia, zestawy,
rankingi}) plus rankings/kody.json (anonymous code -> question id), keeps the judges whose model
is in SCALE_MODELS, turns each ranked set of five into its 10 ordered pairs and fits a
Bradley-Terry model (Hunter's MM algorithm; half a win and half a loss against a virtual
opponent of strength 1 as regularisation). The zero is then moved to the mean of the reference
panel (data/difficulty/panel.json), so values do not drift as more questions get judged.
Writes one sidecar per data file:

    data/difficulty/<data file>.json   {id: {logit, pct, pct_etap, n}}

See data/difficulty/README.md.

    python3 dev/scripts/difficulty-fit.py
"""
import json
import math
import statistics as st
from collections import defaultdict
from itertools import combinations
from pathlib import Path

SCALE_MODELS = {"opus"}  # pilot 2026-11-21: sonnet/haiku agree too weakly to share the scale
VERSION = 1

ROOT = Path(__file__).resolve().parents[2]
DIFF = ROOT / "data" / "difficulty"


def pairs(judges):
    out = []
    for j in judges:
        for rk in j["rankingi"]:
            i = rk["zestaw"] - 1
            if 0 <= i < len(j["zestawy"]) and sorted(rk["kolejnosc"]) == sorted(j["zestawy"][i]):
                o = rk["kolejnosc"]  # hardest first
                out += [(o[a], o[b]) for a, b in combinations(range(len(o)), 2)]
    return out


def bradley_terry(p, iters=500):
    items = sorted({x for ab in p for x in ab})
    wins = defaultdict(float)
    n = defaultdict(float)
    for a, b in p:
        wins[a] += 1
        n[(a, b)] += 1
        n[(b, a)] += 1
    nbrs = defaultdict(list)
    for (i, j), c in n.items():
        nbrs[i].append((j, c))
    s = {k: 1.0 for k in items}
    for _ in range(iters):
        new = {k: (wins[k] + 0.5) / (sum(c / (s[k] + s[j]) for j, c in nbrs[k]) + 1 / (s[k] + 1))
               for k in items}
        g = math.exp(st.mean(math.log(v) for v in new.values()))
        s = {k: v / g for k, v in new.items()}
    return {k: math.log(v) for k, v in s.items()}


def pct(value, pool):
    return round(sum(1 for v in pool if v < value) / len(pool), 3)


def main():
    codes = json.loads((DIFF / "rankings" / "kody.json").read_text())
    panel = set(json.loads((DIFF / "panel.json").read_text()))
    judges = []
    for f in sorted((DIFF / "rankings").glob("*.json")):
        if f.name not in ("kody.json", "aliasy.json"):
            judges += [j for j in json.loads(f.read_text()) if j.get("model") in SCALE_MODELS]
    p = pairs(judges)
    raw = bradley_terry(p)
    count = defaultdict(int)
    for a, b in p:
        count[a] += 1
        count[b] += 1

    by_id = {codes[c]: v for c, v in raw.items()}
    missing = panel - by_id.keys()
    if missing:
        raise SystemExit(f"panel questions without judgements: {sorted(missing)[:5]}")
    zero = st.mean(by_id[q] for q in panel)
    scale = {q: v - zero for q, v in by_id.items()}
    n_by_id = {codes[c]: k for c, k in count.items()}
    # exact reprints (dup) judged once: rankings/aliasy.json maps reprint id -> judged id
    aliases_file = DIFF / "rankings" / "aliasy.json"
    for dup, rep in (json.loads(aliases_file.read_text()) if aliases_file.exists() else {}).items():
        scale[dup] = scale[rep]
        n_by_id[dup] = n_by_id[rep]

    stage = lambda qid: qid.split("_", 1)[0]
    pool = sorted(scale.values())
    pools = defaultdict(list)
    for q, v in scale.items():
        pools[stage(q)].append(v)
    per_file = defaultdict(dict)
    for q, v in scale.items():
        per_file[q.rsplit("_q", 1)[0]][q] = {
            "logit": round(v, 2),
            "pct": pct(v, pool),
            "pct_etap": pct(v, pools[stage(q)]),
            "n": n_by_id[q],
        }
    for old in DIFF.glob("*.json"):
        if old.name != "panel.json":
            old.unlink()
    for stem, entries in per_file.items():
        if not (ROOT / "data" / "questions" / f"{stem}.json").exists():
            raise SystemExit(f"no data file for {stem}")
        (DIFF / f"{stem}.json").write_text(json.dumps(entries, ensure_ascii=False, indent=1, sort_keys=True) + "\n")
    print(f"v{VERSION}: {len(judges)} judges, {len(p)} pairs, {len(scale)} questions, "
          f"{len(per_file)} sidecars; zero = panel mean ({len(panel)} questions)")


if __name__ == "__main__":
    main()
