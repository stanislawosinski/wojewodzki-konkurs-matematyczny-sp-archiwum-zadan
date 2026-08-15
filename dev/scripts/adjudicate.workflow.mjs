export const meta = {
  name: 'adjudicate-keys',
  description: 'Judge key-vs-AI conflicts WITH the key visible; writes verdict sidecars for suspected_key_errors.tsv',
  phases: [{ title: 'Judge', detail: 'one agent per chunk -> sidecar {id:{verdict,correct_answer,issue_en,reason_pl}}' }],
}

// args: { files:[basename], judgeDir, outDir, model? }
const A = typeof args === 'string' ? JSON.parse(args) : (args || {})
const { files, judgeDir, outDir } = A
const model = A.model || 'opus'
if (!Array.isArray(files) || !files.length) throw new Error('args.files must be a non-empty array of basenames')

const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['file', 'judged'],
  properties: {
    file: { type: 'string' }, judged: { type: 'integer' },
    key_wrong: { type: 'integer' }, key_correct: { type: 'integer' },
    equivalent: { type: 'integer' }, solution_wrong: { type: 'integer' },
  },
}

const prompt = (f) => `Adjudicate disputed answer keys of Polish primary-school math-competition questions. Each item was solved independently by an AI that reached a different answer than the printed key. You decide who is right — the official key, or the AI. Unlike the solvers, YOU SEE THE KEY.

INPUT: ${judgeDir}/${f} — a JSON array of {id, hash, type, points, prompt_html, choices, figures, key, key_solution_html, ai:[{by, answer, solution_html}]}. Read it in full. For any item whose "figures" array is non-empty, Read each listed PNG path before judging — several disputes hinge on the diagram.

For EACH item: FIRST solve the question yourself from scratch, carefully and completely (Polish decimals use a comma; prompt_html holds prose + inline MathML). Only THEN compare your result with \`key\` and with the AI answers. Do not assume the key is right because it is official, and do not assume the AI is right because it is confident — both fail regularly. Watch for these specific traps: the question asks for a different quantity than the one computed (first box vs second box, remaining days vs total days); the key accepts alternatives or gives examples ("np.") where other answers are equally valid; a figure contradicts a plausible algebraic reading; a discrete/whole-units reading changes a true/false statement; the printed key has a typo or a stale row.

Then classify with EXACTLY one verdict:
- EQUIVALENT — no real conflict: the AI answer and the key say the same thing, differing only in wording, notation, spacing ("26 250" vs "26250"), extra derivation steps, or a different but equally valid example where the question allows several. The key is fine and so is the AI.
- KEY_CORRECT — a real conflict and the KEY is right; the AI erred. Name the AI's mistake.
- KEY_WRONG — a real conflict and the KEY is wrong; the AI (or your own result) is right.
- SOLUTION_WRONG — the key's final answer is right, but the reasoning printed in key_solution_html is broken.

OUTPUT:
1. Write ${outDir}/${f} — a single JSON object mapping every question id to
   {"verdict": "EQUIVALENT|KEY_CORRECT|KEY_WRONG|SOLUTION_WRONG",
    "correct_answer": <the answer you believe is correct, in the key's own format>,
    "issue_en": <one line of English, max ~20 words, naming the conflict — for a maintainer's TSV>,
    "reason_pl": <POLISH, 2-5 sentences, no HTML, no markdown>}
   Include EVERY id exactly once. Use the Write tool.
   \`reason_pl\` is shown IN THE APP to students and parents next to the question, so write it for them: state the correct reasoning briefly and concretely (with the numbers), say plainly whether the key is right or wrong, and end with what the AI got wrong (or what the key got wrong). Plain Polish, no jargon about "models" beyond "modele AI".
2. Return {file:"${f}", judged:<count>, key_wrong:<n>, key_correct:<n>, equivalent:<n>, solution_wrong:<n>}.`

const results = await pipeline(
  files,
  (f) => agent(prompt(f), { label: `judge:${f}`, phase: 'Judge', model, agentType: 'general-purpose', schema: SCHEMA }),
)

const ok = results.filter(Boolean)
const sum = (k) => ok.reduce((s, r) => s + (r[k] || 0), 0)
return {
  attempted: files.length, done: ok.length, failed: files.length - ok.length,
  judged: sum('judged'), key_wrong: sum('key_wrong'), key_correct: sum('key_correct'),
  equivalent: sum('equivalent'), solution_wrong: sum('solution_wrong'),
  per_file: ok.map(r => ({ file: r.file, judged: r.judged })),
}
