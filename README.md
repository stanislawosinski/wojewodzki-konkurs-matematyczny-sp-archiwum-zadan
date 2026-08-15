# konkurs-mat

A searchable practice bank of past **Polish regional math-competition papers** —
*Wojewódzki Konkurs Przedmiotowy z Matematyki* / *Konkurs Matematyczny* for primary schools
(szkoły podstawowe; plus one older gimnazjum set), spanning many voivodeships and years
(~2010–2026) across the three contest stages **szkolny** (school) → **rejonowy** (regional) →
**wojewódzki** (provincial).

The pipeline turns the official question-paper PDFs + answer keys into **per-question structured
JSON** (question text as HTML + inline MathML, cropped figures, topic tags, answers), then
assembles that JSON into a single **filterable HTML question browser** for contest prep — filter
by topic, year, voivodeship, points, question type, and school type.

**▶ Try it live: [the question browser](https://stanislawosinski.github.io/wojewodzki-konkurs-matematyczny-sp-archiwum-zadan/)** — search and filter the whole bank in your browser, nothing to install.

## Mostly the work of an LLM agent

This archive is **largely the product of an autonomous LLM agent** (Claude / Opus, driven via
[Claude Code](https://claude.com/claude-code)). Agents did the heavy lifting:

- **Downloading** the papers — one agent per voivodeship, each education-authority site laid out
  differently.
- **Extraction** — one agent per PDF, reading the *rendered page images* (the PDF text layer drops
  exponents, roots and figures), transcribing the exact Polish wording, converting every formula to
  [MathML](https://developer.mozilla.org/en-US/docs/Web/MathML), cropping diagrams with `pdftoppm`,
  and mapping the answer keys.
- **Categorization** — tagging each question against a fixed topic catalog (see
  [`SCHEMA.md`](SCHEMA.md)).

Humans set the conventions, spot-checked output, and made the structural decisions. The full
reproducible procedure is preserved in [`EXTRACTION_PLAYBOOK.md`](dev/docs/EXTRACTION_PLAYBOOK.md).

**Honest limitations** (please read before relying on answers):

- Stored answers are the **official keys** plus a non-blind agent sanity check — questions were
  **not** independently re-solved. A blind-verification pass is planned but not yet run.
- A handful of **suspected answer-key errors** are logged in
  [`suspected_key_errors.tsv`](suspected_key_errors.tsv).
- The **original download URLs were not recorded and are lost** — see
  [`SOURCES.md`](dev/docs/SOURCES.md) for provenance and per-voivodeship re-derivation seeds.

## Layout

```
konkurs-mat/
  README.md  LICENSE
  SCHEMA.md               # JSON spec + extraction procedure + topic catalog
  suspected_key_errors.tsv
  dev/
    docs/                 # EXTRACTION_PLAYBOOK.md (how to process new papers), SOURCES.md (provenance & rights)
    scripts/              # one-off pipeline & verification tools
    reports/              # PROGRESS.md (status, coverage, gotchas) + verification reports
    figures/              # figure redraw/contradiction campaign artifacts + review sheets
  pdfs/
    szkolny/  rejonowy/  wojewodzki/   # source PDFs: <year>_<wojewodztwo>[_sp|_gim][_answers].pdf
  browser/
    data/     *.json      # source of truth — one structured JSON per test
    figures/  *.png       # cropped question figures
    index.html app.css app.js   # the browser app (static, committed)
    build.mjs             # JSON -> data shard preprocessor (Node, no dependencies)
    # data.*.js data.*.json     # generated data shards — NOT committed; rebuild with build.mjs
```

## The data

Everything of value is in `browser/data/` — one JSON per test, the **source of truth**. Full spec
in [`SCHEMA.md`](SCHEMA.md); in brief, each question object carries:

`id`, `number`, `page`, `type` (`closed_single` | `open` | `true_false`), `points`, `topics`
(leaf tags), `prompt_html` (HTML + inline MathML), `choices`, `figures` (filenames in
`browser/figures/`), and `answer` (`correct` + optional `solution_html`).

Each test also records `source_file` / `answers_file`, e.g. `szkolny/2016_podkarpackie.pdf` —
these are **relative to `pdfs/`** (prepend `pdfs/` to open the file).

## Status & coverage

| Stage | Extracted |
|-------|-----------|
| szkolny (school) | **complete — 126 / 126** (2210 questions; validates clean) |
| rejonowy (regional) | 0 / 147 — PDFs present, not yet extracted |
| wojewódzki (provincial) | 0 / 165 — PDFs present, not yet extracted |

Known gaps: **lubuskie** and **opolskie** are absent from the archive; szkolny W-M 2012/13–2016/17
were never web-archived; some podlaskie years shipped without an answer key. Details in
[`SOURCES.md`](dev/docs/SOURCES.md) and [`PROGRESS.md`](dev/reports/PROGRESS.md).

## Building the browser

The browser is a static page (`browser/index.html` + `app.css` + `app.js`) that renders questions
client-side from generated per-stage data shards (not committed). It is auto-deployed to
[GitHub Pages](https://stanislawosinski.github.io/wojewodzki-konkurs-matematyczny-sp-archiwum-zadan/)
on every push to `main` (see [`.github/workflows/pages.yml`](.github/workflows/pages.yml)). To run
it locally, rebuild the shards from the JSON with Node (no dependencies):

```sh
cd browser && node build.mjs
```

Then open `browser/index.html` directly (`file://`) or serve the `browser/` directory over http —
the app detects the protocol and loads shards via `<script>` tags or `fetch()` accordingly.
MathML renders natively, figures load lazily from `figures/`, answers reveal per-question, a
sidebar filters client-side, and results are paged 100 questions at a time. Topic sets are a
filter in the UI (no build-time `--topic` needed).

## Sources & rights

The source papers are official *konkursy przedmiotowe* run by each voivodeship's **Kuratorium
Oświaty**. See [`SOURCES.md`](dev/docs/SOURCES.md) for the per-voivodeship attribution table.

The **PDFs under `pdfs/` and the competition questions/answers** remain © their respective
Kuratoria Oświaty and are included here for **non-commercial educational and archival use only**.
To request removal of any material, please open an issue.

## License

The repository's **original contributions** — the JSON structure and topic categorization, the
cropped figures, the browser app, and the documentation — are licensed **CC BY 4.0**. The third-party
competition papers and question content are **not** relicensed (see above). Full terms in
[`LICENSE`](LICENSE).
