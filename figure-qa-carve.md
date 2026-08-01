# Figure QA from the carve pass (2026-08-02)

Ten findings, produced as a by-product of the `categories.json` revision 2026-08-02 carve
(commit `0c9f543`). 68 agents read 395 figure PNGs — 165 of which have an SVG redraw — to
decide topic leaves for questions whose maths lives in the diagram. The PNG was authoritative
throughout, so **none of these findings changed a tagging decision**; every one is free
redraw QA that nobody went looking for.

That provenance matters when triaging: these are not the output of `scripts/figcheck.py`, so
there is no `match@4px` score behind them. They are things a reader noticed while trying to
*solve* the question — which is why two of them sit on figures already signed off in
`redraw-ok.jsonl`. A pixel scorer would not have caught a swapped label; a solver did.

Hashes below open the question in the local browser via `browser/index.html#inc=<hash>`
(the "Pokaż tylko id" filter). To see a redraw side by side, run
`python3 scripts/figsheet.py <figure-name>` and open `debug/figure-subset-review.html`.

Sign-off convention, per `FIGURE_REDRAW.md`: accepted redraws go to `redraw-ok.jsonl`,
revision requests to `redraw-feedback.jsonl` (the review sheet's "copy JSON" button emits
the box coordinates these findings lack). Nothing here has been written to either file.

---

## 1. Blocking — bad PNG crop, question unsolvable from its figure ✅ FIXED

### `wojewodzki_2020_podlaskie_q1` — hash `fa181098`

`wojewodzki_2020_podlaskie_q1_fig1.png`. An SVG redraw was **added** on top of the crop fix
(`match@4px 1.000`, ink ratio 0.91, `figangles.py` clean) — see the end of this section.

The crop cut off the `3√3 cm` label on the vertical left side, leaving a figure that carried
no numeric data at all. The question could not be answered from the cropped image. Verified
against `pdfs/wojewodzki/2020_podlaskie.pdf` p.2, where the label sits to the left of the
trapezoid — the crop box simply started too far right.

**Fixed** in two steps:

1. `figcrop.py crop … 978 175 467 363 --apply`, was `1100 150 480 400`. The other three edges
   were tightened at the same time (the old box had ~150px of dead space on the right).
2. The new box necessarily dragged in an ~80px tail of prompt text (`va tego`) at top-left, so
   that rectangle was **whitened in the PNG** (`im[0:62, 0:100] = 255`).

Step 2 was needed because no rectangular crop can separate them. The ink bands on page 2:

| band | y | x |
|---|---|---|
| `b` label | 189–218 | 1179–1196 |
| prompt text `…podstawa tego` | 202–230 | ≤1072 |
| `3√3 cm` label | 330–362 | **992**–1094 |

Reaching left to x≈992 for `3√3` admits the prompt text, which occupies the same rows as the
`b` label — so excluding it by cropping means losing `b`, which the question needs. In the
figure's own coordinates the two are well separated (text y 30–55, label y 155–187), so the
erase is safe and left the `3√3 cm` label untouched.

⚠ **This figure is now a crop *plus* an edit, the only one in the corpus.** Consequences:

- `locate()` still recovers the box exactly, but the squared-difference score went from
  9.8e-08 (pixel-identical) to 3.3e-03. The exact-match path's cutoff is `mn < 1e-2`, so it
  still takes that path with roughly 3× headroom — it has not fallen back to correlation.
  A larger erase on some future figure could cross that line; `locate()` would then use the
  `TM_CCOEFF_NORMED > 0.85` fallback rather than fail.
- Re-running `figcrop.py crop … --apply` on this figure **re-renders from the PDF and silently
  restores the prompt text**. If the box is ever adjusted again, redo the whiten.

> Gotcha found while verifying this: `figcrop.py queue` does **not** re-locate. It reads a cached
> `$FIGWORK/audit.tsv`, so after an `--apply` it will report the *old* box (and old w/h) until
> `figcrop.py audit` is re-run. To check a fresh crop, call `locate()` directly.

**Redraw** — `browser/figures/svg/wojewodzki_2020_podlaskie_q1_fig1.svg`, a right trapezoid with
the diagonal `BL→TR`. Scores `match@4px 1.000`; the `.cmp.png` overlay is pure black (nothing
missing, nothing invented). `figangles.py`: 0 FAIL. Geometry is least-squares fitted (rms 0.23px
on both slants); the left side is genuinely ~2px off vertical in the scan and was kept that way
per rule 2. The right-angle arc is vertex-centred — a free circle fit lands only 1.07 rms against
1.58 constrained, nowhere near the 5–12px signature of a real off-centre arc.

Two things learnt here that are not yet in `FIGURE_REDRAW.md`:

- **`rawdict` char bboxes are font boxes, not ink** — every glyph in a span reports the same
  ascender-to-descender height. Sizing a label off that height undershoots badly (it produced
  `font-size` 17.5 where 31.6 was right). Fit against the *rendered ink* instead: emit the label
  alone, rasterize it through the same MuPDF path `figcheck.py` uses, and measure. rawdict is
  still trustworthy horizontally (advance widths are real), which is what the vinculum uses.
- **Long labels drift.** `3√3 cm` is 102px wide in the scan and Helvetica's advances do not match
  the original font across that span, so it was emitted as four `<text>` pieces each pinned to its
  own measured column. Fitting the string as one element cannot land all of `3`, `√`, `3`, `cm`.

The builder that did the measuring is throwaway and lives in the session scratchpad, not the repo —
the SVG is the artefact. Re-deriving it needs only the fitted lines quoted in its docstring.

---

## 2. Redraw defects worth fixing

### `wojewodzki_2019-2020_slaskie_q7` — hash `e99b5739`

`wojewodzki_2019-2020_slaskie_q7_fig1.svg`. **Labels swapped.** The SVG puts `x` on the
bottom-right vertex arc — where the PNG has `α` — and `α` under the bottom side, where the PNG
has the side label `x`. So the redraw asks for a different quantity than the scan does. This is
the most serious of the redraw findings: it is wrong, not merely incomplete.

### `rejonowy_2023-2024_wielkopolskie_q13` — hash `5dbcfad4` — ⚠ already in `redraw-ok.jsonl`

The redraw labels the shaded angle at Q with a capital `X`; the PNG scan and the prompt text
both use lowercase `x`. Geometry, vertex labels and all four angle arcs (α at P, β at R, γ at T,
δ at S) match. Minor, but it slipped through sign-off.

### `szkolny_2024-2025_pomorskie_q8` — hash `85d37aeb`

`szkolny_2024-2025_pomorskie_q8_fig1`. The SVG carries the `α` text label but **no arc**: the PNG
draws a large arc marking α at the `a ∩ b` intersection, sweeping from ray b up-left round to ray
a down. Only the right-angle arc-and-dot was redrawn. Without the arc it is ambiguous which of
the four angles at the intersection is meant.

### `wojewodzki_2017_podkarpackie_q10` — hash `6071a9ce` — already in `redraw-feedback.jsonl`

Geometry agrees (E inside the square, joined to all four corners), but the PNG appears to carry a
small angle mark at E for the asked angle DEC, which the redraw omits. Already queued for
revision on other grounds — fold this in rather than filing it separately.

### `szkolny_2016-2017_malopolskie_q2` — hash `9641f50d`

The 134° wedge at B is drawn as a bare arc, while the PNG shades all three wedges light grey
(the 34° and `?` wedges *are* filled in the SVG, so this is an inconsistency within the redraw
itself). All values and the geometry agree.

---

## 3. Cosmetic — no effect on solving

### `rejonowy_2020-2021_malopolskie_q17` — hash `144a7c3a` — ⚠ already in `redraw-ok.jsonl`

The SVG omits the vertex dot on side DC — that apex is point G in the official solution — and the
right-hand rhombus vertex dot. The geometry itself matches.

### `rejonowy_2021-2022_wielkopolskie_q14` — hash `76610257`

The scan runs diagonal AC a short way past C to the upper right; the redraw stops the line at C.
It does keep the matching BD extension past D, so the asymmetry looks accidental. All three
marked angles (40° at A between AD and AC, 35° at C between CD and CA, 25° at B between BA and BD)
and the grey exterior sector at D match, so the answer 100 is unaffected.

### `szkolny_2024-2025_malopolskie_q7` — hash `241c6b6a`

The redraw strokes both rhombi in `#000`; the PNG — and the sibling `q6` redraw — use mid-grey
`#8a8a8a`. All labels, the `3x+2` / `7−x` / `x+1` values and the shaded overlap JFKD match.

---

## 4. Not a conflict — noted for judgement

### `wojewodzki_2025-2026_wielkopolskie_q15` — hash `929ed70c`

No PNG/SVG disagreement. The "equilateral" triangle is drawn with unequal sides (AB 356px,
CA 341px, BC 339px), so the two circles — which must both have radius = side/2 — come out at
178 vs 169.65. **The scan has the same distortion**, so the redraw faithfully copied it rather
than idealising it.

Worth a decision rather than a fix: does a redraw reproduce the scan's sloppiness, or correct it?
`FIGURE_REDRAW.md` does not say. Whatever is decided here should probably become a rule there,
since this cannot be the only distorted original.
