# Konkurs Matematyczny — extraction schema & procedure

One agent parses **one test file** into one JSON under `browser/data/`. HTML is
generated from that JSON by `browser/build.py` — never hand-edit the HTML.
Extraction (hard, agent) and assembly (trivial, filter) are kept separate so a
topic set is just `build.py --topic "<topic>" data/*.json`.

## Files & naming

```
browser/
  data/<stage>_<year>_<wojewodztwo>.json      # source of truth, one per test
  figures/<question_id>_figN.png              # cropped bitmaps
  <stage>_<year>_<wojewodztwo>.html           # generated
  build.py                                     # JSON -> HTML assembler
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
| `topics` | 1+ **leaf** topics from the catalog below, most-specific first; category is derived, not stored |
| `prompt_html` | question body, HTML + inline MathML |
| `choices` | `[{label,html}]` for closed/true_false; `[]` for open |
| `figures` | filenames in `browser/figures/`; `[]` if none |
| `answer.correct` | choice label (`"C"`) or short text; `null` if unknown |
| `answer.solution_html` | worked solution HTML, or `null` if the key gives only a letter |

### Topic catalog (use these exact leaf strings)

A question is tagged with **leaves** (most-specific first). The category
headings are for browsing/filtering only — derive them from the leaf, don't
store them. **Metody i rozumowanie** leaves are cross-cutting: combine with a
content leaf, e.g. `["trójkąty", "dowodzenie / dowody"]`.

**Liczby i podzielność**
- `podzielność`
- `reszta z dzielenia`
- `NWW / NWD`
- `liczby rzymskie`
- `procenty`

**Wyrażenia: potęgi, pierwiastki, przekształcenia**
- `potęgi i pierwiastki`
- `usuwanie niewymierności z mianownika`
- `wzory skróconego mnożenia`
- `wyłączanie jednomianu przed nawias`

**Równania, nierówności, proporcje**
- `równania z jedną zmienną`
- `układy równań`
- `nierówności`
- `proporcjonalność prosta`
- `proporcjonalność odwrotna`
- `prędkość / droga / czas`

**Geometria płaska**
- `geometria` — ogólna, gdy nic bardziej szczegółowego nie pasuje
- `trójkąty`
- `sześciokąty foremne`
- `koła / okręgi`
- `pierścień kołowy`
- `okrąg wpisany i opisany`
- `dwusieczna kąta / symetralna odcinka`

**Geometria przestrzenna**
- `bryły`

**Kombinatoryka i prawdopodobieństwo**
- `zliczanie / metody zliczania`
- `kombinatoryka`
- `prawdopodobieństwo`

**Statystyka**
- `statystyka opisowa`

**Metody i rozumowanie** (przekrojowe)
- `dowodzenie / dowody`
- `szacowanie (zamiast obliczania)`
- `zagadki logiczne`

**Inne**
- `inne`
- `przyroda` — nature/biology/geography/science items (esp. the śląskie "…z Elementami Przyrody"
  contests). Tag these `przyroda`, NOT `inne`, so they can be filtered out. (Older already-processed
  śląskie files used `inne` for these; do not retag them — this leaf applies to newly processed files.)

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
5. **Answer key** — read the paired `answers_file`. Keys are usually a table
   with an `X` under the correct column (A–E); map row→letter into
   `answer.correct`. If the key shows full solutions, put them in
   `solution_html`; otherwise leave it `null`.
6. **Verify** a few answers against the math before trusting the key mapping
   (column alignment in `pdftotext` tables is easy to misread).

## Build

```
python3 browser/build.py browser/data/<file>.json                 # one arkusz
python3 browser/build.py --topic "NWW / NWD" browser/data/*.json   # topic set
```
Self-contained HTML: MathML renders natively, one button toggles answers
(hidden by default), figures via `<img src="figures/…">`. No dependencies.
