#!/usr/bin/env node
// Krok 2: land the key-visible Opus verdicts (adjudicate.workflow.mjs sidecars).
//   EQUIVALENT                              -> data: agrees := true (no real conflict, only wording)
//   KEY_CORRECT | KEY_WRONG | SOLUTION_WRONG -> one row in suspected_key_errors.tsv; data untouched
// build.mjs turns those rows into the `suspect` flag + badge + reason, so the TSV is the only place
// a key judgement is recorded — `answer.correct` is never rewritten here. Idempotent: known ids skip.
// Usage: node apply-adjudication.mjs <scratchpad-dir> [--write]
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SP = process.argv[2], write = process.argv.includes('--write');
if (!SP) { console.error('usage: node apply-adjudication.mjs <scratchpad-dir> [--write]'); process.exit(1); }
const root = fileURLToPath(new URL('..', import.meta.url)), dataDir = root + 'browser/data/';
const tsvPath = root + 'suspected_key_errors.tsv';

const targets = new Map(JSON.parse(readFileSync(SP + '/targets.json', 'utf8')).map(t => [t.id, t]));
const verdicts = {};
for (const f of readdirSync(SP + '/verdicts').filter(f => f.endsWith('.json')))
  Object.assign(verdicts, JSON.parse(readFileSync(SP + '/verdicts/' + f, 'utf8')));

const VALID = new Set(['EQUIVALENT', 'KEY_CORRECT', 'KEY_WRONG', 'SOLUTION_WRONG']);
const clean = s => String(s ?? '').replace(/[\t\r\n]+/g, ' ').trim();
const bad = [];
for (const [id, v] of Object.entries(verdicts)) {
  if (!targets.has(id)) bad.push(`${id}: judged but not a target`);
  else if (!VALID.has(v.verdict)) bad.push(`${id}: unknown verdict ${JSON.stringify(v.verdict)}`);
  else if (v.verdict !== 'EQUIVALENT' && !clean(v.reason_pl)) bad.push(`${id}: ${v.verdict} without reason_pl`);
}
for (const id of targets.keys()) if (!(id in verdicts)) bad.push(`${id}: no verdict`);
if (bad.length) { console.error(`${bad.length} PROBLEM(S):\n  ` + bad.join('\n  ')); process.exit(1); }

// --- EQUIVALENT: flip agrees in place (surgical, one line per question) ---
const allBlocks = /"model": \{\n([\s\S]*?)\n( *)\}/g;
let files = 0, flipped = 0;
const notFlipped = [];   // EQUIVALENT verdicts on questions that never dissented (agrees: null)
for (const file of readdirSync(dataDir).filter(f => f.endsWith('.json'))) {
  const qs = JSON.parse(readFileSync(dataDir + file, 'utf8')).questions;
  let i = 0, hits = 0;
  const text = readFileSync(dataDir + file, 'utf8').replace(allBlocks, block => {
    const q = qs[i++], v = verdicts[q.id];
    if (!v || v.verdict !== 'EQUIVALENT') return block;

    // only a real dissent can be talked out of: agrees === null means the stored answer was
    // partial (one label of "A, C"), and a judge calling that EQUIVALENT does not complete it
    if (!block.includes('"agrees": false')) { notFlipped.push(q.id); return block; }
    hits++; flipped++;
    return block.replace('"agrees": false', '"agrees": true');
  });
  if (i !== qs.length) throw new Error(`${file}: matched ${i} model blocks, expected ${qs.length}`);
  if (hits) { files++; if (write) writeFileSync(dataDir + file, text); }
}

// --- the other three verdicts: append TSV rows ---
const tsv = readFileSync(tsvPath, 'utf8').replace(/\n+$/, '');
const known = new Set(tsv.split('\n').slice(1).map(l => l.split('\t')[1]));
const rows = [], tally = {};
for (const [id, v] of Object.entries(verdicts)) {
  tally[v.verdict] = (tally[v.verdict] || 0) + 1;
  if (v.verdict === 'EQUIVALENT' || known.has(id)) continue;
  const t = targets.get(id);
  rows.push([t.hash, id, clean(t.key), clean(v.issue_en), clean(v.reason_pl), v.verdict].join('\t'));
}
if (write && rows.length) writeFileSync(tsvPath, tsv + '\n' + rows.join('\n') + '\n');

console.log(`${Object.keys(verdicts).length} verdict(s)`, tally);
console.log(`agrees flipped in ${files} file(s): ${flipped} | new TSV rows: ${rows.length}${write ? ' — written' : ' — dry run, pass --write'}`);
if (notFlipped.length) console.log(`left at agrees: null (partial answer, EQUIVALENT ignored): ${notFlipped.join(', ')}`);
