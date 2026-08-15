export const meta = {
  name: 'carve-leaves',
  description: 'Carve the 2026-08-02 leaves out of existing tags: one agent per ~35-question batch, add-only',
  phases: [{ title: 'Carve', detail: 'one agent per batch file → {id:[leaves to ADD]}' }],
}

// args: { batches:[name], batchDir, resultsDir, categoriesPath, model }
const A = typeof args === 'string' ? JSON.parse(args) : (args || {})
const { batchDir, resultsDir, categoriesPath, model = 'opus' } = A
if (!Array.isArray(A.batches) || !A.batches.length) throw new Error('args.batches must be a non-empty array of batch-file names')
const batches = A.batches.map((b) => (b.endsWith('.json') ? b : b + '.json'))

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['batch', 'questions', 'tagged', 'per_leaf', 'svg_conflicts'],
  properties: {
    batch: { type: 'string' },
    questions: { type: 'integer' },  // candidates seen
    tagged: { type: 'integer' },     // candidates that gained at least one leaf
    per_leaf: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false, required: ['leaf', 'count'],
        properties: { leaf: { type: 'string' }, count: { type: 'integer' } },
      },
    },
    svg_conflicts: {                 // free redraw QA: where the SVG disagrees with the authoritative PNG
      type: 'array',
      items: {
        type: 'object', additionalProperties: false, required: ['id', 'figure', 'note'],
        properties: { id: { type: 'string' }, figure: { type: 'string' }, note: { type: 'string' } },
      },
    },
  },
}

const prompt = (b) => `Decide, for each question in ONE batch, whether a small set of NEW topic leaves applies. This is a narrow refinement pass, not a re-tag: you are ONLY ever ADDING leaves. You never remove or rewrite an existing tag.

INPUTS (read both, IN FULL, before deciding anything):
- Batch:   ${batchDir}/${b}
  Fields: "leaves" = the ONLY leaves you may assign in this batch. "rules" = the catalog rules governing exactly those leaves — read every one, they are the specification. "questions" = the candidates, each with its "id", its current "topics", and its content.
- Catalog: ${categoriesPath}  (for the leaf "desc" strings and surrounding context)

THE ONE PRINCIPLE: a leaf belongs on a question if and only if its concept is REQUIRED TO SOLVE that question. Never assign a leaf because notation, a keyword, or an incidental value merely appears. If you cannot name the STEP OF THE SOLUTION that uses the concept, the leaf does not belong. Sketch the solution first, then decide.

THIS IS A CARVE, NOT A SWEEP. Every candidate already carries a broader leaf, and the broad leaf is CORRECT and STAYS. Your job is to find the subset that genuinely needs the sharper leaf. The expected answer for most candidates is "none of these leaves apply" — that is a success, not a gap. A leaf that lands on most of its pool has been applied as a catch-all and is worse than useless: these leaves exist to build small, coherent practice sets, so a false positive costs more than a miss.

FIGURES. Many questions carry their real content in a picture. For every candidate with a "_figures" entry, READ THE IMAGE with the Read tool before deciding — do not judge such a question on its text alone.
- "png" is the scan from the original paper. It is AUTHORITATIVE.
- "svg", when present, is a hand-made redraw: cleaner and easier to read, but NOT all redraws have been signed off. Use it as a second, more legible view.
- When the two disagree about anything that matters (a value, a mark, a right angle, which segments are equal, what is shaded), TRUST THE PNG, and report it in "svg_conflicts" with a one-line note on what differs. That list is redraw QA — it is worth as much as the tagging, so report anything you notice even if it did not change your decision.

OUTPUT — write a result file, then return the summary:
1. Write ${resultsDir}/${b} containing a single JSON object mapping question "id" to the array of leaves to ADD, e.g. {"rejonowy_2015_podlaskie_q7": ["twierdzenie Pitagorasa"]}. INCLUDE ONLY questions that gain at least one leaf — omit every question you decided against, and never write an empty array. If nothing in the batch qualifies, write {}. Use the Write tool.
2. Return {batch:"${b}", questions:<candidates seen>, tagged:<how many gained a leaf>, per_leaf:[{leaf,count}...], svg_conflicts:[{id,figure,note}...]}.

Only ids present in the batch. Only leaves listed in the batch's "leaves" array, verbatim.`

const results = await pipeline(
  batches,
  (b) => agent(prompt(b), { label: `carve:${b}`, phase: 'Carve', model, agentType: 'general-purpose', schema: SCHEMA }),
)

const ok = results.filter(Boolean)
const perLeaf = {}
for (const r of ok) for (const { leaf, count } of r.per_leaf || []) perLeaf[leaf] = (perLeaf[leaf] || 0) + count
return {
  model,
  attempted: batches.length,
  done: ok.length,
  failed: batches.filter((b) => !ok.some((r) => r.batch === b)),
  questions: ok.reduce((s, r) => s + (r.questions || 0), 0),
  tagged: ok.reduce((s, r) => s + (r.tagged || 0), 0),
  per_leaf: Object.entries(perLeaf).sort((a, b) => b[1] - a[1]),
  svg_conflicts: ok.flatMap((r) => r.svg_conflicts || []),
}
