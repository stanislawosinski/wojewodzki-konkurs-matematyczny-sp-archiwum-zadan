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
| `scripts/figsheet.py` | regenerates `debug/figure-redraw-review.html`; with figure names as arguments, writes just those to `debug/figure-subset-review.html` |
| `scripts/figangles.py` | angle-mark linter, reads the vector source (see **Angle marks**) |
| `debug/figure-redraw-review.html` | side-by-side review, worst score first; each heading links its question hash into the local browser |
| `debug/figure-angles-review.html` | zoomed original-vs-redraw crops of every flagged vertex |

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

Target ≥ 0.75. Current state: n=344, mean 0.963, 11 below 0.85.

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

**Ask MuPDF where it actually put the text** instead of guessing at metrics —
it will hand you a bbox per character:

```python
fitz.open(svg)[0].get_text('rawdict')   # blocks > lines > spans > chars, each with 'bbox'
```

Coordinates come back in viewBox units, which for every figure here is the PNG
pixel grid. This settles label placement, `text-anchor` drift and glyph widths
in one call, and it is how the square-root bars below were positioned.
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
6. **Labels placed by eye** rather than at the centroid of their ink blob — or
   at a font size carried over from the SVG instead of measured off the
   bitmap's ink box. Undersized labels were worth more score than every arc fix
   in the same figure (0.846 → 0.962 on one, 0.937 → 0.963 on another).
7. **Arcs**: wrong sweep flag, or drawn as a full circle where the original has
   a short angle tick.
9. **Square roots drawn without their bar.** `&#8730;` renders fine, but the
   vinculum over the radicand is a separate `<line>` — four figures were
   missing all seven of theirs, reading as `√ 29` rather than `√29`. Place it
   from the right edge of the `√` glyph's bbox to the right edge of the last
   radicand glyph, at the topmost ink row inside the `√` bbox (all three from
   `rawdict`). Do **not** copy the bar's position off the bitmap: MuPDF's glyph
   advances differ from the scan's, so a bitmap-measured bar lands beside the
   radical it belongs to — it scores slightly *better* and is plainly wrong.

8. **Charts and tables**: gridlines present but tick labels missing, or axis
   numbers pulled from the question text instead of read off the picture.

## Angle marks

Chamfer score is blind to these: a figure with two backwards arcs still scores
0.92, because the arc is 20px of ink in a 900px figure. So they get their own
linter, which reads the vector source instead of the pixels:

```
python3 scripts/figangles.py                # whole corpus, TSV to stdout
python3 scripts/figangles.py <name> ...     # one or more figures
python3 scripts/figangles.py --crops        # + debug/figure-angles-review.html
```

`--crops` writes a 3× zoom of `original | redraw` around every flagged vertex.
Read it. The linter cannot know whether the original marks *that* angle at all,
or which right-angle glyph the source uses.

**The load-bearing fact: an arc centred on the vertex is convex by
construction.** So "the arc bends the wrong way" is not a curvature question,
it is `dist(centre, vertex)`. Everything else follows the same way.

| check | means | fix |
|---|---|---|
| `centre-off-vertex` | arc isn't centred on the vertex it marks — concave, or marking nothing | recompute both endpoints as `V + r·(unit leg)`, redraw the `A` with `rx=ry=r` |
| `endpoint-off-leg` | an end doesn't touch a side of the angle; or both ends sit on the *same* side | same |
| `span-mismatch` | arc spans the complement/reflex instead of the interior angle | flip the sweep flag, or swap the endpoints |
| `label-outside-arc` | the α/β/γ inside the wedge is further from V than the arc | move the label to `V + 0.55r·(bisector)`, or grow `r` |
| `arc-small-for-label` | arc too small to house its label | grow `r` |
| `right-angle-mark` (INFO) | reports the glyph used: square tick / arc / arc+dot | eyeball vs the original — **conventions differ per source**, this is never a rule |

Recipe for one arc at vertex `V` between legs towards `P` and `Q`:

```python
u = unit(P - V); w = unit(Q - V)          # r ≈ 0.15–0.25 × the shorter leg
a, b = V + r*u, V + r*w
# sweep=1 goes clockwise in SVG's y-down space
sweep = 1 if cross(u, w) > 0 else 0
f'M {a.x:.2f} {a.y:.2f} A {r} {r} 0 0 {sweep} {b.x:.2f} {b.y:.2f}'
```

Sanity check before writing: the *interior* angle is the one containing the
midpoint of `PQ`. Large-arc-flag stays 0 for angles under 180°.

Caveats: not every arc is an `A` command (one figure tessellates its 75° arc as
a 14-point polyline — the linter circle-fits runs of ≥5 straight points); ten
figures use a transform the parser bails on and are reported `INFO
unsupported-transform` rather than checked.

Elliptic arcs are skipped outright, on the theory that an ellipse is never an
angle mark. That theory is wrong twice: `szkolny_2016-2017_malopolskie_q2` and
`szkolny_2024-2025_wielkopolskie_q13` are both scans squashed on one axis
(ry/rx ≈ 0.81–0.84), so their marks really are vertex-centred **ellipses** and
fit to <1px rms where the best circle misses by 5–12px. Both figures therefore
report nothing — unchecked, not verified. Drawing them as circles costs real
score (0.997 → 0.971 on the first).

### Deciding whether the original really is off-centre

Most `centre-off-vertex` findings are redraw bugs, but a solid minority are the
original being sloppy, and the two want opposite fixes. What worked:

- **Fit, don't eyeball.** Least-squares circle over the thinned arc ink, then
  the same fit constrained to the vertex. A genuinely off-centre arc lands at
  0.2–1.0px rms where the vertex-centred one misses the ink by 5–12px — the gap
  is not subtle.
- **Short arcs defeat a free fit.** Under ~40° of span the three-parameter fit
  is unidentifiable along the bisector: it will return a centre 50px away with
  a convincing residual. Two agents nearly published one. Cross-check with
  radial sampling and with ink coverage — one such candidate covered 4% of the
  arc's pixels, the correct model 78%.
- **Arbitrate with a *local* chamfer.** Mask the legs and labels, render both
  candidates, score only the arc's neighbourhood. Globally the two differ by
  0.001; locally it was 0.992 vs 0.069.
- Radius measured from the vertex along the arc is the cheap tell: roughly
  constant → centred; drifting monotonically → not.

Draw dots as `<circle>`, never `<rect>`. A rect is loaded as four segments
whose corners become vertices, and the linter will anchor a nearby arc to one
of them and report an offset that isn't there.

### Current state — 344 svg, 46 with findings, 10 FAIL in 8 figures

8 `centre-off-vertex`, 2 `label-outside-arc`, 4 `arc-small-for-label` (WARN),
48 right-angle-mark INFOs (10 square tick, 32 arc+dot, 6 arc without a dot),
10 `unsupported-transform`.

The first pass over this linter fixed 36 figures (76 FAIL → 10); corpus mean
`match@4px` went 0.961 → 0.963, biggest single gains 0.846 → 0.962
(`szkolny_2020-2021_malopolskie_q10`) and 0.893 → 0.951
(`rejonowy_2023-2024_pomorskie_q7`), and two figures reached 1.000.

**The 10 that remain are accepted, not outstanding.** Every one was measured
off the bitmap and the original really is drawn that way — rule 2, do not
regularise a sloppy original. Do not "fix" these without re-measuring first.

| figure | question | why it stays |
|---|---|---|
| `rejonowy_2010_podkarpackie_gim_q15_fig1` | `9a61f91b` | circle fit rms 1.0px, centre 47.6px off vertex C |
| `rejonowy_2022_lubuskie_q16_fig1` | `31d6505d` | S-curve of shape arcs, anchors to a dotted-grid crossing |
| `rejonowy_2023-2024_wielkopolskie_q7_fig1` | `bb8fb9d6` | fit rms 0.21px off-centre vs 0.83px centred; ~an ellipse-tool drag that missed the corner |
| `rejonowy_2023_lodzkie_q14_fig1` | `9f0722c2` | r=145 circle centred 37px *outside* the vertex; fit std 2.2px vs 11.9px centred |
| `rejonowy_2024-2025_wielkopolskie_q12_fig1` | `6ad93ded` | the original prints both labels outside their arcs |
| `szkolny_2018_podkarpackie_2_q10_fig1` | `54030f84` | fit rms 1.1px, centre 48.3px off A; centring moves ink 7px |
| `wojewodzki_2018_podkarpackie_q12_fig1` | `c7816b2e` | flat r=151 arc, centre 83px above C; local chamfer 0.992 as drawn vs 0.069 centred |
| `wojewodzki_2023_kujawsko-pomorskie_q5_fig1` | `429923a1` | this source bulges its marks by design — both fit at 0.4px rms, 0.6–0.7r off the vertex |

Three defects the linter cannot see, all found while fixing the above: an arc
tessellated as a polyline that stops short of a leg; an angle mark missing
entirely (`wojewodzki_2024-2025_wielkopolskie_q13`, the 20° at S); and angle
labels rendered at half size because `text-anchor` was carrying the position
(MuPDF ignores it). Undersized labels were worth more score than the arcs.

## Worth revising first

The 11 below 0.85. Several are text-heavy charts where the ceiling is MuPDF's
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

### Variant: fix the angle marks

Same brief, but replace steps 2 and 4 with the linter, and add:

> Read the **Angle marks** section of `FIGURE_REDRAW.md`. Reported findings:
> ```
> <PASTE the figangles.py lines for this figure>
> ```
> Gate: `python3 scripts/figangles.py <NAME>` reports no FAIL, **and**
> `python3 scripts/figcheck.py <NAME>` is not below its current `match@4px`.
> Touch only the angle marks and their labels — the rest of the figure is
> already accepted.
>
> A finding can be wrong. If the original really does mark the reflex angle, or
> really does draw the arc off-centre (rule 2: don't regularise a sloppy
> original), leave it and say so in `notes:`.
