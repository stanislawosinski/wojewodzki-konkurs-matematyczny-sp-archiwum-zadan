#!/usr/bin/env node
// Carve-pass helper for revision 2026-08-02. A carve pass refines existing tags: candidates are
// selected by the tag they already carry, and each agent decides only whether a handful of new
// leaves apply. Results are ADD-ONLY — a carve can never drop a tag the full retag decided.
//
//   node carve.mjs prep  <batchDir>                 build batch files from the current tags
//   node carve.mjs merge <resultsDir> <tagsDir>     fold results into per-file sidecars for apply-tags.mjs
//
// ponytail: pools deliberately overlap (a question can be both a `kąty` and a `równania` candidate);
// since results are add-only, merging is a union and needs no priority ordering.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dataDir = root + 'browser/data/';
const pngDir = root + 'browser/figures/';
const svgDir = root + 'browser/figures/svg/';
const BATCH = 35;

const CAT = JSON.parse(readFileSync(root + 'categories.json', 'utf8'));
const LEAVES = new Set(CAT.categories.flatMap(c => c.leaves.map(l => l.name)));
const has = (q, t) => (q.topics || []).includes(t);

const PASSES = [
  { key: 'geo', leaves: ['wędrówka kąta', 'twierdzenie Pitagorasa', 'trójkąty o kątach 30-60-90 i 45-45-90'],
    pool: q => has(q, 'kąty') || has(q, 'trójkąty') },
  { key: 'rown', leaves: ['zadania tekstowe na równania'],
    pool: q => has(q, 'równania z jedną zmienną') },
  { key: 'stat', leaves: ['mediana i dominanta'],
    pool: q => has(q, 'statystyka opisowa') },
  { key: 'bryly', leaves: ['graniastosłupy', 'ostrosłupy', 'bryły obrotowe', 'bryły'],
    pool: q => has(q, 'liczba krawędzi, ścian i wierzchołków') },
];

const loadAll = () => readdirSync(dataDir).filter(f => f.endsWith('.json')).sort().flatMap(f =>
  JSON.parse(readFileSync(dataDir + f, 'utf8')).questions.map(q => ({ ...q, _file: f })));

const cmd = process.argv[2];

if (cmd === 'prep') {
  const batchDir = process.argv[3];
  if (!batchDir) { console.error('usage: node carve.mjs prep <batchDir>'); process.exit(1); }
  mkdirSync(batchDir, { recursive: true });
  const all = loadAll();
  let totalBatches = 0;
  for (const p of PASSES) {
    // a rule belongs to this pass if it names one of the pass's leaves
    const rules = CAT.migration.rules.filter(r => p.leaves.some(l => r.includes('`' + l + '`')));
    const pool = all.filter(p.pool).map(q => ({
      ...q,
      _figures: (q.figures || []).map(f => ({
        png: pngDir + f,
        svg: existsSync(svgDir + f.replace(/\.[^.]+$/, '.svg')) ? svgDir + f.replace(/\.[^.]+$/, '.svg') : null,
      })),
    }));
    for (let i = 0; i < pool.length; i += BATCH) {
      const name = `${p.key}-${String(i / BATCH + 1).padStart(3, '0')}.json`;
      writeFileSync(batchDir + '/' + name,
        JSON.stringify({ pass: p.key, batch: name, leaves: p.leaves, rules, questions: pool.slice(i, i + BATCH) }, null, 1));
      totalBatches++;
    }
    const figs = pool.filter(q => q._figures.length).length;
    console.log(`${p.key.padEnd(6)} ${String(pool.length).padStart(5)} candidates | ${String(figs).padStart(4)} with a figure | ` +
      `${Math.ceil(pool.length / BATCH)} batches | leaves: ${p.leaves.join(', ')}`);
  }
  console.log(`\n${totalBatches} batch file(s) in ${batchDir}`);
  writeFileSync(batchDir + '/../batches.json', JSON.stringify(readdirSync(batchDir).filter(f => f.endsWith('.json')).sort()));
}

else if (cmd === 'merge') {
  const [, , , resultsDir, tagsDir] = process.argv;
  if (!resultsDir || !tagsDir) { console.error('usage: node carve.mjs merge <resultsDir> <tagsDir>'); process.exit(1); }
  mkdirSync(tagsDir, { recursive: true });
  const all = loadAll();
  const byId = new Map(all.map(q => [q.id, q]));

  const adds = new Map(); // id -> Set(leaves to add)
  const bad = [];
  for (const f of readdirSync(resultsDir).filter(f => f.endsWith('.json'))) {
    for (const [id, leaves] of Object.entries(JSON.parse(readFileSync(resultsDir + '/' + f, 'utf8')))) {
      if (!byId.has(id)) { bad.push(`${f}: unknown id ${id}`); continue; }
      for (const l of leaves) {
        if (!LEAVES.has(l)) { bad.push(`${f}: ${id}: invalid leaf ${l}`); continue; }
        if (!adds.has(id)) adds.set(id, new Set());
        adds.get(id).add(l);
      }
    }
  }
  if (bad.length) { console.error('REFUSING TO MERGE:\n  ' + bad.join('\n  ')); process.exit(1); }

  // one sidecar per touched file, carrying EVERY id in that file (apply-tags.mjs checks coverage both ways)
  const touched = new Set([...adds.keys()].map(id => byId.get(id)._file));
  let changed = 0;
  for (const file of touched) {
    const out = {};
    for (const q of all.filter(q => q._file === file)) {
      const extra = [...(adds.get(q.id) || [])].filter(l => !(q.topics || []).includes(l));
      if (extra.length) changed++;
      out[q.id] = [...extra, ...(q.topics || [])]; // most-specific first, per the catalog convention
    }
    writeFileSync(tagsDir + '/' + file, JSON.stringify(out, null, 1));
  }
  const perLeaf = {};
  for (const s of adds.values()) for (const l of s) perLeaf[l] = (perLeaf[l] || 0) + 1;
  console.log(`${changed} question(s) gained a leaf across ${touched.size} file(s) -> ${tagsDir}`);
  console.log(Object.entries(perLeaf).sort((a, b) => b[1] - a[1]).map(([l, n]) => `  ${String(n).padStart(4)}  ${l}`).join('\n'));
}

else { console.error('usage: node carve.mjs prep|merge ...'); process.exit(1); }
