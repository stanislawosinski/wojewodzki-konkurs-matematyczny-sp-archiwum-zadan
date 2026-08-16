export const meta = {
  name: 'ai-solutions',
  description: 'Write a short Polish derivation for every keyed question that has none (writes sidecars, not data files)',
  phases: [{ title: 'Solve', detail: 'one agent per data file → sidecar {id:{html,check}}' }],
}

// args: { files:[basename], dataDir, figDir, outDir, model }  (tolerate a JSON-string args)
// Resumable at file granularity, like the mental campaign: every agent writes its own sidecar the
// moment it finishes, so a killed run resumes by passing only the basenames still missing from outDir.
const A = typeof args === 'string' ? JSON.parse(args) : (args || {})
const { dataDir, figDir, outDir, model = 'sonnet' } = A
if (!Array.isArray(A.files) || !A.files.length) throw new Error('args.files must be a non-empty array of data-file names')
const files = A.files.map((f) => (f.endsWith('.json') ? f : f + '.json'))

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['file', 'in_scope', 'solved', 'unresolved'],
  properties: {
    file: { type: 'string' },
    in_scope: { type: 'integer' },   // questions matching the scope rule
    solved: { type: 'integer' },     // entries written to the sidecar
    unresolved: { type: 'array', items: { type: 'string' } },  // "<id>: <one line why>"
    notes: { type: 'string' },       // anything that made the paper hard, free text, may be empty
  },
}

const prompt = (f) => `Write the missing DERIVATIONS for one Polish math-competition paper (primary-school level). The official answer key is in the data and is already corroborated by an independent blind AI solve — treat it as ground truth. You are not verifying anything; you are writing the path to an answer that is already known.

INPUT: ${dataDir}/${f} — a test object with a "questions" array. Read it IN FULL first.
Questions with a non-empty "figures" array: Read each PNG at ${figDir}/<filename> before solving that question. A question you cannot see is a question you leave unresolved.

SCOPE — exactly the questions where ALL THREE hold:
- "answer.correct" is present and not empty (there is a key to reach),
- "answer.solution_html" is null (the organiser published no derivation),
- "answer.model" has no "solution_html" (the verification pass left none).
Everything else is out of scope: skip it silently, no entry in the sidecar.

WHY THIS EXISTS: the browser app shows the derivation under the answer reveal and on the printed key sheet. For roughly two thirds of the keyed questions the pupil currently sees a bare letter and nothing else. You are filling exactly that hole.

HOW TO WORK: solve each in-scope question yourself first, then write it up. Your derivation MUST land exactly on "answer.correct". If it does not after a genuine second attempt, write NO entry for that question and list its id in "unresolved" with one line saying why — a wrong path that ends on the right letter is worse than a gap.

STYLE — this text is read by a 7th–8th grader, in Polish:
- 1–4 steps, the route an able pupil would actually take. State the move, then the number.
- NEVER solve a closed_single by eliminating options ("A odpada, bo…"). Derive the value, then say which option it is.
- true_false: one short clause per statement, in the order of "choices".
- open: end with the result and its unit.
- No restating the question, no closing "Odpowiedź: C" — the app prints the key itself right above your text.
- Under ~600 characters. Terse beats complete; the official solutions in this corpus are longer than they need to be.

HTML — the field is rendered as trusted HTML, so keep it clean:
- "<p>" paragraphs, plus inline MathML "<math xmlns=\\"http://www.w3.org/1998/Math/MathML\\">…</math>" exactly like the "solution_html" entries already in the corpus. Copy their conventions.
- Allowed tags and NOTHING else: p, ul, ol, li, b, em, sub, sup, br, math and MathML children. No LaTeX, no markdown, no images, no class/style/on* attributes.
- Polish decimal comma (2,5 — never 2.5). Units as plain text outside the math.

THE "check" FIELD — the answer your derivation reaches, in the key's own format, compared mechanically against the key afterwards:
- closed_single: the choice LABEL letter ("C"); the two-part variants of the corpus follow the key's shape ("A, C", "B3").
- true_false: one char per statement in order, P/F ("PFPF"), length equal to the number of choices.
- open: the final result as concise text with units, the way the key states it.

OUTPUT:
1. Write ${outDir}/${f} — one JSON object with an entry ONLY for the questions you solved:
   {"<question id>": {"html": "<derivation HTML>", "check": "<answer in key format>"}}
   Use the exact "id" strings from the data file. Write "{}" if nothing is in scope. Use the Write tool.
2. Return {file:"${f}", in_scope:<count>, solved:<entries written>, unresolved:["<id>: <why>", …], notes:"<what was hard to call, or empty>"}.`

const results = await pipeline(
  files,
  (f) => agent(prompt(f), { label: `sol:${f}`, phase: 'Solve', model, agentType: 'general-purpose', schema: SCHEMA }),
)

const ok = results.filter(Boolean)
const sum = (k) => ok.reduce((s, r) => s + (r[k] || 0), 0)
return {
  model,
  attempted: files.length,
  done: ok.length,
  failed: files.length - ok.length,
  in_scope: sum('in_scope'),
  solved: sum('solved'),
  unresolved: ok.flatMap((r) => r.unresolved || []),
  per_file: ok.map((r) => ({ file: r.file, scope: r.in_scope, solved: r.solved, notes: (r.notes || '').slice(0, 200) })),
}
