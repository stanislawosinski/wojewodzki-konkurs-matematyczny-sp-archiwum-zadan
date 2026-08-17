export const meta = {
  name: 'time-estimate',
  description: 'Bucket every question by focused-solving time (min: 1/2/5/10/20) for session planning (judge only; writes sidecars, not data files)',
  phases: [{ title: 'Estimate', detail: 'one agent per data file → sidecar {id:{min}}' }],
}

// args: { files:[basename], dataDir, solDir, figDir, outDir, model }  (tolerate a JSON-string args)
// Resumable at file granularity: every agent writes its own sidecar the moment it finishes, so a
// run killed by a rate-limit reset resumes by passing only the basenames still missing from outDir.
const A = typeof args === 'string' ? JSON.parse(args) : (args || {})
const { dataDir, solDir, figDir, outDir, model = 'sonnet' } = A
if (!Array.isArray(A.files) || !A.files.length) throw new Error('args.files must be a non-empty array of data-file names')
const files = A.files.map((f) => (f.endsWith('.json') ? f : f + '.json'))

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['file', 'questions', 'm1', 'm2', 'm5', 'm10', 'm20', 'sum'],
  properties: {
    file: { type: 'string' },
    questions: { type: 'integer' }, // questions seen (must equal sidecar entry count)
    m1: { type: 'integer' },        // count in bucket 1
    m2: { type: 'integer' },
    m5: { type: 'integer' },
    m10: { type: 'integer' },
    m20: { type: 'integer' },
    sum: { type: 'integer' },       // sum of min over the paper — the drift alarm
    notes: { type: 'string' },      // anything that made calibration hard, free text, may be empty
  },
}

const prompt = (f) => `Estimate how long a well-prepared contestant needs for EACH question of ONE math-competition paper (Polish, primary-school level, klasa 7-8). This is pure judgement — you do NOT edit the data file.

INPUT: ${dataDir}/${f} — a test object with a "questions" array. Read it IN FULL first.
For each question, gauge the amount of work from its worked solution, first one that exists of: "answer.solution_html", "answer.model.solution_html", the entry for its id in ${solDir}/${f} (field "html"). A handful of questions have none — estimate those from the prompt alone.
Questions with a non-empty "figures" array: Read each PNG at ${figDir}/<filename> before estimating that question — geometry time lives in the figure.

THE PERSON YOU ARE TIMING: a strong, trained 7th-8th grader who broadly knows how to approach this kind of problem. You are timing execution, not struggle — but execution INCLUDES reading the problem, finding the approach shown in the solution (the pupil must FIND it, not transcribe it — weight insight-finding on tricky items), doing the computation, and, for "type":"open", writing the solution up on paper. A "closed_single" answer is a letter — no write-up. A "true_false" item is judged statement by statement — its time scales with the number of entries in "choices".

THE SCALE — five buckets, values are representative minutes. Judge every question against these anchors, NEVER against the other questions in the paper (papers differ in level; the scale must not):
- 1 — look and compute: one step, a formula applied directly, a value read off a figure. Canonical: a one-line linear equation; decoding a Roman numeral.
- 2 — closed with genuine computation or a few cases to work through; a true/false with a few quick statements; the odd micro-open. Canonical: area scale factor plus a unit conversion; enumerating divisor pairs.
- 5 — a standard open task: set up an equation, solve it, write it up; or a genuinely laborious closed (long enumeration, multi-claim bookkeeping). Canonical: an age/percent word problem solved by one linear equation, written up.
- 10 — a hard open task: an insight plus a multi-step computation plus the write-up; a written proof; heavy casework. Canonical: dissecting a cube into pyramids and summing the faces of the net; a two-case parity proof.
- 20 — multi-part blocks, krzyżówki, long proofs — everything from ~13 focused minutes up. This bucket is open-ended; do not agonise between 20 and more.
Intermediate values are FORBIDDEN — pick the nearest anchor. If torn between two buckets, take the higher one only when the write-up or the insight is the sticking point; otherwise the lower.

CALIBRATION CHECK before you output: sum your minutes over the paper. A typical arkusz here sums to ~35-75 focused minutes (about half its printed sitting time). A total far outside that range usually means your bar drifted — re-check your least certain calls against the anchors, then trust yourself.

OUTPUT:
1. Write ${outDir}/${f} — one JSON object with an entry for EVERY question in the paper (annulled ones included; ignore the annulment note when timing):
   {"<question id>": {"min": 1|2|5|10|20}}
   Use the exact "id" strings from the data file. Use the Write tool.
2. Return {file:"${f}", questions:<total>, m1..m20:<bucket counts>, sum:<sum of min>, notes:"<what was hard to call, or empty>"}.`

const results = await pipeline(
  files,
  (f) => agent(prompt(f), { label: `time:${f}`, phase: 'Estimate', model, agentType: 'general-purpose', schema: SCHEMA }),
)

const ok = results.filter(Boolean)
const sum = (k) => ok.reduce((s, r) => s + (r[k] || 0), 0)
return {
  model,
  attempted: files.length,
  done: ok.length,
  failed: files.length - ok.length,
  questions: sum('questions'),
  buckets: { m1: sum('m1'), m2: sum('m2'), m5: sum('m5'), m10: sum('m10'), m20: sum('m20') },
  // per-file sums surface scale drift at a glance: a paper way off 35-75 wants an eyeball
  per_file: ok.map((r) => ({ file: r.file, q: r.questions, sum: r.sum, notes: (r.notes || '').slice(0, 200) })),
}
