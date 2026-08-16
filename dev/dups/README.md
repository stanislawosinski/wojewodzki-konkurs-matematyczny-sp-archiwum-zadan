# Near-duplicate verdicts

`near-dups.tsv` holds human/LLM verdicts for question pairs that look alike but that the
deterministic text keys in `browser/build.mjs` cannot decide on their own: pairs involving
figures (same text can come with a different picture) and rewordings. The build reads it
directly — bad ids or verdicts fail the build.

Columns: `id_a  id_b  verdict  note`. Verdicts:

- `SAME` — the same question (possibly reworded or with reshuffled choices; for figure
  pairs: the figures show the same picture). Merged into the `dup` clusters (the ×N chip).
- `VARIANT` — the same problem with different numbers; solving it is still fresh practice.
  Merged into the `sim` clusters (the ~N chip).
- `DIFFERENT` — checked and rejected. Kept as the record of what was examined, so a re-run
  of the campaign can skip the pair.

## How the pairs were produced (resume recipe)

1. `node dev/scripts/neardup-candidates.mjs > candidates.ndjson` — token-Jaccard ≥ 0.5
   pairs over normalized prompt+choices, minus pairs the build already clusters (exact or
   digit-blind key) and minus pairs already present in `near-dups.tsv` (any verdict), so
   re-running after an interrupted campaign emits only the unjudged remainder.
2. `dev/scripts/neardup.workflow.mjs` judges the candidates (Sonnet; batches of pairs, one
   agent per batch). Figure pairs include the PNG paths — the agent must Read and compare
   the actual crops (SVG redraws are independent drawings, useless for comparison). Each
   agent returns TSV rows.
3. Append the rows to `near-dups.tsv`, eyeball the SAME/VARIANT ones, rebuild
   (`cd browser && node build.mjs`) — the clusters and chips update by themselves.

Campaign 2026-08-16 (`dev/scripts/neardup.workflow.mjs`, Sonnet, 19 batches): 249
candidates judged → 110 SAME / 70 VARIANT / 69 DIFFERENT. Cross-checks before merging:
zero transitivity conflicts in the SAME graph; answer values compared for every SAME pair
(47 flags, all but 4 were normalization noise; the 4 re-judged by hand). Two downgrades
applied: the śląskie crossword-family VARIANTs → DIFFERENT (21 rows — batch verdicts on
those grids contradicted each other, so none is trusted), and one SAME → VARIANT (turysta
fill-in vs P/F formats). Final: 109 SAME / 50 VARIANT / 90 DIFFERENT, merged clusters
163 dup / 49 sim.
