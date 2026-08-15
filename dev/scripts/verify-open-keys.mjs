// Verify open-WITH-key answers: the one bucket tier-1 never cross-checked (open answers were
// stored with agrees:null). Compare the stored key (answer.correct) against Sonnet's blind answer
// (answer.model.answer) with the tier-2 numeric/text-equivalence heuristic. REPORT ONLY — no data
// touched. Confidence read from the tier-1 sidecars (scratchpad solved/) when available.
// Usage: node scripts/verify-open-keys.mjs <scratchpad> <repo-root>
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
const SP = process.argv[2], root = process.argv[3];
const dataDir = root + '/browser/data/', sonDir = SP + '/solved/';
const hash = id => createHash('sha1').update(id).digest('hex').slice(0, 8);

// --- text/number equivalence (copied from adjudicate-t2.mjs) ---
const ENT = { nbsp: ' ', lt: '<', gt: '>', amp: '&', rarr: '→', larr: '←', minus: '−', times: '×', divide: '÷', deg: '°', le: '≤', ge: '≥', ne: '≠', asymp: '≈', equiv: '≡', sup2: '²', sup3: '³', frac12: '½', frac13: '⅓', frac14: '¼', frac34: '¾', hellip: '…', ndash: '–', mdash: '—', middot: '·', bull: '•', prime: '′', Prime: '″', bdquo: '„', ldquo: '“', rdquo: '”', laquo: '«', raquo: '»', sdot: '⋅', radic: '√', alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', Delta: 'Δ', pi: 'π', ang: '∠', angmsd: '∡', perp: '⊥', par: '∥', cong: '≅', sim: '∼', infin: '∞', oacute: 'ó', Oacute: 'Ó', aogon: 'ą', Aogon: 'Ą', eogon: 'ę', Eogon: 'Ę', lstrok: 'ł', Lstrok: 'Ł', nacute: 'ń', Nacute: 'Ń', sacute: 'ś', Sacute: 'Ś', zacute: 'ź', Zacute: 'Ź', zdot: 'ż', Zdot: 'Ż', cacute: 'ć', Cacute: 'Ć' };
const txt = h => String(h ?? '').replace(/<[^>]+>/g, ' ').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&quot;/g, '"').replace(/&angmsd[a-z]*;/g, '∡').replace(/&([a-z][a-z0-9]*);/gi, (m, e) => ENT[e] ?? m).replace(/\s+/g, ' ').trim();
const clip = (s, n) => s.length > n ? s.slice(0, n) + ' …' : s;
const stripApprox = s => String(s ?? '').replace(/\([^()]*[≈~≅][^()]*\)/g, ' ').replace(/[≈~≅][^;,)]*/g, ' ');
const nums = s => (stripApprox(s).replace(/[−‑–]/g, '-').match(/-?\d+(?:[.,]\d+)?/g) || []).map(x => String(Number(x.replace(',', '.')))).sort();
const UNIT = /\b(cm|mm|dm|km|m|zł|gr|ml|l|kg|dag|g|min|minut[ay]?|godz(?:in[ay]?)?|proc|st)\b|[²³°%]/gi;
const words = s => txt(stripApprox(s)).toLowerCase().replace(/[−‑–]/g, '-').replace(UNIT, '').replace(/[^0-9a-ząćęłńóśźż-]/gi, '');
const subset = (a, b) => [...a].every(x => b.has(x));
const openEq = (a, b) => {
  const na = new Set(nums(a)), nb = new Set(nums(b));
  if (na.size && nb.size && (subset(na, nb) || subset(nb, na))) return true;
  const wa = words(a), wb = words(b); return wa === wb && wa.length > 0;
};

const files = readdirSync(dataDir).filter(f => f.endsWith('.json')).sort();
let matched = 0;
const differ = [];
for (const f of files) {
  const qs = JSON.parse(readFileSync(dataDir + f, 'utf8')).questions;
  const son = existsSync(sonDir + f) ? JSON.parse(readFileSync(sonDir + f, 'utf8')) : {};
  for (const q of qs) {
    if (q.type !== 'open') continue;
    const key = q.answer && q.answer.correct;
    if (key == null || key === '') continue;
    const ma = q.answer.model && q.answer.model.answer;
    if (ma == null || ma === '') continue;
    if (openEq(key, ma)) { matched++; continue; }
    differ.push({ f, id: q.id, hash: hash(q.id), key, ma, conf: (son[q.id] && son[q.id].confidence) || '?', prompt: clip(txt(q.prompt_html), 320) });
  }
}
const rank = { high: 0, med: 1, low: 2, '?': 3 };
differ.sort((a, b) => (rank[a.conf] - rank[b.conf]) || (a.id < b.id ? -1 : 1));
const hi = differ.filter(d => d.conf === 'high').length;

const md = ['# Open-answer key verification — Sonnet vs stored key (2026-07-27)', '',
  `The ${matched + differ.length} open questions that have a key were never auto-checked in tier-1 (open answers stored \`agrees:null\`). Here Sonnet's blind answer is compared to \`answer.correct\` with the tier-2 numeric/text heuristic. **No data modified.**`, '',
  '## Summary', '',
  '| bucket | count |', '|---|---:|',
  `| match (key corroborated) | ${matched} |`,
  `| **differ (review)** | **${differ.length}** |`,
  `| — of which Sonnet was high-confidence | ${hi} |`, '',
  `> Heuristic caveat: open text is noisy — the differ list contains false positives (phrasing/format) alongside genuine key errors and Sonnet slips. High-confidence differs are the strongest key-error candidates.`, '',
  `## Differ — high-confidence first (${differ.length})`, ''];
for (const d of differ) {
  md.push(`### \`${d.hash}\` · ${d.id} · conf ${d.conf}`);
  md.push(`- **key:** \`${clip(txt(d.key), 160)}\` · **model:** \`${clip(txt(d.ma), 160)}\``);
  md.push(`- **Q:** ${d.prompt}`);
  md.push('');
}
writeFileSync(root + '/dev/reports/open-key-report.md', md.join('\n'));
writeFileSync(SP + '/open-key-mismatches.tsv',
  'hash\tconf\tfile\tid\tkey\tmodel\n' + differ.map(d => [d.hash, d.conf, d.f, d.id, txt(d.key), txt(d.ma)].join('\t')).join('\n') + '\n');
console.log(`open-with-key: ${matched + differ.length} | match ${matched} | differ ${differ.length} (high-conf ${hi})`);
console.log(`-> open-key-report.md ; ${SP}/open-key-mismatches.tsv`);
