# Pipeline progress & resume notes

## What this is
An archive of past **Polish regional math-competition** papers — *Wojewódzki Konkurs
Przedmiotowy z Matematyki* / *Konkurs Matematyczny* for primary schools (szkoły podstawowe;
one older gimnazjum set), spanning many voivodeships and years (~2010–2026), across the three
contest stages **szkolny** (school) → **rejonowy** (regional) → **wojewódzki** (provincial).
The pipeline turns the official question-paper PDFs + answer keys into per-question structured
JSON (`browser/data/`, figures in `browser/figures/`), then builds one **filterable HTML question
browser** (`browser/wszystkie-zadania.html`) — search/filter practice problems by topic, year,
voivodeship, points, question type, and school type. Purpose: a searchable practice bank for
contest prep.

GitHub restructuring done 2026-07-23 (PDFs → `pdfs/<stage>/`, outputs → `browser/`; see README). This file is the resume/status point.
Three docs, read in order: **SCHEMA.md** (JSON spec) → **EXTRACTION_PLAYBOOK.md**
(the full agent-prompt template + per-batch workflow + reusable scripts + all the
accumulated per-file conventions) → this file (status + gotchas). The playbook holds
the know-how that used to live only in the chat; everything needed to resume is on disk.

> Post-restructuring layout: source PDFs under `pdfs/<stage>/`, JSON/figures/generator under `browser/`.

## Status

- **szkolny: COMPLETE — 126 / 126 processed.** `pdfs/szkolny/` has **131** question PDFs; 5 remain
  mislabeled W-M→śląskie dups (2012/13–2016/17, filtered) → 126 real, **all 126 done**. The 6
  genuine W-M papers recovered 2026-07-23 (2009/10 + 2010/11, 2011/12, 2017/18, 2018/19, 2019/20;
  keys for all but 2010/11 & 2011/12) were extracted 2026-07-23 — all header-verified genuine
  W-M (Olsztyn), TODO now 0 pending. (The former `remaining/szkolny/` 14 — podlaskie 2012–2015
  sp/gim, wielkopolskie 2019–2026 — were merged into `pdfs/szkolny/` on 2026-07-22.)
  Only permanent gap: szkolny W-M 2012/13–2016/17 (never web-archived).
  → **126 files, 2210 questions; validates 100% clean:
  no dup ids, no invalid JSON, every points-sum == max, no missing/orphan figures,
  every file has school_type = **122 podstawowa + 4 gimnazjum**.)
  - The 4 gimnazjum files: 2018_podkarpackie + podlaskie 2013/2014/2015 _gim.
  - Keyless (answers null): podlaskie 2012/2013/2014. podlaskie 2015 + all wielkopolskie keyed.
  - **NEW field: `school_type`** (podstawowa | gimnazjum) added to EVERY json right after
    `competition`, derived from the title. Also a HTML filter ("Typ szkoły"). Only gimnazjum
    file so far: 2018_podkarpackie. Re-add script: the school_type block in the school_type
    section below / build.py auto-derives `data-school`.
- **rejonowy: 0 / 147** processed. (was 163; on 2026-07-23 **all 16 W-M files were purged** —
  W-M SP math has NO rejonowy stage, so every `pdfs/rejonowy/*_warminsko-mazurskie.pdf` was a spurious
  śląskie dup. Remaining 147 are the real set. Earlier +15 merged from `remaining/rejonowy/`:
  podkarpackie_gim 2010, podlaskie 2012–2015 sp/gim, wielkopolskie 2019–2026.)
- **wojewodzki: 0 / 165** processed (160 real — 5 W-M śląskie-dups still present for years with no
  genuine available: 2012/13–2015/16, 2025/26). On 2026-07-23 the W-M source files were **fixed**:
  12 genuine W-M wojewódzki papers (2009/10, 2010/11, 2011/12, 2016/17–2024/25) recovered & swapped
  in (keys for 2016/17 onward). Prep only — not processed. Earlier +16 merged from `remaining/wojewodzki/`.
- Built: 22 per-test HTMLs + `browser/wszystkie-zadania.html` (master, 320 questions).
  Rebuild master with: `cd browser && python3 build.py data/*.json -o wszystkie-zadania.html`

Recompute the exact TODO list any time (don't trust a hardcoded list). This version
also skips the mislabeled W-M duplicates (a W-M file byte-identical to same-year slaskie):
```
for f in pdfs/szkolny/*.pdf; do case "$f" in *_answers.pdf) continue;; esac
  b=$(basename "$f" .pdf)
  case "$b" in 20??-20??_warminsko-mazurskie)
    yr=${b%_warminsko-mazurskie}
    [ -e "pdfs/szkolny/${yr}_slaskie.pdf" ] && \
      [ "$(md5 -q pdfs/szkolny/$b.pdf)" = "$(md5 -q pdfs/szkolny/${yr}_slaskie.pdf)" ] && continue;;
  esac
  [ -e "browser/data/szkolny_${b}.json" ] || echo "$f"; done
```
(swap `szkolny` for `rejonowy`/`wojewodzki` and the `szkolny_` id prefix accordingly.)

## How to resume the parsing fan-out

One background Opus agent per **question PDF** (+ its `_answers` PDF). Recipe that worked:
- Tool: `Agent`, `subagent_type: "general-purpose"`, `model: "opus"`, background (parallel).
  Launch ~12 at a time (concurrency caps around a dozen; the rest queue).
- **The agent prompt template + per-file special-case notes now live in
  `EXTRACTION_PLAYBOOK.md`** (no longer only in chat). Copy it from there. Key points, per file:
  - Read `SCHEMA.md` fully + two example JSONs to match shape:
    `browser/data/szkolny_2026_podkarpackie.json` (open + figures + solutions) and
    `browser/data/szkolny_2025-2026_swietokrzyskie.json` (closed + true/false + open).
  - Source PDF, answers PDF (or "NONE" → answers_file=null, answers null),
    output path `browser/data/<name>.json`, id prefix `<name>_q<n>`.
  - **true/false = choices-form**: each statement a choice labeled "1","2",…;
    intro only in prompt_html; `answer.correct` a positional P/F string ("FPPP"), or null.
  - Figures: `pdftoppm -png -r 200 -f <pg> -l <pg> -x -y -W -H <src> <SCRATCH>/<name>`,
    Read the PNG, tighten, copy final to `browser/figures/<name>_q<n>_fig1.png`.
  - Validate JSON with `python3 -c "import json;json.load(open('...'));print('ok')"`.
  - Do NOT build HTML; do NOT touch other files.
- **Naming**: json/id = `<stage>_<sourcebasename>` (e.g. `szkolny_2015-2016_slaskie`).
- **SCRATCH dir is session-specific** — don't reuse the old UUID path. Use this session's
  scratchpad or `$CLAUDE_JOB_DIR/tmp`. Give each agent a unique prefix (= its `<name>`).
- After a batch: validate the whole corpus (dup ids / missing figs / points-sum == max),
  then rebuild per-test HTMLs + master.

## Open decisions (not done — waiting on user)

- **Blind verification pass**: offered, not run. Fan out a 2nd set of agents that solve
  each question WITHOUT seeing `answer.correct`, then diff vs stored answers to surface
  both agent errors and genuine key errors. Current answers = official keys + a
  self-reported (non-blind) sanity check; NOT independently re-solved.
  - **Suspected genuine key errors already spotted** (stored faithfully as the official key,
    flag for this pass): `szkolny_2018_podkarpackie_2_q1` (hash aff9ae09; key B=38 but arith→47=C),
    `szkolny_2020_dolnoslaskie_q20` (key B=500cm² but corner-cube removal preserves area→550,
    not even an option), `szkolny_2020-2021_zachodniopomorskie_q20` (key's final line mislabels
    the difference as x). Good ground-truth test cases for the blind solver.
  - **Agent-derived (not from official key), verify first**: `szkolny_2023-2024_pomorskie_q9`
    (hash f6385e77) — the bundled 9.1–9.7 letters were computed by the agent because the
    pomorskie key gives only per-item scoring criteria, no letters. Also note several years
    have keys that accept ALTERNATE answers (stored as "X lub Y" / "B, D"): 2022-2023_malopolskie q9,
    2022_lodzkie q2 & q3, 2022_mazowieckie q1 & q3 — these are correct-as-stored, not errors.
- **Bundled multi-part questions**: pomorskie 2024-25 Q8 and 2025-26 Q10 pack several
  A–D sub-items into one `closed_single` with sub-parts in `prompt_html` (not individually
  filterable). Fine for now; revisit if per-sub-item filtering is wanted.

## Gotchas discovered

- **W-M 2010–2020 are mislabeled Śląskie duplicates.** Every `20XX-20YY_warminsko-mazurskie.pdf`
  from 2010-2011 through 2019-2020 is **byte-identical** (same md5, incl. the `_answers` PDF)
  to the same-year `_slaskie.pdf` — printed header reads "województwa śląskiego"
  (Kuratorium w Katowicach). They are NOT real W-M arkusze. Do **not** process them;
  the TODO command above filters them out. (2010-2013 ones were caught & their JSON/figures
  deleted this batch.) Note: 2024-2025 & 2025-2026 W-M are real (distinct files, already processed).
  - **CONFIRMED download mix-up** (web-investigated 2026-07-23), not a source duplication:
    the files self-identify as śląskie by header; genuine W-M is a separate competition
    (Olsztyn, "Wojewódzki Konkurs Matematyczny", WMODN logo, no "Elementami Przyrody",
    ~8pp/15 tasks/60min vs śląskie 9pp/22/90min); and the W-M authority hosted its OWN distinct
    math papers for exactly 2010–2020. The download agent evidently pulled śląskie files and
    mislabeled them W-M. Genuine W-M 2010–2020 originals are **offline** (wmodn.olsztyn.pl 404,
    Wayback had no usable snapshot). Live re-download hub for genuine W-M arkusze+klucze:
    **https://www.ko.olsztyn.pl/category/konkursy-przedmiotowe/testy/** (recent years; older
    years likely gone). See SOURCES.md.
- A resumed agent (2012-2013_malopolskie) ran `build.py` against instructions and left a
  stray `browser/szkolny_2012-2013_malopolskie.html`. Harmless (master untouched); the final
  HTML rebuild regenerates everything. Watch for stray per-test HTMLs after resumed agents.


- LibreOffice headless: first-ever call warms up the profile and can no-op silently; the
  docx→pdf conversions are already done (originals moved to `docx_originals/`).
- `2025_lodzkie` / `2026_lodzkie` are docx-converted (layout differs); tell the agent.
- `2025_lubelskie` had **no separate key** but the key is embedded in the question PDF
  (pp. 14–16); `answers_file` points at the question PDF itself. Watch for this pattern.
- `2025-2026_pomorskie` genuinely has no key → answers null.
- Filename year ≠ school_year sometimes (e.g. `2025_mazowieckie` is 2025/2026,
  `2025_podkarpackie` is 2024/2025). Use the printed header, not the filename.
- Text layer drops exponents/roots — always read page images for math.
- **Annulled questions** ("Zadanie anulowano") — everyone got full points; keep as a question,
  `answer.correct: null`, points retained (still counts toward max_points).
  **User convention (decided this session):** KEEP the real question text + an annulment note.
  BUT two sub-cases:
  - Paper still prints the question (annulled only in the key) → prompt_html = real text +
    note paragraph; restore choices if any.
  - Paper REPLACED the question with the red notice (Małopolskie does this — confirmed for
    2018-2019 Q8 & 2017-2018 Q19; the original text is GONE from the source) → the notice IS
    the content; `choices: []`. Nothing to restore. These two are correct as-is.
  After each batch, grep new JSONs for "anulowano" and verify the right sub-case was applied.
  Current annulled set (3): 2017-2018_malopolskie q19 & 2018-2019_malopolskie q8 (paper replaced
  text w/ notice — notice IS the content), and **2024_dolnoslaskie q9** (paper KEEPS the full
  question — real text + annulment note, points retained, answer null; the keep-text sub-case).
- **No-key years**: 2017-2018_pomorskie (like 2025-2026_pomorskie) has no key anywhere
  (checked for embedded too) → answers_file null, all answer.correct null.
- Filename year commonly one-off from printed school_year for single-year names
  (2016_podkarpackie=2015/2016, 2016_podlaskie & 2017_podlaskie=next year, etc.) — trust header.
