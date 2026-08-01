export const meta = {
  name: 'retag-questions',
  description: 'Re-tag question topics against categories.json (classify only; writes sidecars, not data files)',
  phases: [{ title: 'Classify', detail: 'one Sonnet agent per data file → sidecar {id:[leaves]}' }],
}

// args: { files:[basename], dataDir, categoriesPath, tagsDir, model }  (tolerate a JSON-string args)
const A = typeof args === 'string' ? JSON.parse(args) : (args || {})
const { dataDir, categoriesPath, tagsDir, model = 'sonnet' } = A
if (!Array.isArray(A.files) || !A.files.length) throw new Error('args.files must be a non-empty array of data-file names')
// sidecars must end in .json — apply-tags.mjs enumerates with .endsWith('.json')
const files = A.files.map((f) => (f.endsWith('.json') ? f : f + '.json'))

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['file', 'questions', 'dropped', 'added', 'spill', 'multipart'],
  properties: {
    file: { type: 'string' },
    questions: { type: 'integer' },   // questions seen
    dropped: { type: 'integer' },     // questions that LOST at least one old tag
    added: { type: 'integer' },       // questions that GAINED at least one tag
    spill: { type: 'integer' },       // questions where you dropped a powers/roots leaf as merely incidental
    multipart: { type: 'integer' },   // questions you tagged "zadania wieloczęściowe"
  },
}

const prompt = (f) => `Re-tag the topic labels for ONE math-competition paper (Polish, primary-school level). This is pure classification — you do NOT edit the data file.

INPUTS (read both, IN FULL, before tagging anything):
- Data file: ${dataDir}/${f}   (a test object with a "questions" array)
- Catalog:   ${categoriesPath}  (categories[].leaves[].name = the ONLY valid tags, each with a "desc"; plus a "migration" block whose "rules" array you MUST read end to end — all of it, not a summary)

THE ONE PRINCIPLE: a leaf belongs on a question if and only if its concept is REQUIRED TO SOLVE that question. Never tag a concept because its notation, a keyword, or an incidental intermediate value merely appears. If you cannot say which STEP OF THE SOLUTION uses the concept, the tag does not belong.

THE EXISTING "topics" FIELD IS NOT A STARTING POINT. It was produced by an older, coarser catalog and is wrong often enough that you must ignore it while deciding. Solve (or at least sketch a solution for) each question yourself, then tag what that solution needed. Only after choosing tags may you glance at the old ones — and only to check you have not missed a genuine topic.

DROPPING TAGS IS A NORMAL, EXPECTED OUTCOME. Concretely, in a hand-checked sample about 28% of questions currently carrying a powers/roots leaf should lose it entirely: a √3 in an equilateral-triangle area, a √2 in a cube diagonal, √256 for a square's side, or 10²³ used only as "a big number" are NOT power/root topics — those questions keep only their content leaf (trójkąty, graniastosłupy, pole i obwód, podzielność…). The same trap applies to "nierówności" (comparing two given numbers is not solving an inequality), "zagadki logiczne" (a word problem solved by one equation is "równania z jedną zmienną" ALONE, however whimsical the story), and "podzielność" (setup mentioning divisibility ≠ a divisibility argument). The migration rules spell all of this out.

TAG SET RULES:
- Use only exact leaf "name" strings from the catalog, verbatim. Most-specific first.
- At most 3 content leaves per question, plus any cross_cutting leaves that apply ("pole i obwód", "dowodzenie / dowody", "szacowanie (zamiast obliczania)", "wyłączanie wspólnego czynnika przed nawias", "zadania wieloczęściowe"). Most questions need 1–2 tags. Never emit an empty array.
- Multi-part items (krzyżówki; blocks of unrelated sub-questions like 7.1–7.8 or a)–e)): tag "zadania wieloczęściowe" plus AT MOST TWO dominant content leaves. Do not enumerate every subtopic — that is what made the old tags unusable.
- 25 catalog leaves are brand new and currently carry zero questions. Reach for them when they fit: prefer the specific new leaf over the old catch-all ("potęgi i pierwiastki", "geometria", "bryły", "inne", "procenty", "zagadki logiczne", "zliczanie / metody zliczania"), and keep a catch-all only when nothing specific applies.
- A CATCH-ALL IS ALMOST NEVER RIGHT. If the solution actually computes with powers or roots, the tag is "działania na potęgach" / "działania na pierwiastkach" — "potęgi i pierwiastki" is only for a question about powers/roots that no specific leaf covers. Likewise a question about a specific shape is "czworokąty"/"trójkąty"/…, never bare "geometria"; a specific solid is "graniastosłupy"/"ostrosłupy"/…, never bare "bryły".
- DO NOT TAG THE PARTS OF A SHAPE. A pyramid's square base does not earn "czworokąty"; its lateral faces do not earn "trójkąty"; a prism's net does not earn the polygon leaves. Tag the figure the question is ABOUT, not every polygon visible in it. Same for a shape used only as scaffolding for another shape.

OUTPUT — write a sidecar JSON file, then return the summary:
1. Write ${tagsDir}/${f} containing a single JSON object mapping every question "id" to its chosen topics array, e.g. {"szkolny_2012-2013_slaskie_q1": ["ułamki"], "..._q2": ["czworokąty","pole i obwód"]}. Include EVERY question id exactly once. Use the Write tool.
2. Return {file:"${f}", questions:<count>, dropped:<count of questions that lost at least one old tag>, added:<count that gained at least one>, spill:<count where you dropped a powers/roots leaf because it was only incidental>, multipart:<count tagged "zadania wieloczęściowe">}.

Do not tag any id you did not see in the file. Every tag must be a verbatim catalog leaf name.`

const results = await pipeline(
  files,
  (f) => agent(prompt(f), { label: `retag:${f}`, phase: 'Classify', model, agentType: 'general-purpose', schema: SCHEMA }),
)

const ok = results.filter(Boolean)
const sum = (k) => ok.reduce((s, r) => s + (r[k] || 0), 0)
return {
  model,
  attempted: files.length,
  done: ok.length,
  failed: files.length - ok.length,
  questions: sum('questions'),
  dropped: sum('dropped'),
  added: sum('added'),
  spill: sum('spill'),
  multipart: sum('multipart'),
  per_file: ok.map((r) => ({ file: r.file, q: r.questions, dropped: r.dropped, added: r.added, spill: r.spill })),
}
