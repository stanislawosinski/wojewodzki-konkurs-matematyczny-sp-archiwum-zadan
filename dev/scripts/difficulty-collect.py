#!/usr/bin/env python3
"""Collect a "Trudność" judging run into data/difficulty/rankings/ and check its quality.

Reads the run dir written by difficulty-prepare.py and filled by difficulty.workflow.mjs
(zestawy.json, meta.json, wynik-s<N>.json). A judge counts as done when his file parses and
ranks every one of his sets with exactly the set's five codes. Missing or invalid judges are
listed — rerun just those (workflow arg `only`) and collect again. Once all are done (or with
--partial), writes data/difficulty/rankings/<date>-<name>.json and reports:

  - split-half reliability of the new questions (odd vs even judges, Spearman-Brown),
  - stability of the questions already on the scale (with vs without this run).

It does not touch the sidecars — run dev/scripts/difficulty-fit.py afterwards.

    python3 dev/scripts/difficulty-collect.py --dir dev/work/difficulty/szkolne-kraj
"""
import argparse
import importlib.util
import json
import statistics as st
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RANKINGS = ROOT / "data" / "difficulty" / "rankings"
NON_RANKING = ("kody.json", "aliasy.json")

spec = importlib.util.spec_from_file_location("fit", Path(__file__).with_name("difficulty-fit.py"))
fit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fit)


def load_judge(path, sets):
    try:
        rankings = json.loads(path.read_text())["rankingi"]
    except (OSError, ValueError, KeyError, TypeError):
        return None
    seen = set()
    for rk in rankings:
        i = rk.get("zestaw", 0) - 1
        if not (0 <= i < len(sets)) or sorted(rk.get("kolejnosc", [])) != sorted(sets[i]):
            return None
        seen.add(i)
    return rankings if len(seen) == len(sets) else None


def scale(judges, codes, panel):
    raw = fit.bradley_terry(fit.pairs(judges))
    by_id = {codes[c]: v for c, v in raw.items()}
    zero = st.mean(by_id[q] for q in panel if q in by_id)
    return {q: v - zero for q, v in by_id.items()}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--dir", type=Path, required=True, help="run dir from difficulty-prepare.py")
    ap.add_argument("--model", default="opus", help="judge model recorded with the rankings (default opus)")
    ap.add_argument("--partial", action="store_true", help="write even if some judges are missing")
    args = ap.parse_args()

    meta = json.loads((args.dir / "meta.json").read_text())
    all_sets = json.loads((args.dir / "zestawy.json").read_text())
    judges, bad = [], []
    for j, sets in enumerate(all_sets, 1):
        rankings = load_judge(args.dir / f"wynik-s{j}.json", sets)
        if rankings is None:
            bad.append(j)
        else:
            judges.append({"grupa": meta["name"], "model": args.model, "sedzia": j,
                           "zestawy": sets, "rankingi": rankings})
    print(f"{meta['name']}: {len(judges)}/{len(all_sets)} judges complete")
    if bad:
        print(f"missing or invalid: {bad}\n  rerun the workflow with args.only = {json.dumps(bad)}")
        if not args.partial:
            raise SystemExit(1)

    out = RANKINGS / f"{meta['date']}-{meta['name']}.json"
    out.write_text(json.dumps(judges, ensure_ascii=False))
    print(f"wrote {out.relative_to(ROOT)}")

    codes = json.loads((RANKINGS / "kody.json").read_text())
    panel = set(json.loads((ROOT / "data" / "difficulty" / "panel.json").read_text()))
    others = []
    for f in sorted(RANKINGS.glob("*.json")):
        if f.name not in NON_RANKING and f != out:
            others += [j for j in json.loads(f.read_text()) if j.get("model") in fit.SCALE_MODELS]
    if args.model not in fit.SCALE_MODELS:
        print(f"model {args.model} is not in SCALE_MODELS — difficulty-fit.py will ignore this run")
        return
    before = scale(others, codes, panel)
    after = scale(others + judges, codes, panel)
    old = [q for q in before if q in after]
    if len(old) > 2:
        r = st.correlation([before[q] for q in old], [after[q] for q in old])
        shift = st.mean(after[q] - before[q] for q in old)
        print(f"stability of {len(old)} questions already on the scale: r = {r:.3f}, mean shift {shift:+.2f}"
              "  (expect r >= 0.99, |shift| <= 0.1)")
    a = scale(others + [j for j in judges if j["sedzia"] % 2], codes, panel)
    b = scale(others + [j for j in judges if not j["sedzia"] % 2], codes, panel)
    new = [q for q in a if q in b and q not in before]
    if len(new) > 2:
        r = st.correlation([a[q] for q in new], [b[q] for q in new])
        print(f"split-half reliability of {len(new)} new questions: r = {r:.2f}, "
              f"Spearman-Brown {2 * r / (1 + r):.2f}  (expect >= 0.9)")
    print("next: python3 dev/scripts/difficulty-fit.py && (cd browser && node build.mjs)")


if __name__ == "__main__":
    main()
