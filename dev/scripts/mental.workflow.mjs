export const meta = {
  name: 'mental-math',
  description: 'Flag questions solvable in your head (wprost / pomysl) with a Polish UI hint (judge only; writes sidecars, not data files)',
  phases: [{ title: 'Judge', detail: 'one agent per data file → sidecar {id:{level,hint}}' }],
}

// args: { files:[basename], dataDir, figDir, outDir, model }  (tolerate a JSON-string args)
// Resumable at file granularity: every agent writes its own sidecar the moment it finishes, so a
// run killed by a rate-limit reset resumes by passing only the basenames still missing from outDir.
const A = typeof args === 'string' ? JSON.parse(args) : (args || {})
const { dataDir, figDir, outDir, model = 'opus' } = A
if (!Array.isArray(A.files) || !A.files.length) throw new Error('args.files must be a non-empty array of data-file names')
const files = A.files.map((f) => (f.endsWith('.json') ? f : f + '.json'))

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['file', 'questions', 'wprost', 'pomysl', 'skipped'],
  properties: {
    file: { type: 'string' },
    questions: { type: 'integer' },  // questions seen
    wprost: { type: 'integer' },     // flagged level "wprost"
    pomysl: { type: 'integer' },     // flagged level "pomysl"
    skipped: { type: 'integer' },    // dropped by a hard rule (przyroda / anulowane / krzyżówka / dowód)
    notes: { type: 'string' },       // anything that made calibration hard, free text, may be empty
  },
}

const prompt = (f) => `Judge which questions of ONE math-competition paper (Polish, primary-school level) can be solved IN YOUR HEAD — no pencil, no paper. This is pure judgement — you do NOT edit the data file.

INPUT: ${dataDir}/${f} — a test object with a "questions" array. Read it IN FULL first.
Questions with a non-empty "figures" array: Read each PNG at ${figDir}/<filename> before judging that question. A question you cannot see is a question you do not flag.

WHY THIS EXISTS: the browser app has a "W pamięci" filter, meant to teach "simplify first, then compute" instead of brute-force arithmetic. It is currently a crude text heuristic (short prompt, small numbers) and it is wrong in both directions — that is what you are replacing. Prompt length and digit size are NOT evidence. A 200-character question with a 142² in it can be a five-second head calculation; a 60-character one-liner can need half a page.

SOLVE EVERY QUESTION YOURSELF, IN YOUR HEAD, before deciding. Then ask: could a bright 7th–8th grader who knows the material do exactly that, with nothing written down? Not you with a scratchpad — a pupil on a bus with a phone.

THE TEST (all must hold to flag):
- No intermediate value needs writing down; at most ~3 quantities held at once.
- Under about a minute for a fluent pupil.
- The path is a real solution, not a guess. Eliminating three absurd options is NOT solving in the head; a question whose answer you'd only get by trying the options is not flagged.
- Your mental path reaches the answer in "answer.correct" (the official key is in the data — use it as a check on yourself). If it does not, assume you misread the question and do not flag it. One exception: when "answer.model.agrees" is false the key itself is already contested (a few dozen printed keys in this corpus are provably wrong), so there judge on the merit of your own solution and say so in "notes".

RULINGS on shapes that keep coming up:
- A true/false item (several statements under one key like "PFP") is ONE question, not a multi-part block, whatever its topic tags say. Flag it only if EVERY statement is decidable in the head and the whole item still fits in a minute or so — one laborious statement sinks the item.
- The multi-part rule below targets krzyżówki and long blocks of separately-scored sub-questions. A question with two short sub-parts, each a few seconds of head work, is judged on merit like any other.

TWO LEVELS — and the line between them is where this whole exercise lives, so apply it strictly:
- "wprost" — direct: recall, short arithmetic, reading a figure, an obvious chain of two or three easy steps. No trick needed; you just do it. Several small steps still make it "wprost", not "pomysl".
- "pomysl" — one insight COLLAPSES the work. Before flagging this level, state to yourself the naive route a pupil would take without the insight. If that naive route is itself short and head-doable, the level is "wprost" — the question simply has more than one path. "pomysl" requires BOTH: the naive route is genuine paper work (a long computation, an enumeration, an equation to set up), AND one observation turns it into seconds.
  Canonical example, question hash 656cf627: √((−142)²·6² + (−142)²·8²). Naive route: square 142, multiply by 36 and by 64, add, take a root of a six-digit number — paper work, minutes. Insight: factor out 142² and the root becomes 142·√(36+64) = 142·10. That gap between the two routes is what "pomysl" means. Same family: pairing terms from both ends of a long sum, a difference of squares hiding in a product, an invariant that does not change (salt in a solution, dry mass in fruit), assuming a convenient unit value, cancelling before multiplying, symmetry in a figure.
  A step of ordinary cleverness is NOT an insight. Setting up a unit rate, enumerating six cases, recalling a Pythagorean triple, spotting a divisibility rule — that is competent "wprost" work. Reserve "pomysl" for questions where a pupil who misses the trick genuinely reaches for a pencil.
  Calibration: a typical paper yields a handful of "pomysl" items — two to five. If you are marking more than about a fifth of a paper "pomysl", your bar has drifted; re-read the ones you are least sure of and demote them.
- Everything else: absent from the sidecar. There is no "maybe" — if you hesitate, leave it out. A filter with false positives teaches the pupil that the filter lies.

NEVER FLAG (hard rules — count these as "skipped", do not judge them further):
- "przyroda" in "topics" (nature/science items, not math).
- "annulled": true.
- Krzyżówki / multi-part blocks: a crossword-style item, or a block of separately-scored sub-questions (a)–e), 7.1–7.8, "zadania wieloczęściowe" in "topics"). Even if each part is easy, the whole is not a head task. TWO EXCEPTIONS, and they override the topic tag: a "true_false" item is NEVER a block (the tag sits on many of them merely because several statements share one key), and neither is a question with two short sub-parts — both are judged on merit under the ruling above. Only the tag on a genuine krzyżówka or a long sub-question block skips the item.
- Anything demanding written work: "uzasadnij", "wykaż", "udowodnij", "zapisz obliczenia", "opisz sposób", proofs ("dowodzenie / dowody" in "topics"). The answer being short does not matter — the task asks for a written argument.
Open questions ("type":"open") and questions with figures are otherwise FULLY IN SCOPE — many are excellent head tasks. Judge them like the rest.

THE HINT (this text is shown to the pupil in the app, so write it for a pupil, in Polish):
- One short phrase naming the move that makes it work in the head: "wyłącz 142² przed pierwiastek, zostaje √(36+64)", "sparuj wyrazy od końców", "policz najpierw ile brakuje do 100".
- MUST NOT contain the final answer, or a value one trivial step from it. Name the MOVE, not the result of the move: "sparuj wyrazy od końców", never "każda para daje 101". It is a nudge, not a solution.
- Plain text only — no HTML, no MathML, no LaTeX. Unicode math is fine (√ · ² ½ °). Max ~110 characters.
- Start lowercase and end without a full stop — these render as a short aside in the UI, not as sentences.
- For "wprost" the hint may just name what to do ("zamień na ułamek zwykły", "odczytaj z rysunku"); never write "to oczywiste" or restate the question.

OUTPUT:
1. Write ${outDir}/${f} — one JSON object with an entry ONLY for the flagged questions:
   {"<question id>": {"level": "wprost"|"pomysl", "hint": "<polski tekst>"}}
   Use the exact "id" strings from the data file. Write "{}" if nothing qualifies. Use the Write tool.
2. Return {file:"${f}", questions:<total in file>, wprost:<count>, pomysl:<count>, skipped:<count dropped by a hard rule>, notes:"<what was hard to call, or empty>"}.`

const results = await pipeline(
  files,
  (f) => agent(prompt(f), { label: `mental:${f}`, phase: 'Judge', model, agentType: 'general-purpose', schema: SCHEMA }),
)

const ok = results.filter(Boolean)
const sum = (k) => ok.reduce((s, r) => s + (r[k] || 0), 0)
return {
  model,
  attempted: files.length,
  done: ok.length,
  failed: files.length - ok.length,
  questions: sum('questions'),
  wprost: sum('wprost'),
  pomysl: sum('pomysl'),
  skipped: sum('skipped'),
  // notes are trimmed: useful for spotting a file that went sideways, too bulky to return in full at 433 files
  per_file: ok.map((r) => ({ file: r.file, q: r.questions, wprost: r.wprost, pomysl: r.pomysl, notes: (r.notes || '').slice(0, 200) })),
}
