// Tier-2 adjudication: 3-way compare key vs sonnet vs opus over the contested subset.
// Opus solved blind (never saw key or sonnet) -> independent third vote.
// Reads: browser/data (key,type,sonnet=model.answer,prompt), solved/ (sonnet conf/why),
//        solved-opus/ (opus answer/conf/why), contested.json.
// Emits: tier2-report.md + tier2-verdicts.tsv. Mutates NO data (human decides key changes).
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const SP = process.argv[2], root = process.argv[3];
const dataDir = root + '/browser/data/', sonDir = SP + '/solved/', opDir = SP + '/solved-opus/';
const contested = JSON.parse(readFileSync(SP + '/contested.json', 'utf8'));

const hash = id => createHash('sha1').update(id).digest('hex').slice(0, 8);
const ENT = { nbsp: ' ', lt: '<', gt: '>', amp: '&', rarr: '→', larr: '←', minus: '−', times: '×', divide: '÷', deg: '°', le: '≤', ge: '≥', ne: '≠', asymp: '≈', equiv: '≡', sup2: '²', sup3: '³', frac12: '½', frac13: '⅓', frac14: '¼', frac34: '¾', hellip: '…', ndash: '–', mdash: '—', middot: '·', bull: '•', prime: '′', Prime: '″', bdquo: '„', ldquo: '“', rdquo: '”', laquo: '«', raquo: '»', sdot: '⋅', radic: '√', alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', Delta: 'Δ', pi: 'π', ang: '∠', angmsd: '∡', perp: '⊥', par: '∥', cong: '≅', sim: '∼', infin: '∞',
  oacute: 'ó', Oacute: 'Ó', aogon: 'ą', Aogon: 'Ą', eogon: 'ę', Eogon: 'Ę', lstrok: 'ł', Lstrok: 'Ł', nacute: 'ń', Nacute: 'Ń', sacute: 'ś', Sacute: 'Ś', zacute: 'ź', Zacute: 'Ź', zdot: 'ż', Zdot: 'Ż', cacute: 'ć', Cacute: 'Ć' };
const txt = h => String(h ?? '').replace(/<[^>]+>/g, ' ').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&quot;/g, '"').replace(/&angmsd[a-z]*;/g, '∡').replace(/&([a-z][a-z0-9]*);/gi, (m, e) => ENT[e] ?? m).replace(/\s+/g, ' ').trim();
const clip = (s, n) => s.length > n ? s.slice(0, n) + ' …' : s;
const flat = h => String(h).replace(/<[^>]+>/g, '').replace(/\s+/g, '').toLowerCase();
const resolveClosed = (ma, q) => {
  const up = String(ma).trim().toUpperCase();
  const labels = new Set((q.choices || []).map(c => c.label.toUpperCase()));
  if (labels.has(up)) return up;
  const hit = (q.choices || []).filter(c => flat(c.html) === flat(ma));
  return hit.length === 1 ? hit[0].label.toUpperCase() : null;
};
const normTF = s => String(s).toUpperCase().replace(/[^PF]/g, '');
// numeric fingerprint for open answers: sorted numbers (comma->dot), for a heuristic equal/differ
const nums = s => (String(s).replace(/\s/g, '').match(/-?\d+(?:[.,]\d+)?/g) || []).map(x => x.replace(',', '.')).sort();
const openEq = (a, b) => { const na = nums(a), nb = nums(b); if (na.length && na.join('|') === nb.join('|')) return true; return flat(a) === flat(b) && flat(a).length > 0; };

// compare two answers for a given type -> boolean|null(unresolvable)
function eq(a, b, q) {
  if (a == null || b == null || a === '' || b === '') return null;
  if (q.type === 'true_false') return normTF(a) === normTF(b);
  if (q.type === 'open') return openEq(a, b);
  const ra = resolveClosed(a, q), rb = resolveClosed(b, q);
  if (ra == null || rb == null) return null;   // multi-label/format anomaly — can't auto-compare
  return ra === rb;
}

const rows = [];   // {file,id,hash,type,verdict,key,sonnet,opus,sconf,oconf,prompt,choices,swhy,owhy}
const tally = {};
for (const [f, ids] of Object.entries(contested)) {
  const set = new Set(ids);
  const qs = JSON.parse(readFileSync(dataDir + f, 'utf8')).questions.filter(x => set.has(x.id));
  const son = existsSync(sonDir + f) ? JSON.parse(readFileSync(sonDir + f, 'utf8')) : {};
  const op = existsSync(opDir + f) ? JSON.parse(readFileSync(opDir + f, 'utf8')) : {};
  for (const q of qs) {
    const key = q.answer && q.answer.correct != null && q.answer.correct !== '' ? q.answer.correct : null;
    const sonnet = (q.answer && q.answer.model && q.answer.model.answer) ?? (son[q.id] && son[q.id].answer) ?? null;
    const opus = op[q.id] ? op[q.id].answer : null;
    const kS = eq(key, sonnet, q), kO = eq(key, opus, q), sO = eq(sonnet, opus, q);
    let verdict;
    if (opus == null) verdict = 'opus_missing';
    else if (key == null) {                       // keyless
      verdict = sO === true ? 'keyless_agreed' : sO === false ? 'keyless_split' : 'keyless_review';
    } else if (kS === false) {                     // known disagreement (sonnet != key)
      if (kO === true) verdict = 'key_confirmed';        // opus sides with key -> sonnet erred
      else if (sO === true) verdict = 'key_suspect';     // opus + sonnet agree vs key -> likely key error
      else verdict = 'three_way_split';                  // all differ / unresolvable
    } else {                                       // key present, sonnet agreed (contested via low-conf)
      if (kO === true) verdict = 'agree_confirmed';
      else if (kO === false) verdict = 'new_dispute';    // opus disputes a previously-agreeing answer
      else verdict = 'agree_review';
    }
    tally[verdict] = (tally[verdict] || 0) + 1;
    rows.push({
      file: f, id: q.id, hash: hash(q.id), type: q.type, verdict, key, sonnet, opus,
      sconf: son[q.id] && son[q.id].confidence, oconf: op[q.id] && op[q.id].confidence,
      prompt: clip(txt(q.prompt_html), 480),
      choices: (q.choices || []).map(c => `${c.label}) ${clip(txt(c.html), 70)}`),
      owhy: clip(txt(op[q.id] && op[q.id].solution_html), 600),
      swhy: clip(txt(son[q.id] && son[q.id].solution_html), 400),
    });
  }
}

// ---- report ----
const order = ['key_suspect', 'three_way_split', 'new_dispute', 'key_confirmed', 'keyless_split', 'keyless_review', 'agree_review', 'keyless_agreed', 'agree_confirmed', 'opus_missing'];
const label = {
  key_suspect: 'KEY SUSPECT — Opus + Sonnet agree *against* the stored key (likely key error)',
  three_way_split: 'THREE-WAY SPLIT — key, Sonnet, Opus all differ (needs human)',
  new_dispute: 'NEW DISPUTE — Opus disputes a low-conf answer that had agreed with the key',
  key_confirmed: 'KEY CONFIRMED — Opus sides with the key; Sonnet had erred',
  keyless_split: 'KEYLESS SPLIT — no key; Opus and Sonnet disagree (low confidence)',
  keyless_review: 'KEYLESS REVIEW — no key; answers unresolvable to auto-compare',
  agree_review: 'AGREE REVIEW — low-conf; Opus answer unresolvable to auto-compare',
  keyless_agreed: 'KEYLESS AGREED — no key; Opus and Sonnet agree (high-confidence fill)',
  agree_confirmed: 'AGREE CONFIRMED — low-conf answer confirmed by Opus',
  opus_missing: 'OPUS MISSING — no Opus answer produced',
};
const md = [];
md.push('# Tier-2 adjudication — Opus vs Sonnet vs key (2026-07-27)');
md.push('');
md.push('Opus re-solved the 739 contested questions **blind** (never shown the key or Sonnet\'s answer), giving an independent third vote. Verdicts below come from a local 3-way compare. **No key was modified** — `key_suspect` cases are candidates for `suspected_key_errors.tsv` pending your review.');
md.push('');
md.push('## Verdict tally');
md.push('');
md.push('| verdict | count | meaning |');
md.push('|---|---:|---|');
for (const v of order) if (tally[v]) md.push(`| ${v} | ${tally[v]} | ${label[v].split(' — ')[1] || ''} |`);
md.push(`| **total** | **${rows.length}** | |`);
md.push('');

const detailed = new Set(['key_suspect', 'three_way_split', 'new_dispute', 'key_confirmed', 'keyless_split']);
const byId = (a, b) => a.id < b.id ? -1 : 1;
for (const v of order) {
  const rs = rows.filter(r => r.verdict === v);
  if (!rs.length) continue;
  md.push(`## ${label[v]} (${rs.length})`);
  md.push('');
  if (!detailed.has(v)) {   // summarise the confident/bulk buckets
    md.push('_Summarised (hashes):_ ' + rs.map(r => `\`${r.hash}\``).join(' '));
    md.push('');
    continue;
  }
  for (const r of rs.sort(byId)) {
    md.push(`### \`${r.hash}\` · ${r.id} · _${r.type}_`);
    md.push(`- **key:** \`${r.key ?? '(none)'}\` · **sonnet:** \`${r.sonnet ?? '?'}\`(${r.sconf ?? '?'}) · **opus:** \`${r.opus ?? '?'}\`(${r.oconf ?? '?'})`);
    md.push(`- **Q:** ${r.prompt}`);
    if (r.choices.length) md.push(`- **choices:** ${r.choices.join(' · ')}`);
    md.push(`- **opus reasoning:** ${r.owhy || '(none)'}`);
    if (v === 'three_way_split' || v === 'new_dispute') md.push(`- **sonnet reasoning:** ${r.swhy || '(none)'}`);
    md.push('');
  }
}
writeFileSync(root + '/tier2-report.md', md.join('\n'));
writeFileSync(SP + '/tier2-verdicts.tsv',
  'verdict\thash\tfile\tid\ttype\tkey\tsonnet\topus\tsconf\toconf\n' +
  rows.map(r => [r.verdict, r.hash, r.file, r.id, r.type, r.key ?? '', r.sonnet ?? '', r.opus ?? '', r.sconf ?? '', r.oconf ?? ''].join('\t')).join('\n') + '\n');
console.log('verdicts:', JSON.stringify(tally));
console.log(`report -> tier2-report.md (${rows.length} rows) ; tsv -> ${SP}/tier2-verdicts.tsv`);
