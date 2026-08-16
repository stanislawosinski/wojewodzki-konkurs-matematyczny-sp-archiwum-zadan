// Emit tier-2 blind inputs: per paper, ONLY the contested questions (from contested.json),
// stripped of the key. Same shape tier-1 solve expects. Figures -> absolute paths.
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const SP = process.argv[2], root = process.argv[3];
const contested = JSON.parse(readFileSync(SP + '/contested.json', 'utf8'));
const data = root + '/data/questions/', figs = root + '/browser/figures/';
const out = SP + '/blind-t2'; mkdirSync(out, { recursive: true });
let papers = 0, q = 0;
for (const [f, ids] of Object.entries(contested)) {
  const set = new Set(ids);
  const qs = JSON.parse(readFileSync(data + f, 'utf8')).questions.filter(x => set.has(x.id));
  const blind = qs.map(x => ({
    id: x.id, type: x.type, points: x.points, prompt_html: x.prompt_html,
    choices: (x.choices || []).map(c => ({ label: c.label, html: c.html })),
    figures: (x.figures || []).map(fn => figs + fn),
  }));
  writeFileSync(out + '/' + f, JSON.stringify(blind, null, 1));
  papers++; q += blind.length;
}
writeFileSync(SP + '/t2-files.json', JSON.stringify(Object.keys(contested)));
console.log(`${papers} papers, ${q} contested questions -> ${out}`);
