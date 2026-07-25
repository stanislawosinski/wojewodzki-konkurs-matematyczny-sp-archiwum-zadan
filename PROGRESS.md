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
- **rejonowy: COMPLETE — 147 / 147** processed (batches 1–3 done 2026-07-23; batches 4–8 done
  2026-07-24; batches 9–13 done 2026-07-25). → **147 files, 2706 questions; validates clean**
  (no dup ids, no invalid JSON, every points-sum == max except the one documented source defect
  rejonowy_2012_podlaskie_sp 31≠30, no missing/orphan figures, all have school_type). 2 annulled
  (zachodniopomorskie 2018-19 q23, dolnoslaskie 2023 q9). Keyless: 2012/2018/2020/2021_podkarpackie,
  2012/2013 podlaskie sp/gim, 2017-2018_pomorskie, 2019/2020/2021_lodzkie. Embedded keys: all
  lubelskie + opolskie 2019. (was 163; on 2026-07-23 **all 16
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
  - **Batch 6 (6):** 2019-2020_wielkopolskie, 2019-2020_zachodniopomorskie (33 closed, no annulment
    this year), 2019_kujawsko-pomorskie (new woj), 2019_lodzkie (keyless — see below), 2019_lubuskie
    (new woj), 2019_mazowieckie (combined-choice). All keyed + self-verified except łódzkie.
  - **New voivodeships:** kujawsko-pomorskie, lubuskie (both podstawowa, header-verified).
  - **łódzkie 2019 GENUINELY KEYLESS** (no separate + no embedded; łódzkie 2019–2021 all keyless,
    2022+ keyed) → answers null. docx-converted layout; some closed items have 3 or 5 (A–E) choices.
    (Adds to keyless list.)
  - **mazowieckie combined-choice confirmed for rejonowy:** "zaznacz wszystkie" item → ONE
    closed_single with comma-joined answer (e.g. "C, D"), per szkolny_2023_mazowieckie.
  - Filename single-year vs header: 2019_* files nearly all resolve to **2018/2019** (Dec 2018 / Feb
    2019 contest dates) — trust the printed date, not the filename.
  - **Batch 7 (15):** 2019_opolskie (embedded key), 2019_podkarpackie, 2019_podlaskie,
    2020-2021_{malopolskie, pomorskie (bundled), slaskie (pure math), wielkopolskie,
    zachodniopomorskie, swietokrzyskie_1, swietokrzyskie_2}, 2020_{dolnoslaskie (new woj),
    kujawsko-pomorskie, lodzkie (keyless), lubuskie, mazowieckie (combined-choice)}. All
    header-verified; keyed + self-verified except łódzkie.
  - **New rejonowy voivodeship:** dolnoslaskie ("zDolny Ślązak", printed stage "powiatowy" → kept
    rejonowy). Also świętokrzyskie ships **two SP papers per year** (_1 = 19.01, _2 = 03.02.2021;
    both podstawowa) — process each separately, store the printed title in `competition`.
  - **2019_opolskie key is EMBEDDED** in the question PDF (pp.3–4) → answers_file = the question pdf
    itself (like lubelskie). Opolskie prints Part II before Part I; keep logical numbering 1–11.
  - **łódzkie 2020 keyless + docx colon-garble:** the docx→pdf conversion misplaces the ratio/division
    colon (renders *after* the following number); decode by the consistent swap rule (e.g. "11000:"
    → "1:1000", "19:8:" → "1:9:8"). Still no key → answers null.
  - **kujawsko-pomorskie format is not stable:** 2019 = 5 open (20 pts); 2020 = 21 mixed q (16 closed
    + T/F + open, 30 pts). Don't assume; read the paper.
  - **Two more suspected key errors (borderline, stored official C, flagged in
    suspected_key_errors.tsv):** `rejonowy_2020-2021_malopolskie_q1` (Roman numerals, key C vs likely
    D) and `rejonowy_2020-2021_swietokrzyskie_1_q1` ("cannot equal −1,2" has two valid options as
    printed; likely a print error in option B). Ground-truth candidates for the blind pass.
  - `dolnoslaskie` rejonowy figures include cryptarithm/long-multiplication layouts kept AS figures
    (aligned digit grids don't render faithfully as text). `2020_lubuskie` q25 (cube-net choice) puts
    each option's diagram as an inline `<img src="figures/…">` inside the choice html (+ a reference
    fig1) — renders correctly; keep this pattern for image-choice questions.
  - **Batch 8 (5):** 2020_opolskie (key clean this year), 2020_podkarpackie (KEYLESS — see below),
    2020_podlaskie, 2021-2022_malopolskie (Q9 "D lub E" alternate), 2021-2022_pomorskie (bundled Q7).
    All header-verified.
  - **2020_podkarpackie: NO key** (no separate PDF, none embedded — page 13 is a blank karta
    odpowiedzi) → answers null. Confirms podkarpackie keys are separate downloads sometimes missing;
    other podkarpackie years mostly keyed. (Keyless list grows: 2012/2018/2020_podkarpackie, 2012/2013
    podlaskie sp/gim, 2017-2018_pomorskie, 2019/2020_lodzkie.)
  - **Batch 9 (10):** 2021-2022_{slaskie (pure math), swietokrzyskie, wielkopolskie,
    zachodniopomorskie (30 closed, no annulment)}, 2021_{dolnoslaskie, lodzkie (keyless, 100-pt),
    lubelskie (embedded key), lubuskie, mazowieckie (combined-choice), podkarpackie (KEYLESS)}. All
    header-verified.
  - **New rejonowy voivodeship: lubelskie** — like szkolny, the key is EMBEDDED in the question PDF
    ("ODPOWIEDZI I SCHEMAT OCENIANIA", 2021 pp.14–15) → answers_file = the question pdf itself.
  - **łódzkie 2021** keyless (docx); this one uses a **100-point scale** (11×5 A–E closed + T/F 10 +
    open) and the colon-garble did NOT appear (ratios rendered fine) — still verify per file.
  - **2021_podkarpackie also KEYLESS** (blank karta odpowiedzi, no embedded) → answers null. Both
    2020 & 2021 podkarpackie rejonowy lack keys. (Keyless list: +2021_podkarpackie, +2021_lodzkie.)
  - **Batch 10 (10):** 2021_podlaskie, 2022-2023_{malopolskie, pomorskie (bundled), slaskie (pure
    math), swietokrzyskie, wielkopolskie, zachodniopomorskie (40 closed!)}, 2022_{dolnoslaskie,
    lodzkie (now KEYED, 80-pt), lubelskie (embedded key)}. All keyed + self-verified.
  - **łódzkie is KEYED from 2022 on** (2019–2021 were keyless). 2022_lodzkie has a separate
    _answers.pdf, 80-pt scale (A–E closed @3pt) — NOT the 100-pt of 2021. docx layout persists.
  - **zachodniopomorskie grew 30→40 closed questions in 2022/2023** (was 27 in 2018/19, 30–33 since).
    Don't assume a fixed count.
  - **dolnoslaskie filename year = END year; contest is Nov of the prior year** (2020→2019/2020 Nov
    2019; 2021→2020/2021 Nov 2020; 2022→2021/2022 Nov 2021). Trust the printed date.
  - **Source printing defects (recorded faithfully, NOT key errors):** 2022-2023_slaskie q11 and
    2020-2021_swietokrzyskie_2 q6 have duplicated/mislabeled answer choices in the arkusz; the key's
    answer is still unambiguous, noted in the question's solution_html.
  - **Batch 11 (20):** 2022_{lubuskie, mazowieckie (combined-choice), opolskie, podkarpackie (now
    KEYED), podlaskie} + all of 2023: 2023-2024_{malopolskie, pomorskie (bundled), slaskie (pure
    math), swietokrzyskie, wielkopolskie, zachodniopomorskie (40 closed)}, 2023_{dolnoslaskie,
    kujawsko-pomorskie, lodzkie (100-pt), lubelskie (embedded key), lubuskie, mazowieckie
    (combined-choice), opolskie, podkarpackie, podlaskie}. All keyed + self-verified.
  - **2nd rejonowy ANNULMENT:** `rejonowy_2023_dolnoslaskie_q9` — key explicitly says "Zadanie nr 9
    zostało anulowane ze względu na błąd w poleceniu" (triangle labeled C but the prompt asks for T).
    annulled:true, correct null, 1 pt retained, note in prompt_html, figure kept. (Annulled register
    now 5: +this. grep 'anulowan' finds it.)
  - **Official key UPDATE note:** 2023-2024_malopolskie key carries a dated correction (2024-01-25)
    fixing q15 B→D and q16 D→E — use the corrected values (agent verified both).
  - **podkarpackie became KEYED again in 2022** (2020/2021 were keyless); 2023_podkarpackie shifted to
    an all-OPEN 9-question 24-pt paper (was 21–22 mixed). **kujawsko-pomorskie** keeps mutating
    (2023 = 19 q / 20 pt, 18 closed + 1 T/F). Read each paper; don't assume prior-year shape.
  - **łódzkie key transcription typos (open Qs):** 2023_lodzkie key mis-stated a point coord (q13) and
    a surd (q14 √3 vs √6); agent stored the geometry-confirmed correct forms (the key's own working
    confirmed them). Not tsv-flagged (key internally self-corrects).
  - **New borderline key flag (suspected_key_errors.tsv):** `rejonowy_2023_dolnoslaskie_q5` (lattice
    points at integer distance from A: key C=26 vs a strict Euclidean count of 34; narrower counting
    convention). Stored official C.
  - **Batch 12 (20):** all of 2024 (dolnoslaskie, kujawsko-pomorskie, lodzkie, lubelskie [embedded
    key], lubuskie, mazowieckie, opolskie, podkarpackie, podlaskie) + 2024-2025_{malopolskie,
    pomorskie, slaskie, swietokrzyskie, wielkopolskie, zachodniopomorskie} + 2025-2026_{malopolskie,
    pomorskie, slaskie, swietokrzyskie, wielkopolskie}. All keyed + self-verified; no annulments.
  - **The 2025/2026 rejonowy season is now partly in the corpus** (małopolskie, pomorskie, śląskie,
    świętokrzyskie, wielkopolskie — contest dates Dec 2025 / Feb 2026). śląskie 2025-2026 dropped the
    crossword q1 (17 q / 40 pt, not the 60-pt crossword format).
  - **lubuskie 2024** added a 3rd item type: "wielokrotnego wyboru" (multi-answer closed, 27–29) →
    modeled as closed_single with comma-joined answers, same as mazowieckie multi-select.
  - **podkarpackie & dolnoslaskie confirm their per-year format drift:** 2024_podkarpackie = 9 all-open
    (6×2+3×4=24pt); dolnoslaskie stays ~15-16 q / 24-25 pt with Nov/Dec-prior-year dates.
  - **Batch 13 (16) — FINISHES REJONOWY:** the single-year 2025 & 2026 tail (dolnoslaskie,
    kujawsko-pomorskie, lodzkie, lubelskie [embedded], lubuskie, mazowieckie, opolskie, podkarpackie,
    podlaskie for 2025; dolnoslaskie, kujawsko-pomorskie, lodzkie, lubelskie [embedded], lubuskie,
    opolskie, podkarpackie for 2026). All keyed + self-verified; no annulments.
  - **2025/2026 season fully in for these voivodeships.** New closed sub-formats normalized to
    closed_single with combined answers: lubuskie "two-select" (choices A–H, e.g. "A, H"),
    "teza+uzasadnienie" ("B2"), and multi-answer "wielokrotnego wyboru". łódzkie uses 60/80/100-pt
    scales interchangeably per year — trust the printed "Maksymalna liczba punktów".
  - **Source authoring defects seen (transcribed faithfully, key answer still unambiguous):**
    2026_kujawsko-pomorskie q4 (truncated numerators in choices B/C), 2025_lodzkie q9 ("no valid
    answer" impossibility task — NOT an annulment, computed heights stored). Embedded-key running
    headers occasionally carry a stale prior-year (2025_lubelskie key hdr says 2023/2024,
    2025_mazowieckie answers title says "ETAP SZKOLNY") — trust the question paper.
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
- **wojewodzki: 40 / 160** processed (batches 1–2 done 2026-07-25). (160 real of 165 — 5 W-M śląskie-dups
  still present for years with no genuine available: 2012/13–2015/16, 2025/26. On 2026-07-23 the W-M
  source files were fixed: 12 genuine W-M wojewódzki papers (2009/10, 2010/11, 2011/12, 2016/17–2024/25)
  recovered & swapped in — keys for 2016/17 onward. Earlier +16 merged from `remaining/wojewodzki/`.)
  - **Batch 1 (20):** 2009-2010/2010-2011/2011-2012_warminsko-mazurskie (GENUINE Olsztyn, keyless),
    2010-2011/2011-2012/2012-2013/2013-2014/2014-2015_slaskie, 2010_podkarpackie_gim, 2011/2012/2013/2014
    _podkarpackie, 2011/2013_podlaskie_gim, 2012/2013_podlaskie_sp, 2012-2013/2013-2014/2014-2015
    _malopolskie. All header-verified.
  - **Genuine W-M confirmed:** the 3 W-M files (2009/10–2011/12) have md5 distinct from same-year
    slaskie and printed "Kuratorium Oświaty w Olsztynie" / "W-M ODN" — NOT dups. They print NO
    per-question points and NO key → points are convention-based (closed 1 / open 2–3), answers null.
  - **śląskie wojewódzki: "z Elementami Przyrody" through 2013/2014, PURE MATH from 2014/2015** (same
    switch as szkolny/rejonowy). 2010-2013 + 2013-2014 śląskie przyroda-tagged; 2014-2015 pure math.
  - **Keyless wojewódzki (answers null):** all 3 genuine W-M, 2011/2012/2013 podlaskie sp/gim,
    2012_podkarpackie. Others keyed + self-verified.
  - **2nd documented points!=max:** `wojewodzki_2011_podlaskie_gim` sum 42 ≠ stated 45 — closed block
    1–13 are MULTIPLE-SELECT ("może być po kilka poprawnych odpowiedzi") worth extra untabulated
    points; kept max_points at the printed 45. Not an extraction error; validator will keep flagging it.
  - **Batch 2 (20):** 2014_podlaskie_sp/gim, 2015_podkarpackie/podlaskie_sp/podlaskie_gim/opolskie,
    2015-2016_slaskie/malopolskie, 2016_opolskie/podkarpackie/podlaskie, 2016-2017_slaskie/malopolskie/
    warminsko-mazurskie, 2017_opolskie, 2017-2018_slaskie/malopolskie/pomorskie/zachodniopomorskie/
    warminsko-mazurskie. All keyed + self-verified except 2017-2018_pomorskie (keyless).
  - **W-M has SEPARATE KEYS from 2016/2017 on** (2016-2017 & 2017-2018 W-M both keyed + verified, genuine
    Olsztyn confirmed by md5 + "W-M ODN OLSZTYN" logo). Still no printed max on the arkusz → max_points
    computed (closed 1pt convention + stated open points).
  - **New wojewódzki voivodeships:** opolskie (two-part TAK/NIE + open, keys re-derived clean),
    zachodniopomorskie (closed+open, no annulment), pomorskie (2017-2018 KEYLESS, 9 q incl. an 8-stmt T/F).
  - **śląskie wojewódzki fully pure-math from 2014/2015** (2015-2016, 2016-2017, 2017-2018 all pure math,
    crossword q1). Confirmed przyroda ended after 2013/2014 at every stage.
  - **Official key corrections (not errors, not annulments):** 2016_podkarpackie key was officially
    corrected for q14/q17 (q14 = "A lub C" alternate). Minor source/key number mismatches
    (2016_opolskie q2, 2017_opolskie q3 missing sequence term) left faithful; P/F verdict robust.
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
  Current annulled set (5, all carry `"annulled": true`): szkolny_2017-2018_malopolskie q19 &
  szkolny_2018-2019_malopolskie q8 (paper replaced text w/ notice — notice IS the content);
  **szkolny_2024_dolnoslaskie q9**, **rejonowy_2018-2019_zachodniopomorskie q23**, and
  **rejonowy_2023_dolnoslaskie q9** (paper KEEPS the full question — real text + annulment note,
  points retained, answer null; the keep-text sub-case).
- **No-key years**: 2017-2018_pomorskie (like 2025-2026_pomorskie) has no key anywhere
  (checked for embedded too) → answers_file null, all answer.correct null.
- Filename year commonly one-off from printed school_year for single-year names
  (2016_podkarpackie=2015/2016, 2016_podlaskie & 2017_podlaskie=next year, etc.) — trust header.
