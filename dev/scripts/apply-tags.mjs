#!/usr/bin/env node
// Apply retag sidecars ({id:[leaves]}) onto browser/data/*.json, patching ONLY each
// question's "topics" array in place (clean diffs). Validates every leaf against
// categories.json. Usage: node apply-tags.mjs <tagsDir> [basename ...]   (no basenames = every sidecar present)
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
const dataDir = root + 'browser/data/';
const tagsDir = process.argv[2];
if (!tagsDir) { console.error('usage: node apply-tags.mjs <tagsDir> [basename ...]'); process.exit(1); }

const LEAVES = new Set(
  JSON.parse(readFileSync(root + 'categories.json', 'utf8')).categories.flatMap(c => c.leaves.map(l => l.name)),
);
const GENERIC = new Set(['inne', 'geometria', 'bryły']);

const only = process.argv.slice(3);
const files = (only.length ? only : readdirSync(tagsDir).filter(f => f.endsWith('.json')));

// topics arrays hold only strings (no ']' in leaf names), so a bracket-free match is safe.
const TOPICS_RE = /(\n[ \t]*)"topics": \[[^\]]*\]/g;
const ser = (topics, keyIndent) => {
  if (!topics.length) return '[]';
  const el = keyIndent + '  ';
  return '[\n' + topics.map(t => el + JSON.stringify(t)).join(',\n') + '\n' + keyIndent + ']';
};

let filesChanged = 0, arraysChanged = 0, generic = 0, totalQ = 0, bad = [];
for (const f of files) {
  const side = tagsDir + '/' + f, dst = dataDir + f;
  if (!existsSync(side)) { console.error(`skip ${f}: no sidecar`); continue; }
  if (!existsSync(dst)) { console.error(`skip ${f}: no data file`); continue; }
  const map = JSON.parse(readFileSync(side, 'utf8'));
  const raw = readFileSync(dst, 'utf8');
  const t = JSON.parse(raw);
  const qs = t.questions;
  totalQ += qs.length;

  // validate coverage + leaf names before touching anything
  const ids = new Set(qs.map(q => q.id));
  for (const q of qs) if (!(q.id in map)) bad.push(`${f}: missing id in sidecar: ${q.id}`);
  for (const id of Object.keys(map)) if (!ids.has(id)) bad.push(`${f}: sidecar id not in file: ${id}`);
  for (const [id, tp] of Object.entries(map)) {
    if (!Array.isArray(tp) || !tp.length) bad.push(`${f}: ${id}: empty/invalid topics`);
    for (const tag of tp || []) if (!LEAVES.has(tag)) bad.push(`${f}: ${id}: unknown leaf "${tag}"`);
  }

  // patch the i-th "topics" array to questions[i]'s new tags (arrays appear in question order)
  let i = 0, localChanged = 0;
  const out = raw.replace(TOPICS_RE, (m, lead) => {
    const q = qs[i++];
    const nt = map[q.id];
    if (!nt) return m; // leave untouched if unmapped (already flagged above)
    const keyIndent = lead.slice(1);
    const same = JSON.stringify(q.topics) === JSON.stringify(nt);
    if (nt.every(x => GENERIC.has(x))) generic++;
    if (same) return m;
    localChanged++;
    return lead + '"topics": ' + ser(nt, keyIndent);
  });
  if (i !== qs.length) bad.push(`${f}: matched ${i} topics arrays but file has ${qs.length} questions`);
  if (localChanged) { writeFileSync(dst, out); filesChanged++; arraysChanged += localChanged; }
  console.log(`${f}: ${localChanged} array(s) changed / ${qs.length} q`);
}

console.log(`\n${filesChanged} file(s), ${arraysChanged} topics array(s) changed; ${generic}/${totalQ} still generic (inne/geometria/bryły only)`);
if (bad.length) { console.error(`\n${bad.length} PROBLEM(S) — not all applied:\n  ` + bad.join('\n  ')); process.exit(1); }
