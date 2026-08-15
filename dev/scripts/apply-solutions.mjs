#!/usr/bin/env node
// Merge blind-solve sidecars ({id:{answer,confidence,solution_html}}) into each
// question's answer object as a `model` sub-object, WITHOUT touching the extracted
// key (answer.correct) or reformatting the rest of the file. Emits a diff report
// (disagreements + keyless filled + low confidence). Idempotent (re-runs overwrite model).
// Usage: node apply-solutions.mjs <sideDir> <by> [basename ...]
//   <by> = label for the model that produced these answers, e.g. sonnet | opus
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
const dataDir = root + 'browser/data/';
const sideDir = process.argv[2], by = process.argv[3];
if (!sideDir || !by) { console.error('usage: node apply-solutions.mjs <sideDir> <by> [basename ...]'); process.exit(1); }
const only = process.argv.slice(4);
const files = only.length ? only : readdirSync(sideDir).filter(f => f.endsWith('.json'));

// answer object = "answer": { ...lines indented deeper... \n<indent>}  (each JSON string is one physical line)
const ANSWER_RE = /(\n([ \t]*))"answer": \{\n([\s\S]*?)\n\2\}/g;
const norm = (s, t) => t === 'true_false' ? String(s).toUpperCase().replace(/[^PF]/g, '') : String(s).trim().toUpperCase();
const flat = h => String(h).replace(/<[^>]+>/g, '').replace(/\s+/g, '').toLowerCase();
// closed_single: model should return a label letter; if it returned the value, map it back to the choice label.
const resolveClosed = (ma, q) => {
  const up = String(ma).trim().toUpperCase();
  const labels = new Set((q.choices || []).map(c => c.label.toUpperCase()));
  if (labels.has(up)) return up;
  const hit = (q.choices || []).filter(c => flat(c.html) === flat(ma));
  return hit.length === 1 ? hit[0].label.toUpperCase() : null;   // null = unresolvable format anomaly
};

const report = [];      // {file,id,type,kind,key,model,conf}
let filesChanged = 0, changed = 0, agree = 0, disagree = 0, keyless = 0, lowc = 0, format = 0, bad = [];

for (const f of files) {
  const side = sideDir + '/' + f, dst = dataDir + f;
  if (!existsSync(side)) { console.error(`skip ${f}: no sidecar`); continue; }
  if (!existsSync(dst)) { console.error(`skip ${f}: no data file`); continue; }
  const map = JSON.parse(readFileSync(side, 'utf8'));
  const raw = readFileSync(dst, 'utf8');
  const qs = JSON.parse(raw).questions;

  for (const q of qs) if (!(q.id in map)) bad.push(`${f}: missing solve for ${q.id}`);

  let i = 0, local = 0;
  const out = raw.replace(ANSWER_RE, (m, lead, ind, inner) => {
    const q = qs[i++], s = map[q.id];
    if (!s) return m;
    const key = q.answer ? q.answer.correct : null;
    let ma = s.answer, badfmt = false;
    if (q.type === 'closed_single') { const r = resolveClosed(ma, q); if (r) ma = r; else badfmt = true; }
    const agrees = (key == null || badfmt || q.type === 'open') ? null : norm(key, q.type) === norm(ma, q.type);
    if (badfmt) format++; else if (key == null) keyless++; else if (agrees === true) agree++; else if (agrees === false) disagree++;
    if (s.confidence === 'low') lowc++;
    const kind = badfmt ? 'FORMAT' : key == null ? 'KEYLESS' : agrees === false ? 'DISAGREE' : s.confidence === 'low' ? 'lowconf' : null;
    if (kind) report.push({ file: f, id: q.id, type: q.type, kind, key, model: ma, conf: s.confidence });

    const model = { answer: ma, by, agrees };
    if (key == null || agrees === false || badfmt) model.solution_html = s.solution_html ?? null;  // store reasoning only where it matters
    const el = ind + '  ';
    const stripped = inner.split('\n' + el + '"model":')[0].replace(/,\s*$/, '');  // drop any prior model (idempotent)
    const modelStr = el + '"model": ' + JSON.stringify(model, null, 2).replace(/\n/g, '\n' + el);
    local++;
    return lead + '"answer": {\n' + stripped + ',\n' + modelStr + '\n' + ind + '}';
  });
  if (i !== qs.length) bad.push(`${f}: matched ${i} answer objects but file has ${qs.length} questions`);
  if (local && out !== raw) { writeFileSync(dst, out); filesChanged++; changed += local; }
}

console.log(`${filesChanged} file(s), ${changed} answer(s) marked [by=${by}]`);
console.log(`agree ${agree} | disagree ${disagree} | keyless ${keyless} | format ${format} | low-conf ${lowc}`);
if (report.length) {
  const rp = sideDir + '/_report.tsv';
  writeFileSync(rp, 'kind\tfile\tid\ttype\tkey\tmodel\tconf\n' +
    report.map(r => [r.kind, r.file, r.id, r.type, r.key ?? '', r.model, r.conf].join('\t')).join('\n') + '\n');
  console.log(`report -> ${rp} (${report.length} rows: disagreements + keyless + low-conf)`);
}
if (bad.length) { console.error(`\n${bad.length} PROBLEM(S):\n  ` + bad.join('\n  ')); process.exit(1); }
