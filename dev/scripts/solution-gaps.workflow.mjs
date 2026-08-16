export const meta = {
  name: 'ai-solutions-gaps',
  description: 'Second pass over the questions the main solution campaign left unsolved (one agent per question, stronger model)',
  phases: [{ title: 'Retry', detail: 'one agent per gap → data/solutions/_gaps/<id>.json' }],
}

// args: { gaps:[{id, file, why}], dataDir, figDir, outDir, model }
// Each agent writes its own one-entry file, so nothing can clobber the campaign's sidecars; the
// merge back into data/solutions/<file>.json is a separate deliberate step.
const A = typeof args === 'string' ? JSON.parse(args) : (args || {})
const { dataDir, figDir, outDir, model = 'opus' } = A
if (!Array.isArray(A.gaps) || !A.gaps.length) throw new Error('args.gaps must be a non-empty array')

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'solved'],
  properties: {
    id: { type: 'string' },
    solved: { type: 'boolean' },       // true = an entry was written
    verdict: { type: 'string' },       // one line: how it was cracked, or why it still cannot be
    key_suspect: { type: 'boolean' },  // the printed key itself looks wrong
  },
}

const prompt = (g) => `Write the derivation for ONE hard question a first pass could not solve. You are the second attempt, with a stronger model.

QUESTION: id "${g.id}" in ${dataDir}/${g.file} — find it in the "questions" array and read it in full, together with its "answer.correct" (the official key, corroborated by an independent blind AI solve).
FIGURES: read every PNG listed in that question's "figures" array from ${figDir}/ before deciding anything. Most of these gaps are figure-reading problems — look closely, and use the figure's own labels and tick marks rather than measured proportions.

WHY THE FIRST PASS GAVE UP: ${g.why}

Take that report as a hypothesis, not a fact — it may have misread the figure or missed an elementary route. Solve the question yourself from scratch.

THREE POSSIBLE OUTCOMES, and picking the honest one matters more than producing text:
1. You find a genuine derivation that lands on the key → write it (rules below), solved:true.
2. The question really is underdetermined / the figure really is ambiguous → write nothing, solved:false, and say in "verdict" exactly what is missing.
3. The key itself is wrong (your solid derivation reaches a different answer) → write nothing, solved:false, key_suspect:true, and give your answer and reasoning in "verdict".
A path that reverse-engineers the key — assuming the answer to justify the answer, or reading proportions off a drawing — is outcome 2, not outcome 1.

STYLE if you do write one (identical to the campaign's, this text is read by a 7th–8th grader, in Polish):
- 1–4 steps, the route an able pupil would take; never eliminate options instead of deriving.
- "<p>" paragraphs plus inline MathML "<math xmlns=\\"http://www.w3.org/1998/Math/MathML\\">…</math>"; allowed tags: p, ul, ol, li, b, em, sub, sup, br, math and MathML children. No LaTeX, no markdown, no attributes beyond the MathML xmlns.
- Polish decimal comma, units as plain text, under ~600 characters, no closing "Odpowiedź: …".

OUTPUT:
1. Only when solved: write ${outDir}/${g.id}.json = {"${g.id}": {"html": "<derivation>", "check": "<answer in the key's format: label letter / PFPF / concise text>"}}. Write nothing at all otherwise.
2. Return {id:"${g.id}", solved:<bool>, verdict:"<one line>", key_suspect:<bool>}.`

const results = await pipeline(
  A.gaps,
  (g) => agent(prompt(g), { label: `gap:${g.id}`, phase: 'Retry', model, agentType: 'general-purpose', schema: SCHEMA }),
)

const ok = results.filter(Boolean)
return {
  model,
  attempted: A.gaps.length,
  solved: ok.filter((r) => r.solved).length,
  key_suspects: ok.filter((r) => r.key_suspect).map((r) => `${r.id}: ${r.verdict}`),
  still_open: ok.filter((r) => !r.solved && !r.key_suspect).map((r) => `${r.id}: ${r.verdict}`),
}
