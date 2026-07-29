# Figure redraw: bitmaps → SVG

Reference for revising `browser/figures/svg/*.svg`. Paste the relevant sections
into an agent brief; the "Agent brief" section at the bottom is self-contained
and can be handed over verbatim.

## What exists

| | |
|---|---|
| `browser/figures/*.png` | 855 figure crops, all low-resolution bitmaps pasted into the source PDFs |
| `browser/figures/svg/*.svg` | 344 vector redraws. Same basename as the PNG they replace |
| `scripts/figcheck.py` | scorer: `match@4px` + a visual diff sheet |
| `scripts/figsheet.py` | regenerates `debug/figure-redraw-review.html` |
| `debug/figure-redraw-review.html` | side-by-side review, worst score first; each heading links its question hash into the local browser |

The browser shows the bitmap by default. A `△` button in the question's left
gutter (only for questions whose figures have a redraw) swaps every figure in
that question to its SVG. `browser/build.mjs` finds the redraws by directory
listing and emits `figsvg: [...]` per question — **adding an SVG requires
re-running `node browser/build.mjs`**, nothing else.

Never rename an SVG: the PNG basename *is* the link.

## Scoring

```
python3 scripts/figcheck.py <name> --sheet    # one figure, writes the diff sheet
python3 scripts/figcheck.py --all             # every figure, worst first
```

`match@4px` is a symmetric chamfer: the fraction of each side's ink lying
within 4px of the other side's ink. Strict pixel IoU is useless here — a 3px
stroke offset scores ~0 on otherwise perfect geometry.

`--sheet` prints the path of `original | redraw | overlay`, where
**red = in the original, missing from the redraw** and **blue = the redraw
invented it**. Read that image; the number alone does not say *what* is wrong.

Target ≥ 0.75. Current state: n=344, mean 0.961, 12 below 0.85.

**The score has a hard ceiling from text.** `figcheck.py` renders through
MuPDF, which ignores `text-anchor` and `font-weight` and has no italic face, so
labels never line up. A chart or table that is 40% text will sit at 0.80 with
perfect geometry. Do not chase it — read the overlay and judge the *shapes*.
Conversely, a whole shape missing from the middle panel means the SVG used
something MuPDF cannot draw.

## Rules the redraws were made under

1. **The PNG is the ground truth for what is drawn.** The question text is
   context that helps interpret blur (which letter, which digit, what the shape
   is) — not licence to draw a different, "more correct" figure. If picture and
   text disagree, follow the picture and say so. This came up constantly:
   triangles labelled *równoboczny* drawn 27% off equilateral; a cuboid drawn
   4×4×10 while the text says 120 cm³; a printed "52°" on an angle measurably
   drawn at 57°.
2. **Do not silently regularise a sloppy original.** A line 1° off stays 1° off;
   an arc not centred on its vertex stays off-centre. Snap to exact geometry
   only when the original is within ~1px of it anyway.
3. **Measure, don't eyeball.** Load the PNG with cv2/numpy and *fit* the
   geometry — least-squares circle fits, total-least-squares / Hough line fits,
   pixel-run endpoints, connected components to count dots, `approxPolyDP` on
   contours. Then emit exact coordinates. That is the whole reason the redraw
   beats the blur. (There is no potrace/autotrace/inkscape on this box.)
4. `width`/`height`/`viewBox` = the PNG's exact pixel size:
   `python3 -c "import cv2;print(cv2.imread('browser/figures/<name>.png',0).shape)"` → `(h, w)`.
5. Same layout, proportions, position, stroke weight, fills and label positions
   as the original. Grey shading stays grey, colours stay their colour.
6. Opaque white background `<rect width=... height=... fill="#fff"/>` first.

## MuPDF quirks (the rasterizer everything is checked against)

- **`<polygon>` loses its closing edge.** Use `<path d="M … Z">`.
- `text-anchor` ignored — text is always left-anchored at `x`. Position labels
  by their left edge, or accept the offset.
- `font-weight` ignored; no italic face.
- `stroke-dasharray` renders solid.
- No CSS `<style>` blocks, no filters, no gradients (use the mean flat colour),
  no external fonts, no `<image>`.
- Fonts: `Helvetica,Arial,sans-serif` or `Times New Roman,serif` only.
- Allowed elements: `rect line path polyline circle ellipse text g` +
  presentation attributes, `transform`, `fill`, `stroke`, `stroke-width`,
  `stroke-dasharray`.

## Common errors to look for when revising

Ordered by how often they actually bit:

1. **Ink too light to exist.** `figcheck.py`'s threshold is gray `< 200`. Fills
   and strokes lighter than that are invisible to the scorer *and* nearly
   invisible on screen. This alone produced 0.37 → 0.99 and 0.58 → 0.82 jumps.
   Suspect it whenever the middle panel looks emptier than the left one.
2. **Text drifting** because `text-anchor="middle"` was assumed to work.
3. **A shape silently dropped** — `<polygon>`, a filter, a CSS rule.
4. **Regularised geometry**: the redraw is the *ideal* figure, the original is
   the sloppy one. Check angles and side lengths against the bitmap, not
   against what the question says the shape is.
5. **Stroke weight off**, usually too thin — it costs chamfer score on every
   edge at once and reads as a washed-out figure.
6. **Labels placed by eye** rather than at the centroid of their ink blob.
7. **Arcs**: wrong sweep flag, or drawn as a full circle where the original has
   a short angle tick.
8. **Charts and tables**: gridlines present but tick labels missing, or axis
   numbers pulled from the question text instead of read off the picture.

## Worth revising first

The 12 below 0.85. Several are text-heavy charts where the ceiling is MuPDF's
text rendering, not the SVG — check the overlay before rewriting anything.

| match@4px | figure | question |
|---|---|---|
| 0.745 | `wojewodzki_2021_podlaskie_q26_fig1` | `715d654b` |
| 0.752 | `wojewodzki_2022_lubuskie_q10_fig1` | `33fef160` |
| 0.766 | `szkolny_2017-2018_malopolskie_q9_fig1` | `4dbb61ef` |
| 0.778 | `wojewodzki_2021-2022_warminsko-mazurskie_q8_fig1` | `9f297a01` |
| 0.785 | `szkolny_2025-2026_warminsko-mazurskie_q10_fig1` | `516a90ff` |
| 0.789 | `wojewodzki_2020-2021_malopolskie_q6_fig1` | `9cdab7ec` |
| 0.798 | `szkolny_2024_mazowieckie_q5_fig1` | `01c67824` |
| 0.803 | `wojewodzki_2021-2022_warminsko-mazurskie_q19_fig1` | `2f487c4b` |
| 0.815 | `szkolny_2024-2025_warminsko-mazurskie_q3_fig1` | `e09ba5db` |
| 0.839 | `wojewodzki_2018_podkarpackie_q22_fig1` | `b886005b` |
| 0.846 | `szkolny_2020-2021_malopolskie_q10_fig1` | `17447406` |
| 0.846 | `wojewodzki_2025_mazowieckie_q6_fig1` | `fb5cbdda` |

Regenerate the list any time with `python3 scripts/figcheck.py --all`.

## What was deliberately not redrawn

All *przyroda* figures, plus 12 rejected in triage: photographs, clip-art,
shaded/textured illustrations, maps with organic coastlines, heraldic art, and
figures that are a paragraph of prose set as an image. The triage rule: redraw
anything built from primitives an agent can compute — segments, circles/arcs,
polygons, grids, nets, axonometric solids, tables, pips, angle arcs, hatching,
flat fills, short labels. Volume of work was never a reason to reject; 40
segments or a 10×10 grid is fine.

Rejected list (do not revisit without a reason):

```
szkolny_2016-2017_malopolskie_q13_fig1   Malopolska coat-of-arms eagle, heraldic clip-art
szkolny_2016-2017_malopolskie_q1_fig1    outline map of Malopolska, freehand border
rejonowy_2022_lubuskie_q22_fig1          gradient-shaded clip-art balance scale
rejonowy_2020_podkarpackie_q18_fig1      shaded orange 3D polyhedron render
wojewodzki_2022_mazowieckie_q9_fig1      parking-fee poster, prose + clip-art
wojewodzki_2022_lubuskie_q6_fig1         shaded leafy-tree illustration
wojewodzki_2020-2021_malopolskie_q12_fig1  nautical map, organic coastline
rejonowy_2024_mazowieckie_q10_fig1       clip-art baskets of puppies
rejonowy_2024_mazowieckie_q6_fig1        grey frame with callout and prose
wojewodzki_2021_lubuskie_q14_fig1        photograph of a wall clock
szkolny_2015-2016_malopolskie_q16_fig1   clip-art matchstick houses, yellow/red stylisation
rejonowy_2012_podkarpackie_q13_fig1      balance scale with organic shaded beaker of liquid
```

---

## Agent brief: revise one figure

> Revise the vector redraw `browser/figures/svg/<NAME>.svg` of the bitmap
> `browser/figures/<NAME>.png`. Question text: <PASTE, or look it up by hash in
> `browser/data/*.json`>. Reported problem: <WHAT TO FIX>.
>
> Read `FIGURE_REDRAW.md` first — the MuPDF quirks and the "common errors"
> section are why most redraws are wrong.
>
> Scratch files go in a directory of your own; never a shared or generic path,
> other agents run concurrently.
>
> Workflow:
> 1. `Read` the PNG. It is the ground truth for what is drawn — the question
>    text only helps you interpret blur. Reproduce the figure as drawn, sloppy
>    angles included.
> 2. `python3 scripts/figcheck.py <NAME> --sheet`, then `Read` the printed
>    `.cmp.png`. Red = you are missing it, blue = you invented it.
> 3. Measure with cv2/numpy and fit the geometry; do not eyeball coordinates.
> 4. Edit the SVG, re-score, iterate. Target `match@4px` ≥ 0.75, stop at 8
>    rounds. Text will never score well — judge the shapes in the overlay.
> 5. Do not change the SVG's `width`/`height`/`viewBox` — they must stay the
>    PNG's pixel size.
>
> Return, with no preamble:
> ```
> score: <before> -> <after>
> rounds: <n>
> fixed: <one line>
> notes: <anything unresolved, guessed, or where the picture disagrees with the text>
> ```
