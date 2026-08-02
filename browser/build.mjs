#!/usr/bin/env node
import { createHash } from "node:crypto";

// Preprocess data/*.json into per-stage shards for the browser app:
//   data.<stage>.js    - script-tag loadable (file:// protocol)
//   data.<stage>.json  - fetch()-able (http/https)
// Usage: node build.mjs   (cwd doesn't matter)
import { readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

// the browser fetches the .json files over http(s); gzip size ≈ what goes over the wire
const gz = s =>
  `${(s.length / 1024).toFixed(0)} KB (${(gzipSync(s).length / 1024).toFixed(0)} KB gzip)`;

const here = fileURLToPath(new URL(".", import.meta.url));
const dataDir = fileURLToPath(new URL("data/", import.meta.url));
const STAGES = ["szkolny", "rejonowy", "wojewodzki"];

const byStage = Object.fromEntries(STAGES.map(s => [s, []]));
const seenId = new Map(),
  seenHash = new Map();

// The repo-root categories.json is the single source of truth: it validates every question's tags
// (below) AND drives the browser's topic sidebar via the emitted catalog.js (near the shard writes).
const CATEGORIES = JSON.parse(
  readFileSync(fileURLToPath(new URL("../categories.json", import.meta.url)), "utf8")
).categories;
const LEAVES = new Set(CATEGORIES.flatMap(c => c.leaves.map(l => l.name))); // catches typos in exact-match tags
const badTopics = [];

// questions flagged in suspected_key_errors.tsv get `suspect: true` + `suspect_reason` + `suspect_verdict`.
// col 0 = sha1(id)[:8] hash; col 3 = English maintainer note; col 4 = reason_pl (Polish text the browser
// shows; blank → generic badge); col 5 = verdict (KEY_WRONG / KEY_CORRECT / SOLUTION_WRONG) driving the
// badge label & colour. File lives at repo root.
const suspects = new Map(
  readFileSync(fileURLToPath(new URL("../suspected_key_errors.tsv", import.meta.url)), "utf8")
    .trim()
    .split("\n")
    .slice(1)
    .map(l => l.split("\t"))
    .map(c => [c[0], { reason: c[4], verdict: c[5] }])
);

// figures/hidpi.json maps each figure re-rendered at 400 dpi (scripts/figcrop.py hidpi)
// to its [w, h] in CSS px. The app puts those on the <img> so a 400 dpi figure lays out at
// the same size as a 200 dpi one instead of at its natural, doubled size.
let hidpi = {};
try {
  hidpi = JSON.parse(
    readFileSync(fileURLToPath(new URL("figures/hidpi.json", import.meta.url)), "utf8")
  );
} catch {
  /* no re-rendered figures yet */
}

// figures/svg/<name>.svg is a vector redraw of figures/<name>.png. Only some figures have one;
// the app offers a per-question bitmap↔vector toggle for the questions that do.
let svgs = new Set();
try {
  svgs = new Set(readdirSync(fileURLToPath(new URL("figures/svg/", import.meta.url))));
} catch {
  /* no redrawn figures yet */
}
const svgOf = f => f.replace(/\.png$/, ".svg");

for (const f of readdirSync(dataDir)
  .filter(f => f.endsWith(".json"))
  .sort()) {
  const t = JSON.parse(readFileSync(dataDir + f, "utf8"));
  if (!byStage[t.stage]) {
    console.error(`${f}: unknown stage "${t.stage}"`);
    process.exit(1);
  }
  for (const q of t.questions) {
    const hash = createHash("sha1").update(q.id).digest("hex").slice(0, 8);
    if (seenId.has(q.id)) {
      console.error(`duplicate id ${q.id} (${f}, ${seenId.get(q.id)})`);
      process.exit(1);
    }
    if (seenHash.has(hash)) {
      console.error(`hash collision ${hash}: ${q.id} vs ${seenHash.get(hash)} — lengthen the hash`);
      process.exit(1);
    }
    seenId.set(q.id, f);
    seenHash.set(hash, q.id);
    for (const tag of q.topics || []) {
      if (!LEAVES.has(tag)) {
        badTopics.push(`${q.id}: "${tag}"`);
      }
    }
    const figsvg = (q.figures || []).filter(f => svgs.has(svgOf(f)));
    byStage[t.stage].push({
      id: q.id,
      hash,
      number: q.number,
      page: q.page,
      type: q.type,
      points: q.points,
      ...(q.annulled ? { annulled: true } : {}), // only the rare annulled ones carry the flag
      ...(suspects.has(hash)
        ? {
            suspect: true,
            ...(suspects.get(hash).reason && { suspect_reason: suspects.get(hash).reason }),
            ...(suspects.get(hash).verdict && { suspect_verdict: suspects.get(hash).verdict })
          }
        : {}), // flagged in suspected_key_errors.tsv
      topics: q.topics,
      prompt_html: q.prompt_html,
      choices: q.choices,
      figures: q.figures,
      answer: q.answer,
      ...((q.figures || []).some(f => hidpi[f])
        ? { figdim: Object.fromEntries(q.figures.filter(f => hidpi[f]).map(f => [f, hidpi[f]])) }
        : {}),
      ...(figsvg.length ? { figsvg } : {}),
      source_file: t.source_file,
      school_year: t.school_year,
      wojewodztwo: t.wojewodztwo,
      stage: t.stage,
      school_type: t.school_type,
      competition: t.competition
    });
  }
}

if (badTopics.length) {
  console.error(
    `unknown topic tag(s) not in categories.json — fix the tag or add the leaf:\n  ${badTopics.join("\n  ")}`
  );
  process.exit(1);
}

// catalog.js: category -> ordered leaves for the browser's topic sidebar. A <script>, not fetch(), so
// it works under file:// too. Strip a trailing "(przekrojowe)"-style note so it doesn't clutter the header.
const catalog = CATEGORIES.map(c => [
  c.name.replace(/\s*\([^)]*\)$/, ""),
  c.leaves.map(l => l.name)
]);
writeFileSync(`${here}catalog.js`, `window.CATALOG = ${JSON.stringify(catalog)};\n`);

let total = 0;
for (const s of STAGES) {
  const qs = byStage[s];
  const jsPath = `${here}data.${s}.js`,
    jsonPath = `${here}data.${s}.json`;
  if (!qs.length) {
    rmSync(jsPath, { force: true });
    rmSync(jsonPath, { force: true });
    continue;
  }
  const json = JSON.stringify(qs);
  writeFileSync(jsonPath, json);
  writeFileSync(jsPath, `window.DATA = window.DATA || [];\nwindow.DATA.push(...${json});\n`);
  console.log(`${s}: ${qs.length} questions, ${gz(json)} (.json), + .js shard`);
  total += qs.length;
}
console.log(`total: ${total} questions`);
