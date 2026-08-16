# konkurs-mat

A searchable practice bank of past **Polish regional math-competition papers** —
*Wojewódzki Konkurs Przedmiotowy z Matematyki* / *Konkurs Matematyczny* for primary schools, 
spanning all voivodeships and years (~2010–2026) across the three contest stages **szkolny**
(school) → **rejonowy** (regional) → **wojewódzki** (provincial).

This project turns the official question-paper PDFs + answer keys into **per-question structured
JSON** (question text as HTML + inline MathML, cropped figures, topic tags, answers), then
assembles that JSON into a single **filterable HTML question browser** for contest prep — filter
by topic, year, voivodeship, points, question type, and school type.

**▶ Try it live: [the question browser](https://stanislawosinski.github.io/wojewodzki-konkurs-matematyczny-sp-archiwum-zadan/)** — search and filter the whole bank in your browser, nothing to install.

## Heads up: this is mostly the work of an LLM agent

This archive is **largely the product of an autonomous LLM agent** (Claude / Opus, driven via
[Claude Code](https://claude.com/claude-code)) working under human supervision. Agents did the
heavy lifting, in this order:

1. **Downloading** the papers — one agent per voivodeship, each education-authority site laid out
   differently.
2. **Extraction** — one agent per PDF, reading the *rendered page images* (the PDF text layer drops
   exponents, roots and figures), transcribing the exact Polish wording, converting every formula to
   [MathML](https://developer.mozilla.org/en-US/docs/Web/MathML), and pulling the metadata (number,
   points, stage, …) and the answer keys into one consistent JSON shape.
3. **Figure cropping** — 855 diagrams cut straight out of the PDF renders with `pdftoppm`.
4. **Categorization** — tagging each question against a fixed topic catalog (see
   [`SCHEMA.md`](SCHEMA.md)).
5. **Blind verification** — every question re-solved from scratch without sight of the key, and the
   disagreements adjudicated across model tiers.
6. **Figure redraw** — 823 of those 855 crops redrawn as clean vector SVGs, switchable in the
   browser under ⚙ → *Rysunki wektorowe*.
7. **Mental-math pass** — every question re-solved once more, this time to rule whether a pupil
   could finish it with nothing written down, in two tiers (*od ręki* / *z pomysłem*) plus a Polish
   one-line hint naming the move to start with. Drives the *W pamięci* filter and the 🧠 / 💡
   markers; judgements live in `dev/mental/` and are merged into the shards at build time (see
   [`dev/mental/README.md`](dev/mental/README.md)).
8. **Duplicate pass** — the same questions resurface across years and voivodeships. Exact reprints
   and number-swapped variants are caught by deterministic text keys at build time; lexically
   similar leftovers (including figure pairs, compared picture against picture) were judged by a
   model and reviewed (see [`dev/dups/README.md`](dev/dups/README.md)). Drives the ×N / ~N chips
   next to affected questions.
9. **Solution pass** — two thirds of the keyed questions come with a bare letter and nothing else:
   the organisers published a derivation for only 2080 of them. Every such question was solved once
   more, this time to write the path down in Polish, with the printed key acting as the check on
   the result. 4847 derivations live in `dev/solutions/` and are merged into the shards at build
   time (see [`dev/solutions/README.md`](dev/solutions/README.md)); they are labelled *Rozwiązanie
   AI* wherever they appear.

Humans set the conventions, reviewed the redrawn figures, spot-checked questions, and made the
structural decisions. The full reproducible procedure is preserved in
[`EXTRACTION_PLAYBOOK.md`](dev/docs/EXTRACTION_PLAYBOOK.md).

**Honest limitations** (please read before relying on answers):

- Stored answers are the **official keys**, additionally **blind-verified by AI**: every question
  was independently re-solved without sight of the key, disagreements adjudicated across model
  tiers (see [`dev/docs/VERIFICATION.md`](dev/docs/VERIFICATION.md)). Keyless questions carry a
  corroborated AI answer instead, clearly marked as such in the browser.
- **Suspected answer-key errors** are logged in
  [`suspected_key_errors.tsv`](suspected_key_errors.tsv) (38 reviewed: 6 wrong keys,
  1 wrong official solution, the rest confirmed correct).
- The derivations marked ***Rozwiązanie AI* were written by a model**, not by the organisers. Each
  one had to land on the printed key to be kept — and none of the 4847 disagrees with it — but the
  path itself is unreviewed: a right answer reached by a clumsy or wrong argument is possible.
  Where the model could not find an honest path it wrote nothing rather than fake one.
- The **🧠 / 💡 markers are one model's opinion**, not a property of the question — a judgement
  about what a pupil can carry in their head. Disagree and the gutter button flips it for your
  sheet; the data stays as judged.
- The **original download URLs were not recorded and are lost** — see
  [`SOURCES.md`](dev/docs/SOURCES.md) for provenance and per-voivodeship re-derivation seeds.

## Two ways to use it

### 1. Build and print a worksheet in the browser

[The browser](https://stanislawosinski.github.io/wojewodzki-konkurs-matematyczny-sp-archiwum-zadan/)
is the short path from "I need twenty questions on the Pythagorean theorem" to a printed sheet:

- **Filter** in the sidebar — topic (matching *any* or *every* selected topic), stage, year,
  voivodeship, points, question type, school type, *W pamięci* (head-solvable: *od ręki* /
  *z pomysłem*) — plus full-text search over the question text.
- **Practise in your head** — head-solvable questions carry a 🧠 / 💡 marker; click it for a hint
  on where to start that never gives the result away. The marker is a display flag: the box-button
  in the left gutter turns it off (or on) per question, and that override travels in the URL.
- **Spot the repeats** — questions that recur across years and voivodeships carry a ×N chip
  (exact reprint) or a ~N chip (same problem, different numbers); hover lists the other sheets,
  a click shows the whole cluster, and the *Powtórki* filter selects questions that have a
  duplicate or a variant.
- **See how it is done** — the 👁 reveal shows the official derivation where the organiser
  published one, and an AI-written one (labelled *Rozwiązanie AI*) where nobody did; the
  *Rozwiązanie* filter separates questions that have one from those that don't. On the printed key
  the AI derivations are off by default — ⚙ → *Wydruk* → *Rozwiązania AI w kluczu*.
- **Curate** — tick the questions you want and press **Zaznaczone ↑** to collect their ids in the
  *Pokaż tylko id* box; that box *is* your worksheet. **Skopiuj** saves the id list and pasting it
  back restores the set; *Pomiń id* drops individual questions.
- **Share** — the filters, the id set and the (editable) sheet title all live in the URL hash, so a
  worksheet is just a link.
- **Print** — **Drukuj** (questions only), **Drukuj z odpowiedziami** (key on the last page) or
  **Drukuj sam klucz**. Under ⚙ → *Wydruk*: which metadata to print, how much scratch space
  (*brudnopis*: automatic / half page / full page / none) and whether it is squared paper
  (*kratka*: always / geometry only / never).

### 2. Mine the JSON with an LLM agent and `jq`

For the questions the UI cannot express — "percentages combined with geometry", "tasks whose
solution needs a proof", "everything a given voivodeship asked twice" — point an agent (Claude Code
or similar) at `browser/data/*.json` and let it query with `jq`. One JSON per test, schema in
[`SCHEMA.md`](SCHEMA.md):

```sh
# 3+ point Pythagoras questions from the provincial stage
jq -r 'select(.stage=="wojewodzki") | .wojewodztwo as $w | .school_year as $y | .questions[]
       | select(.topics|index("twierdzenie Pitagorasa")) | select(.points>=3)
       | "\(.id)\t\(.points)p\t\($w) \($y)"' browser/data/*.json

# which topics come up most often?
jq -r '.questions[].topics[]' browser/data/*.json | sort | uniq -c | sort -rn | head

# open questions that ship a worked solution
jq -r '.questions[] | select(.type=="open" and .answer.solution_html != null) | .id' browser/data/*.json
```

The two halves meet at the id: the browser's short id is `sha1(question.id)[:8]`, so an agent can
hand its results straight over for printing —

```sh
jq -r '.questions[] | select(.topics|index("twierdzenie Pitagorasa")) | .id' browser/data/*.json |
  while read -r id; do printf '%s' "$id" | shasum | cut -c1-8; done | paste -sd, -
```

Paste that comma-separated list into *Pokaż tylko id*, then print.

## Layout

```
konkurs-mat/
  README.md  LICENSE
  SCHEMA.md               # JSON spec + extraction procedure + topic catalog
  suspected_key_errors.tsv
  dev/
    docs/                 # playbooks: EXTRACTION_PLAYBOOK.md, VERIFICATION.md, FIGURE_REDRAW.md + SOURCES.md
    scripts/              # one-off pipeline & verification tools
    reports/              # point-in-time reviews (full verification reports live in git history)
    figures/              # figure redraw/contradiction campaign artifacts + review sheets
    mental/   *.json      # "W pamięci" judgements, one sidecar per test; merged by build.mjs
    solutions/ *.json     # AI-written derivations, one sidecar per test; merged by build.mjs
  pdfs/
    szkolny/  rejonowy/  wojewodzki/   # source PDFs: <year>_<wojewodztwo>[_sp|_gim][_answers].pdf
  browser/
    data/     *.json      # source of truth — one structured JSON per test
    figures/  *.png       # cropped question figures
    index.html app.css    # the browser app (static, committed)
    facets.js defs.js render.js state.js app.js   # classic scripts, loaded in that order
    build.mjs             # JSON -> data shard preprocessor (Node, no dependencies)
    # catalog.js data.*.js data.*.json   # generated — NOT committed; rebuild with build.mjs
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
| szkolny (school) | **complete — 126 / 126** (2210 questions) |
| rejonowy (regional) | **complete — 147 / 147** (2706 questions) |
| wojewódzki (provincial) | **complete — 160 / 160** (2716 questions) |

Known gaps: szkolny W-M 2012/13–2016/17 were never web-archived; 38 papers (641 questions)
shipped without any answer key — those carry corroborated blind-AI answers instead. Details in
[`SOURCES.md`](dev/docs/SOURCES.md).

## Building the browser

The browser is a static page (`browser/index.html` + `app.css` + the five scripts) that renders questions
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
