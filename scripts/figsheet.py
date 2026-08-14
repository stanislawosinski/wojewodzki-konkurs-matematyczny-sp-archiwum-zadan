#!/usr/bin/env python3
"""figsheet.py [name ...] -> debug/figure-redraw-review.html

Side-by-side review of every vector redraw: left the shipped bitmap, right the
SVG at the same CSS size. Worst match@4px first, so review can stop when the
scores get boring.

Both panels are <img src>, so the redraws are read off disk on every reload —
edit an SVG and refresh, no regeneration. That also matches how browser/app.js
shows them (img.src swap), which inline SVG would not. Only the scores and the
ordering are baked in; rerun to refresh those. Each heading links its question hash into the local
browser (#inc=<hash> is the "Pokaż tylko id" filter).

Annotation: drag on either panel to box a problem area, type a comment. Boxes
are stored in viewBox/pixel units (both panels share that grid) so they point
at the same place in the SVG source and in the scan. Notes live in
localStorage; "copy JSONL" puts one line per annotated figure on the
clipboard, to be pasted into debug/figure-feedback.jsonl. The "ok" checkbox
signs a figure off (it fades but stays, so it can be unchecked); "copy OK list"
exports those as their own JSONL, for dropping them from the next review round.

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

# figures signed off via the sheet's "ok" checkbox; dropped from the full sheet,
# but still shown if you name one on the command line
OKFILE = os.path.join(ROOT, 'redraw-ok.jsonl')
done = ({json.loads(l)['figure'] for l in open(OKFILE) if l.strip()}
        if os.path.exists(OKFILE) else set())

items = []
for svg in sorted(glob.glob(os.path.join(SVGS, '*.svg'))):
    name = os.path.basename(svg)[:-4]
    if only and name not in only:
        continue
    if not only and name in done:
        continue
    png = os.path.join(FIGS, name + '.png')
    h, w = cv2.imread(png, cv2.IMREAD_GRAYSCALE).shape
    s, _, _ = score(svg, png)
    items.append((s, name, w, h))

items.sort()
SCALE = .75
rows = [f'''<section data-name="{name}" data-hash="{qhash.get(name, '')}" data-w={w} data-h={h}>
<h2>{i}. {html.escape(name)} <a class=h href="../browser/index.html#inc={qhash.get(name, '')}" target=_blank>{qhash.get(name, '?')}</a> <span class=s>match@4px {s:.2f}</span> <label class=ok><input type=checkbox> ok</label> <label class=xl><input type=checkbox> overlay</label> <button class=cp hidden>copy JSON</button> <span class=n></span></h2>
<div class=p><figure><figcaption>original {w}&times;{h}</figcaption><div class=ov><img src="../browser/figures/{name}.png" width={round(w * SCALE)}></div></figure>
<figure><figcaption>redraw</figcaption><div class=ov><img src="../browser/figures/svg/{name}.svg" width={round(w * SCALE)}><img class=x src="../browser/figures/{name}.png" width={round(w * SCALE)}></div></figure></div></section>'''
        for i, (s, name, w, h) in enumerate(items, 1)]

CSS = '''<style>
body{font:13px/1.4 system-ui;margin:2rem;background:#fafafa}
section{margin:0 0 2.5rem;border-top:1px solid #ddd;padding-top:.6rem}
h2{font-size:13px;font-weight:600;margin:0 0 .5rem} .s{color:#888;font-weight:400}
.h{color:#88a;font-weight:400;font-family:ui-monospace,monospace;text-decoration:none} .h:hover{text-decoration:underline}
.p{display:flex;gap:1.5rem;align-items:flex-start;flex-wrap:wrap}
figure{margin:0} figcaption{color:#999;font-size:11px;margin-bottom:.3rem}
img{background:#fff;display:block}
/* outline, not border: it draws outside the box, so .ov's content box stays
   exactly the image rect and box coords need no offset */
.ov{position:relative;display:inline-block;cursor:crosshair;outline:1px solid #eee}
.b{position:absolute;border:2px solid #e33;background:#e3333312;box-sizing:border-box;cursor:pointer}
.b>i{position:absolute;top:0;left:0;background:#e33;color:#fff;font:10px/1 system-ui;padding:2px 3px;font-style:normal}
.n{color:#e33;font-weight:400} button{font:11px system-ui;cursor:pointer}
.ok{color:#2a2;font-weight:400;cursor:pointer;user-select:none} .ok input{vertical-align:-1px}
/* blink comparator: the scan sits exactly on the redraw, so toggling it makes
   a mismatch jump. Opaque on purpose — a blend is harder to read than a flip. */
.xl{color:#66c;font-weight:400;cursor:pointer;user-select:none} .xl input{vertical-align:-1px}
.x{position:absolute;left:0;top:0;display:none} section.xray .x{display:block}
section.done{opacity:.4}          /* still there to re-check, just out of the way */
/* offset so the ring sits clear of the panels' own outlines */
section.cur{outline:2px solid #48f;outline-offset:8px}
#bar{position:fixed;right:1rem;bottom:1rem;background:#fff;border:1px solid #ccc;border-radius:4px;padding:.5rem;box-shadow:0 1px 6px #0002}
#bar button{display:block;width:100%;margin-top:.3rem}
</style><div id=bar><span id=tot>(js off)</span>
<button id=all>copy JSONL</button><button id=okc>copy OK list</button><button id=clr>clear all</button></div>'''

JS = '''<script>
// notes are kept in viewBox/pixel units; both panels render on that same grid
const KEY = 'figfeedback', store = JSON.parse(localStorage.getItem(KEY) || '{}')
const save = () => { localStorage.setItem(KEY, JSON.stringify(store)); tot() }
// "ok" is orthogonal to notes — a figure can be signed off with its old notes
// still attached, so keep it in its own key rather than as a flag on store
const OK = 'figok', okset = new Set(JSON.parse(localStorage.getItem(OK) || '[]'))
const saveok = () => { localStorage.setItem(OK, JSON.stringify([...okset])); tot() }
const rec = sec => ({figure: sec.dataset.name, hash: sec.dataset.hash,
  w: +sec.dataset.w, h: +sec.dataset.h, notes: store[sec.dataset.name] || []})
const copy = (t, el) => navigator.clipboard.writeText(t)
  .then(() => { el.textContent = 'copied'; setTimeout(() => el.textContent = el.dataset.t, 900) },
        () => prompt('copy this:', t))

function tot() {
  const n = Object.keys(store).length
  document.getElementById('tot').textContent =
    (n ? n + ' annotated' : 'no notes') + (okset.size ? ', ' + okset.size + ' ok' : '')
}
function draw(sec) {
  const list = store[sec.dataset.name] || []
  for (const ov of sec.querySelectorAll('.ov')) {
    ov.querySelectorAll('.b').forEach(b => b.remove())
    const s = ov.clientWidth / sec.dataset.w
    list.forEach((n, i) => {
      const b = document.createElement('div')
      b.className = 'b'
      b.style.cssText = `left:${n.box[0]*s}px;top:${n.box[1]*s}px;width:${n.box[2]*s}px;height:${n.box[3]*s}px`
      b.innerHTML = '<i></i>'
      b.firstChild.textContent = i + 1
      b.title = n.comment
      b.onmousedown = e => e.stopPropagation()   // ponytail: so you can't start a new box inside one
      b.onclick = () => {
        const v = prompt('comment (empty deletes this box)', n.comment)
        if (v === null) return
        v.trim() ? n.comment = v.trim() : list.splice(i, 1)
        if (!list.length) delete store[sec.dataset.name]
        save(); draw(sec)
      }
      ov.append(b)
    })
  }
  sec.querySelector('.n').textContent = list.length ? list.length + ' note(s)' : ''
  sec.querySelector('.cp').hidden = !list.length
}
const all = () => document.querySelectorAll('section')
for (const sec of all()) {
  const btn = sec.querySelector('.cp')
  btn.dataset.t = btn.textContent
  btn.onclick = () => copy(JSON.stringify(rec(sec)), btn)
  const cb = sec.querySelector('.ok input')
  cb.checked = okset.has(sec.dataset.name)
  sec.classList.toggle('done', cb.checked)
  cb.onchange = () => {
    cb.checked ? okset.add(sec.dataset.name) : okset.delete(sec.dataset.name)
    sec.classList.toggle('done', cb.checked)
    saveok()
  }

  // view-only, so not persisted — it is meant to be flipped, not left on
  const xb = sec.querySelector('.xl input')
  xb.onchange = () => sec.classList.toggle('xray', xb.checked)
  for (const ov of sec.querySelectorAll('.ov')) ov.onmousedown = e => {
    if (e.button) return
    e.preventDefault()                            // kills the browser's native image drag
    const r = ov.getBoundingClientRect(), s = ov.clientWidth / sec.dataset.w
    const x0 = e.clientX - r.left, y0 = e.clientY - r.top
    const box = document.createElement('div')
    box.className = 'b'; ov.append(box)
    let cur = [x0, y0, 0, 0]
    const move = e2 => {
      const x = e2.clientX - r.left, y = e2.clientY - r.top
      cur = [Math.min(x, x0), Math.min(y, y0), Math.abs(x - x0), Math.abs(y - y0)]
      box.style.cssText = `left:${cur[0]}px;top:${cur[1]}px;width:${cur[2]}px;height:${cur[3]}px`
    }
    const up = () => {
      removeEventListener('mousemove', move); removeEventListener('mouseup', up)
      box.remove()
      if (cur[2] < 6 || cur[3] < 6) return
      const c = prompt("what's wrong here?")
      if (!c || !c.trim()) return
      ;(store[sec.dataset.name] ||= []).push({box: cur.map(v => Math.round(v / s)), comment: c.trim()})
      save(); draw(sec)
    }
    addEventListener('mousemove', move); addEventListener('mouseup', up)
  }
}
const redraw = () => { for (const sec of all()) draw(sec) }
addEventListener('load', redraw)                  // boxes need the images' final width
redraw(); tot()
document.getElementById('all').onclick = e => copy(
  [...all()].filter(s => store[s.dataset.name]).map(s => JSON.stringify(rec(s))).join('\\n') + '\\n', e.target)
document.getElementById('all').dataset.t = 'copy JSONL'
document.getElementById('okc').onclick = e => copy(
  [...all()].filter(s => okset.has(s.dataset.name))
    .map(s => JSON.stringify({figure: s.dataset.name, hash: s.dataset.hash, ok: true}))
    .join('\\n') + '\\n', e.target)
document.getElementById('okc').dataset.t = 'copy OK list'
// j/k walk the sheet; v and o act on whatever j/k last landed on
let sel = -1
const focus = i => {
  const secs = [...all()]
  if (!secs.length) return
  sel = (i + secs.length) % secs.length
  secs.forEach((s, n) => s.classList.toggle('cur', n === sel))
  secs[sel].scrollIntoView({block: 'start', behavior: 'smooth'})
}
const hit = cls => {
  if (sel < 0) return false
  const cb = [...all()][sel].querySelector(cls + ' input')
  cb.checked = !cb.checked
  cb.onchange()                                   // same path as clicking it
  return cb.checked
}
addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey) return
  if (e.key === ' ') { focus(e.shiftKey ? (sel < 0 ? -1 : sel - 1) : sel + 1) }
  else if (e.key === 'j') { focus(sel + 1) }
  else if (e.key === 'k') { focus(sel < 0 ? -1 : sel - 1) }
  else if (e.key === 'v') { hit('.xl') }

  // signing off is the end of a figure, so move on — but un-ticking isn't, stay put
  else if (e.key === 'o') { if (hit('.ok')) { focus(sel + 1) } }
  else { return }
  e.preventDefault()
})
document.getElementById('clr').onclick = () => {
  if (!confirm('delete every note and ok mark?')) return
  for (const k in store) delete store[k]
  okset.clear()
  save(); saveok(); redraw()
  for (const sec of all()) { sec.classList.remove('done'); sec.querySelector('.ok input').checked = false }
}
</script>'''

lo = sum(1 for s, *_ in items if s < 0.75)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, 'w').write(f'''<!doctype html><meta charset=utf-8>
<title>figure redraw review</title>{CSS}
<p>{len(items)} figures, worst first. {lo} below 0.75. Drag on a panel to box a problem, click a box to edit or delete it.
Keys: <b>space</b>/<b>j</b> next figure, <b>shift-space</b>/<b>k</b> prev, <b>v</b> overlay, <b>o</b> ok.</p>
{''.join(rows)}{JS}''')
print(f'{len(items)} figures ({lo} below 0.75'
      + ('' if only else f', {len(done)} signed off and skipped') + f') -> {OUT}')
