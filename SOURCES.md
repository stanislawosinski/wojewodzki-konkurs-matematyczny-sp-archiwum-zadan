# Sources & provenance

## The gap (read this first)

**The original download URLs were not recorded and are lost.** The early phase that
downloaded the per-voivodeship PDFs (one agent per wojewodztwo, each site different — no
standard) logged no URLs. Nothing downstream captured them: the JSONs store only local
paths (`source_file`, `answers_file`), there is no `source_url` field, and nothing —
not `idea.txt`, not the memory dir — records where files came from.

What *did* survive is the archive *shape* (not the sites), folded into the **Provenance of
the merged files** section at the bottom of this file (formerly `remaining/NOTES.md`):
- **podkarpackie** — loose individual PDFs (the `podkarpackie_*_2011_ambiguous.pdf`, since deleted)
- **wielkopolskie** — one combined yearly PDF per year, split into 3 stages × (test, key)
- **podlaskie** — the 5 `podlaskie_testy_*.zip` archives (SP + gimnazjum)

## Re-derivation seeds (per voivodeship)

To re-find sources, use the **organizing body**. All these are *konkursy przedmiotowe*
run by each voivodeship's **Kuratorium Oświaty** (regional education authority), so the
Kuratorium in the voivodeship capital is the canonical publisher/host.

- **Competition name** below = verbatim from the papers' printed headers (via the JSON
  `competition` field) — reliable.
- **Publisher/city** = inferred (well-founded: przedmiotowe konkursy are always Kuratorium-run),
  **verify before trusting**. **No URLs listed** — those would be guesses.

| Woj. | Competition (as printed) | Publisher — city *(inferred, verify)* |
|---|---|---|
| dolnoslaskie | "Dolnośląski Konkurs Matematyczny **zDolny Ślązak**" | DODN / Kuratorium — Wrocław. (zDolny Ślązak is a distinct branded program.) |
| kujawsko-pomorskie | "(Wojewódzki) Konkurs Przedmiotowy z Matematyki … województwa kujawsko-pomorskiego" | Kuratorium Oświaty — Bydgoszcz |
| lodzkie | "Wojewódzki Konkurs Przedmiotowy z Matematyki organizowany przez **Łódzkiego Kuratora Oświaty**" | Kuratorium Oświaty — Łódź (named on papers) |
| lubelskie | "Konkurs Matematyczny dla uczniów szkoły podstawowej" | Kuratorium Oświaty — Lublin. (Key embedded in the test PDF, pp. ~12–16.) |
| malopolskie | "**Małopolski** Konkurs Matematyczny … województwa małopolskiego" | Kuratorium Oświaty — Kraków |
| mazowieckie | "Konkurs Matematyczny dla uczniów (klas IV–VIII) szkół podstawowych województwa mazowieckiego" | Kuratorium Oświaty — Warszawa |
| podkarpackie | "Konkurs z Matematyki … (podkarpackie)"; older **gimnazjum** variant present | Kuratorium Oświaty — Rzeszów |
| podlaskie | "Wojewódzki Konkurs Matematyczny … (podlaskie)" | Kuratorium Oświaty — Białystok |
| pomorskie | "Wojewódzki Konkurs Matematyczny dla uczniów klas IV–VIII szkół podstawowych województwa pomorskiego" | Kuratorium Oświaty — Gdańsk |
| slaskie | "Wojewódzki Konkurs Przedmiotowy z Matematyki … województwa śląskiego" (+ older **"z Elementami Przyrody"** math+nature variant) | **Kuratorium Oświaty — Katowice** (confirmed on papers) |
| swietokrzyskie | "**{IV…X}** Wojewódzki Konkurs z Matematyki … województwa świętokrzyskiego" (editions numbered) | Kuratorium Oświaty — Kielce |
| warminsko-mazurskie | "Wojewódzki Konkurs Matematyczny dla szkół podstawowych" | **W-M ODN / Kuratorium — Olsztyn.** Live hub: https://www.ko.olsztyn.pl/category/konkursy-przedmiotowe/testy/ ; old archive wmodn.olsztyn.pl (now 404). See W-M note below. |
| zachodniopomorskie | "Konkurs Matematyczny … województwa zachodniopomorskiego" | Kuratorium Oświaty — Szczecin |
| **wielkopolskie** | "Wojewódzki Konkurs Matematyczny …województwa wielkopolskiego" (szkolny processed; wojew. staged) | Kuratorium Oświaty — Poznań |

## Warmińsko-Mazurskie ↔ Śląskie mix-up (confirmed 2026-07-23)

The archive's W-M **szkolny** files for 2010/2011–2019/2020 are byte-identical to the same-year
**śląskie** files — a **download mix-up** (agent pulled śląskie files and mislabeled them W-M),
NOT a source duplication. Web investigation confirmed: the files carry śląskie headers
("województwa śląskiego", Kuratorium Katowice, "z Elementami Przyrody"); genuine W-M is a
separate competition (Olsztyn); and the W-M authority published its own distinct math papers
those years. **Recovery done (2026-07-23):** genuine W-M papers were re-sourced (Wayback for 2009/10–2011/12
via curl; live ko.olsztyn.pl for 2016/17+) and integrated. szkolny genuine now present for
2009/10, 2010/11, 2011/12, 2017/18, 2018/19, 2019/20 (+2020/21–2025/26 already had); **still
unrecoverable: szkolny 2012/13–2016/17** (never web-archived). wojewódzki genuine present for
2009/10–2011/12 + 2016/17–2024/25. All three stage dirs were also cleaned of the mislabeled W-M
dups: **rejonowy W-M fully purged** (W-M has NO rejonowy stage), wojewódzki dups replaced where a
genuine paper existed (5 dup years remain: 2012/13–2015/16, 2025/26). The recovered **szkolny**
papers were extracted 2026-07-23 (szkolny now complete); the recovered **wojewódzki** papers are
staged as source PDFs, not yet extracted.

## Coverage gaps

- The table rows come from the **szkolny** corpus (now complete, incl. wielkopolskie).
  rejonowy & wojewodzki stages are not yet processed.
- Of Poland's 16 voivodeships, **lubuskie** and **opolskie** appear to be absent from the archive.
- Some podlaskie years have **no answer key** (zips lacked schematy): 2011 gim-woj, 2012 sp
  (all stages), 2013 sp+gim (all stages), 2014 szkolny — see Provenance below.

## Problematic answer-key PDFs (wojewódzki batch 8, found 2026-07-26)

Several `pdfs/wojewodzki/*_answers.pdf` have a **corrupt image layer**: `pdftoppm` renders a
*different* competition (usually the wielkopolskie 2025/26 key), but the **text layer**
(`pdftotext -layout`) is the correct key. Extraction agents that read the render first wrongly
reported these "keyless"; all but one were recovered from the text layer. **Always read keys via
`pdftotext -layout` first** (now the standing rule in EXTRACTION_PLAYBOOK.md).

| answers PDF | image layer renders as | real key (text layer) | status |
|---|---|---|---|
| `wojewodzki/2024_kujawsko-pomorskie_answers.pdf` | podkarpackie | kujawsko-pomorskie 2023/24 | recovered (text) |
| `wojewodzki/2024_podlaskie_answers.pdf` | wielkopolskie | podlaskie 2024/25 | recovered (text) |
| `wojewodzki/2024_lodzkie_answers.pdf` | śląskie 2025/26 | łódzkie 2023/24 | recovered (text) |
| `wojewodzki/2025-2026_slaskie_answers.pdf` | wielkopolskie | śląskie 2025/26 | recovered (text) |
| `wojewodzki/2025-2026_pomorskie_answers.pdf` | wielkopolskie | pomorskie 2025/26 | recovered (text) |
| `wojewodzki/2024_lubuskie_answers.pdf` | podlaskie (scan) | **none** — no text layer (3 bytes) | **UNRECOVERED — needs re-sourcing** |

`2024_lubuskie` is the only genuine loss: the file is a pure scanned image of a *podlaskie* key,
so `wojewodzki_2024_lubuskie.json` has `answers_file: null` and all answers null. That paper also
prints **no voivodeship** in its header — `wojewodztwo: lubuskie` rests on the filename alone.
(Note: lubuskie & opolskie, listed absent above from the szkolny corpus, DO appear in wojewódzki.)

## Provenance of the merged files (formerly `remaining/NOTES.md`)

78 PDFs were converted from ambiguous/archived source originals and merged into the main stage
dirs (`pdfs/szkolny/`, `pdfs/rejonowy/`, `pdfs/wojewodzki/`) on 2026-07-22. The pre-conversion originals (4
podkarpackie ambiguous PDFs, 5 podlaskie zips, 7 wielkopolskie combined PDFs) were deleted
2026-07-23 once their derivatives were in place. Verified at conversion: subject=math, stage,
and printed school-year all match filenames.

**Naming decisions** (differ per wojewodztwo, matching existing dirs):
- Year = how each wojewodztwo's existing files number: podkarpackie → ending year (`2011` = 2010/2011);
  podlaskie → starting year (`2016` = 2016/2017); wielkopolskie → `YYYY-YYYY` (source-labelled).
- `_sp`/`_gim` suffix = school track — needed because 2011–2016 ran separate SP and gimnazjum
  contests (same year/stage would collide). 2016+ podlaskie have no suffix (post-reform single SP track).
- `_answers` = the official key (klucz / schemat oceniania).

**What came from where:**
- **podkarpackie** (4): the loose `podkarpackie_*_2011_ambiguous.pdf` are actually 2009/2010
  gimnazjum (filename year was wrong) → `2010_podkarpackie_gim` (rejonowy + wojewodzki). Not a dup
  of `wojewodzki/2011_podkarpackie` (that's 2010/2011 SP).
- **wielkopolskie** (42): each combined yearly PDF split into 3 stages × (test, key).
- **podlaskie** (32): math tests + schematy pulled from the 5 zips (SP + GIM). 2012 SP was `.doc`,
  converted via LibreOffice.

**Gaps (source had no key):** podlaskie 2011 (gim woj only), 2012 (sp, all stages), 2013 (sp+gim,
all stages), 2014 szkolny — zips contained no schemat files. Embedded keys inside test PDFs were
never split out; only separate key files were used.
