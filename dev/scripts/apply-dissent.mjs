// Add answer.model.dissent = { by:"opus", answer } to the questions where the reveal must
// show a SECOND, distinct AI answer (Opus disagreeing with the stored Sonnet answer):
//   - keyless split  (answer.model.corroborated === false): Sonnet vs Opus disagreed, no key.
//   - keyed three-way / new-dispute: Opus differs from BOTH the stored answer and the key.
// The primary answer (Sonnet) already lives in answer.model.answer; this only adds the dissenter.
// Opus answers come from the one-time blind-solve outputs: tier-2 `solved-opus/<file>.json` +
// open-cascade `open-verify/solve-out/<chunk>.json` (both {id:{answer,...}}). Keyed set = the
// THREE-WAY SPLIT + NEW DISPUTE sections of tier2-report.md ∪ adjudicated.json bucket 'three_way'.
// Surgical: inserts one "dissent" field as the first key of each target model block. Idempotent.
// Usage: node apply-dissent.mjs <scratchpad-dir> <repo-root>
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
const SP = process.argv[2], root = process.argv[3], dataDir = root + '/browser/data/';

// --- Opus answers (+ reasoning), id -> {answer, solution_html}, from both solve output dirs ---
const opus = {};
const addDir = dir => { if (!existsSync(dir)) return;
  for (const f of readdirSync(dir).filter(f => f.endsWith('.json')))
    for (const [id, v] of Object.entries(JSON.parse(readFileSync(dir + '/' + f, 'utf8'))))
      if (v && v.answer != null) opus[id] = { answer: v.answer, solution_html: v.solution_html }; };
addDir(SP + '/solved-opus');
addDir(SP + '/open-verify/solve-out');

// --- keyed ids that need the Opus dissenter (three-way + new-dispute) ---
const keyed = new Set();
for (const sec of readFileSync(root + '/dev/reports/tier2-report.md', 'utf8').split(/^## /m))
  if (/^THREE-WAY SPLIT|^NEW DISPUTE/.test(sec))
    for (const m of sec.matchAll(/^### `[0-9a-f]+` · (\S+) ·/gm)) keyed.add(m[1]);
const adj = JSON.parse(readFileSync(SP + '/open-verify/adjudicated.json', 'utf8'));
for (const [id, b] of Object.entries(adj)) if (b === 'three_way') keyed.add(id);

// which questions get a dissent field
const needsDissent = q => {
  const a = q.answer || {}, m = a.model;
  if (!m || m.dissent) return false;                        // no model / already applied
  const hasKey = a.correct != null && a.correct !== '';
  return hasKey ? keyed.has(q.id) : m.corroborated === false; // keyed set | keyless split
};

const modelRe = /"model": \{\n( *)/;                        // opening + first-field indent, per block
const allBlocks = /"model": \{\n[\s\S]*?\n *\}/g;           // one per question, in document order
let files = 0, applied = 0, missing = [];
for (const file of readdirSync(dataDir).filter(f => f.endsWith('.json'))) {
  const qs = JSON.parse(readFileSync(dataDir + file, 'utf8')).questions;
  let i = 0, changed = 0;
  const text = readFileSync(dataDir + file, 'utf8').replace(allBlocks, block => {
    const q = qs[i++];
    if (!needsDissent(q)) return block;
    const o = opus[q.id];
    if (o == null) { missing.push(q.id); return block; }
    const dissent = { by: 'opus', answer: o.answer };
    if (o.solution_html) dissent.solution_html = o.solution_html; // reasoning, shown when it's the sole answer
    const indent = block.match(modelRe)[1];
    const field = `"dissent": ${JSON.stringify(dissent)},\n${indent}`;
    changed++; applied++;
    return block.replace(modelRe, `"model": {\n${indent}${field}`);
  });
  if (i !== qs.length) throw new Error(`${file}: matched ${i} model blocks, expected ${qs.length}`);
  if (changed) { writeFileSync(dataDir + file, text); files++; }
}
console.log(`files ${files} | dissent applied ${applied}` + (missing.length ? ` | MISSING opus answer: ${missing.join(', ')}` : ''));
