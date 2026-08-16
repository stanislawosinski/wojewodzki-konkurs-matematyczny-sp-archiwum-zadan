# Figure redraw: bitmaps → SVG

Reference for revising `browser/figures/svg/*.svg`. Paste the relevant sections
into an agent brief; the "Agent brief" section at the bottom is self-contained
and can be handed over verbatim.

## What exists

| | |
|---|---|
| `browser/figures/*.png` | 855 figure crops, all low-resolution bitmaps pasted into the source PDFs |
| `browser/figures/svg/*.svg` | 823 vector redraws (2026-08-15; the 32 PNGs without one are photos/infographics/przyroda — deliberate). Same basename as the PNG they replace |
| `dev/scripts/figcheck.py` | scorer: `match@4px` + a visual diff sheet |
| `dev/scripts/figsheet.py` | regenerates `dev/figures/figure-redraw-review.html`; with figure names as arguments, writes just those to `dev/figures/figure-subset-review.html` |
| `dev/scripts/figangles.py` | angle-mark linter, reads the vector source (see **Angle marks**) |
| `dev/figures/figure-redraw-review.html` | side-by-side review, worst score first; each heading links its question hash into the local browser |
| `dev/figures/figure-angles-review.html` | zoomed original-vs-redraw crops of every flagged vertex |
| `dev/figures/redraw-queue.tsv` | the campaign queue (now fully drawn — kept as the triage record), ordered low → high effort |

The browser shows the bitmap by default. A `△` button in the question's left
gutter (only for questions whose figures have a redraw) swaps every figure in
that question to its SVG. `browser/build.mjs` finds the redraws by directory
listing and emits `figsvg: [...]` per question — **adding an SVG requires
re-running `node browser/build.mjs`**, nothing else.

Never rename an SVG: the PNG basename *is* the link.

## Scoring

```
python3 dev/scripts/figcheck.py <name> --sheet    # one figure, writes the diff sheet
python3 dev/scripts/figcheck.py --all             # every figure, worst first
```

`match@4px` is a symmetric chamfer: the fraction of each side's ink lying
within 4px of the other side's ink. Strict pixel IoU is useless here — a 3px
stroke offset scores ~0 on otherwise perfect geometry.

`--sheet` prints the path of `original | redraw | overlay`, where
**red = in the original, missing from the redraw** and **blue = the redraw
invented it**. Read that image; the number alone does not say *what* is wrong.

Target ≥ 0.75. Current state: n=344, mean 0.9725, 9 below 0.85. Eight are signed
off in `dev/figures/redraw-ok.jsonl`, i.e. looked at and accepted; the ninth is
`rejonowy_2019_lubuskie_q17` at 0.647, a gradient figure MuPDF cannot render at
all (see below) — in Chrome it scores 1.000.

**The score has a ceiling from text, but a smaller one than this doc used to
claim.** MuPDF honours `text-anchor`, `font-weight` and italics when they sit
on the `<text>` element (see below), so labels *can* be made to line up, and
several figures now score 1.000 with a dozen labels. What does not close is ink
*volume*: the scans are upscaled bitmap text whose blur pushes far more pixels
under the gray<200 threshold than a clean glyph outline does. Expect a
text-heavy figure to sit at ink ratio 0.7–0.8 with every label box matching to
1–2px. Do not fatten glyphs to close that gap — it is inventing ink.
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

   *Exception, decided 2026-08-01 on `wojewodzki_2025-2026_wielkopolskie_q15`:*
   where the prompt asserts the property and only the scan's draughtsmanship
   fails it — an "equilateral" triangle drawn 356/341/339 — **idealise**.
   Rebuild at the measured mean (s = 345.500) and accept the score drop as the
   deliberate departure, 0.990 → 0.973. Note what tipped it: the scan's own two
   circles were already equal-radius (fits 173.02 and 172.68), so only the
   triangle was distorted. Rule 1 still governs — idealise the *drawing's*
   imprecision, never redraw a figure that genuinely disagrees with its text.
3. **Measure, don't eyeball.** Load the PNG with cv2/numpy and *fit* the
   geometry — least-squares circle fits, total-least-squares / Hough line fits,
   pixel-run endpoints, connected components to count dots, `approxPolyDP` on
   contours. Then emit exact coordinates. That is the whole reason the redraw
   beats the blur. (There is no potrace/autotrace/inkscape on this box.)

   Two ways the fitting itself goes wrong, both found on q15:
   - **Fit the pose to the ink, not to the vertices.** Least squares over three
     vertices gives a tidy symmetric 6.29px residual each, but buys it by sliding
     base AB down 3.5px — moving 356px of heavily-inked line perpendicular to
     itself, exactly what a 4px chamfer punishes. Fitting all 9362 black pixels
     instead keeps AB where it is drawn and lifts the apex: vertex residuals get
     *worse* (6.94 / 3.92 / 9.30) while stroke coverage@4px goes 0.745 → 0.843.
   - **Do not score-hunt.** A local search on `match@4px` reached 0.9746 at
     s = 347.0, but the score is flat to ±0.0025 across s = 344–348 and 347
     contradicts both independent measurements of the side. The
     measurement-backed 345.5 was kept.
4. `width`/`height`/`viewBox` = the PNG's exact pixel size:
   `python3 -c "import cv2;print(cv2.imread('browser/figures/<name>.png',0).shape)"` → `(h, w)`.
5. Same layout, proportions, position, stroke weight, fills and label positions
   as the original. Grey shading stays grey, colours stay their colour.
6. Opaque white background `<rect width=... height=... fill="#fff"/>` first.

## MuPDF quirks (the rasterizer everything is checked against)

**The big one: MuPDF does not inherit text attributes from a `<g>`.**
`text-anchor`, `font-family`, `font-weight` and `font-style` are each honoured
on a `<text>` element and silently dropped when set on an ancestor group — where
a browser inherits them normally. A group-styled label therefore renders in the
*default* face (Times-Roman, upright, regular, left-anchored) for the scorer
while the browser draws what you actually asked for, and every measurement you
take off `rawdict` is of the wrong glyphs. Measured, not assumed:

| attribute | on a `<g>` | on the `<text>` |
|---|---|---|
| `font-family="Helvetica,…"` | Times-Roman | Helvetica |
| `font-weight="bold"` | Times-Roman | Helvetica-Bold |
| `font-style="italic"` | Times-Roman | Times-Italic |
| `text-anchor="middle"` | left-anchored | centred |

`font-size` and `fill` *do* inherit. **Put font attributes on the `<text>`.**
All four faces exist (`Helvetica`, `-Bold`, `-Oblique`, `-BoldOblique`, and the
Times equivalents) — the old claim that `font-weight` is ignored and there is no
italic face was wrong, and produced both undersized labels and "labels too
light" misdiagnoses. Bold carries ~37% more ink than regular at the same size,
which matters when calibrating ink ratio.

A corpus sweep moved `text-anchor` off the group in 33 files (mean +0.035, best
+0.118, none worse); 127 files still carry a group-level font attribute.

- **`<polygon>` loses its closing edge.** Use `<path d="M … Z">`.
- `stroke-dasharray` renders solid, so a dashed gridline scores as a solid line
  and inflates ink ratio. Do not materialise dashes into segments to chase the
  number — check by scoring a throwaway copy that has.
- **Gradients render solid black.** Not dropped, not flattened: any
  `fill="url(#…)"` paints a black shape. Every variant fails
  (`objectBoundingBox`, `userSpaceOnUse`, CSS paint-fallback `url(#g) #ccc`).
  If the scan really is a gradient, **draw the gradient and eat the score** —
  `rejonowy_2019_lubuskie_q17` is 0.647 under MuPDF and 1.000 under headless
  Chrome, and the review sheet shows the browser render, so the figure is right
  and only the number is wrong. Flat bands sampled from the scan's profile are
  the fallback for when a gradient would be overkill, not the preferred answer.
- No filters, no external fonts, no `<image>`, `letter-spacing` ignored. CSS
  `<style>` blocks are ignored too. That once tempted a dual representation —
  a browser-only gradient plus `<style>`-hidden flat bands only MuPDF sees —
  which does buy a 1.000. Don't: it is two drawings to keep in sync for a
  number nobody reads.
- Fonts: `Helvetica,Arial,sans-serif` or `Times New Roman,serif` only.

**Ask MuPDF where it actually put the text** instead of guessing at metrics —
it will hand you a bbox per character:

```python
fitz.open(svg)[0].get_text('rawdict')   # blocks > lines > spans > chars, each with 'bbox'
```

Coordinates come back in viewBox units, which for every figure here is the PNG
pixel grid. This settles label placement, `text-anchor` drift and glyph widths
in one call, and it is how the square-root bars below were positioned.

**But `rawdict` char bboxes are font boxes, not ink** — every glyph in a span
reports the same ascender-to-descender height, so sizing a label off that height
undershoots badly (it produced `font-size` 17.5 where 31.6 was right). Horizontally
it is still trustworthy; advance widths are real. To size a label, fit against the
*rendered ink*: emit the label alone, rasterize it through the same MuPDF path
`figcheck.py` uses, measure its ink bbox, correct `font-size` by target_h/ink_h and
x/y by the bbox delta, then iterate. Long labels also drift — `3√3 cm` is 102px wide
in the scan and Helvetica's advances do not match the original font across that span,
so it was emitted as four `<text>` pieces each pinned to its own measured column.
- Allowed elements: `rect line path polyline circle ellipse text g` +
  presentation attributes, `transform`, `fill`, `stroke`, `stroke-width`,
  `stroke-dasharray`.

## Common errors to look for when revising

Ordered by how often they actually bit:

1. **Ink too light to exist.** `figcheck.py`'s threshold is gray `< 200`. Fills
   and strokes lighter than that are invisible to the scorer *and* nearly
   invisible on screen. This alone produced 0.37 → 0.99 and 0.58 → 0.82 jumps.
   Suspect it whenever the middle panel looks emptier than the left one.
2. **Text drifting** because a font attribute was set on the `<g>` instead of
   the `<text>` — the browser inherits it, MuPDF does not, so the scorer marks
   down a displacement nobody can see. Worth up to 0.118 on one figure.
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

   **And the bar must start *on* the radical's tip, not near it.** Four figures
   shipped with theirs 3.4–4.1px to the right, which reads as a dash floating
   above the radicand. Every one of them had the `√` inside a multi-glyph run
   (`>5√3<`, `>2√5 cm<`), where the tip's x depends on the advance widths of
   the glyphs before it — guessing that is what put the bar 4px out. Two fixes,
   either works: give the `√` its own `<text>` at a known x, or compute the tip
   as `x + Σ advance(preceding glyphs)·fs + xMax(√)·fs` from the font file.
   Overlap the bar onto the tip by ~0.5px so they fuse.

   **Measure it in the real font, not in MuPDF.** MuPDF substitutes its base-14
   Times/Helvetica, whose `√` outline is *not* the outline the browser draws;
   across eleven bars the two tips disagreed by −3.4 to +6.8px. The redraws are
   looked at in a browser (the review sheet is `<img src=…svg>`, as is the app),
   so the browser's font is the one that matters. Take the tip from
   `/System/Library/Fonts/Supplemental/Times New Roman*.ttf` (or `Helvetica.ttc`)
   for whatever `font-family`/`font-weight` that `<text>` actually uses.

   match@4px cannot see any of this — the four figures scored 0.87–1.00 with
   the bar detached and moved by ≤0.001 when it was fixed. Check it by eye in a
   zoomed render, never by score.

8. **Charts and tables**: gridlines present but tick labels missing, or axis
   numbers pulled from the question text instead of read off the picture.

## Angle marks

Chamfer score is blind to these: a figure with two backwards arcs still scores
0.92, because the arc is 20px of ink in a 900px figure. So they get their own
linter, which reads the vector source instead of the pixels:

```
python3 dev/scripts/figangles.py                # whole corpus, TSV to stdout
python3 dev/scripts/figangles.py <name> ...     # one or more figures
python3 dev/scripts/figangles.py --crops        # + dev/figures/figure-angles-review.html
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

`span-mismatch` has a blind spot: it did **not** fire on `szkolny_2019_kujawsko-pomorskie_q7`'s 306.6° vertex-centred arc (`A 60 60 0 1 1 …`, a near-full circle bulging outside the triangle). A wrong `large-arc-flag` is invisible to it — that one showed up only in the score, 0.942, and by eye.

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
angle mark. That theory is wrong in two separate ways, four figures so far, and
those figures report nothing — unchecked, not verified.

**Squashed scan.** `szkolny_2016-2017_malopolskie_q2`,
`szkolny_2024-2025_wielkopolskie_q13` and `rejonowy_2024_lodzkie_q7` are scans
compressed on one axis (ry/rx ≈ 0.81–0.85), so *every* mark in the figure is a
vertex-centred **ellipse**, fitting to <1px rms where the best circle misses by
5–12px. Drawing them as circles costs real score (0.997 → 0.971 on the first;
+0.019 across five marks on the third). The tell is that one squash factor fits
all the marks at once — measure it on the node blobs, then fit one radius each.

**Genuine perspective.** In `rejonowy_2023-2024_wielkopolskie_q14` the figure is
a pyramid, so a right-angle marker lying in a receding face projects to an
ellipse — a *rotated* one, not axis-aligned: circle 1.67px rms → axis-aligned
ellipse 0.89 → general ellipse 0.58, with the radius drifting monotonically
46.1 → 40.2px from one leg to the other. Deriving the axes from the two leg
directions as conjugate diameters is the textbook construction but was measurably
worse here than a free fit — the original drawer's ellipse is slightly off-true,
and rule 2 says keep it.

Emitting these as `A rx ry …` rather than a tessellated polyline is deliberate:
the linter circle-fits runs of straight points and would report bogus
`centre-off-vertex` FAILs for each one.

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

### Linter state (2026-08-02 snapshot, 344 svg then) — 18 FAIL in 12 figures

14 `centre-off-vertex`, 4 `label-outside-arc`, 4 `arc-small-for-label` (WARN),
52 right-angle-mark INFOs (12 square tick, 38 arc+dot, 2 arc without a dot),
9 `unsupported-transform`.

The first pass over this linter fixed 36 figures (76 FAIL → 10); corpus mean
`match@4px` went 0.961 → 0.963, biggest single gains 0.846 → 0.962
(`szkolny_2020-2021_malopolskie_q10`) and 0.893 → 0.951
(`rejonowy_2023-2024_pomorskie_q7`), and two figures reached 1.000.

**The 18 that remain are accepted, not outstanding.** Every one was measured
off the bitmap and the original really is drawn that way — rule 2, do not
regularise a sloppy original. Do not "fix" these without re-measuring first.

| figure | question | why it stays |
|---|---|---|
| `rejonowy_2010_podkarpackie_gim_q15_fig1` | `9a61f91b` | circle fit rms 1.0px, centre 47.6px off vertex C |
| `rejonowy_2022-2023_malopolskie_q7_fig1` | `5951c837` | free fit rms 1.07px vs 3.22px vertex-constrained; local chamfer 1.000 vs 0.768 |
| `rejonowy_2025-2026_wielkopolskie_q19_fig1` | `1c220237` | **linter false positive** — the "12" it calls a stray angle label is the side length of BC, printed there in the scan; it only tripped once the arc grew to its correct r=60 |
| `szkolny_2025-2026_wielkopolskie_q10_fig1` | `707a888d` | all five arcs off-vertex in the scan: free fits 0.93–1.14px rms vs 2.8–5.3px centred, local chamfer 0.831→0.960 / 0.879→0.965 / 0.791→0.929 / 0.567→0.900 / 0.935→0.948; the worst confirmed by 3-point construction |
| `wojewodzki_2020-2021_malopolskie_q6_fig1` | `9cdab7ec` | `label-outside-arc`; signed off by eye but never individually re-measured — the one entry here taken on trust |
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

Nothing, on this evidence. The 9 below 0.85 are all explained: eight are
**already signed off in `dev/figures/redraw-ok.jsonl`**, i.e. checked by eye in the browser
and accepted — text-heavy charts where the ceiling is ink volume, not geometry
— and the ninth is the gradient figure MuPDF can't draw. Do not "fix" any of
them on the strength of the number; check the overlay first, and if the only
gap is glyph weight or a gradient, leave it.

| match@4px | figure | question |
|---|---|---|
| 0.647 | `rejonowy_2019_lubuskie_q17_fig1` (gradient, 1.000 in Chrome) | `f55b3d5e` |
| 0.752 | `wojewodzki_2022_lubuskie_q10_fig1` | `33fef160` |
| 0.778 | `wojewodzki_2021-2022_warminsko-mazurskie_q8_fig1` | `9f297a01` |
| 0.792 | `wojewodzki_2020-2021_malopolskie_q6_fig1` | `9cdab7ec` |
| 0.815 | `szkolny_2024-2025_warminsko-mazurskie_q3_fig1` | `e09ba5db` |
| 0.823 | `szkolny_2017-2018_malopolskie_q9_fig1` | `4dbb61ef` |
| 0.839 | `wojewodzki_2018_podkarpackie_q22_fig1` | `b886005b` |
| 0.846 | `wojewodzki_2025_mazowieckie_q6_fig1` | `fb5cbdda` |
| 0.849 | `szkolny_2024-2025_malopolskie_q6_fig1` | `ad68ccb5` |

Regenerate the list any time with `python3 dev/scripts/figcheck.py --all`.

## Solve-through-SVG sweep (2026-08-02) — done, low yield

All 252 never-signed-off redraws were rendered through Chrome and solved blind
(figure + prompt, no key), then differenced against **both** the key and the
stored PNG-derived `answer.model` baseline. Only *wrong-from-SVG ∧
right-from-PNG* implicates a drawing; wrong-from-both just means a hard
question. Answer equivalence needs a judge, not a regex — a numeric-multiset
comparison produced 51 false positives (`FPP` vs `1-F, 2-P, 3-P`, `12,5π cm²`
vs `25π/2 cm²`, keys with working shown).

Yield: **one genuine redraw defect in 252** (`wojewodzki_2012_podkarpackie_q3`
— the 3♣'s bottom pip is inverted in the scan, playing-card convention, and the
redraw drew all three upright; an axis-of-symmetry question turns on exactly
that). Plus three answers worth a second look, all with the redraw exonerated:
`wojewodzki_2021_lodzkie_q9` (baseline A, correct C=160°),
`wojewodzki_2012_podlaskie_sp_q8` (baseline 15°, correct 75°), and
`wojewodzki_2025-2026_wielkopolskie_q15` (SVG and PNG both B, key says C).

Don't run this again over the same set, and don't read the pass as a sign-off:
recall is ~26% by construction. The known defect classes are ~2/3 cosmetic —
label nudges, miters, font, arc radii — and a solver cannot see any of them.
Eyeballing in `dev/figures/figure-redraw-review.html` remains the only real check.

**Also dead: pixel score as triage.** `figcheck.score()` over the 128 reviewed
figures runs *anti*-correlated with defects — signed off (n=93) median 0.943,
reviewer-flagged (n=35) median 0.973, and 19 of the 20 worst-scoring reviewed
figures were signed off as fine. The score tracks ink volume and text density,
not correctness. Worst-first ordering is no help in finding bad redraws.

## What was deliberately not redrawn

All *przyroda* figures, plus 17 rejected in triage: photographs, clip-art,
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
rejonowy_2020_kujawsko-pomorskie_q9_fig1 clip-art digital clock, gradient mirror reflection
rejonowy_2020_lubuskie_q23_fig1          pictogram table of photographic clip-art fish
rejonowy_2025-2026_pomorskie_q8_fig1     photographs of Banach and Krygowska
szkolny_2021_podkarpackie_q16_fig1       gradient-shaded 3D cuboids
szkolny_2023_lodzkie_q12_fig1            3D pie chart + phone screenshot + handwritten note
```

The 2026-08-02 triage pass classified every one of the 478 figures that had
never been looked at, against the rule above. It found only those last 5
rejects — **473 are redrawable**, so the pool is not the constraint, drawing
time is. `dev/figures/redraw-queue.tsv` is the queue, ordered low → high effort (269 low,
163 med, 41 high). The `high` tail is almost entirely the śląskie
arithmetic-crossword grids, which are dense but mechanical.

Resolution is *not* a selection criterion: the SVG's value is being vector, so
a crisp 300-dpi scan deserves a redraw as much as a soft 90-dpi one. Source
DPI was tried as a triage signal and fails — it selects clip-art, because
clip-art is what the source PDFs embed at low resolution.

---

## Agent brief: revise one figure

> Revise the vector redraw `browser/figures/svg/<NAME>.svg` of the bitmap
> `browser/figures/<NAME>.png`. Question text: <PASTE, or look it up by hash in
> `data/questions/*.json`>. Reported problem: <WHAT TO FIX>.
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
> 2. `python3 dev/scripts/figcheck.py <NAME> --sheet`, then `Read` the printed
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
> Gate: `python3 dev/scripts/figangles.py <NAME>` reports no FAIL, **and**
> `python3 dev/scripts/figcheck.py <NAME>` is not below its current `match@4px`.
> Touch only the angle marks and their labels — the rest of the figure is
> already accepted.
>
> A finding can be wrong. If the original really does mark the reflex angle, or
> really does draw the arc off-centre (rule 2: don't regularise a sloppy
> original), leave it and say so in `notes:`.
