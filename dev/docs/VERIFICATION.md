# Verification playbook (the AI answer layer)

How the corpus' AI verification layer was built (July–August 2026) and how to re-run it
for newly extracted papers. Companion to **EXTRACTION_PLAYBOOK.md** (runs on its JSON
output). Scripts live in `dev/scripts/`; the one-off per-question reports this file
distils were removed from HEAD on 2026-08-15 (`git log --follow -- 'dev/reports/*.md'`
recovers them).

## The data model

Each verified question carries, next to the untouched official key:

```json
"answer": {
  "correct": "…",           // official key — this pipeline NEVER rewrites it
  "solution_html": "…",     // official derivation, when the key printed one
  "model": {
    "dissent": { "by": "opus", "answer": "…" },  // optional second, differing AI answer
    "answer": "…",
    "by": "sonnet",          // sonnet | opus | fable | opus+sonnet | sonnet+fable | … —
                             // a combo = these models produced the same answer independently
    "agrees": true,          // vs key: true / false / null (null = not auto-comparable)
    "corroborated": true,    // keyless only: true = 2+ blind models agree, false = they split
    "solution_html": "…"     // the model's derivation
  }
}
```

Key judgements never land in the data files: they go to `suspected_key_errors.tsv`
(id · verdict `KEY_CORRECT`/`KEY_WRONG`/`SOLUTION_WRONG` · reason), which
`browser/build.mjs` folds into `suspect`/`suspect_verdict`/`suspect_reason`. The
browser's "Weryfikacja AI" facet derives entirely from these fields (`browser/defs.js`).

**The iron rule: `answer.correct` is only ever corrected against the printed source
PDF, never from an AI verdict — no matter how many models agree.** AI consensus
against the key produces a TSV row for human review, nothing else.

## The pipeline (for a batch of new papers)

Solving is always **blind**: the solver sees neither the key nor another model's
answer. Every apply-script is surgical (rewrites only the `"model": {…}` block,
preserving file formatting) and idempotent.

1. **Blind inputs** — `node dev/scripts/make-blind.mjs <outDir> [basenames]`:
   questions minus key, figures as absolute paths.
2. **Tier 1: solve** — `solve.workflow.mjs` (Workflow tool; args
   `{files, blindDir, outDir, model}`), one agent per paper → sidecars
   `{id: {answer, confidence, solution_html}}`.
3. **Merge** — `apply-solutions.mjs <sideDir> <by> [basenames]`: writes
   `answer.model`, computes `agrees` for closed/true_false (open → `null`), reports
   disagreements / keyless fills / low confidence.
4. **De-noise the comparator** — `fix-agrees-format.mjs`, `fix-agrees-compound.mjs`:
   alternate keys ("D lub E"), multi-select ("A, C") and compound ("B3", "TC") shapes
   are format artifacts, not real disagreements.
5. **Tier 2: contested subset** (disagreements + keyless + low-confidence) —
   `build-t2-blind.mjs`, blind re-solve with a *different* model, then
   `adjudicate-t2.mjs`: local 3-way compare → verdict report + TSV, mutates nothing.
6. **Land tier 2** — `apply-corroboration.mjs` (keyless agreed → `by:"opus+sonnet"`,
   `corroborated:true`; splits → `corroborated:false`) and `apply-dissent.mjs`
   (adds `dissent` where the reveal should show the second AI answer).
7. **Open-with-key** — `verify-open-keys.mjs` (numeric/text heuristic over the bucket
   tier 1 stored as `agrees:null`) → cheap-model triage of the flagged set (most are
   phrasing) → blind re-solve of the genuine few.
8. **Key-visible adjudication** of everything still contesting the key —
   `adjudicate.workflow.mjs` (the judge *does* see the key) → **human reviews the
   verdicts** → `apply-adjudication.mjs --write`: `EQUIVALENT` → `agrees:=true` in
   data; real verdicts → TSV rows.
9. **Residual keyless splits** — a third blind vote by yet another model; 2-of-3 wins
   → its answer + `corroborated:true` + combined `by`, `dissent` deleted where
   settled. Still unresolved → keep `corroborated:false` (surfaces as "Niepewna
   odpowiedź AI").

Hard-won notes:

- Open-text equivalence needs a **judge model, not a regex** — a numeric-multiset
  compare once produced 51 false positives in a 252-question pass
  ("FPP" vs "1-F, 2-P, 3-P"; "12,5π cm²" vs "25π/2 cm²").
- Agents die right before their Write: check the sidecar exists, relaunch fresh
  (resume fails once the transcript is gone).
- Some keys are figures the schema can't hold (szkolny_2022_dolnoslaskie_q20) →
  `correct: null`, no model verdict, shows as "nierozstrzygnięte".
- Annulled questions (prompt matches `/anulowan/i`) carry no `answer.model` at all.
- A question can be genuinely flawed (two valid answers): store a dual answer with
  justification in `model.answer` (see wojewodzki_2024_lubuskie_q11, "B i C").

## What ran (history + final state)

| pass | date | scope | outcome |
|---|---|---|---|
| Tier 1, Sonnet blind | 2026-07-27 | all 7632 | 61 disagreements, 646 keyless fills, 86 format artifacts |
| Tier 2, Opus blind | 2026-07-27 | 739 contested | 22 key_suspect, 33 key_confirmed, 625 keyless corroborated, 19 keyless splits |
| Open-key cascade (Sonnet→Haiku→Opus) | 2026-07-27 | 2093 open-with-key | 234 flagged → 36 genuine → 7 KEY_SUSPECT, 23 key_ok |
| Key-visible adjudication (Opus) | 2026-07/08 | 38 suspects | 31 KEY_CORRECT, 6 KEY_WRONG, 1 SOLUTION_WRONG — all in `suspected_key_errors.tsv` |
| Tier 3, Fable blind | 2026-08-15 | 19 keyless splits | all settled 2-of-3 (+1 flawed question given a dual answer) |

Facet buckets after all passes (2026-08-15, values overlap): zgodne 6950 ·
bezklucza 641 · sprawdzony 31 · podejrzany 7 · anulowane 5 · nieroz 1.
