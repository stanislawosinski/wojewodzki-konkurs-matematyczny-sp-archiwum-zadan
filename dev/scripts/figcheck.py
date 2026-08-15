#!/usr/bin/env python3
"""figcheck.py <name|path.svg> [--sheet] [--all]

Scores a vector redraw (browser/figures/svg/<name>.svg) against the bitmap it
replaces (browser/figures/<name>.png).

  match@4px  symmetric chamfer: fraction of each side's ink lying within 4px of
             the other side's ink. 1.0 = identical. Strict pixel IoU is useless
             here — a 3px stroke offset scores ~0 on otherwise perfect geometry.
  --sheet    also writes <tmp>/figcheck/<name>.cmp.png:
             original | redraw | overlay (RED = lost, BLUE = invented)
  --all      score every SVG in browser/figures/svg, worst first

ponytail: MuPDF is the only rasterizer on this box, so SVG features it cannot
draw (filters, CSS, <polygon> closing edges) silently vanish — that is what the
score is for. See FIGURE_REDRAW.md.
"""
import sys, os, glob, tempfile
import numpy as np, cv2, fitz

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FIGS = os.path.join(ROOT, 'browser', 'figures')
SVGS = os.path.join(FIGS, 'svg')
CMP = os.path.join(tempfile.gettempdir(), 'figcheck')
INK = 200  # gray < INK counts as ink (same threshold figcrop.py uses)


def render(svg, w, h):
    d = fitz.open(svg)
    p = d[0]
    z = fitz.Matrix(w / p.rect.width, h / p.rect.height)
    pm = p.get_pixmap(matrix=z, colorspace=fitz.csGRAY, alpha=False)
    return np.frombuffer(pm.samples, np.uint8).reshape(pm.height, pm.width)[:h, :w]


def score(svg, png, sheet=False, tol=4):
    O = cv2.imread(png, cv2.IMREAD_GRAYSCALE)
    assert O is not None, png
    h, w = O.shape
    R = render(svg, w, h)
    a, b = O < INK, R < INK
    da = cv2.distanceTransform((~a).astype(np.uint8), cv2.DIST_L2, 3)
    db = cv2.distanceTransform((~b).astype(np.uint8), cv2.DIST_L2, 3)
    if not a.sum() or not b.sum():
        return 0.0, a.sum(), b.sum()
    iou = ((db[a] <= tol).sum() + (da[b] <= tol).sum()) / (a.sum() + b.sum())
    if sheet:
        bd, ad = db <= 2, da <= 2  # "near enough to the other side's ink"
        ov = np.dstack([np.where(a & ~bd, 255, 255 - b * 255)] * 3).astype(np.uint8)
        ov[a & ~bd] = (0, 0, 255)      # in the original, missing from the redraw
        ov[b & ~ad] = (255, 0, 0)      # invented by the redraw
        pad = np.full((h, 8, 3), 220, np.uint8)
        os.makedirs(CMP, exist_ok=True)
        out = os.path.join(CMP, os.path.basename(svg)[:-4] + '.cmp.png')
        cv2.imwrite(out, np.hstack([
            cv2.cvtColor(O, cv2.COLOR_GRAY2BGR), pad,
            cv2.cvtColor(R, cv2.COLOR_GRAY2BGR), pad, ov]))
        print(out)
    return iou, a.sum(), b.sum()


def resolve(arg):
    """accept a bare figure name, <name>.png, <name>.svg, or any path to one"""
    name = os.path.basename(arg)
    for ext in ('.svg', '.png'):
        if name.endswith(ext):
            name = name[:-4]
    return os.path.join(SVGS, name + '.svg'), os.path.join(FIGS, name + '.png')


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if '--all' in sys.argv:
        rows = []
        for svg in sorted(glob.glob(os.path.join(SVGS, '*.svg'))):
            name = os.path.basename(svg)[:-4]
            rows.append((score(svg, os.path.join(FIGS, name + '.png'))[0], name))
        rows.sort()
        for s, name in rows:
            print(f'{s:.3f}  {name}')
        v = [s for s, _ in rows]
        print(f'# n {len(v)}  mean {sum(v) / len(v):.3f}  <0.85 {sum(x < .85 for x in v)}', file=sys.stderr)
    else:
        svg, png = resolve(args[0])
        iou, ai, bi = score(svg, png, '--sheet' in sys.argv)
        print(f'match@4px {iou:.3f}   ink orig {ai}  redraw {bi}  ratio {bi / max(ai, 1):.2f}')
