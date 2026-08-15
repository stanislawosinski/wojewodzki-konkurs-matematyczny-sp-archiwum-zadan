# Figures that contradict something

Recorded during the redraw campaign (`redraw-queue.tsv`, 473 figures). Every entry is a
place where the **original scan** disagrees with its own prompt, its own printed labels,
or itself. Redraw defects are *not* listed here — those go to `redraw-feedback.jsonl`.

The redraws reproduce the scan as drawn (rule 2), so fixing any of these means deliberately
departing from the original. Rows whose description ends in **Fixed** / **Partly fixed**
have been changed on a reviewer's instruction (`contradiction-feedback.jsonl`); everything
else still stands as scanned.

`hash` is the question hash (`browser/data/`, `redraw-queue.tsv`); the figure is
`browser/figures/<fig>.png` / `browser/figures/svg/<fig>.svg`.

Severity: **high** = touches the mathematics or the answer · **med** = visible
structural contradiction, answer probably unaffected · **low** = measurement-level.

## Contradicts the prompt text

| sev | hash | figure | the contradiction |
|---|---|---|---|
| high | `40422428` | `wojewodzki_2019_kujawsko-pomorskie_q14_fig1` | Prompt: *„BC jest średnicą tego okręgu”*. As drawn, chord CB misses the fitted centre by **6.9 px** (length 329.3 vs diameter 329.6). The solution is Thales on that diameter. |
| high | `5a6b07f0` | `wojewodzki_2022_dolnoslaskie_q6_fig1` | Prompt: *„ich wierzchołki leżą odpowiednio na prostych a₆,a₅,a₁,a₂ oraz a₇,a₅,a₁,a₃”*. No vertex sits on its line: C 4.2 px below a₁, D 3.7 above a₂, G 7.8 below a₁, H 6.3 above a₃, F 6.8 below a₅, E 6.5 above a₇ — E leaves a visible 2 px gap. Seating the vertices on the parallels *is* the construction. Worse, ABCD is drawn as a **298.6 × 331.0 rectangle**, not the square the prompt calls it. **Fixed:** both refitted as true squares with their vertices on the prescribed lines (least squares over the measured line positions, no vertex more than 0.18 px off), sides 330.59 and 358.42 — 17 and 20 spacings squared, the intended difference of 3. The A, B and F labels, which the scan lets a₆ and the edges AB / EF cut through, were also dropped clear. |
| high | `f783b98c` | `wojewodzki_2026_kujawsko-pomorskie_q22_fig1` | Prompt fully specifies the construction: *„łuki AC i AB są półokręgami, zaś BC jest ćwiartką okręgu o środku A”*. None of the three arcs is compass-true — perpendicular ellipse fits (rms 0.34/0.33/0.53 px) bulge up to **6 px** outside it, and forcing the quarter arc onto centre A gives rms 1.74. The question is which of F₁/F₂ is larger. The legs also differ, 312.60 vs 319.23, so no circle centred on A can reach both B and C. **Fixed:** redrawn compass-true at R = 316 about A — the value the scan's own crossing dot implies, its *x* being A.x + R/2. The semicircles then meet on the hypotenuse and F₁ = F₂ exactly. |
| high | `d09fa5ef` | `wojewodzki_2019_lubuskie_q18_fig1` | Prompt: *„Ile liter polskiego alfabetu (przedstawionych obok)…”*. The figure shows **V** and **X** — not letters of the Polish alphabet — and omits every diacritic (ą, ć, ę, ł, ń, ó, ś, ź, ż). Q is absent. The count of symmetry axes is taken off exactly this set. |
| high | `04454fbd` | `wojewodzki_2019_podlaskie_q22_fig1` | Prompt: *„siatką ostrosłupa prawidłowego czworokątnego”*, so the central face must be a square. Measured **227 × 240 px**, and it is not aligned to the grid it sits on. |
| med | `497248c9` | `wojewodzki_2025-2026_pomorskie_q3_fig1` | Not to scale: a 5 cm notch in a 15 cm cube is 1/3; the drawn notch chord is **0.50** of the cube edge (137/272 px). All seven cm callouts therefore disagree with the geometry they label. |
| med | `1bcad3d7` | `wojewodzki_2026_dolnoslaskie_q5_fig1` | Prompt: *„ośmiokąta **foremnego** ABCDEFGH”*. The drawn octagon is irregular — edge lengths run 110–112 px — in a plane figure with no projection to excuse it. |
| med | `98281fce` | `wojewodzki_2021_dolnoslaskie_q4_fig1` | Not to scale: beams drawn 500 px long on a 50 px square section (**10:1**) where the prompt's 10 × 10 × 200 cm is 20:1. |
| med | `08be15aa` | `wojewodzki_2023_mazowieckie_q4_fig1` | The plotted curve is not the hyperbola it represents: a smoothed spline through the six markers, sagging up to **12 px** off *y* = 20/*x* between (1,20)–(2,10) and (2,10)–(4,5), and running past both end markers. The markers themselves are exact. |
| low | `3e1489ad` | `wojewodzki_2011_podkarpackie_q21_fig1` | Pie sweeps measure 4.3° / 74.6° / 282.4° = **1.2 / 20.7 / 78.4 %** against its own printed 1 / 21 / 78, and the chart runs **counter-clockwise**. The percentages are also given in the prompt text, so the reader is not misled. |
| low | `19a42c92` | `wojewodzki_2024-2025_slaskie_q17_fig1` | Prompt gives \|AB\|:\|CD\|:\|DA\| = 16:10:10; drawn 440.3 : 257.2 : 286.2 px = 16 : **9.35** : **10.4**. Also K and L sit ~3 px off the true midpoints of AE/ED. |

## Contradicts itself

| sev | hash | figure | the contradiction |
|---|---|---|---|
| high | `44c3ad4c` | `wojewodzki_2018-2019_slaskie_q1_fig1` | Row **h) has no label**. It is the only row whose cells reach into column 0, i.e. the leftmost cell occupies exactly where the `h)` would print. The clue list has an h), so the row-to-clue mapping breaks at that row. No label was invented. |
| high | `1c95b02a` | `wojewodzki_2020_mazowieckie_q6_fig1` | The task is to complete a net on grid paper so it has exactly one symmetry axis — but the grid **is not square** (verticals 38.2 px apart, horizontals 40.75), and the drawn horizontal symmetry axis is not level: it drops **3.7 px** across the width. |
| med | `2ae1f34c` | `wojewodzki_2022_podkarpackie_q18_fig1` | Area-by-counting question over two grids, but figure A's leftmost gridline is grey **233** — effectively invisible — where every sibling is black, and the two figures' fills differ (189 vs 209) though nothing distinguishes them. The redraw departs from the scan here and draws that gridline black. |
| med | `d6374c58` | `wojewodzki_2020_podlaskie_q26_fig1` | The cutting triangle's apex does not land on cube vertex D: edges D-K and D-B cross at (112, 236.5), ~5 px up-right of D (108.2, 239.5). Edge B-C meets the CG vertical ~3 px above C. **Partly fixed:** the apex now lands on D; B-C is left as scanned. The A and B labels, which the crop cuts through, were also raised inside it. |
| med | `0b6e61ad` | `wojewodzki_2024-2025_malopolskie_q14_fig2` | Three unit joints are drawn **solid** where the same rule dashes every comparable joint in the figure — (0,3,5)-(1,3,5), (3,5,5)-(3,6,5), (4,5,5)-(4,6,5). The projection is also not isometric (horizontal axes foreshorten 30.85 vs 50.10 px, vertical 54.80). |
| med | `415f06c4` | `wojewodzki_2021_podlaskie_q25_fig1` | The back-right lateral edge is hidden but drawn **solid**, while the three back bottom edges are dashed. Every lateral edge also leans right by 1–1.8 px top-to-bottom against dead-level horizontals (a scan shear). |
| med | `02beb1c9` | `wojewodzki_2020_dolnoslaskie_q6_fig1` | All 12 prism edges are solid — hidden edges DA/DC/DH are **not** dashed — while ZX/ZY in the same drawing are. |
| med | `b81b0b5c` `038807d5` | `wojewodzki_2024-2025_malopolskie_q6_fig1` `wojewodzki_2024-2025_malopolskie_q7_fig1` | The 120° mark is a true circular arc centred **14–15 px right of vertex A** (fit rms 0.35–1.08; forced onto A the radius wanders 58.5–68.5). It marks an angle at a point that is not the angle's vertex. Both figures share the construction. **Partly fixed, in q7 only:** the arc's ends now meet the radii AC and AB, which the scan falls 5.7 and 3.3 px short of. Both arcs are still struck off-vertex. |
| med | `d9cf58aa` `02920afd` `cd4b5811` `a364aa3f` | `rejonowy_2012-2013_slaskie_q1_fig1` `wojewodzki_2013-2014_slaskie_q1_fig1` `wojewodzki_2012-2013_slaskie_q1_fig1` `rejonowy_2013-2014_slaskie_q1_fig1` | Same family, same defect: the **bottom-right cell is not drawn**. The last horizontal rule and the last vertical rule both stop short, so a cell the solver is asked to fill has no box. Recurs across four papers and both stages. |
| med | `abed092d` | `wojewodzki_2020_podlaskie_q21_fig1` | Prompt is about quarter-*circles* on the sides of a right triangle; the scan's three arcs are measurably **elliptical** — 130.5×134.9, 177.2×170.2, 224.9×216.7. |
| low | `ca41e5f9` | `wojewodzki_2014-2015_slaskie_q1_fig1` | Mixed decimal separators in one grid: `0,5` (comma, Polish convention) in r1c3 but `0.25` (period) in r3c5. |
| low | `39a04706` | `wojewodzki_2025_podlaskie_q17_fig1` | The pie is an **ellipse**, not a circle — outer 371.0 × 362.0, inner 185.2 × 180.5 — so equal shares subtend visibly unequal arcs. The bar chart carries the same data, which is what the question asks the reader to cross-check. |
| low | `fe833e3c` | `wojewodzki_2023_dolnoslaskie_q6_fig1` | All 18 edges of the hexagonal prism are solid; no hidden-line dashing anywhere. |
| low | `88de95bf` | `wojewodzki_2021_podlaskie_q14_fig1` | Parallelograms 1 and 2 sit on their grid intersections; parallelogram **3 does not** — ~1.5 px left and ~1 px above. The construction rule chains each shape off the previous one's midpoint. |
| low | `5ff23cd9` | `wojewodzki_2020-2021_wielkopolskie_q7_fig1` | All 12 cuboid edges solid, hidden edges included. |
| low | `4de35b18` | `wojewodzki_2022-2023_malopolskie_q15_fig1` | Squares on the sides of a right triangle: G and F sit ~1.5 px off the exact perpendicular construction. |
| low | `a4fba0b9` | `wojewodzki_2019_podkarpackie_q18_fig1` | Of the two dots inside the right-angle mark at D, the second — (201.8, 423) — is not on the angle bisector. **Fixed:** moved to (206.4, 412.3), on the bisector of ∠SDA at its scanned radius. |

## Source-PDF defects

| sev | hash | figure | what |
|---|---|---|---|
| med | `b22f3b2d` | `wojewodzki_2013_podlaskie_gim_q13_fig1` | Two problems. (a) The rectangle is labelled 120° but as scanned (479 × 256) the marked angle is **123.7°**. (b) The source PDF fails to embed the degree sign — it prints as a `.notdef` box. **This is the one figure where the redraw does not reproduce the scan**: it was reproportioned to 479 × 276.55 (aspect exactly √3) so the angle really is 120°. Flagged because it breaks rule 2 deliberately. **(b) fixed:** the box is drawn as the glyph it stands for. |

## Not contradictions — explained

Recorded as oddities during redraw, resolved on review. Left here so they are not
re-flagged.

- **The "stray comma" cell** at the top of many crossword ladders (`be5b1c75`, plus the
  `2,` / `4,` / `5,` / `0,` cells in the śląskie and rejonowy ladders) is not crop debris
  and not a missing row. The hasło is a decimal expansion — √5 = 2,236… for `be5b1c75` —
  and the unlabelled cell holds its **pre-filled integer part and comma**. That also
  explains why those ladders have one more shaded cell than they have labelled rows.
- Grey fills at levels 210–220 (`#d9d9d9`, `#dcdcdc`, `#ebebeb`, `#e6e6e6`) sit above
  `figcheck`'s ink cut of 200 and score as background in *both* panels. Not a defect in
  either the scan or the redraw.

## Scan debris left out of the redraws

Present in the PNG, deliberately not drawn — listed so a future eyeball doesn't read
them as missing detail.

- `40422428` — 2–3 px black crop border on all four sides (this one *is* reproduced).
- `wojewodzki_2019-2020_slaskie_q8_fig1` — 1 px full-width black rule on the last row, a
  PDF footer caught by the crop (reproduced verbatim).
- `b81b0b5c` / `038807d5` — a 1 px grey rule at y=344 bleeding in from the page, and a
  3 px speck at (440, 394).
- `abed092d` — one stray speck at (333, 246).

## Redraw defects raised on the same review

Not contradictions — the scan is fine, the SVG was wrong. Both were sharp corners where the
default miter join threw a spike several px past the vertex; both are now `stroke-linejoin="round"`,
matching the blunt tips the scan has.

- `415f06c4` `wojewodzki_2021_podlaskie_q25_fig1` — the cut-plane outline, at its top and
  bottom vertices (37.5° corners, ~6.7 px of spike on a 4.3 px stroke).
- `2ae1f34c` `wojewodzki_2022_podkarpackie_q18_fig1` — figura A's two bottom corners and
  figura B's two top corners (63° and 45°, ~4–4.6 px).

The contradictions recorded for these two above are untouched.

## See also

- `dev/docs/FIGURE_REDRAW.md` § *Solve-through-SVG sweep* — the one genuine **redraw** defect
  found in 252 (`wojewodzki_2012_podkarpackie_q3`, inverted 3♣ pip), plus three answers
  worth a second look. Different category: redraw vs scan, not scan vs prompt.
- `suspected_key_errors.tsv` — answer-key disputes, unrelated to figures.
