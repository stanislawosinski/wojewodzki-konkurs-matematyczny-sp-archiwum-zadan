#!/usr/bin/env node
// Repair `answer.model.agrees === false` verdicts that are FORMAT artifacts, not real
// model↔key disagreements. Three key shapes the tier-1 comparator could not read:
//   "D lub E"   alternates accepted by the key; model picked a listed one   -> agrees: true
//   "A, C"      multi-select key stored as closed_single; model named one   -> agrees: null
//   "B3" / "TC" answer+justification combined; model gave only one part     -> agrees: null
// null = "cannot auto-compare" (browser bucket `nieroz`) — a partial answer is not a match.
// Surgical: rewrites only the one `"agrees": false` line of each affected question. Idempotent.
// Usage: node fix-agrees-format.mjs [--write]
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dataDir = fileURLToPath(new URL('../../data/questions/', import.meta.url));
const write = process.argv.includes('--write');

// -> true | null (new agrees value) | undefined (leave alone: a genuine disagreement)
function reclassify(q) {
  const key = String(q.answer.correct).trim().toUpperCase();
  const mdl = String(q.answer.model.answer).trim().toUpperCase();
  const labels = new Set((q.choices || []).map(c => c.label.toUpperCase()));
  if (labels.has(key) || !labels.has(mdl)) return;   // plain label key, or model answer we can't place

  const alts = key.split(/\s+LUB\s+/).map(s => s.trim());
  if (alts.length > 1 && alts.every(a => labels.has(a))) return alts.includes(mdl) ? true : undefined;

  const set = key.split(/\s*,\s*/).map(s => s.trim());
  if (set.length > 1 && set.every(a => labels.has(a))) return set.includes(mdl) ? null : undefined;

  // combined answer+justification: the key is the model's label plus the other part ("B"+"3")
  if (key.length <= 4 && (key.startsWith(mdl) || key.endsWith(mdl))) return null;
}

const allBlocks = /"model": \{\n[\s\S]*?\n *\}/g;   // one per question, in document order
let files = 0, changed = 0;
for (const file of readdirSync(dataDir).filter(f => f.endsWith('.json'))) {
  const qs = JSON.parse(readFileSync(dataDir + file, 'utf8')).questions;
  let i = 0, hits = 0;
  const text = readFileSync(dataDir + file, 'utf8').replace(allBlocks, block => {
    const q = qs[i++], a = q.answer || {}, m = a.model || {};
    if (q.type !== 'closed_single' || m.agrees !== false || a.correct == null || a.correct === '') return block;
    const verdict = reclassify(q);
    if (verdict === undefined) return block;
    console.log(`${q.id}\tkey=${JSON.stringify(a.correct)}\tmodel=${JSON.stringify(m.answer)}\t-> agrees: ${verdict}`);
    hits++; changed++;
    return block.replace('"agrees": false', `"agrees": ${verdict}`);
  });
  if (i !== qs.length) throw new Error(`${file}: matched ${i} model blocks, expected ${qs.length}`);
  if (hits) { files++; if (write) writeFileSync(dataDir + file, text); }
}
console.log(`\n${changed} question(s) in ${files} file(s)${write ? ' — written' : ' — dry run, pass --write'}`);
