#!/usr/bin/env python3
"""Tier 0 crop QA -- text-layer detectors over every figure's crop box.

Why the text layer and not more pixels: figcrop.py's signals() probes a 3px band
just outside the box, so ink detached by more than that is invisible to it --
wojewodzki_2020_podlaskie_q1 lost its only numeric label and was missed by 6px.
Widening the band is not the fix, because a wide band swallows prompt prose and
floods the flag list. Telling prose from figure labels is the fix, and the PDF
gives that away for free: exact glyphs, fonts, and the bbox of every embedded
image, no OCR and no rasterising.

Verified against q1: the '3 sqrt3 cm' span sits at px (990,328)-(1104,369),
matching the ink measured off the page render, and the trapezoid is an image
block at px [1103,181,1440,533] -- the label's right edge touches the image, and
the old crop box started at x1100.

Severity is the worklist: **high means "solve this question and check"**, med is
noise-adjacent. Needs a current $FIGWORK/audit.tsv -- run `figcrop.py audit` first.

    python3 scripts/figtext.py    # -> crop-flags.tsv + summary
"""
import os, re, sys, json, glob, math, html, collections

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('FIGWORK', '/private/tmp/konkurs-figwork')
sys.path.insert(0, os.path.join(REPO, 'scripts'))
import figcrop as fc                                             # noqa: E402
import fitz                                                      # noqa: E402
import numpy as np                                               # noqa: E402

PT2PX = 200 / 72.0     # audit boxes are 200-dpi page pixels; fitz reports points
MARGIN = 100           # px: how far outside the box a label still counts as stranded
PROSE_WORDS = 4        # a figure label is never this many words
EDGE_SLACK = 8         # px an image block may poke out of the box before it counts
LOST_INK = 200         # px of the embedded image's own ink outside the box to matter
OUT = os.path.join(REPO, 'crop-flags.tsv')   # $FIGWORK is reaped nightly, the repo is not

TAG = re.compile(r'<[^>]+>')
DIGIT = re.compile(r'\d')


def plain(h):
    return html.unescape(TAG.sub(' ', h or ''))


def norm(s):
    return re.sub(r'\s+', ' ', s).strip().lower()


def qindex():
    """-> ({figure_png: question record}, {(src, page): prose of every question there})

    The page corpus matters more than the figure's own question: a crop sits in a
    column of other questions, and their prompts and choices are the things most
    easily mistaken for figure labels.
    """
    out, corpus = {}, collections.defaultdict(list)
    for fp in sorted(glob.glob(os.path.join(REPO, 'browser/data/*.json'))):
        d = json.load(open(fp))
        for q in d['questions']:
            for f in (q.get('figures') or []):
                out[f] = q
            t = plain(q.get('prompt_html')) + ' ' + ' '.join(
                plain(c.get('html')) for c in (q.get('choices') or []))
            for p in (q['page'] - 1, q['page'], q['page'] + 1):
                corpus[(d['source_file'], p)].append(t)
    return out, {k: norm(' '.join(v)) for k, v in corpus.items()}


_pages = collections.OrderedDict()


def structure(src, pgno):
    """-> (text_lines, image_blocks) for one page, all bboxes in 200-dpi px.

    A text line is the unit of the prose test: figure labels sit alone on a line,
    prose does not. Spans are merged back into their line for that reason.
    """
    key = (src, pgno)
    if key in _pages:
        return _pages[key]
    lines, images = [], []
    try:
        doc = fitz.open(os.path.join(REPO, 'pdfs', src))
        pg = doc[pgno - 1]
        for b in pg.get_text('dict')['blocks']:
            bb = [v * PT2PX for v in b['bbox']]
            if b.get('type') != 0:
                images.append(bb)
                continue
            for ln in b['lines']:
                t = ''.join(s['text'] for s in ln['spans'])
                if not t.strip():
                    continue
                lines.append(dict(box=[v * PT2PX for v in ln['bbox']], text=t,
                                  fonts=sorted({s['font'] for s in ln['spans']})))
        doc.close()
    except Exception as e:                    # a page that will not open is a finding
        lines, images = [], [('ERROR', str(e))]
    if len(_pages) > 40:
        _pages.popitem(last=False)
    _pages[key] = (lines, images)
    return lines, images


def frac_inside(box, b):
    """How much of bbox b lies within the crop box (0..1)."""
    x, y, w, h = box
    ix = max(0.0, min(x + w, b[2]) - max(x, b[0]))
    iy = max(0.0, min(y + h, b[3]) - max(y, b[1]))
    return ix * iy / max(1e-6, (b[2] - b[0]) * (b[3] - b[1]))


def gap(box, b):
    """Shortest distance from bbox b to the crop box; 0 if they touch."""
    x, y, w, h = box
    dx = max(x - b[2], b[0] - (x + w), 0.0)
    dy = max(y - b[3], b[1] - (y + h), 0.0)
    return math.hypot(dx, dy)


def lost_ink(src, pgno, box, im):
    """Ink of the embedded image `im` that the crop box excludes, in px."""
    G = fc.page(src, pgno)
    if G.ndim > 2:
        G = G[..., :3].mean(2)
    H, W = G.shape[:2]
    ix0, iy0 = max(0, int(round(im[0]))), max(0, int(round(im[1])))
    ix1, iy1 = min(W, int(round(im[2]))), min(H, int(round(im[3])))
    if ix1 <= ix0 or iy1 <= iy0:
        return 0
    m = G[iy0:iy1, ix0:ix1] < fc.INK
    x, y, w, h = box
    cx0, cy0 = max(ix0, x) - ix0, max(iy0, y) - iy0
    cx1, cy1 = min(ix1, x + w) - ix0, min(iy1, y + h) - iy0
    if cx1 > cx0 and cy1 > cy0:
        m[cy0:cy1, cx0:cx1] = False      # what the box keeps is not lost
    return int(m.sum())


CHOICE = re.compile(r'^[A-D]\s*[.)]\s')      # 'D.  163,3' -- an option, never a label

# Page furniture: short, isolated and numeric exactly like a figure label, but it
# belongs to the exam paper, not to any question, so no prose corpus contains it.
# This was 262 of the first run's 616 stranded-label flags.
FURNITURE = re.compile(r'''(?ix)
    ^[A-D]\s*[.)]?$                    # option marker alone on its line
  | ^zadanie\b | ^rozwi | ^brudnopis | ^prawda | ^fa[lł]sz
  | ^stopie[nń]\b | ^konkurs | ^etap\b | ^wojew | ^strona\b
  | ^[.\s…]*[/\\]\s*\d+ | ^[.…\s]+$     # '......./3' score box, dotted answer rule
''')
BARE_NUM = re.compile(r'^\d{1,2}$')    # page or point count -- unless it is on the figure


def is_prose(line, qnorm):
    t = line['text'].strip()
    if len(t.split()) >= PROSE_WORDS or CHOICE.match(t):
        return True
    n = norm(t)
    return len(n) >= 8 and n in qnorm


def main():
    rows = fc._audit_rows()
    figs, _ = fc.index()          # audit.tsv omits the source PDF; index() has it
    qi, corpus = qindex()
    flags, stats = [], collections.Counter()

    def flag(r, det, sev, detail):
        flags.append((r['fig'], r['hash'], det, sev, detail))
        stats[det] += 1

    for i, r in enumerate(rows, 1):
        if i % 200 == 0:
            print(f'  ...{i}/{len(rows)}', file=sys.stderr)
        q = qi.get(r['fig'])
        if q is None:
            flag(r, 'no-question', 'high', 'figure not referenced by any question')
            continue
        src = figs[r['fig']][3]
        lines, images = structure(src, r['page'])
        if images and images[0] and images[0][0] == 'ERROR':
            flag(r, 'page-error', 'high', images[0][1])
            continue

        box = (r['x'], r['y'], r['w'], r['h'])
        prompt = plain(q.get('prompt_html'))
        choices = ' '.join(plain(c.get('html')) for c in (q.get('choices') or []))
        qnorm = corpus.get((src, r['page']), norm(prompt + ' ' + choices))

        inside_lines, near, straddle = [], [], []
        for ln in lines:
            f = frac_inside(box, ln['box'])
            if f > 0.9:
                inside_lines.append(ln)
            elif f > 0.1:
                straddle.append(ln)
            elif gap(box, ln['box']) <= MARGIN:
                near.append(ln)

        # D1 -- a figure label left outside the crop (the q1 class)
        for ln in near:
            t = ln['text'].strip()
            if is_prose(ln, qnorm) or FURNITURE.match(t):
                continue
            touches_fig = any(frac_inside(box, im) > 0.3 and gap(im, ln['box']) <= 6
                              for im in images)
            if BARE_NUM.match(t) and not touches_fig:
                continue          # '3' beside the box is a page number; '3' on it is a side
            # high == on the solve worklist. A label touching the figure is the
            # q1 signature; a stray number further out is usually page furniture
            # the stopword list did not name.
            sev = 'high' if touches_fig else 'med'
            flag(r, 'stranded-label', sev,
                 f'{ln["text"].strip()!r} {gap(box, ln["box"]):.0f}px outside'
                 + (' touching the figure image' if touches_fig else ''))

        # D1b -- a label the box cuts in half
        for ln in straddle:
            if not is_prose(ln, qnorm) and not FURNITURE.match(ln['text'].strip()):
                flag(r, 'label-straddles-edge', 'high',
                     f'{ln["text"].strip()!r} {frac_inside(box, ln["box"]):.0%} inside')

        # D2 -- prompt prose dragged into the crop
        for ln in inside_lines:
            if is_prose(ln, qnorm):
                flag(r, 'prose-inside', 'med', repr(ln['text'].strip()[:60]))

        # D3 -- the embedded figure image itself is clipped.
        # The bbox overshoot alone is worthless: 252 of 282 overshoots are the
        # image's own white padding, which the crop trims on purpose. Only ink
        # counts, and only ink belonging to the image (prose beside the figure
        # sits in the same strip and must not be mistaken for the drawing).
        for im in images:
            if frac_inside(box, im) <= 0.3:
                continue
            over = max(box[0] - im[0], box[1] - im[1],
                       im[2] - (box[0] + box[2]), im[3] - (box[1] + box[3]))
            if over <= EDGE_SLACK:
                continue
            lost = lost_ink(src, r['page'], box, im)
            if lost > LOST_INK:
                flag(r, 'image-clipped', 'high',
                     f'{lost}px of the figure image lies outside the box ({over:.0f}px overshoot)')
            elif lost > 30:
                flag(r, 'image-clipped', 'med', f'{lost}px edge sliver outside the box')

        # D4 -- nothing in the figure can answer a quantitative question.
        # Only meaningful where the box carries text at all: a raster figure's
        # labels live in the bitmap, invisible here, so it is skipped not passed.
        if inside_lines:
            if DIGIT.search(choices) and not DIGIT.search(prompt) \
               and not any(DIGIT.search(l['text']) for l in inside_lines):
                flag(r, 'no-quantity', 'high', 'quantitative choices, no number in prompt or figure')
        else:
            stats['_opaque-box'] += 1

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w') as fh:
        fh.write('fig\thash\tdetector\tseverity\tdetail\n')
        for f in sorted(flags, key=lambda r: (r[3] != 'high', r[2], r[0])):
            fh.write('\t'.join(str(v) for v in f) + '\n')

    print(f'\n{len(rows)} figures audited, {len(flags)} flags on '
          f'{len({f[0] for f in flags})} figures')
    for k, v in sorted(stats.items(), key=lambda kv: -kv[1]):
        print(f'  {k:24} {v}')
    shortlist = sorted({f[0] for f in flags if f[3] == 'high'})
    print(f'\nsolve worklist (severity high): {len(shortlist)} figures')
    print(f'-> {OUT}')


if __name__ == '__main__':
    main()
