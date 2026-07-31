#!/usr/bin/env python3
"""figangles.py [name ...] [--crops] [--quiet]

Lints the angle marks in browser/figures/svg/*.svg. Chamfer score (figcheck.py)
is blind to these defects — a figure with two backwards arcs still scores 0.92,
because the arc is 20px of ink in a 900px figure. So check the vector source
instead, where the geometry is exact.

The load-bearing fact: an arc centred on the vertex is convex by construction.
"Bends the wrong way" therefore means "centre is not at the vertex", which is a
distance comparison.

Checks, per angle arc (explicit `A` command or a polyline that fits a circle):

  A1 centre-off-vertex    centre must sit on the vertex the arc marks
  A2 endpoint-off-leg     both ends must touch the two sides forming the angle
  A3 span-mismatch        arc must span the interior angle, not its complement
  A4 label-outside-arc    a label inside the wedge must be housed by the arc
     arc-small-for-label  ... and the arc must be big enough to house it
  A5 right-angle-mark     INFO: reports which glyph the redraw used at a right
                          angle (square / arc / arc+dot) — conventions differ
                          per source, so this needs an eyeball, not a rule

`--crops` also writes debug/figure-angles-review.html: for every flagged mark, a
3x zoom of original | redraw around the vertex. That covers the one thing the
linter cannot know — whether the original marks that angle at all.

See FIGURE_REDRAW.md.
"""
import sys, os, re, math, glob, base64, html
import numpy as np, cv2
from figcheck import render, ROOT, FIGS, SVGS

import xml.etree.ElementTree as ET

OUT = os.path.join(ROOT, 'debug', 'figure-angles-review.html')
NS = '{http://www.w3.org/2000/svg}'

# ---------------------------------------------------------------- geometry

def mul(m, n):  # affine (a,b,c,d,e,f) as in SVG: x' = a x + c y + e
    a, b, c, d, e, f = m
    A, B, C, D, E, F = n
    return (a * A + c * B, b * A + d * B, a * C + c * D, b * C + d * D,
            a * E + c * F + e, b * E + d * F + f)


def app(m, p):
    a, b, c, d, e, f = m
    return (a * p[0] + c * p[1] + e, b * p[0] + d * p[1] + f)


IDENT = (1, 0, 0, 1, 0, 0)


def parse_transform(s):
    if not s:
        return IDENT, True
    m, ok = IDENT, True
    for fn, arg in re.findall(r'(\w+)\s*\(([^)]*)\)', s):
        v = [float(x) for x in re.findall(r'-?[\d.]+(?:[eE][-+]?\d+)?', arg)]
        if fn == 'translate':
            t = (1, 0, 0, 1, v[0], v[1] if len(v) > 1 else 0)
        elif fn == 'scale':
            t = (v[0], 0, 0, v[1] if len(v) > 1 else v[0], 0, 0)
        elif fn == 'matrix':
            t = tuple(v[:6])
        elif fn == 'rotate' and len(v) == 1:
            r = math.radians(v[0])
            t = (math.cos(r), math.sin(r), -math.sin(r), math.cos(r), 0, 0)
        else:
            ok = False       # rotate-about-point, skew: rare enough to bail on
            continue
        m = mul(m, t)
    return m, ok


def dist(p, q):
    return math.hypot(p[0] - q[0], p[1] - q[1])


def seg_dist(p, a, b):
    """distance from p to segment ab"""
    vx, vy = b[0] - a[0], b[1] - a[1]
    L = vx * vx + vy * vy
    t = 0 if L == 0 else max(0, min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy) / L))
    return dist(p, (a[0] + t * vx, a[1] + t * vy))


def intersect(a, b, c, d):
    """proper intersection point of segments ab, cd (None if parallel/no cross)"""
    r = (b[0] - a[0], b[1] - a[1])
    s = (d[0] - c[0], d[1] - c[1])
    den = r[0] * s[1] - r[1] * s[0]
    if abs(den) < 1e-9:
        return None
    t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / den
    u = ((c[0] - a[0]) * r[1] - (c[1] - a[1]) * r[0]) / den
    if -0.02 <= t <= 1.02 and -0.02 <= u <= 1.02:
        return (a[0] + t * r[0], a[1] + t * r[1])
    return None


def arc_centre(p1, p2, rx, ry, fa, fs):
    """SVG endpoint parameterization -> centre. Assumes x-axis-rotation 0."""
    dx, dy = (p1[0] - p2[0]) / 2, (p1[1] - p2[1]) / 2
    L = dx * dx / (rx * rx) + dy * dy / (ry * ry)
    if L > 1:
        rx *= math.sqrt(L); ry *= math.sqrt(L)
    num = rx * rx * ry * ry - rx * rx * dy * dy - ry * ry * dx * dx
    den = rx * rx * dy * dy + ry * ry * dx * dx
    c = math.sqrt(max(num / den, 0)) * (-1 if fa == fs else 1)
    return (c * rx * dy / ry + (p1[0] + p2[0]) / 2,
            -c * ry * dx / rx + (p1[1] + p2[1]) / 2), rx


def fit_circle(pts):
    """Kasa algebraic fit -> (centre, r, max residual)"""
    x = np.array([p[0] for p in pts]); y = np.array([p[1] for p in pts])
    A = np.column_stack([x, y, np.ones(len(x))])
    try:
        s, *_ = np.linalg.lstsq(A, x * x + y * y, rcond=None)
    except np.linalg.LinAlgError:
        return None, 0, 1e9
    cx, cy = s[0] / 2, s[1] / 2
    r2 = s[2] + cx * cx + cy * cy
    if r2 <= 0:
        return None, 0, 1e9
    r = math.sqrt(r2)
    res = max(abs(math.hypot(px - cx, py - cy) - r) for px, py in pts)
    return (cx, cy), r, res


def ang(p, c):
    return math.atan2(p[1] - c[1], p[0] - c[0])


def dang(a, b):
    """smallest absolute difference between two angles, in degrees"""
    d = abs(a - b) % (2 * math.pi)
    return math.degrees(min(d, 2 * math.pi - d))


# ---------------------------------------------------------------- SVG parsing

CMD = re.compile(r'([MmLlHhVvCcSsQqTtAaZz])|(-?\d*\.?\d+(?:[eE][-+]?\d+)?)')


def parse_path(d):
    """-> list of subpaths; each is (points, arcs, had_curve).
       points are the straight-line vertices in order; arcs are dicts."""
    toks = [(c, n) for c, n in CMD.findall(d)]
    i, cmd = 0, None
    cur = start = (0.0, 0.0)
    subs, pts, arcs, curved = [], [], [], False

    def flush():
        nonlocal pts, arcs, curved
        if len(pts) > 1 or arcs:
            subs.append((pts, arcs, curved))
        pts, arcs, curved = [], [], False

    def nums(k):
        nonlocal i
        v = []
        while len(v) < k and i < len(toks) and toks[i][0] == '':
            v.append(float(toks[i][1])); i += 1
        return v

    while i < len(toks):
        if toks[i][0]:
            cmd = toks[i][0]; i += 1
        elif cmd is None:
            i += 1; continue
        rel = cmd.islower()
        C = cmd.upper()
        if C == 'M':
            v = nums(2)
            if len(v) < 2: break
            cur = (cur[0] + v[0], cur[1] + v[1]) if rel else (v[0], v[1])
            flush(); start = cur; pts = [cur]
            cmd = 'l' if rel else 'L'      # implicit lineto for extra pairs
        elif C == 'L':
            v = nums(2)
            if len(v) < 2: break
            cur = (cur[0] + v[0], cur[1] + v[1]) if rel else (v[0], v[1])
            pts.append(cur)
        elif C in 'HV':
            v = nums(1)
            if not v: break
            if C == 'H': cur = (cur[0] + v[0] if rel else v[0], cur[1])
            else:        cur = (cur[0], cur[1] + v[0] if rel else v[0])
            pts.append(cur)
        elif C == 'A':
            v = nums(7)
            if len(v) < 7: break
            p2 = (cur[0] + v[5], cur[1] + v[6]) if rel else (v[5], v[6])
            arcs.append(dict(p1=cur, p2=p2, rx=v[0], ry=v[1], fa=int(v[3]), fs=int(v[4])))
            cur = p2
            pts.append(cur)                # keeps a following L connected
        elif C in 'CSQT':
            v = nums({'C': 6, 'S': 4, 'Q': 4, 'T': 2}[C])
            if len(v) < 2: break
            cur = (cur[0] + v[-2], cur[1] + v[-1]) if rel else (v[-2], v[-1])
            curved = True; pts.append(cur)
        elif C == 'Z':
            if pts: pts.append(start)
            cur = start
    flush()
    return subs


def load(path):
    """-> segs, arcs, texts, dots, ticks, ok
    ticks are short open 2-3 segment subpaths — how a square right-angle mark is drawn.
    Matching on *subpath shape* rather than "short segments nearby" is what keeps a bar
    chart (every corner perpendicular, short segments everywhere) from lighting up."""
    segs, arcs, texts, dots, ticks = [], [], [], [], []
    ok = True
    root = ET.parse(path).getroot()

    def walk(el, m, fill=''):
        nonlocal ok
        fill = el.get('fill') or fill
        t, good = parse_transform(el.get('transform'))
        if not good:
            ok = False
        m = mul(m, t)
        tag = el.tag.replace(NS, '')
        if tag == 'line':
            g = lambda k: float(el.get(k, 0))
            segs.append((app(m, (g('x1'), g('y1'))), app(m, (g('x2'), g('y2')))))
        elif tag in ('polyline', 'polygon'):
            v = [float(x) for x in re.findall(r'-?[\d.]+', el.get('points', ''))]
            p = [app(m, (v[i], v[i + 1])) for i in range(0, len(v) - 1, 2)]
            if tag == 'polygon' and p: p.append(p[0])
            add_poly(p, [])
        elif tag == 'rect':
            if (el.get('fill') or '').lower() not in ('#fff', '#ffffff', 'white'):
                g = lambda k: float(el.get(k, 0))
                x, y, w, h = g('x'), g('y'), g('width'), g('height')
                c = [app(m, p) for p in [(x, y), (x + w, y), (x + w, y + h), (x, y + h), (x, y)]]
                for i in range(4):
                    segs.append((c[i], c[i + 1]))
        elif tag == 'circle':
            r = float(el.get('r', 0)) * abs(m[0])
            dots.append((app(m, (float(el.get('cx', 0)), float(el.get('cy', 0)))), r))
        elif tag == 'path':
            # an angle mark is stroke-only; a filled path is a shape (the evenodd
            # two-disc shading in wojewodzki_2019-2020_malopolskie_q16 read as 4 arcs)
            solid = fill.lower() not in ('', 'none')
            for p, a, _ in parse_path(el.get('d', '')):
                add_poly(p, [] if solid else a, m)
        elif tag == 'text':
            fs = float(re.sub(r'[^\d.]', '', el.get('font-size', '16')) or 16) * abs(m[3])
            txt = ''.join(el.itertext()).strip()
            texts.append(dict(p=app(m, (float(el.get('x', 0)), float(el.get('y', 0)))),
                              fs=fs, s=txt))
        for ch in el:
            walk(ch, m, fill)

    def add_poly(p, a, m=IDENT):
        p = [app(m, q) for q in p]
        # an angle mark is a subpath that is exactly one arc and nothing else. A subpath
        # chaining several arcs (an S-curve, a circle as two semicircles, a lens) is shape
        # outline, and its arcs anchor to whatever vertex happens to sit a radius away.
        for x in (a if len(a) == 1 and len(p) <= 2 else []):
            if abs(x['rx'] - x['ry']) > 0.02 * max(x['rx'], 1):
                continue                              # an ellipse is never an angle mark
            c, r = arc_centre(app(m, x['p1']), app(m, x['p2']),
                              x['rx'] * abs(m[0]), x['ry'] * abs(m[3]), x['fa'], x['fs'])
            arcs.append(dict(c=c, r=r, p1=app(m, x['p1']), p2=app(m, x['p2']), kind='A'))
        if a:
            return                                    # explicit arc: not a polyline arc
        if 3 <= len(p) <= 4 and dist(p[0], p[-1]) > 1:
            L = sum(dist(p[i], p[i + 1]) for i in range(len(p) - 1))
            if L < 90:
                ticks.append(p)
        # a run of >=5 points that fits a circle is a hand-tessellated arc, not an outline
        if len(p) >= 5:
            c, r, res = fit_circle(p)
            span = dang(ang(p[0], c), ang(p[-1], c)) if c else 0
            if c and res <= max(1.5, 0.03 * r) and span >= 15 and r < 1e4:
                arcs.append(dict(c=c, r=r, p1=p[0], p2=p[-1], kind='poly', elliptic=False))
                return
        for i in range(len(p) - 1):
            if dist(p[i], p[i + 1]) > 0.5:
                segs.append((p[i], p[i + 1]))

    walk(root, IDENT)
    return segs, arcs, texts, dots, ticks, ok


# ---------------------------------------------------------------- the checks

def vertices(segs):
    """junction points: shared endpoints and true crossings, clustered at 2px"""
    raw = [p for s in segs for p in s]
    # ponytail: O(n^2) over a few hundred segments; fine, and exact
    for i in range(len(segs)):
        for j in range(i + 1, len(segs)):
            x = intersect(*segs[i], *segs[j])
            if x:
                raw.append(x)
    vs = []
    for p in raw:
        for q in vs:
            if dist(p, q[0]) <= 2:
                q[1] += 1
                break
        else:
            vs.append([p, 1])
    return [p for p, n in vs if n >= 2]


def legs_at(v, segs):
    """unit directions of the segments meeting at v, deduped by angle"""
    out = []
    for a, b in segs:
        if seg_dist(v, a, b) > 2:
            continue
        for p in (a, b):
            L = dist(v, p)
            if L < 3:
                continue
            d = ((p[0] - v[0]) / L, (p[1] - v[1]) / L)
            if not any(dang(math.atan2(d[1], d[0]), math.atan2(e[1], e[0])) < 4 for e, _ in out):
                out.append((d, (a, b)))
    return out


def anchor(arc, vs):
    """the vertex this arc marks: both ends ~equidistant from it, at ~r"""
    r = arc['r']
    best, bestcost = None, 1e9
    for v in vs:
        d1, d2 = dist(v, arc['p1']), dist(v, arc['p2'])
        if not (0.55 * r <= d1 <= 1.7 * r and 0.55 * r <= d2 <= 1.7 * r):
            continue
        if abs(d1 - d2) > 0.3 * r:
            continue
        cost = abs(d1 - r) + abs(d2 - r) + abs(d1 - d2)
        if cost < bestcost:
            best, bestcost = v, cost
    return best


def in_wedge(p, v, d1, d2):
    """is p inside the angular sector spanned by directions d1,d2 at v?"""
    a = math.atan2(p[1] - v[1], p[0] - v[0])
    a1, a2 = math.atan2(d1[1], d1[0]), math.atan2(d2[1], d2[0])
    return abs(dang(a, a1) + dang(a, a2) - dang(a1, a2)) < 2


def check(name):
    svg = os.path.join(SVGS, name + '.svg')
    segs, arcs, texts, dots, ticks, ok = load(svg)
    out = []
    if not ok:
        out.append(('INFO', 'unsupported-transform', 'geometry may be misread', None))
    vs = vertices(segs)
    marks = []
    for k, arc in enumerate(arcs):
        v = anchor(arc, vs)
        if v is None:
            continue                       # a circle/curve in the drawing, not an angle mark
        r = arc['r']
        marks.append((k, arc, v))
        tag = f'arc{k}'
        off = dist(arc['c'], v)
        if off > max(2.5, 0.08 * r):
            out.append(('FAIL', 'centre-off-vertex',
                        f'{tag}: centre {off:.0f}px from the vertex (r={r:.0f}) — '
                        f'{"arc bulges toward the vertex" if off > 1.4 * r else "arc is not centred"}',
                        v, r))
            continue                        # everything below assumes a centred arc
        L = legs_at(v, segs)
        tol = max(3.0, 0.05 * r)
        # match each end to a leg by its *ray* from the vertex — at a crossing the same
        # segment supplies two opposite legs, so segment distance would pick either one
        hit = []
        for p in (arc['p1'], arc['p2']):
            m = []
            for i, (d, _) in enumerate(L):
                t = (p[0] - v[0]) * d[0] + (p[1] - v[1]) * d[1]
                if t <= 0:
                    continue
                m.append((math.hypot(p[0] - v[0] - t * d[0], p[1] - v[1] - t * d[1]), i))
            hit.append(min(m) if m else (1e9, -1))
        if not L:
            out.append(('WARN', 'no-legs', f'{tag}: no segments meet the vertex', v, r))
            continue
        if max(h[0] for h in hit) > tol:
            out.append(('FAIL', 'endpoint-off-leg',
                        f'{tag}: ends are {hit[0][0]:.0f}/{hit[1][0]:.0f}px off the sides (r={r:.0f})', v, r))
        elif hit[0][1] == hit[1][1]:
            out.append(('FAIL', 'both-ends-one-leg', f'{tag}: both ends on the same side', v, r))
        else:
            d1, d2 = L[hit[0][1]][0], L[hit[1][1]][0]
            interior = dang(math.atan2(d1[1], d1[0]), math.atan2(d2[1], d2[0]))
            span = dang(ang(arc['p1'], arc['c']), ang(arc['p2'], arc['c']))
            if abs(span - interior) > 8:
                out.append(('FAIL', 'span-mismatch',
                            f'{tag}: spans {span:.0f}° but the angle is {interior:.0f}°', v, r))
            # A4: a label sitting inside the wedge must be housed by the arc
            for t in texts:
                if not t['s']:
                    continue
                cp = (t['p'][0] + 0.3 * t['fs'], t['p'][1] - 0.33 * t['fs'])  # glyph centre-ish
                if dist(cp, v) > 2.2 * r or not in_wedge(cp, v, d1, d2):
                    continue
                if min(dist(cp, w) for w in vs) < dist(cp, v) - 1:
                    continue                # closer to another vertex: not this angle's label
                if dist(cp, v) > 1.05 * r:
                    out.append(('FAIL', 'label-outside-arc',
                                f'{tag}: "{t["s"]}" sits at {dist(cp, v):.0f}px, outside r={r:.0f}', v, r))
                elif r < 1.5 * t['fs']:
                    out.append(('WARN', 'arc-small-for-label',
                                f'{tag}: r={r:.0f} vs {t["fs"]:.0f}px glyph "{t["s"]}"', v, r))
            # A5: right angle -> report which glyph was used
            if abs(interior - 90) < 3:
                d = any(dist(dp, v) < 1.1 * r and rr <= max(6, 0.25 * r) and in_wedge(dp, v, d1, d2)
                        for dp, rr in dots)
                out.append(('INFO', 'right-angle-mark', f'{tag}: {"arc+dot" if d else "arc, no dot"}', v, r))
    # a square right-angle tick: a corner of short segments at a vertex where two *long*
    # sides meet perpendicularly (the tick's own corners are vertices too — ignore those)
    LONG = 40
    seen = [t[3] for t in out if t[1] == 'right-angle-mark' and t[3]]
    for v in vs:
        L = [(d, s) for d, s in legs_at(v, segs) if dist(*s) >= LONG]
        if len(L) < 2 or any(dist(v, w) < 5 for w in seen):
            continue
        if not any(abs(dang(math.atan2(a[1], a[0]), math.atan2(b[1], b[0])) - 90) < 3
                   for i, (a, _) in enumerate(L) for b, _ in L[i + 1:]):
            continue
        near = [t for t in ticks if min(dist(v, q) for q in t) < 0.6 * LONG]
        if near and not any(dist(a['c'], v) < 3 for a in arcs):
            out.append(('INFO', 'right-angle-mark', 'square tick (no arc)', v,
                        max(dist(v, q) for q in near[0])))
            seen.append(v)
    return out, svg


# ---------------------------------------------------------------- crop sheet

def crop(svg, png_path, v, r):
    """3x zoom of original | redraw around the vertex"""
    O = cv2.imread(png_path, cv2.IMREAD_GRAYSCALE)
    h, w = O.shape
    R = render(svg, w * 3, h * 3)
    half = max(int(1.9 * r), 45)
    x0, y0 = max(0, int(v[0]) - half), max(0, int(v[1]) - half)
    x1, y1 = min(w, int(v[0]) + half), min(h, int(v[1]) + half)
    if x1 - x0 < 8 or y1 - y0 < 8:
        return None
    a = cv2.resize(O[y0:y1, x0:x1], None, fx=3, fy=3, interpolation=cv2.INTER_LINEAR)
    b = R[y0 * 3:y1 * 3, x0 * 3:x1 * 3]
    pad = np.full((a.shape[0], 10), 200, np.uint8)
    return cv2.imencode('.png', np.hstack([a, pad, b[:a.shape[0], :a.shape[1]]]))[1].tobytes()


def sheet(rows):
    body = []
    for name, findings, svg in rows:
        png = os.path.join(FIGS, name + '.png')
        items = []
        for lvl, chk, msg, v, *rest in findings:
            r = rest[0] if rest else 40
            img = crop(svg, png, v, r) if v else None
            items.append(f'<div class=m><div class="l {lvl}">{lvl}</div>'
                         f'<div class=t><b>{chk}</b> {html.escape(msg)}</div>'
                         + (f'<img src="data:image/png;base64,{base64.b64encode(img).decode()}">'
                            if img else '') + '</div>')
        body.append(f'<section><h2>{html.escape(name)}</h2>{"".join(items)}</section>')
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    open(OUT, 'w').write(f'''<!doctype html><meta charset=utf-8>
<title>angle-mark review</title><style>
body{{font:13px/1.4 system-ui;margin:2rem;background:#fafafa}}
section{{margin:0 0 2rem;border-top:1px solid #ddd;padding-top:.6rem}}
h2{{font-size:13px;font-weight:600;margin:0 0 .5rem;font-family:ui-monospace,monospace}}
.m{{display:flex;gap:.8rem;align-items:flex-start;margin:.4rem 0}}
.l{{flex:0 0 3rem;font-size:11px;font-weight:600;padding:.1rem .3rem;border-radius:3px;text-align:center}}
.FAIL{{background:#fdd;color:#900}} .WARN{{background:#fe8;color:#750}} .INFO{{background:#eee;color:#666}}
.t{{flex:0 0 26rem;color:#333}} img{{background:#fff;border:1px solid #eee;max-width:46rem}}
</style><p>left = original, right = redraw, 3&times; zoom. {len(rows)} figures.</p>{"".join(body)}''')
    print(f'-> {OUT}', file=sys.stderr)


if __name__ == '__main__':
    names = [a for a in sys.argv[1:] if not a.startswith('--')]
    if not names:
        names = [os.path.basename(p)[:-4] for p in sorted(glob.glob(os.path.join(SVGS, '*.svg')))]
    rows, n_fail = [], 0
    for name in names:
        try:
            findings, svg = check(name)
        except Exception as e:                       # a parse blowup is itself a finding
            findings, svg = [('WARN', 'lint-error', f'{type(e).__name__}: {e}', None)], None
        if not findings:
            continue
        rows.append((name, findings, svg))
        n_fail += sum(1 for f in findings if f[0] == 'FAIL')
        if '--quiet' not in sys.argv:
            for lvl, chk, msg, *_ in findings:
                print(f'{name}\t{lvl}\t{chk}\t{msg}')
    print(f'# {len(names)} svg, {len(rows)} with findings, {n_fail} FAIL', file=sys.stderr)
    if '--crops' in sys.argv:
        sheet(rows)
