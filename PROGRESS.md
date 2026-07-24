# Pipeline progress & resume notes

## What this is
An archive of past **Polish regional math-competition** papers — *Wojewódzki Konkurs
Przedmiotowy z Matematyki* / *Konkurs Matematyczny* for primary schools (szkoły podstawowe;
one older gimnazjum set), spanning many voivodeships and years (~2010–2026), across the three
contest stages **szkolny** (school) → **rejonowy** (regional) → **wojewódzki** (provincial).
The pipeline turns the official question-paper PDFs + answer keys into per-question structured
JSON (`browser/data/`, figures in `browser/figures/`), served by one **filterable question
browser** (`browser/index.html`, static app rendering client-side from generated data shards) —
search/filter practice problems by topic, year, voivodeship, points, question type, and school
type. Purpose: a searchable practice bank for contest prep.

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
    section below / the browser app filters on it directly.
- **rejonowy: 45 / 147** processed (batches 1–3 done 2026-07-23; batches 4–5 done 2026-07-24). (was 163; on 2026-07-23 **all 16
  W-M files were purged** — W-M SP math has NO rejonowy stage, so every
  `pdfs/rejonowy/*_warminsko-mazurskie.pdf` was a spurious śląskie dup. Remaining 147 are the real
  set. Earlier +15 merged from `remaining/rejonowy/`: podkarpackie_gim 2010, podlaskie 2012–2015
  sp/gim, wielkopolskie 2019–2026.)
  - **Batch 1 (12):** 2010-2011/2011-2012/2012-2013/2013-2014_slaskie (przyroda-tagged),
    2010_podkarpackie_gim (gimnazjum, header yr 2009/2010), 2012/2013_podkarpackie,
    2012-2013/2013-2014_malopolskie, 2012_podlaskie_sp, 2013_podlaskie_gim/sp. All header-verified.
  - **Batch 2 (10):** 2014-2015/2015-2016_slaskie (pure math — see below), 2014/2015_podkarpackie,
    2014_podlaskie_gim/sp + 2015_podlaskie_gim, 2014-2015/2015-2016_malopolskie, 2015_opolskie
    (first opolskie file). All keyed + self-verified.
  - **Batch 3 (3):** 2015_podlaskie_sp, 2016-2017_malopolskie, 2016-2017_slaskie (pure math, title
    confirmed). All keyed + self-verified. 2015_podlaskie_sp_q23 has two accepted answers → stored
    "100 dni lub 117 dni".
  - **Batch 4 (10):** 2016/2017_opolskie (each 11 q: 5 T/F + 6 open, keys re-derived clean),
    2016/2017_podkarpackie, 2016/2017_podlaskie (suffix-less filenames → **both podstawowa** by
    title), 2017-2018/2018-2019_malopolskie, 2017-2018_slaskie (pure math), 2017-2018_pomorskie
    (see below). All header-verified.
  - **PODLASKIE lost its _sp/_gim suffix from 2016 on** (gimnazjum reform phase-out) — 2016/2017
    podlaskie files are single unified **podstawowa** papers; determine school_type from the title.
  - **2017-2018_pomorskie: NO key anywhere** (no separate PDF, no embedded — page 8 blank
    BRUDNOPIS) → answers_file null, all correct null. Only 9 q (8 open + 1 T/F), NOT the bundled
    multi-part single-choice format. (Adds to the keyless list above.)
  - **2016_opolskie numbering misprint:** Part II restarts numbering at "6,7,8" instead of 9,10,11;
    the answer key numbers 1–11 correctly. Agent used the key's continuous 1–11 for number/id.
  - **Batch 5 (10):** 2018-2019/2019-2020_pomorskie (bundled closed_single sub-item blocks),
    2018-2019/2019-2020_slaskie (pure math), 2018_opolskie (key re-derived clean), 2018_podkarpackie
    (NO key anywhere → null), 2018_podlaskie (podstawowa by title), 2018-2019_zachodniopomorskie
    (annulled q23 — see below), 2019-2020_malopolskie, 2019-2020_swietokrzyskie. All header-verified.
  - **First rejonowy ANNULMENT:** `rejonowy_2018-2019_zachodniopomorskie_q23` — garbled double-negative,
    key awarded everyone the point; paper PRINTS the question → kept real text + italic annulment note,
    answer.correct null, 1 pt retained (keep-text sub-case a). Sum still 27=27. (grep 'anulowan' finds it.)
  - **POMORSKIE bundled format extends to rejonowy:** multi-part "Zadanie N" closed sub-item blocks
    (N.1–N.k single-choice) → ONE closed_single, sub-items in prompt_html, choices [], combined
    answer.correct. Also pomorskie rejonowy T/F items can carry 6 statements worth 5 pts (1pt/2 correct).
  - **2018_podkarpackie: NO key anywhere** (page 9 blank BRUDNOPIS, no embedded) → answers null. (Adds
    to keyless list: now 2012_podkarpackie, 2018_podkarpackie, 2012/2013 podlaskie sp/gim, 2017-2018_pomorskie.)
  - **2018_podlaskie key has a stale-template header (2017/2018)** while the question paper says 2018/2019
    (date 19.12.2018) — trust the question paper, not the key header.
  - **Keyless (answers null):** 2012_podkarpackie, 2012_podlaskie_sp, 2013_podlaskie_gim/sp — no
    separate key and none embedded (checked last pages). All other 18 keyed + self-verified.
  - **ŚLĄSKIE switched away from "z Elementami Przyrody" ~2014/2015:** 2010-2013 śląskie rejonowy
    papers are the przyroda variant (nature items → `przyroda`); **2014-2015 onward are pure
    "Konkurs Przedmiotowy z Matematyki"** — NO przyroda tags. Agents must verify the printed title,
    not assume przyroda from the śląskie name.
  - **Flagged source inconsistencies / key errors** (corpus validator will keep surfacing #1):
    1. `rejonowy_2012_podlaskie_sp` points-sum **31 ≠ printed max 30** (Q16 has no printed point
       marker; assigned 2 per the "13–16" grouping — printed "Razem 30" off by one). Not an
       extraction error.
    2. `rejonowy_2015_opolskie_q8` (hash 44782164) — **suspected key error**, added to
       suspected_key_errors.tsv: key says 246,4 cm² but printed Q asks lateral surface (correct =
       192 cm²); key row looks mismatched. Stored the correct 192; verify in blind pass.
    3. `rejonowy_2014_podkarpackie_q16` — arkusz omitted square labels; everyone got 1 pt but key
       still lists B. Kept correct=B + italic note (not an annulment).
- **wojewodzki: 0 / 165** processed (160 real — 5 W-M śląskie-dups still present for years with no
  genuine available: 2012/13–2015/16, 2025/26). On 2026-07-23 the W-M source files were **fixed**:
  12 genuine W-M wojewódzki papers (2009/10, 2010/11, 2011/12, 2016/17–2024/25) recovered & swapped
  in (keys for 2016/17 onward). Prep only — not processed. Earlier +16 merged from `remaining/wojewodzki/`.
- Browser: static app (`browser/index.html` + `app.css` + `app.js`, committed) rendering from
  generated per-stage data shards (`data.<stage>.js`/`.json`, gitignored). Rebuild shards with:
  `cd browser && node build.mjs` (2026-07-23: replaced the old per-test HTML generator `build.py`).

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
- (Historical) Resumed agents occasionally ran the old `build.py` against instructions and left
  stray per-test HTMLs. Moot since 2026-07-23: build.py and per-test HTMLs are gone — the browser
  is a static app; only `node build.mjs` regenerates data shards.


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
  Current annulled set (4): szkolny_2017-2018_malopolskie q19 & szkolny_2018-2019_malopolskie q8 (paper
  replaced text w/ notice — notice IS the content), **szkolny_2024_dolnoslaskie q9** and
  **rejonowy_2018-2019_zachodniopomorskie q23** (paper KEEPS the full question — real text + annulment
  note, points retained, answer null; the keep-text sub-case).
- **No-key years**: 2017-2018_pomorskie (like 2025-2026_pomorskie) has no key anywhere
  (checked for embedded too) → answers_file null, all answer.correct null.
- Filename year commonly one-off from printed school_year for single-year names
  (2016_podkarpackie=2015/2016, 2016_podlaskie & 2017_podlaskie=next year, etc.) — trust header.
