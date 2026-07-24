#!/usr/bin/env node
// Preprocess data/*.json into per-stage shards for the browser app:
//   data.<stage>.js    - script-tag loadable (file:// protocol)
//   data.<stage>.json  - fetch()-able (http/https)
// Usage: node build.mjs   (cwd doesn't matter)
import { readdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

// the browser fetches the .json files over http(s); gzip size ≈ what goes over the wire
const gz = s => `${(s.length / 1024).toFixed(0)} KB (${(gzipSync(s).length / 1024).toFixed(0)} KB gzip)`;

const here = fileURLToPath(new URL('.', import.meta.url));
const dataDir = fileURLToPath(new URL('data/', import.meta.url));
const STAGES = ['szkolny', 'rejonowy', 'wojewodzki'];

const byStage = Object.fromEntries(STAGES.map(s => [s, []]));
const seenId = new Map(), seenHash = new Map();

for (const f of readdirSync(dataDir).filter(f => f.endsWith('.json')).sort()) {
  const t = JSON.parse(readFileSync(dataDir + f, 'utf8'));
  if (!byStage[t.stage]) {
    console.error(`${f}: unknown stage "${t.stage}"`);
    process.exit(1);
  }
  for (const q of t.questions) {
    const hash = createHash('sha1').update(q.id).digest('hex').slice(0, 8);
    if (seenId.has(q.id)) { console.error(`duplicate id ${q.id} (${f}, ${seenId.get(q.id)})`); process.exit(1); }
    if (seenHash.has(hash)) { console.error(`hash collision ${hash}: ${q.id} vs ${seenHash.get(hash)} — lengthen the hash`); process.exit(1); }
    seenId.set(q.id, f); seenHash.set(hash, q.id);
    byStage[t.stage].push({
      id: q.id, hash, number: q.number, page: q.page, type: q.type, points: q.points,
      ...(q.annulled ? { annulled: true } : {}), // only the rare annulled ones carry the flag
      topics: q.topics, prompt_html: q.prompt_html, choices: q.choices,
      figures: q.figures, answer: q.answer,
      source_file: t.source_file, school_year: t.school_year, wojewodztwo: t.wojewodztwo,
      stage: t.stage, school_type: t.school_type, competition: t.competition,
    });
  }
}

let total = 0;
for (const s of STAGES) {
  const qs = byStage[s];
  const jsPath = `${here}data.${s}.js`, jsonPath = `${here}data.${s}.json`;
  if (!qs.length) { rmSync(jsPath, { force: true }); rmSync(jsonPath, { force: true }); continue; }
  const json = JSON.stringify(qs);
  writeFileSync(jsonPath, json);
  writeFileSync(jsPath, `window.DATA = window.DATA || [];\nwindow.DATA.push(...${json});\n`);
  console.log(`${s}: ${qs.length} questions, ${gz(json)} (.json), + .js shard`);
  total += qs.length;
}
console.log(`total: ${total} questions`);
