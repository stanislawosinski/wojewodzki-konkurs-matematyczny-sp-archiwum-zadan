#!/usr/bin/env node
// Repair `answer.model.agrees === null` verdicts where the blind answer and the key are the SAME
// compound answer written differently — the tier-1 comparator only ever matched a single label:
//   "B, D"                    vs "BD"          separators/spacing
//   "1 – B, 2 – C, 3 – B"     vs "BCBD"        key numbers the sub-items, the model does not
// Nothing is re-solved and no answer is rewritten; this only makes the comparison that was
// missing. Anything that is not a character-for-character match stays null (partial answers,
// one differing sub-item — those need a real solve). Idempotent.
// Usage: node fix-agrees-compound.mjs [--write]
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dataDir = fileURLToPath(new URL('../browser/data/', import.meta.url));
const write = process.argv.includes('--write');

const canon = s => String(s).toUpperCase().replace(/[^A-Z0-9]/g, '');

// "7.1 – D, 7.2 – A, …" / "1 – B, 2 – C, …": sub-item numbering the model is free to omit
const NUMBERED = /^\s*\d+(\.\d+)?\s*[–—-]\s*[A-Z]\s*(,\s*\d+(\.\d+)?\s*[–—-]\s*[A-Z]\s*)+$/;
const letters = s => String(s).toUpperCase().replace(/[^A-Z]/g, '');

const sameAnswer = (key, ans) =>
  NUMBERED.test(String(key)) ? letters(key) === letters(ans) : canon(key) === canon(ans);

const allBlocks = /"model": \{\n[\s\S]*?\n *\}/g;   // one per question, in document order
let files = 0, changed = 0;
for (const file of readdirSync(dataDir).filter(f => f.endsWith('.json'))) {
  const qs = JSON.parse(readFileSync(dataDir + file, 'utf8')).questions;
  let i = 0, hits = 0;
  const text = readFileSync(dataDir + file, 'utf8').replace(allBlocks, block => {
    const q = qs[i++], a = q.answer || {}, m = a.model || {};
    if (q.type !== 'closed_single' || m.agrees !== null || !a.correct || m.answer == null) { return block; }
    if (!sameAnswer(a.correct, m.answer)) { return block; }
    console.log(`${q.id}\tkey=${JSON.stringify(a.correct)}\tmodel=${JSON.stringify(m.answer)}`);
    hits++; changed++;
    return block.replace('"agrees": null', '"agrees": true');
  });
  if (i !== qs.length) { throw new Error(`${file}: matched ${i} model blocks, expected ${qs.length}`); }
  if (hits) { files++; if (write) { writeFileSync(dataDir + file, text); } }
}
console.log(`\n${changed} question(s) in ${files} file(s)${write ? ' — written' : ' — dry run, pass --write'}`);
