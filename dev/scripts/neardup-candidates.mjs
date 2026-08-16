#!/usr/bin/env node
// Emit near-duplicate candidate pairs as NDJSON on stdout (count on stderr) for the
// neardup campaign: token-Jaccard ≥ 0.5 over normalized prompt+choices text, minus pairs
// browser/build.mjs already clusters deterministically (exact or digit-blind key,
// non-figure pairs only) and minus pairs already judged in data/dups/near-dups.tsv
// (any verdict) — so a re-run emits only the unjudged remainder. See data/dups/README.md.
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const dataDir = fileURLToPath(new URL("../../data/questions/", import.meta.url));

// keep in sync with dupText in browser/build.mjs
const dupText = h =>
  (h || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-zA-Z#0-9]+;/g, " ")
    .toLowerCase()
    .replace(/[^a-ząćęłńóśźż0-9,.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const qs = [];
for (const f of readdirSync(dataDir).filter(f => f.endsWith(".json")).sort()) {
  const t = JSON.parse(readFileSync(dataDir + f, "utf8"));
  for (const q of t.questions) {
    const p = dupText(q.prompt_html);
    if (p.length <= 60) continue; // same boilerplate gate as the build
    const choiceTexts = (q.choices || []).map(c => dupText(c.html));
    const html = `${q.prompt_html} ${(q.choices || []).map(c => c.html).join(" ")}`;
    const figs = new Set((q.figures || []).map(n => `browser/figures/${n}`));
    for (const m of html.matchAll(/figures\/[\w.-]+/g)) figs.add(`browser/${m[0]}`); // inline <img> refs
    qs.push({
      id: q.id,
      key: `${p}|${[...choiceTexts].sort().join("|")}`,
      hasFig: figs.size > 0,
      toks: new Set(`${p} ${choiceTexts.join(" ")}`.split(" ").filter(w => w.length > 1)),
      out: {
        id: q.id,
        prompt_html: q.prompt_html,
        choices: (q.choices || []).map(c => c.html),
        correct: q.answer?.correct ?? null,
        figures: [...figs],
      },
    });
  }
}

const judged = new Set();
try {
  const tsv = readFileSync(fileURLToPath(new URL("../../data/dups/near-dups.tsv", import.meta.url)), "utf8");
  for (const l of tsv.trim().split("\n").slice(1)) {
    const [a, b] = l.split("\t");
    judged.add(`${a}|${b}`);
    judged.add(`${b}|${a}`);
  }
} catch {
  /* no verdicts yet */
}

// inverted index over rare tokens; common tokens (df > 400) don't pair questions up
const MAXDF = 400;
const df = new Map();
for (const q of qs) for (const w of q.toks) df.set(w, (df.get(w) || 0) + 1);
const postings = new Map();
qs.forEach((q, i) => {
  for (const w of q.toks) {
    if (df.get(w) > MAXDF) continue;
    if (!postings.has(w)) postings.set(w, []);
    postings.get(w).push(i);
  }
});

let out = 0;
for (let i = 0; i < qs.length; i++) {
  const shared = new Map();
  for (const w of qs[i].toks) {
    if (df.get(w) > MAXDF) continue;
    for (const j of postings.get(w)) if (j > i) shared.set(j, (shared.get(j) || 0) + 1);
  }
  for (const [j, n] of shared) {
    const jac = n / (qs[i].toks.size + qs[j].toks.size - n);
    if (jac < 0.5) continue;
    const a = qs[i], b = qs[j];
    if (judged.has(`${a.id}|${b.id}`)) continue;
    if (!a.hasFig && !b.hasFig) {
      if (a.key === b.key) continue; // already a `dup` cluster
      if (a.key.replace(/[0-9]+/g, "#") === b.key.replace(/[0-9]+/g, "#")) continue; // already `sim`
    }
    console.log(JSON.stringify({ jaccard: +jac.toFixed(3), a: a.out, b: b.out }));
    out++;
  }
}
console.error(`${out} candidate pairs`);
