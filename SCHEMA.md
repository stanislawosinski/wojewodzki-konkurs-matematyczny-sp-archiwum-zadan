# Konkurs Matematyczny — extraction schema & procedure

One agent parses **one test file** into one JSON under `browser/data/`. The browser
(`browser/index.html`, a static app) renders client-side from data shards generated
by `browser/build.mjs` — never hand-edit the shards. Extraction (hard, agent) and
assembly (trivial, `node build.mjs`) are kept separate; topic sets are a filter in
the browser UI.

## Files & naming

```
browser/
  data/<stage>_<year>_<wojewodztwo>.json      # source of truth, one per test
  figures/<question_id>_figN.png              # cropped bitmaps
  index.html app.css app.js                    # the browser app (static, committed)
  build.mjs                                    # JSON -> data.<stage>.js/.json shards
```

`question_id = <stage>_<year>_<wojewodztwo>_q<number>` (globally unique).
Source PDFs live under `pdfs/<stage>/`; `source_file` is that path relative to `pdfs/` — i.e. `<stage>/<name>.pdf`.

## Test object

| field | notes |
|-------|-------|
| `source_file` | path to the questions PDF/docx, relative to `pdfs/` (`<stage>/<name>.pdf`) |
| `answers_file` | path to the key file, or `null` if none exists |
| `competition` | full name as printed |
| `stage` | `szkolny` \| `rejonowy` \| `wojewodzki` |
| `wojewodztwo` | slug: `malopolskie`, `slaskie`, … |
| `school_year` | `"2021/2022"` |
| `date` | ISO `YYYY-MM-DD` (contest date if printed, else null) |
| `total_questions`, `max_points` | integers as stated in the arkusz |
| `questions` | array, in printed order |

## Question object

| field | notes |
|-------|-------|
| `id` | see naming above |
| `number` | original number in the PDF (1-based) |
| `page` | 1-based **PDF** page it appears on |
| `type` | `closed_single` \| `open` \| `true_false` |
| `points` | points for the task |
| `annulled` | `true` only for an annulled task (`answer.correct` null, points retained, `prompt_html` carries the "Zadanie anulowano…" note); **omit the field entirely otherwise** — its absence means "not annulled" |
| `topics` | 1+ **leaf** topics from the catalog below, most-specific first; category is derived, not stored |
| `prompt_html` | question body, HTML + inline MathML |
| `choices` | `[{label,html}]` for closed/true_false; `[]` for open |
| `figures` | filenames in `browser/figures/`; `[]` if none |
| `answer.correct` | choice label (`"C"`) or short text; `null` if unknown |
| `answer.solution_html` | worked solution HTML, or `null` if the key gives only a letter |

### Topic catalog

The catalog is the machine-readable **[`categories.json`](categories.json)** at repo root —
categories → leaves, each leaf with a one-line `desc`. Tag questions with the exact leaf
`name` strings (most-specific first); category headings are for filtering only, derive them
from the leaf and never store them. A `cross_cutting` leaf combines with a content leaf,
e.g. `["trójkąty", "dowodzenie / dowody"]` or `["czworokąty", "pole i obwód"]`. `build.mjs`
fails the build on any tag not in the catalog. When re-tagging older sheets, follow the
`migration` block in that file (e.g. old śląskie nature items tagged `inne` → `przyroda`).

Difficulty is **not** a field — `points` carries it (2p basic, 3p advanced here).

## Extraction procedure (reproducible)

1. **Read pages as images** (`Read` with `pages`), not just text. The text
   layer exists but drops all exponents/roots (e.g. `2⁹·5⁶` → `29 56`) and
   figures. Use text only to copy exact Polish wording/spelling; use the image
   to get every math symbol right. Old files also have font artifacts (`ż`→`Ŝ`).
2. **Skip non-questions**: cover page, karta odpowiedzi, BRUDNOPIS pages.
3. **Math → MathML**, namespaced `<math xmlns="http://www.w3.org/1998/Math/MathML">`.
   Powers `<msup>`, roots `<msqrt>`, fractions `<mfrac>`, Polish decimal comma
   stays a comma (`3,24`). Keep prose in `<p>`/`<ul>`; only formulas in `<math>`.
4. **Figures** — crop straight from the PDF render, no SVG:
   ```
   pdftoppm -png -r 200 -f <pg> -l <pg> -x <X> -y <Y> -W <W> -H <H> in.pdf out
   ```
   `-x/-y/-W/-H` are pixels at the chosen `-r` DPI. Iterate: render, `Read` the
   png, adjust the box until the figure is tight. Save as `<question_id>_figN.png`.
   Crop at 200 — that is the scale every box in the corpus is expressed in. Then run
   `scripts/figcrop.py hidpi --apply`, which re-renders the vector-source ones at 400
   and lists them in `browser/figures/hidpi.json` for the app's `srcset ... 2x`.
5. **Answer key** — read the paired `answers_file`. Keys are usually a table
   with an `X` under the correct column (A–E); map row→letter into
   `answer.correct`. If the key shows full solutions, put them in
   `solution_html`; otherwise leave it `null`.
6. **Verify** a few answers against the math before trusting the key mapping
   (column alignment in `pdftotext` tables is easy to misread).

## Build

```
cd browser && node build.mjs    # regenerates data.<stage>.js/.json shards
```
Then open `browser/index.html` (file:// or http). MathML renders natively,
answers reveal per-question (hidden by default), figures via
`<img src="figures/…">`. No dependencies.
