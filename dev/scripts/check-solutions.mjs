#!/usr/bin/env node
// Validate the AI-solution sidecars in data/solutions/ against data/questions/ before they are
// merged by build.mjs: scope, key agreement (the campaign's whole safety net), HTML hygiene,
// coverage. Read-only. Writes data/solutions/_check.tsv and exits 1 on any ERROR row.
// Usage: node check-solutions.mjs [basename ...]   (default: every sidecar present)
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
const dataDir = root + 'data/questions/', sideDir = root + 'data/solutions/';
const only = process.argv.slice(2).map(f => f.endsWith('.json') ? f : f + '.json');
const files = only.length ? only : readdirSync(sideDir).filter(f => f.endsWith('.json'));

// same normalisation as apply-solutions.mjs, so "check" is judged exactly like a model answer
const norm = (s, t) => t === 'true_false' ? String(s).toUpperCase().replace(/[^PF]/g, '') : String(s).trim().toUpperCase();
const flat = h => String(h).replace(/<[^>]+>/g, '').replace(/\s+/g, '').toLowerCase();
const resolveClosed = (ma, q) => {
  const up = String(ma).trim().toUpperCase();
  if (new Set((q.choices || []).map(c => c.label.toUpperCase())).has(up)) return up;
  const hit = (q.choices || []).filter(c => flat(c.html) === flat(ma));
  return hit.length === 1 ? hit[0].label.toUpperCase() : null;
};
const inScope = q => {
  const a = q.answer || {};
  return a.correct != null && a.correct !== '' && !a.solution_html && !(a.model && a.model.solution_html);
};
// mirrors the tags the corpus itself uses (menclose included — a few papers box an operator),
// minus the table family: a derivation that needs a table is a smell worth seeing flagged
const OK_TAGS = new Set(['p', 'ul', 'ol', 'li', 'b', 'strong', 'em', 'sub', 'sup', 'br',
  'math', 'mrow', 'mn', 'mi', 'mo', 'mfrac', 'msqrt', 'mroot', 'msup', 'msub', 'msubsup',
  'mtext', 'mspace', 'mfenced', 'mtable', 'mtr', 'mtd', 'mover', 'munder', 'mstyle', 'menclose']);

const rows = [], counts = { ERROR: 0, WARN: 0, GAP: 0 };
const add = (lvl, kind, file, id, detail) => { rows.push([lvl, kind, file, id, detail]); counts[lvl]++; };

for (const f of files) {
  if (!existsSync(sideDir + f)) { console.error(`skip ${f}: no sidecar`); continue; }
  if (!existsSync(dataDir + f)) { add('ERROR', 'no-data-file', f, '', ''); continue; }
  const side = JSON.parse(readFileSync(sideDir + f, 'utf8'));
  const qs = JSON.parse(readFileSync(dataDir + f, 'utf8')).questions;
  const byId = new Map(qs.map(q => [q.id, q]));

  for (const [id, v] of Object.entries(side)) {
    const q = byId.get(id);
    if (!q) { add('ERROR', 'unknown-id', f, id, ''); continue; }
    if (!inScope(q)) { add('ERROR', 'out-of-scope', f, id, 'already has a derivation or no key'); continue; }
    if (!v || typeof v.html !== 'string' || typeof v.check !== 'string') { add('ERROR', 'bad-entry', f, id, JSON.stringify(v).slice(0, 80)); continue; }

    // key agreement — the derivation must land on the printed key
    const key = q.answer.correct;
    if (q.type === 'open') {
      if (flat(v.check) !== flat(key)) add('WARN', 'open-diff', f, id, `key="${key}" check="${v.check}"`);
    } else {
      // A literal match in the key's own format settles it — that is how the corpus's two-part keys
      // ("B3", "7.1 – D, 7.2 – A, …" on a multi-part item with no choices) agree. Only when that
      // fails is it worth mapping a closed_single answer given as the option's value back to its label.
      let got = v.check;
      if (norm(got, q.type) !== norm(key, q.type) && q.type === 'closed_single') {
        got = resolveClosed(v.check, q) ?? v.check;
      }
      if (norm(got, q.type) !== norm(key, q.type)) add('ERROR', 'mismatch', f, id, `key="${key}" check="${v.check}"`);
    }

    // HTML hygiene — this field is rendered as trusted HTML
    for (const m of v.html.matchAll(/<\/?([a-zA-Z][\w-]*)/g)) {
      if (!OK_TAGS.has(m[1].toLowerCase())) add('ERROR', 'bad-tag', f, id, `<${m[1]}>`);
    }
    if (/\son[a-z]+\s*=|\bstyle\s*=|javascript:/i.test(v.html)) add('ERROR', 'bad-attr', f, id, '');

    // judged on the rendered text, not the markup — MathML inflates a one-line derivation to
    // 2 kB of tags. Clock times ("9.25") trip dot-decimal too; treat it as a hint, not a verdict.
    const text = v.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (/\d\.\d/.test(text)) add('WARN', 'dot-decimal', f, id, '');
    if (text.length > 500) add('WARN', 'long', f, id, `${text.length} chars of text`);
  }

  for (const q of qs) {
    if (inScope(q) && !(q.id in side)) add('GAP', 'unsolved', f, q.id, q.type);
  }
}

writeFileSync(sideDir + '_check.tsv', 'level\tkind\tfile\tid\tdetail\n' + rows.map(r => r.join('\t')).join('\n') + '\n');
console.log(`${files.length} sidecar(s) — ERROR ${counts.ERROR} | WARN ${counts.WARN} | GAP ${counts.GAP}`);
const by = {};
for (const [lvl, kind] of rows) { by[`${lvl} ${kind}`] = (by[`${lvl} ${kind}`] || 0) + 1; }
for (const [k, n] of Object.entries(by).sort((a, b) => b[1] - a[1])) { console.log(`  ${k}: ${n}`); }
console.log(`report -> ${sideDir}_check.tsv`);
process.exit(counts.ERROR ? 1 : 0);
