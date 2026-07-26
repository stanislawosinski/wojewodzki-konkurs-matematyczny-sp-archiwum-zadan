export const meta = {
  name: 'retag-questions',
  description: 'Re-tag question topics against categories.json (classify only; writes sidecars, not data files)',
  phases: [{ title: 'Classify', detail: 'one Sonnet agent per data file → sidecar {id:[leaves]}' }],
}

// args: { files:[basename], dataDir, categoriesPath, tagsDir }  (tolerate a JSON-string args)
const A = typeof args === 'string' ? JSON.parse(args) : (args || {})
const { files, dataDir, categoriesPath, tagsDir } = A
if (!Array.isArray(files) || !files.length) throw new Error('args.files must be a non-empty array of data-file basenames')

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['file', 'questions', 'still_generic'],
  properties: {
    file: { type: 'string' },
    questions: { type: 'integer' },                                   // questions seen
    still_generic: { type: 'integer' },                               // final topics ⊆ {inne,geometria,bryły}
  },
}

const prompt = (f) => `Re-tag the topic labels for ONE math-competition paper. This is pure classification — you do NOT edit the data file.

INPUTS (read both, in full):
- Data file: ${dataDir}/${f}   (a test object with a "questions" array)
- Catalog:   ${categoriesPath}  (categories[].leaves[].name = the ONLY valid tags, each with a "desc"; plus a "migration" block of rules)

FOR EACH question in the data file, decide its topic set from the question CONTENT (prompt_html, choices, answer), NOT by copying its current "topics":
- Use only exact leaf "name" strings from the catalog. Most-specific leaf first.
- Multi-tag when apt: one content leaf + any cross_cutting leaf (e.g. "pole i obwód" for area/perimeter tasks, "dowodzenie / dowody" for proofs).
- Follow every rule in the catalog's "migration" block. In particular: split old "geometria" into czworokąty/kąty/symetrie/układ współrzędnych (or trójkąty / koła / okręgi) when the content is specific, keep "geometria" only when genuinely general; split old "bryły" into graniastosłupy/ostrosłupy, keep "bryły" only for round/mixed solids; a nature/science item in a śląskie "z Elementami Przyrody" paper → "przyroda"; fraction arithmetic → "ułamki"; number-line/coordinate items → "układ współrzędnych"; general expression building/simplifying → "wyrażenia algebraiczne". Leave already-good specific tags as they are.

OUTPUT — write a sidecar JSON file, then return the summary:
1. Write ${tagsDir}/${f} containing a single JSON object mapping every question "id" to its chosen topics array, e.g. {"szkolny_2012-2013_slaskie_q1": ["ułamki"], "..._q2": ["czworokąty","pole i obwód"]}. Include EVERY question id exactly once. Use the Write tool.
2. Return {file:"${f}", questions:<count>, still_generic:<count of questions whose final topics are all within {inne,geometria,bryły}>}.

Do not tag any id you did not see in the file. Every tag must be a verbatim catalog leaf name.`

const results = await pipeline(
  files,
  (f) => agent(prompt(f), { label: `retag:${f}`, phase: 'Classify', model: 'sonnet', agentType: 'general-purpose', schema: SCHEMA }),
)

const ok = results.filter(Boolean)
return {
  attempted: files.length,
  done: ok.length,
  failed: files.length - ok.length,
  questions: ok.reduce((s, r) => s + (r.questions || 0), 0),
  still_generic: ok.reduce((s, r) => s + (r.still_generic || 0), 0),
  per_file: ok.map((r) => ({ file: r.file, questions: r.questions, still_generic: r.still_generic })),
}
