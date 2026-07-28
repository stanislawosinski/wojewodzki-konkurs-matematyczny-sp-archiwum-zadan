#!/usr/bin/env python3
"""Audit and re-crop question figures.

browser/figures/*.png are pdftoppm crops of the source PDF pages at 200 dpi. The crop
boxes were never recorded -- but they are exactly recoverable: re-render the page and
template-match the PNG into it, and the match is pixel-identical. Everything here builds
on that. Nothing is persisted; boxes are re-derived on demand.

  figcrop.py audit                    # scan every figure, score clipping evidence
  figcrop.py queue [hash|fig ...]     # build per-figure work items for review agents
  figcrop.py crop <fig> X Y W H       # preview a candidate box
  figcrop.py crop <fig> X Y W H --apply    # overwrite the figure in the repo
  figcrop.py revert <fig>             # restore from the pre-apply backup
  figcrop.py montage                  # contact sheets of unflagged figures
  figcrop.py sheet                    # recrop-review.html for the human gate
  figcrop.py --self-check
"""
import argparse, glob, hashlib, html, json, os, re, shutil, subprocess, sys
import cv2, numpy as np

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIGS = os.path.join(REPO, 'browser', 'figures')
WORK = os.environ.get('FIGWORK', '/private/tmp/konkurs-figwork')
DPI = 200
INK = 200          # gray < INK counts as ink
OUTSIDE_T = 0.002  # ink just outside the box -> something got clipped
BORDER_T = 0.01    # ink on the box's own edge -> clipped, or a stray rule got included


# --- corpus index -----------------------------------------------------------

def index():
    """-> {fig_filename: (hash, qid, page, source_file)}, {hash: (qid, page, src, figs)}"""
    figs, byhash = {}, {}
    for fp in sorted(glob.glob(os.path.join(REPO, 'browser/data/*.json'))):
        d = json.load(open(fp))
        for q in d['questions']:
            h = hashlib.sha1(q['id'].encode()).hexdigest()[:8]
            fl = q.get('figures') or []
            byhash[h] = (q['id'], q['page'], d['source_file'], fl)
            for f in fl:
                figs[f] = (h, q['id'], q['page'], d['source_file'])
    return figs, byhash


def todo_notes():
    """-> {hash: note} from data-todo.txt (may not exist once the list is cleared)."""
    p = os.path.join(REPO, 'data-todo.txt')
    if not os.path.exists(p):
        return {}
    out = {}
    for line in open(p):
        m = re.match(r'- ([0-9a-f]{8})\s*\((.*)\)', line.strip())
        if m:
            out.setdefault(m.group(1), m.group(2))
    return out


# --- page rendering ---------------------------------------------------------

_pcache = {}

def page(src, pg, color=False):
    """Render one page of pdfs/<src> at 200 dpi. None if it can't be rendered.

    Cache key includes the stage directory -- szkolny/, rejonowy/ and wojewodzki/ share
    PDF basenames, and collapsing them silently serves the wrong page.
    """
    if pg < 1:
        return None
    key = (src, pg, color)
    if key in _pcache:
        return _pcache[key]
    stem = os.path.join(WORK, 'pages', src.replace('/', '__')[:-4] + f'_{pg}')
    os.makedirs(os.path.dirname(stem), exist_ok=True)
    hits = glob.glob(stem + '-*.png')
    if not hits:
        try:
            subprocess.run(['pdftoppm', '-png', '-r', str(DPI), '-f', str(pg), '-l', str(pg),
                            os.path.join(REPO, 'pdfs', src), stem],
                           check=True, capture_output=True)
        except subprocess.CalledProcessError:
            _pcache[key] = None
            return None
        hits = glob.glob(stem + '-*.png')
        if not hits:
            _pcache[key] = None
            return None
    im = cv2.imread(hits[0], cv2.IMREAD_COLOR if color else cv2.IMREAD_GRAYSCALE)
    if len(_pcache) > 60:
        _pcache.pop(next(iter(_pcache)))
    _pcache[key] = im
    return im


def locate(figname, src, pg):
    """Find the figure's crop box in its page. -> (x, y, w, h, page, score) or None.

    Tries the recorded page first, then +-1: a handful of figures sit on the neighbouring
    page because the question spans a page break.

    Squared-difference finds an exact re-render. Figures with fine hatching are noisy
    enough under it to miss the cutoff, so fall back to correlation, which separates
    cleanly: a real match scores ~0.88, a figure genuinely absent from the PDF ~0.1.
    """
    F = cv2.imread(os.path.join(FIGS, figname), cv2.IMREAD_GRAYSCALE)
    if F is None:
        return None
    pages = [(p, page(src, p)) for p in (pg, pg + 1, pg - 1)]
    pages = [(p, P) for p, P in pages
             if P is not None and F.shape[0] <= P.shape[0] and F.shape[1] <= P.shape[1]]
    for p, P in pages:
        mn, _, loc, _ = cv2.minMaxLoc(cv2.matchTemplate(P, F, cv2.TM_SQDIFF_NORMED))
        if mn < 1e-2:
            return loc[0], loc[1], F.shape[1], F.shape[0], p, float(mn)
    for p, P in pages:
        _, mx, _, loc = cv2.minMaxLoc(cv2.matchTemplate(P, F, cv2.TM_CCOEFF_NORMED))
        if mx > 0.85:
            return loc[0], loc[1], F.shape[1], F.shape[0], p, float(mx)
    return None


# --- geometry ---------------------------------------------------------------

def signals(P, F, x, y, w, h, b=3):
    """(outside_ink, border_ink) -- how much evidence that this box is wrong."""
    def dens(a):
        return float((a < INK).mean()) if a.size else 0.0
    outside = max(dens(P[max(0, y - b):y, x:x + w]), dens(P[y + h:y + h + b, x:x + w]),
                  dens(P[y:y + h, max(0, x - b):x]), dens(P[y:y + h, x + w:x + w + b]))
    border = max(dens(F[:2]), dens(F[-2:]), dens(F[:, :2]), dens(F[:, -2:]))
    return outside, border


def autobox(P, x, y, w, h, pad=8, bridge=5, maxgrow=120):
    """Propose a corrected box: bounding box of the ink components the crop overlaps.

    ponytail: heuristic, ~75% right on its own -- every proposal goes to a review agent
    and the human contact sheet. Tune pad/bridge/maxgrow rather than adding a model here.
    """
    d = cv2.dilate((P < INK).astype(np.uint8), np.ones((bridge, bridge), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(d, 8)
    inside = np.zeros(lab.shape, bool)
    inside[y:y + h, x:x + w] = True
    keep = []
    for i in range(1, n):
        comp = lab == i
        overlap = int((comp & inside).sum())
        if not overlap:
            continue
        # mostly-inside components are the figure; tiny ones are dangling bits of it
        if overlap / comp.sum() > 0.5 or comp.sum() < 3000:
            keep.append(stats[i])
    if not keep:
        return x, y, w, h
    X1 = max(min(int(s[0]) for s in keep) - pad, x - maxgrow)
    Y1 = max(min(int(s[1]) for s in keep) - pad, y - maxgrow)
    X2 = min(max(int(s[0] + s[2]) for s in keep) + pad, x + w + maxgrow)
    Y2 = min(max(int(s[1] + s[3]) for s in keep) + pad, y + h + maxgrow)
    X1, Y1 = max(0, X1), max(0, Y1)
    X2, Y2 = min(P.shape[1], X2), min(P.shape[0], Y2)
    return X1, Y1, X2 - X1, Y2 - Y1


def context_png(src, pg, old, new, out, margin=250):
    """Page region around the figure, old box in red, new box in green."""
    P = page(src, pg, color=True)
    if P is None:
        return False
    xs = [old[0], new[0]]
    ys = [old[1], new[1]]
    xe = [old[0] + old[2], new[0] + new[2]]
    ye = [old[1] + old[3], new[1] + new[3]]
    X1, Y1 = max(0, min(xs) - margin), max(0, min(ys) - margin)
    X2, Y2 = min(P.shape[1], max(xe) + margin), min(P.shape[0], max(ye) + margin)
    im = P[Y1:Y2, X1:X2].copy()
    for box, col in ((old, (0, 0, 255)), (new, (0, 170, 0))):
        cv2.rectangle(im, (box[0] - X1, box[1] - Y1),
                      (box[0] + box[2] - X1, box[1] + box[3] - Y1), col, 2)
    cv2.imwrite(out, im)
    return True


# --- commands ---------------------------------------------------------------

def cmd_audit(a):
    figs, _ = index()
    notes = todo_notes()
    rows, unlocated = [], []
    for i, (f, (h, qid, pg, src)) in enumerate(sorted(figs.items()), 1):
        if i % 100 == 0:
            print(f'  ...{i}/{len(figs)}', file=sys.stderr)
        loc = locate(f, src, pg)
        if not loc:
            unlocated.append((f, h, qid, pg, src))
            continue
        x, y, w, hh, p, _ = loc
        o, b = signals(page(src, p), cv2.imread(os.path.join(FIGS, f), cv2.IMREAD_GRAYSCALE),
                       x, y, w, hh)
        flag = 'todo' if h in notes else ('flag' if (o > OUTSIDE_T or b > BORDER_T) else '')
        rows.append((f, h, qid, pg, p, x, y, w, hh, round(o, 5), round(b, 5), flag,
                     notes.get(h, '')))

    out = os.path.join(WORK, 'audit.tsv')
    os.makedirs(WORK, exist_ok=True)
    with open(out, 'w') as fh:
        fh.write('fig\thash\tqid\tpage_rec\tpage_found\tx\ty\tw\th\toutside\tborder\tflag\tnote\n')
        for r in rows:
            fh.write('\t'.join(str(v) for v in r) + '\n')
    with open(os.path.join(WORK, 'unlocated.tsv'), 'w') as fh:
        fh.write('fig\thash\tqid\tpage\tsource_file\n')
        for r in unlocated:
            fh.write('\t'.join(str(v) for v in r) + '\n')

    mism = [r for r in rows if r[3] != r[4]]
    print(f'located {len(rows)}  unlocated {len(unlocated)}')
    print(f'  todo-listed  {sum(1 for r in rows if r[11] == "todo")}')
    print(f'  newly flagged {sum(1 for r in rows if r[11] == "flag")}')
    print(f'  unflagged     {sum(1 for r in rows if not r[11])}')
    if mism:
        print(f'  page mismatches ({len(mism)}): ' + ', '.join(f'{r[0]} {r[3]}->{r[4]}' for r in mism))
    for r in unlocated:
        print(f'  UNLOCATED {r[0]} (page {r[3]} of {r[4]})')
    print(f'-> {out}')


def _audit_rows():
    p = os.path.join(WORK, 'audit.tsv')
    if not os.path.exists(p):
        sys.exit('run `figcrop.py audit` first')
    rows = []
    for line in open(p).read().splitlines()[1:]:
        c = line.split('\t')
        rows.append(dict(fig=c[0], hash=c[1], qid=c[2], page_rec=int(c[3]), page=int(c[4]),
                         x=int(c[5]), y=int(c[6]), w=int(c[7]), h=int(c[8]),
                         outside=float(c[9]), border=float(c[10]), flag=c[11],
                         note=c[12] if len(c) > 12 else ''))
    return rows


def cmd_queue(a):
    figs, byhash = index()
    rows = {r['fig']: r for r in _audit_rows()}
    if a.targets:
        want = set()
        for t in a.targets:
            if t in figs:
                want.add(t)
            elif t in byhash:
                want.update(byhash[t][3])
            else:
                sys.exit(f'unknown figure or hash: {t}')
        sel = [rows[f] for f in sorted(want) if f in rows]
    else:
        sel = [r for r in rows.values() if r['flag']]

    qdir = os.path.join(WORK, 'queue')
    os.makedirs(qdir, exist_ok=True)
    items = []
    for r in sel:
        _, _, _, src = figs[r['fig']]
        P = page(src, r['page'])
        old = (r['x'], r['y'], r['w'], r['h'])
        new = autobox(P, *old)
        d = os.path.join(qdir, r['fig'][:-4])
        os.makedirs(d, exist_ok=True)
        cv2.imwrite(os.path.join(d, 'old.png'), P[old[1]:old[1] + old[3], old[0]:old[0] + old[2]])
        cv2.imwrite(os.path.join(d, 'new.png'), P[new[1]:new[1] + new[3], new[0]:new[0] + new[2]])
        context_png(src, r['page'], old, new, os.path.join(d, 'context.png'))
        item = dict(fig=r['fig'], hash=r['hash'], qid=r['qid'], page=r['page'],
                    source_file=src, old=list(old), proposed=list(new),
                    note=r['note'], flag=r['flag'], dir=d)
        json.dump(item, open(os.path.join(d, 'item.json'), 'w'), indent=1)
        items.append(item)
    json.dump(items, open(os.path.join(WORK, 'queue.json'), 'w'), indent=1)
    print(f'{len(items)} work items -> {qdir}')


def cmd_crop(a):
    figs, _ = index()
    if a.fig not in figs:
        sys.exit(f'unknown figure: {a.fig}')
    _, _, pg, src = figs[a.fig]
    loc = locate(a.fig, src, pg)
    pfound = loc[4] if loc else pg
    P = page(src, pfound)
    if P is None:
        sys.exit(f'cannot render page {pfound} of {src}')
    x, y, w, h = a.box
    if x < 0 or y < 0 or x + w > P.shape[1] or y + h > P.shape[0]:
        sys.exit(f'box outside page ({P.shape[1]}x{P.shape[0]})')
    crop = P[y:y + h, x:x + w]
    if a.apply:
        dest = os.path.join(FIGS, a.fig)
        bak = os.path.join(WORK, 'orig', a.fig)
        os.makedirs(os.path.dirname(bak), exist_ok=True)
        if not os.path.exists(bak):
            shutil.copy2(dest, bak)
        cv2.imwrite(dest, crop)
        print(f'applied {a.fig}  -x {x} -y {y} -W {w} -H {h}  (backup {bak})')
    else:
        out = os.path.join(WORK, 'try', a.fig)
        os.makedirs(os.path.dirname(out), exist_ok=True)
        cv2.imwrite(out, crop)
        print(out)


def cmd_revert(a):
    for f in a.figs:
        bak = os.path.join(WORK, 'orig', f)
        if not os.path.exists(bak):
            print(f'no backup for {f}')
            continue
        shutil.copy2(bak, os.path.join(FIGS, f))
        print(f'reverted {f}')


def cmd_montage(a):
    rows = [r for r in _audit_rows() if not r['flag']]
    cols, per = 3, 12
    cw, ch = 420, 340
    mdir = os.path.join(WORK, 'montage')
    os.makedirs(mdir, exist_ok=True)
    idx = []
    for n in range(0, len(rows), per):
        chunk = rows[n:n + per]
        grid = np.full(((per // cols) * ch, cols * cw, 3), 235, np.uint8)
        cells = []
        for k, r in enumerate(chunk):
            im = cv2.imread(os.path.join(FIGS, r['fig']), cv2.IMREAD_COLOR)
            s = min((cw - 20) / im.shape[1], (ch - 40) / im.shape[0], 1.0)
            im = cv2.resize(im, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
            r0, c0 = (k // cols) * ch, (k % cols) * cw
            label = f'{chr(65 + k // cols)}{k % cols + 1}'
            grid[r0 + 30:r0 + 30 + im.shape[0], c0 + 10:c0 + 10 + im.shape[1]] = im
            cv2.rectangle(grid, (c0 + 8, r0 + 28),
                          (c0 + 12 + im.shape[1], r0 + 32 + im.shape[0]), (150, 150, 150), 1)
            cv2.putText(grid, label, (c0 + 10, r0 + 22), cv2.FONT_HERSHEY_SIMPLEX, 0.7,
                        (0, 0, 200), 2)
            cells.append(dict(cell=label, fig=r['fig'], hash=r['hash']))
        p = os.path.join(mdir, f'sheet{n // per:03d}.png')
        cv2.imwrite(p, grid)
        idx.append(dict(sheet=p, cells=cells))
    json.dump(idx, open(os.path.join(mdir, 'index.json'), 'w'), indent=1)
    print(f'{len(idx)} contact sheets covering {len(rows)} figures -> {mdir}')


def cmd_sheet(a):
    figs, _ = index()
    orig = os.path.join(WORK, 'orig')
    changed = sorted(os.path.basename(p) for p in glob.glob(os.path.join(orig, '*.png')))
    notes = todo_notes()
    parts = ["<title>Re-crop review</title><style>",
             "body{font:14px system-ui;margin:2rem;background:#fafafa}",
             "section{background:#fff;border:1px solid #ddd;border-radius:8px;",
             "padding:1rem;margin:1rem 0}",
             "h2{font-size:15px;margin:0 0 .5rem}.n{color:#a00}",
             ".r{display:flex;gap:1rem;align-items:flex-start;overflow-x:auto}",
             ".r figure{margin:0}.r img{max-height:340px;border:1px solid #ccc;background:#fff}",
             "figcaption{font-size:12px;color:#666}</style>",
             f"<h1>Re-crop review — {len(changed)} figures</h1>"]
    for f in changed:
        h = figs.get(f, ('?',))[0]
        note = notes.get(h, '')
        ctx = next((c for c in (os.path.join(WORK, s, f[:-4], 'context.png')
                                for s in ('queue', 'verify')) if os.path.exists(c)), '')
        parts.append(f"<section><h2>{html.escape(f)} <code>{h}</code>"
                     + (f" <span class=n>{html.escape(note)}</span>" if note else "")
                     + "</h2><div class=r>"
                     + f"<figure><img src='file://{orig}/{f}'><figcaption>before</figcaption></figure>"
                     + f"<figure><img src='file://{FIGS}/{f}'><figcaption>after</figcaption></figure>"
                     + (f"<figure><img src='file://{ctx}'><figcaption>page context</figcaption></figure>"
                        if ctx else "")
                     + "</div></section>")
    out = os.path.join(WORK, 'recrop-review.html')
    open(out, 'w').write('\n'.join(parts))
    print(out)


def self_check():
    """The one invariant worth guarding: localisation is exact, or every crop is garbage."""
    f = 'szkolny_2011-2012_warminsko-mazurskie_q14_fig1.png'
    src = 'szkolny/2011-2012_warminsko-mazurskie.pdf'
    loc = locate(f, src, 6)
    assert loc is not None, 'figure did not locate'
    x, y, w, h, p, score = loc
    # ponytail: no hardcoded box — re-cropping this figure would only make it stale.
    # Pixel-identity below is the invariant; the box is whatever it is.
    assert p == 6, f'located on wrong page: {loc}'
    P = page(src, p)
    F = cv2.imread(os.path.join(FIGS, f), cv2.IMREAD_GRAYSCALE)
    assert np.array_equal(P[y:y + h, x:x + w], F), 'page slice is not pixel-identical'
    print('self-check ok: crop boxes are exactly recoverable')


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--self-check', action='store_true')
    sub = ap.add_subparsers(dest='cmd')
    sub.add_parser('audit').set_defaults(fn=cmd_audit)
    q = sub.add_parser('queue'); q.add_argument('targets', nargs='*'); q.set_defaults(fn=cmd_queue)
    c = sub.add_parser('crop')
    c.add_argument('fig'); c.add_argument('box', nargs=4, type=int, metavar=('X', 'Y', 'W', 'H'))
    c.add_argument('--apply', action='store_true'); c.set_defaults(fn=cmd_crop)
    r = sub.add_parser('revert'); r.add_argument('figs', nargs='+'); r.set_defaults(fn=cmd_revert)
    sub.add_parser('montage').set_defaults(fn=cmd_montage)
    sub.add_parser('sheet').set_defaults(fn=cmd_sheet)
    a = ap.parse_args()
    if a.self_check:
        return self_check()
    if not a.cmd:
        return ap.print_help()
    a.fn(a)


if __name__ == '__main__':
    main()
