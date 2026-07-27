// Fold the tier-2 Opus vote into the KEYLESS questions' answer.model (surgical — only the
// "model": {...} block is rewritten; answer.correct is never touched):
//   keyless_agreed        -> prefer Opus's answer+solution, by:"opus+sonnet", corroborated:true
//   keyless_split/review  -> keep Sonnet's answer,          by unchanged,     corroborated:false
// Reads tier2-verdicts.tsv (verdict,hash,file,id,...) + solved-opus/ sidecars.
// Usage: node scripts/apply-corroboration.mjs <scratchpad> <repo-root>
import { readFileSync, writeFileSync } from 'node:fs';
const SP = process.argv[2], root = process.argv[3];
const dataDir = root + '/browser/data/', opDir = SP + '/solved-opus/';

const byFile = {};                                   // file -> Map(id -> verdict)
for (const line of readFileSync(SP + '/tier2-verdicts.tsv', 'utf8').trim().split('\n').slice(1)) {
  const [verdict, , file, id] = line.split('\t');
  if (!verdict.startsWith('keyless')) continue;      // only keyless questions get the flag
  (byFile[file] ??= new Map()).set(id, verdict);
}

const j = v => JSON.stringify(v);
const modelRe = /"model": \{\n[\s\S]*?\n( *)\}/g;     // one match per question, in order (no nested braces in model)
let agreed = 0, flagged = 0, files = 0;

for (const file of Object.keys(byFile)) {
  const want = byFile[file];
  const qs = JSON.parse(readFileSync(dataDir + file, 'utf8')).questions;
  const op = JSON.parse(readFileSync(opDir + file, 'utf8'));
  let i = 0;
  const text = readFileSync(dataDir + file, 'utf8').replace(modelRe, (m, ind) => {
    const q = qs[i++];
    const verdict = want.get(q.id);
    if (!verdict) return m;
    const fi = ind + '  ', em = q.answer.model, o = op[q.id];
    let fields;
    if (verdict === 'keyless_agreed' && o) {           // prefer Opus text, mark corroborated
      agreed++;
      fields = [['answer', o.answer ?? em.answer], ['by', 'opus+sonnet'], ['agrees', null],
                ['corroborated', true], ['solution_html', o.solution_html ?? em.solution_html]];
    } else {                                           // split/review (or opus missing): keep Sonnet, flag uncertain
      flagged++;
      fields = [['answer', em.answer], ['by', em.by], ['agrees', em.agrees],
                ['corroborated', false], ['solution_html', em.solution_html]];
    }
    return '"model": {\n' + fields.map(([k, v]) => fi + j(k) + ': ' + j(v)).join(',\n') + '\n' + ind + '}';
  });
  if (i !== qs.length) throw new Error(`${file}: matched ${i} model blocks, expected ${qs.length}`);
  writeFileSync(dataDir + file, text);
  files++;
}
console.log(`files ${files} | keyless_agreed (Opus preferred) ${agreed} | split/review (flagged) ${flagged}`);
