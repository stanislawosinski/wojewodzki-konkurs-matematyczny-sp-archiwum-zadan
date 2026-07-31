#!/usr/bin/env python3
"""figsheet.py [name ...] -> debug/figure-redraw-review.html

Side-by-side review of every vector redraw: left the shipped bitmap, right the
SVG inline at the same CSS size. Worst match@4px first, so review can stop when
the scores get boring. Each heading links its question hash into the local
browser (#inc=<hash> is the "Pokaż tylko id" filter).

With figure names on the command line, only those are included and the sheet
goes to debug/figure-subset-review.html instead — for reviewing one batch of
revisions without regenerating (and reloading) all 344.

Needs browser/data.*.json — run `node browser/build.mjs` first.
"""
import os, sys, glob, html, json
import cv2
from figcheck import score, ROOT, FIGS, SVGS

only = set(sys.argv[1:])
OUT = os.path.join(ROOT, 'debug',
                   'figure-subset-review.html' if only else 'figure-redraw-review.html')

qhash = {}
for s in ('szkolny', 'rejonowy', 'wojewodzki'):
    for q in json.load(open(os.path.join(ROOT, 'browser', f'data.{s}.json'))):
        for f in q.get('figures') or []:
            qhash[f[:-4]] = q['hash']

items = []
for svg in sorted(glob.glob(os.path.join(SVGS, '*.svg'))):
    name = os.path.basename(svg)[:-4]
    if only and name not in only:
        continue
    png = os.path.join(FIGS, name + '.png')
    h, w = cv2.imread(png, cv2.IMREAD_GRAYSCALE).shape
    s, _, _ = score(svg, png)
    items.append((s, name, w, h, open(svg).read().split('?>')[-1].strip()))

items.sort()
rows = [f'''<section><h2>{i}. {html.escape(name)} <a class=h href="../browser/index.html#inc={qhash.get(name, '')}" target=_blank>{qhash.get(name, '?')}</a> <span class=s>match@4px {s:.2f}</span></h2>
<div class=p><figure><figcaption>original {w}&times;{h}</figcaption><img src="../browser/figures/{name}.png" width={w}></figure>
<figure><figcaption>redraw</figcaption><div class=svg style="width:{w}px">{body}</div></figure></div></section>'''
        for i, (s, name, w, h, body) in enumerate(items, 1)]

lo = sum(1 for s, *_ in items if s < 0.75)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, 'w').write(f'''<!doctype html><meta charset=utf-8>
<title>figure redraw review</title><style>
body{{font:13px/1.4 system-ui;margin:2rem;background:#fafafa}}
section{{margin:0 0 2.5rem;border-top:1px solid #ddd;padding-top:.6rem}}
h2{{font-size:13px;font-weight:600;margin:0 0 .5rem}} .s{{color:#888;font-weight:400}}
.h{{color:#88a;font-weight:400;font-family:ui-monospace,monospace;text-decoration:none}} .h:hover{{text-decoration:underline}}
.p{{display:flex;gap:1.5rem;align-items:flex-start;flex-wrap:wrap}}
figure{{margin:0}} figcaption{{color:#999;font-size:11px;margin-bottom:.3rem}}
img,.svg{{background:#fff;border:1px solid #eee;display:block}}
.svg svg{{width:100%;height:auto;display:block}}
</style><p>{len(items)} figures, worst first. {lo} below 0.75.</p>{''.join(rows)}''')
print(f'{len(items)} figures ({lo} below 0.75) -> {OUT}')
