#!/usr/bin/env node
// Krok 1: replace the stored Sonnet verdict with a fresh BLIND Opus solve on a listed subset,
// recomputing `agrees` against the untouched key. Unlike apply-solutions.mjs this
//   - only touches ids listed in targets.json (everything else is left exactly as is),
//   - judges `open` answers with the numeric/word heuristic instead of giving up (agrees: null),
//   - understands the compound key shapes of fix-agrees-format.mjs ("D lub E", "A, C", "B3").
// Opus agreeing with the key retires the question from the "AI niezgodne z kluczem" bucket;
// Opus dissenting keeps it there WITH its reasoning — that is the Krok-2 pile.
// Surgical: rewrites only the `"model": { … }` block of each target. Idempotent.
// Usage: node apply-opus-recheck.mjs <scratchpad-dir> [--write]
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SP = process.argv[2], write = process.argv.includes('--write');
if (!SP) { console.error('usage: node apply-opus-recheck.mjs <scratchpad-dir> [--write]'); process.exit(1); }
const dataDir = fileURLToPath(new URL('../../browser/data/', import.meta.url));

const targets = new Map(JSON.parse(readFileSync(SP + '/targets.json', 'utf8')).map(t => [t.id, t.why]));
const opus = {};
for (const f of readdirSync(SP + '/solved-opus').filter(f => f.endsWith('.json')))
  Object.assign(opus, JSON.parse(readFileSync(SP + '/solved-opus/' + f, 'utf8')));

const canon = s => String(s).trim().toUpperCase().replace(/\s+/g, '');
const flat = h => String(h).replace(/<[^>]+>/g, '').replace(/\s+/g, '').toLowerCase();
const normTF = s => String(s).toUpperCase().replace(/[^PF]/g, '');
const NUMBERED = /^\s*\d+(\.\d+)?\s*[–—-]\s*[A-Z]\s*(,\s*\d+(\.\d+)?\s*[–—-]\s*[A-Z]\s*)+$/;
const letters = s => String(s).toUpperCase().replace(/[^A-Z]/g, '');
const resolveClosed = (a, q) => {
  const up = canon(a), labels = new Set((q.choices || []).map(c => c.label.toUpperCase()));
  if (labels.has(up)) return up;
  const hit = (q.choices || []).filter(c => flat(c.html) === flat(a));
  return hit.length === 1 ? hit[0].label.toUpperCase() : null;
};
// open answers: sorted-number fingerprint, else letters-only text (units and "≈ …" approximations dropped)
const stripApprox = s => String(s ?? '').replace(/\([^()]*[≈~≅][^()]*\)/g, ' ').replace(/[≈~≅][^;,)]*/g, ' ');
const nums = s => (stripApprox(s).replace(/[−‑–]/g, '-').match(/-?\d+(?:[.,]\d+)?/g) || []).map(x => String(Number(x.replace(',', '.')))).sort();
const UNIT = /\b(cm|mm|dm|km|m|zł|gr|ml|l|kg|dag|g|min|minut[ay]?|godz(?:in[ay]?)?|proc|st)\b|[²³°%]/gi;
const words = s => stripApprox(s).replace(/<[^>]+>/g, ' ').toLowerCase().replace(/[−‑–]/g, '-').replace(UNIT, '').replace(/[^0-9a-ząćęłńóśźż-]/gi, '');
const subset = (a, b) => [...a].every(x => b.has(x));
const openEq = (a, b) => {
  const na = new Set(nums(a)), nb = new Set(nums(b));
  if (na.size && nb.size && (subset(na, nb) || subset(nb, na))) return true;
  const wa = words(a), wb = words(b);
  return wa === wb && wa.length > 0;
};

// key vs opus -> true | false | null (cannot compare)
function compare(key, ans, q) {
  if (key == null || key === '' || ans == null || ans === '') return null;
  if (q.type === 'open') return openEq(key, ans);
  if (q.type === 'true_false') {
    const a = normTF(key), b = normTF(ans);
    return a.length && a.length === b.length ? a === b : null;
  }
  const labels = new Set((q.choices || []).map(c => c.label.toUpperCase()));
  const k = canon(key);

  const alts = k.split(/LUB/).filter(Boolean);                       // "D lub E" — any listed option is accepted
  if (alts.length > 1 && alts.every(a => labels.has(a))) return alts.includes(resolveClosed(ans, q) ?? canon(ans));

  const kset = k.split(',').filter(Boolean);                         // "A, C" — multi-select, needs the full set
  if (kset.length > 1 && kset.every(a => labels.has(a))) {
    const aset = canon(ans).split(',').filter(Boolean);
    if (!aset.every(a => labels.has(a))) return null;
    if (kset.length === aset.length && kset.every(a => aset.includes(a))) return true;

    // naming SOME of the correct labels is an incomplete answer, not a contradicting one
    return aset.every(a => kset.includes(a)) ? null : false;
  }
  // "7.1 – D, 7.2 – A, …": one label per sub-item; the numbering is the key's, not the answer's
  if (NUMBERED.test(String(key))) {
    const kl = letters(key), al = letters(ans);
    return kl.length === al.length ? kl === al : null;                // fewer letters = unanswered sub-items
  }
  if (!labels.has(k)) return k === canon(ans);                       // "B3"/"TC" — answer+justification, compare verbatim

  const ra = resolveClosed(ans, q);
  return ra == null ? null : ra === k;
}

const allBlocks = /"model": \{\n([\s\S]*?)\n( *)\}/g;   // one per question, in document order
const rows = [];
let files = 0, applied = 0, missing = [];
for (const file of readdirSync(dataDir).filter(f => f.endsWith('.json'))) {
  const qs = JSON.parse(readFileSync(dataDir + file, 'utf8')).questions;
  let i = 0, hits = 0;
  const text = readFileSync(dataDir + file, 'utf8').replace(allBlocks, (block, _inner, closeInd) => {
    const q = qs[i++];
    if (!targets.has(q.id)) return block;
    const s = opus[q.id];
    if (!s || s.answer == null) { missing.push(q.id); return block; }
    const key = q.answer.correct;
    const agrees = compare(key, s.answer, q);
    const model = { answer: s.answer, by: 'opus', agrees };

    // reasoning is only worth shipping where the reveal shows the AI answer, i.e. when it dissents
    if (agrees === false && s.solution_html) model.solution_html = s.solution_html;
    rows.push([agrees === true ? 'AGREE' : agrees === false ? 'DISSENT' : 'UNRESOLVED', targets.get(q.id), file, q.id,
      q.type, key, q.answer.model?.answer ?? '', s.answer, s.confidence ?? ''].join('\t'));
    hits++; applied++;
    const ind = closeInd + '  ';
    return '"model": ' + JSON.stringify(model, null, 2).replace(/\n/g, '\n' + closeInd);
  });
  if (i !== qs.length) throw new Error(`${file}: matched ${i} model blocks, expected ${qs.length}`);
  if (hits) { files++; if (write) writeFileSync(dataDir + file, text); }
}

const tally = {};
for (const r of rows) { const k = r.split('\t')[0]; tally[k] = (tally[k] || 0) + 1; }
writeFileSync(SP + '/recheck.tsv', 'verdict\twhy\tfile\tid\ttype\tkey\tsonnet\topus\tconf\n' + rows.join('\n') + '\n');
console.log(`${applied} of ${targets.size} target(s) in ${files} file(s)`, tally);
console.log(`report -> ${SP}/recheck.tsv${write ? '' : '  (dry run, pass --write)'}`);
if (missing.length) console.error(`MISSING opus answer (${missing.length}): ${missing.join(', ')}`);
