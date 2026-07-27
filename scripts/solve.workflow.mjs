export const meta = {
  name: 'blind-solve',
  description: 'Blind-solve every question (no key seen); writes answer sidecars for local apply+diff',
  phases: [{ title: 'Solve', detail: 'one agent per paper -> sidecar {id:{answer,confidence,solution_html}}' }],
}

// args: { files:[basename], blindDir, outDir, model? }
const A = typeof args === 'string' ? JSON.parse(args) : (args || {})
const { files, blindDir, outDir } = A
const model = A.model || 'sonnet'
if (!Array.isArray(files) || !files.length) throw new Error('args.files must be a non-empty array of basenames')

const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['file', 'solved'],
  properties: { file: { type: 'string' }, solved: { type: 'integer' }, low_conf: { type: 'integer' } },
}

const prompt = (f) => `Solve a Polish primary/lower-secondary math-competition paper BLIND — you are NOT given the answer key. Your independent answers verify the keys and fill in missing ones.

INPUT: ${blindDir}/${f} — a JSON array of questions {id, type, points, prompt_html, choices, figures}. Read it in full. For any question whose "figures" array is non-empty, Read each listed PNG path (they carry essential diagram/data) before answering.

For EACH question, work out the answer from the content (the prompt_html holds prose + inline MathML; read the math carefully — Polish decimals use a comma). Then record the answer in the EXACT format for its type:
- closed_single: ONLY the choice LABEL letter (A/B/C/D/E) of the correct option — never the numeric/text value. Compute the result, then output the label of the choice equal to it.
- true_false: one char per statement IN ORDER, P=prawda (true) / F=fałsz (false), e.g. "PFPF". Length must equal the number of choices.
- open: the final result as concise text with units, the way an answer key would state it (e.g. "18" or "a) 26,5°C; b) 56 mm"). No working, just the result.
Also give a confidence: "high" (certain), "med" (likely), or "low" (guess/ambiguous/unreadable figure). And a brief solution_html: 1-4 short steps of reasoning as HTML (inline MathML ok), enough to justify/adjudicate the answer.

OUTPUT:
1. Write ${outDir}/${f} — a single JSON object mapping every question id to {"answer": <string>, "confidence": "high|med|low", "solution_html": <html string>}. Include EVERY id exactly once. Use the Write tool.
2. Return {file:"${f}", solved:<count>, low_conf:<count of low confidence>}.`

const results = await pipeline(
  files,
  (f) => agent(prompt(f), { label: `solve:${f}`, phase: 'Solve', model, agentType: 'general-purpose', schema: SCHEMA }),
)

const ok = results.filter(Boolean)
return {
  attempted: files.length, done: ok.length, failed: files.length - ok.length,
  solved: ok.reduce((s, r) => s + (r.solved || 0), 0),
  low_conf: ok.reduce((s, r) => s + (r.low_conf || 0), 0),
  per_file: ok.map(r => ({ file: r.file, solved: r.solved, low_conf: r.low_conf })),
}
