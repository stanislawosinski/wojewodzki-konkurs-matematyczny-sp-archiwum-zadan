#!/usr/bin/env node
// Emit BLIND solve-inputs: per paper, questions stripped of the answer key.
// Figures become absolute paths so a solver agent can Read them.
// Usage: node make-blind.mjs <outDir> [basename ...]   (no basenames = all)
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
const data = root + 'browser/data/';
const figs = root + 'browser/figures/';
const out = process.argv[2];
if (!out) { console.error('usage: node make-blind.mjs <outDir> [basename ...]'); process.exit(1); }
mkdirSync(out, { recursive: true });

const only = process.argv.slice(3);
const files = only.length ? only : readdirSync(data).filter(f => f.endsWith('.json'));
let q = 0;
for (const f of files) {
  const t = JSON.parse(readFileSync(data + f, 'utf8'));
  const blind = t.questions.map(x => ({
    id: x.id, type: x.type, points: x.points,
    prompt_html: x.prompt_html,
    choices: (x.choices || []).map(c => ({ label: c.label, html: c.html })),
    figures: (x.figures || []).map(fn => figs + fn),   // absolute -> agent Reads them
  }));                                                  // NOTE: no `answer` field — that is the point
  writeFileSync(out + '/' + f, JSON.stringify(blind, null, 1));
  q += blind.length;
}
console.log(`${files.length} blind file(s), ${q} question(s) -> ${out}`);
