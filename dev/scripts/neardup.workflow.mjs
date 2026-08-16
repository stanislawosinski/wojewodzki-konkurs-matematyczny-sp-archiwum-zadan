export const meta = {
  name: 'neardup',
  description: 'Judge near-duplicate candidate pairs (SAME / VARIANT / DIFFERENT) → rows for dev/dups/near-dups.tsv (judge only; writes nothing)',
  phases: [{ title: 'Judge', detail: 'one agent per batch of candidate pairs' }],
}

// args: { batches:[{file,n}], repoRoot, model }  — batch files come from
// dev/scripts/neardup-candidates.mjs output split into JSON arrays (see dev/dups/README.md).
// Resumable for free: candidates already in near-dups.tsv are not emitted again.
const A = typeof args === 'string' ? JSON.parse(args) : (args || {})
const { batches, repoRoot, model = 'sonnet' } = A
if (!Array.isArray(batches) || !batches.length) throw new Error('args.batches must be a non-empty array of {file,n}')

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['rows'],
  properties: {
    rows: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id_a', 'id_b', 'verdict', 'note'],
        properties: {
          id_a: { type: 'string' },
          id_b: { type: 'string' },
          verdict: { enum: ['SAME', 'VARIANT', 'DIFFERENT'] },
          note: { type: 'string' },
        },
      },
    },
  },
}

const prompt = (b) => `Judge candidate near-duplicate pairs of Polish math-competition questions (primary-school level) for a duplicate registry. This is pure judgement — you edit nothing.

INPUT: Read ${b.file} — a JSON array of ${b.n} pairs. Each pair has "jaccard" (lexical similarity, context only) and two questions "a"/"b" with: id, prompt_html, choices (HTML strings, may be empty), correct (official answer, may be null), figures (PNG paths relative to ${repoRoot}).

For EVERY pair pick exactly one verdict:
- SAME — the same question: identical task, or a rewording that changes no content; choices may be reshuffled under different letters. For pairs with figures: only if the figures show THE SAME picture (see below).
- VARIANT — recognizably the same problem template with different numbers/data (rhombus diagonals 24 i 10 vs 12 i 16). A different correct answer is expected here. If the changed numbers change the METHOD needed, it is DIFFERENT, not VARIANT.
- DIFFERENT — anything else: same topic but a different problem, same instruction text over a different puzzle/figure, superficial phrase overlap.

FIGURES ARE DECISIVE. If either question lists figures, Read every listed PNG (prefix the paths with ${repoRoot}/) and compare the actual pictures before judging. Known trap in this corpus: an identical instruction ("wstaw liczby w krzyżówkę…", "oblicz miarę kąta…") printed over a DIFFERENT grid or diagram in another year — that is DIFFERENT (or VARIANT when it is the same construction with different numbers). Never mark a figure pair SAME without having looked at both pictures. If a PNG cannot be read, the pair is DIFFERENT with a note saying so.

Use "correct" as a cross-check: SAME pairs share the same correct VALUE (the letter may differ when choices are reshuffled — compare what the letter points at). If you want SAME but the correct values disagree, re-examine; keep SAME only with an explanation in the note.

note: one short English sentence — for SAME/VARIANT what matches, for a near-miss DIFFERENT what differs. Plain text, no tabs, no newlines.

Return {rows: [...]} with EXACTLY ${b.n} rows, one per input pair, in input order, ids copied verbatim.`

const results = await pipeline(
  batches,
  (b) => agent(prompt(b), { label: `judge:${b.file.split('/').pop()}`, phase: 'Judge', model, agentType: 'general-purpose', schema: SCHEMA }),
)

const ok = results.filter(Boolean)
const rows = ok.flatMap((r) => r.rows)
const count = (v) => rows.filter((r) => r.verdict === v).length
return {
  model,
  batches: batches.length,
  done: ok.length,
  failed: batches.length - ok.length,
  rows_total: rows.length,
  SAME: count('SAME'),
  VARIANT: count('VARIANT'),
  DIFFERENT: count('DIFFERENT'),
  rows,
}
