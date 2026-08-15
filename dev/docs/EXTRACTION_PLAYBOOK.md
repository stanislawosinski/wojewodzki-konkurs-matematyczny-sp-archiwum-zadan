# Extraction playbook (how to run a batch)

Detailed how-to for the PDF→JSON fan-out. Companion to **SCHEMA.md** (the JSON spec);
after extraction, two separate passes run on the JSON output: **VERIFICATION.md**
(blind AI answer layer) and **FIGURE_REDRAW.md** (bitmap→SVG redraws).

All three stages are extracted (433 files / 7632 questions, 2026-07); this recipe is
for future papers. Stages share layout — just swap the prefix everywhere:
`pdfs/szkolny/` · `pdfs/rejonowy/` · `pdfs/wojewodzki/`.
Each `pdfs/<stage>/` holds `<name>.pdf` question papers + optional `<name>_answers.pdf`
keys. Outputs: `browser/data/<stage>_<name>.json` + `browser/figures/<stage>_<name>_q<n>_figN.png`.

> **Layout (restructured for GitHub 2026-07-23):** source PDFs live under `pdfs/<stage>/`;
> extraction outputs under `browser/data/` + `browser/figures/`; generator `browser/build.py`.
> JSON `source_file`/`answers_file` stay `<stage>/<name>.pdf` (read as relative to `pdfs/`).

## Per-batch loop (what the orchestrator does)

1. **Compute the TODO** (never trust a hardcoded list; filters the W-M dups — see below):
   ```sh
   for f in pdfs/<stage>/*.pdf; do case "$f" in *_answers.pdf) continue;; esac
     b=$(basename "$f" .pdf)
     case "$b" in 20??-20??_warminsko-mazurskie) yr=${b%_warminsko-mazurskie}
       [ -e "pdfs/<stage>/${yr}_slaskie.pdf" ] && \
         [ "$(md5 -q pdfs/<stage>/$b.pdf)" = "$(md5 -q pdfs/<stage>/${yr}_slaskie.pdf)" ] && continue;;
     esac
     [ -e "browser/data/<stage>_${b}.json" ] || echo "$b"; done | head -12 | while read b; do
       [ -e "pdfs/<stage>/${b}_answers.pdf" ] && echo "$b -> has answers" || echo "$b -> NO ANSWERS PDF"; done
   ```
2. **Launch one Opus agent per file** (Agent tool, `subagent_type: general-purpose`,
   `model: opus`, background). ~10–12 at a time (concurrency caps ~a dozen; rest queue).
   Use the template below. Inject the per-file special-case notes that apply.
3. **Collect reports.** If an agent dies mid-run (API "Connection closed"), its transcript
   is usually already gone → **relaunch fresh** (SendMessage resume fails with "No transcript
   found"). Check `browser/data/<stage>_<name>.json` exists first; agents often die right
   before the Write.
4. **Validate the whole corpus** (script below): dup ids, invalid JSON, points!=max,
   missing/orphan figures, missing school_type.
5. **Dup-scan the batch's PDFs** (md5) — catches mislabeled duplicates.
6. **Grep new JSONs for `anulowano`** — confirm the right annulled sub-case was applied.
7. **Update the coverage table in README.md**; record new gotchas in the per-file
   notes below; flag key errors for the VERIFICATION.md pipeline.
8. **Rebuild the data shards**: `cd browser && node build.mjs` — it also validates
   topic tags against `categories.json` and folds `suspected_key_errors.tsv` into the
   `suspect` flags. Agents must NOT run it themselves.

## The agent prompt template

Fill `<NAME>` (= `<stage>_<filebase>`, e.g. `rejonowy_2015-2016_slaskie`), `<STAGE>`,
`<SRC>`, `<ANSWERS>`, `<SCRATCH>` (this session's `$CLAUDE_JOB_DIR/tmp` — NOT the old
UUID path). Add the per-file notes from the next section.

```
You are parsing one Polish math-competition question PDF into structured JSON. Work only in
the repo at <REPO_ROOT>.

FILE TO PROCESS:
- Source question PDF (read here): pdfs/<STAGE>/<filebase>.pdf
- Answers PDF (read here): pdfs/<STAGE>/<filebase>_answers.pdf   (or: NONE — see per-file note)
- In the JSON, write source_file/answers_file WITHOUT the pdfs/ prefix (e.g. "<STAGE>/<filebase>.pdf") — SCHEMA.md's pdfs/-relative convention.
- Output JSON path: browser/data/<NAME>.json
- id prefix for each question: <NAME>_q<n>

STEPS:
1. Read <REPO_ROOT>/SCHEMA.md FULLY — the extraction spec; follow exactly. The `school_type`
   field goes right after `competition` ("podstawowa" unless the printed title says
   "gimnazjalnych" -> "gimnazjum").
2. Read two example JSONs to match shape/style:
   - browser/data/szkolny_2026_podkarpackie.json (open + figures + solutions)
   - browser/data/szkolny_2025-2026_swietokrzyskie.json (closed + true/false + open)
3. Read the SOURCE PDF PAGE IMAGES for every question — the text layer drops
   exponents/roots/superscripts, so read the rendered pages for anything mathematical:
   pdftoppm -png -r 200 <SRC> <SCRATCH>/<NAME>_pg   then Read the PNGs.
4. Extract answers from the answers PDF. READ THE KEY VIA `pdftotext -layout <answers.pdf>` FIRST —
   some answers PDFs have a CORRUPT IMAGE LAYER that pdftoppm renders as a DIFFERENT competition
   (e.g. a wielkopolskie key showing under a śląskie/pomorskie/podlaskie filename), while the text
   layer is the correct key. Only fall back to page images if the text layer is empty/missing. If BOTH
   the text and image show a genuinely different test (wrong voivodeship/year, questions don't line up),
   treat the key as missing: answers_file null, answer.correct null. Map each answer to its question.
5. TRUE/FALSE = choices-form: each statement is a choice labeled "1","2","3",… ; the shared
   intro goes only in prompt_html. Put the generic "Oceń, czy…" instruction FIRST and any
   DANGLING sentence-stem that the statements complete LAST, ending with a colon (so it leads
   into the choices). BUT if the intro is already a complete sentence ending in a period, keep
   the source order. answer.correct = positional P/F string like "FPPP", or null if unknown.
6. Figures: for any question with a real diagram, crop it:
   pdftoppm -png -r 200 -f <pg> -l <pg> -x <x> -y <y> -W <w> -H <h> <SRC> <SCRATCH>/<NAME>_figN
   Read the PNG, tighten the box, then copy the final crop to
   browser/figures/<NAME>_q<n>_fig1.png and reference it per SCHEMA.md. Only crop figures that
   appear in the QUESTION paper — diagrams that appear only in the answer key are NOT extracted.
7. Use the PRINTED HEADER for school_year / voivodeship — the filename year is often off by one
   (e.g. a "2020_x" file whose header says 2019/2020). Trust the header.
8. Annulled questions ("Zadanie anulowano") — keep its points, answer.correct null, and add
   `"annulled": true` to the question object (SCHEMA.md; omit the field on all other questions).
   Two cases: (a) the paper still PRINTS the question -> keep the real question text + an italic
   annulment note; (b) the paper REPLACED the question with only the notice -> keep just the notice.
9. Validate: python3 -c "import json;json.load(open('browser/data/<NAME>.json'));print('ok')"
   and confirm per-question points sum to the stated max where the PDF states one.

CONSTRAINTS:
- Write ONLY browser/data/<NAME>.json and browser/figures/<NAME>_*.png. Do NOT build HTML (do NOT
  run build.py). Do NOT touch any other file.
- All scratch/intermediate files go under <SCRATCH>, prefixed <NAME>.
- If the answers PDF is missing/unreadable, set answers_file accordingly and answer.correct null.
Report: #questions, #figures, whether a key was found, points-sum vs max, and any anomalies.
```

## Per-file special-case notes (inject when they apply)

- **W-M 2010–2020 are mislabeled Śląskie duplicates** — byte-identical (md5) to same-year
  `_slaskie.pdf`, incl. the answers PDF; printed header says "śląskiego" (Katowice). SKIP them
  (the TODO filter drops them). But **2020+ W-M are GENUINE** (Olsztyn "W-M ODN" logo) — process
  those; tell the agent to verify the printed voivodeship. (Likely same split in rejonowy/wojewodzki.)
- **śląskie "…z Elementami Przyrody"** (older śląskie SP contests mix in nature/science tasks):
  tag those nature/biology/geography items with the `przyroda` leaf (NOT `inne`) — see SCHEMA.md.
  Already-processed śląskie files used `inne`; do NOT retag them.
- **No `_answers.pdf`**: tell the agent to FIRST check for an EMBEDDED key on the last pages.
  - **lubelskie** embeds "MODEL ODPOWIEDZI I SCHEMAT OCENIANIA" (2023 pp.12–14, 2024 pp.14–16,
    2025 pp.14–16) → set answers_file to the QUESTION pdf itself.
  - **lodzkie 2019/2020/2021** genuinely have NO key anywhere → answers_file null, all correct null.
    (2022+ lodzkie DO have a separate key.) lodzkie are docx-converted (layout differs) and often
    use a 100-pt scale with A–E choices.
  - **pomorskie 2017-2018 & 2025-2026** also have NO key anywhere (embedded checked too) →
    answers_file null, all correct null.
- **pomorskie** bundles a multi-part "Zadanie N" (sub-items N.1–N.k, each single-choice) into ONE
  `closed_single`: sub-items in prompt_html, `choices: []`, combined `answer.correct` (e.g.
  "9.1 – C, 9.2 – D, …"). Match browser/data/szkolny_2024-2025_pomorskie.json. Do NOT split into
  separate questions. (One legacy outlier, szkolny_2020-2021_pomorskie, WAS split — leave it.)
- **mazowieckie** uses "combined-choice" items: "T/N + uzasadnienie A/B/C", or "A-or-B plus
  C-or-D", or "wybierz wszystkie". Model each as ONE `closed_single` with all sub-choices and
  `answer.correct` = key's comma-joined letters (e.g. "T, C" / "B, D"). Match szkolny_2023_mazowieckie.json.
- **lodzkie** statement+justification item ("wskaż zdanie A–C oraz uzasadnienie 1–3") →
  `closed_single`, answer like "B1". **podkarpackie** — check gimnazjum vs podstawowa in the title.
- Keys sometimes accept ALTERNATE answers → store verbatim as "X lub Y" or "B, D" (not an error).
- Genuine "no valid answer" tasks (impossible scenario) are NOT annulments — store a text answer
  describing the impossibility.

## Reusable scripts

**Full-corpus validation** (run after every batch; swap `szkolny_` glob per stage or use `*`):
```python
python3 - <<'PY'
import json, glob, os, collections
ids=collections.Counter(); missing=[]; bad=[]; ptsbad=[]; refd=set(); notype=[]
for fp in sorted(glob.glob('browser/data/*.json')):
    try: d=json.load(open(fp))
    except Exception as e: bad.append((fp,str(e))); continue
    if 'school_type' not in d: notype.append(os.path.basename(fp))
    qs=d.get('questions',[]); s=sum(q.get('points',0) for q in qs); mx=d.get('max_points')
    if mx is not None and s!=mx: ptsbad.append((os.path.basename(fp),s,mx))
    for q in qs:
        ids[q.get('id')]+=1
        for fig in q.get('figures',[]) or []:
            p=fig.get('path') if isinstance(fig,dict) else fig
            if not p: continue
            b=os.path.basename(p); refd.add(b)
            if not any(os.path.exists(x) for x in [os.path.join('browser/figures',b), os.path.join('output',p), p]):
                missing.append((os.path.basename(fp),b))
ondisk=set(os.path.basename(x) for x in glob.glob('browser/figures/*.png'))
print("files",len([1 for _ in glob.glob('browser/data/*.json')]),"| questions",sum(ids.values()))
print("dup ids:",[i for i,c in ids.items() if c>1 and i] or "none")
print("invalid:",bad or "none"); print("points!=max:",ptsbad or "none")
print("missing figs:",missing or "none"); print("orphan figs:",sorted(ondisk-refd) or "none")
print("missing school_type:",notype or "none")
PY
```

**Question hash** (= the browser's question hash, `sha1(id)[:8]`):
```sh
python3 -c "import hashlib,sys;print(hashlib.sha1(sys.argv[1].encode()).hexdigest()[:8])" <id>
```

**Anulowano scan:** `grep -l anulowan browser/data/<stage>_*.json`

## The generator (browser/build.mjs)

`cd browser && node build.mjs` regenerates the data shards (`data.*.js` /
`data.*.json`) + `catalog.js` from `browser/data/*.json`. It fails on unknown topic
tags (vs `categories.json`) and derives the `suspect` fields from
`suspected_key_errors.tsv`. `school_type` is a stored convenience copy derived from
the `competition` string (gimnazjum if it contains "gimnaz", else podstawowa).

## Follow-up passes (each run once over the whole corpus; re-run for new papers)

- **Blind AI verification** — two-tier blind solve + adjudication → `answer.model`,
  `suspected_key_errors.tsv`. Recipe: **VERIFICATION.md**.
- **Figure redraws** — bitmap→SVG, review sheets, angle-mark linter. Recipe:
  **FIGURE_REDRAW.md**; campaign registries stay in `dev/figures/`.
