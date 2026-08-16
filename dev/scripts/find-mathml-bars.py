#!/usr/bin/env python3
"""Find questions whose MathML uses bare <mo>|</mo> length/abs bars.

Native browser MathML infers each bar's form (prefix/infix/postfix) from its
position in a flat <mrow>, so the middle bars render as infix operators with a
wide gap while the outer ones hug — giving inconsistent |AB | = | AC| spacing.

Lists every affected question with its short hash (= sha1(id)[:8], the id the
browser uses in its URL) so each can be eyeballed and, once happy, fixed with
--fix (replaces <mo>|</mo> with a zero-spacing, non-stretchy bar in place).

Usage:
  python3 scripts/find-mathml-bars.py            # list affected questions
  python3 scripts/find-mathml-bars.py --fix      # apply the spacing fix in place
"""

import glob
import hashlib
import json
import re
import sys

DATA = "data/questions/*.json"
BAR = "<mo>|</mo>"
# quotes are escaped: this string is spliced into a JSON string literal by the
# raw-text --fix path, so the attribute quotes must survive as \" in the file.
FIXED = '<mo lspace=\\"0\\" rspace=\\"0\\" stretchy=\\"false\\">|</mo>'


def texts(q):
    yield q.get("prompt_html", "")
    for c in q.get("choices", []) or []:
        yield c.get("html", "")
    yield (q.get("answer") or {}).get("solution_html", "") or ""


def main():
    fix = "--fix" in sys.argv[1:]
    total_q = total_bars = 0

    for path in sorted(glob.glob(DATA)):
        # --fix is a raw text replace: the data files use a custom compact
        # layout (single-line choice objects) that json.dump would reflow, so
        # never round-trip through the parser here.
        if fix:
            raw = open(path, encoding="utf-8").read()
            n = raw.count(BAR)
            if n:
                open(path, "w", encoding="utf-8").write(raw.replace(BAR, FIXED))
                total_bars += n
            continue

        d = json.load(open(path))
        for q in d.get("questions", []):
            n = sum(t.count(BAR) for t in texts(q))
            if not n:
                continue
            total_q += 1
            total_bars += n

            h = hashlib.sha1(q["id"].encode()).hexdigest()[:8]
            snippet = ""
            for t in texts(q):
                m = re.search(r"<mo>\|</mo>.{0,50}", t)
                if m:
                    snippet = re.sub(r"<[^>]+>", "", m.group(0))[:40]
                    break
            print(f"{h}\t{n:2d}\t{q['id']}\t{snippet}")

    if fix:
        print(f"\n{total_bars} bars fixed", file=sys.stderr)
    else:
        print(f"\n{total_q} questions affected, {total_bars} bars total", file=sys.stderr)


if __name__ == "__main__":
    main()
