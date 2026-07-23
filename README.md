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
reproducible procedure is preserved in [`EXTRACTION_PLAYBOOK.md`](EXTRACTION_PLAYBOOK.md).

**Honest limitations** (please read before relying on answers):

- Stored answers are the **official keys** plus a non-blind agent sanity check — questions were
  **not** independently re-solved. A blind-verification pass is planned but not yet run.
- A handful of **suspected answer-key errors** are logged in
  [`suspected_key_errors.tsv`](suspected_key_errors.tsv).
- The **original download URLs were not recorded and are lost** — see [`SOURCES.md`](SOURCES.md)
  for provenance and per-voivodeship re-derivation seeds.

## Layout

```
konkurs-mat/
  README.md  LICENSE
  SCHEMA.md               # JSON spec + extraction procedure + topic catalog
  EXTRACTION_PLAYBOOK.md  # how to process new papers (agent prompt + batch workflow + scripts)
  PROGRESS.md             # status, coverage, gotchas
  SOURCES.md              # provenance & rights
  suspected_key_errors.tsv
  pdfs/
    szkolny/  rejonowy/  wojewodzki/   # source PDFs: <year>_<wojewodztwo>[_sp|_gim][_answers].pdf
  browser/
    data/     *.json      # source of truth — one structured JSON per test
    figures/  *.png       # cropped question figures
    build.py              # JSON -> HTML generator (stdlib only, no dependencies)
    # *.html              # the generated browser — NOT committed; rebuild with build.py
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
[`SOURCES.md`](SOURCES.md) and [`PROGRESS.md`](PROGRESS.md).

## Building the browser

The HTML browser is a generated artifact (not committed). Rebuild it from the JSON with Python 3
(standard library only, no dependencies):

```sh
cd browser
python3 build.py data/*.json -o wszystkie-zadania.html   # master: every question
python3 build.py data/szkolny_2026_podkarpackie.json      # one test
python3 build.py --topic "NWW / NWD" data/*.json          # a topic set
```

The output is a single self-contained page: MathML renders natively, figures load from
`figures/`, answers reveal per-question, and a sidebar filters client-side. No build step at view
time.

## Sources & rights

The source papers are official *konkursy przedmiotowe* run by each voivodeship's **Kuratorium
Oświaty**. See [`SOURCES.md`](SOURCES.md) for the per-voivodeship attribution table.

The **PDFs under `pdfs/` and the competition questions/answers** remain © their respective
Kuratoria Oświaty and are included here for **non-commercial educational and archival use only**.
To request removal of any material, please open an issue.

## License

The repository's **original contributions** — the JSON structure and topic categorization, the
cropped figures, `build.py`, and the documentation — are licensed **CC BY 4.0**. The third-party
competition papers and question content are **not** relicensed (see above). Full terms in
[`LICENSE`](LICENSE).
