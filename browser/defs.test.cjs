"use strict";

// Run: node browser/defs.test.cjs   (exits 0 on success)
//
// Node harness for the pure logic in defs.js: facet values() routing (sol / weryf / czas /
// fig / powt), fmtMin and answerHtml. defs.js is a classic browser script, not a UMD
// module, so it is loaded the way the browser loads it — facets.js then defs.js in one
// shared scope (a vm sandbox standing in for the page's global lexical environment) — and
// the bindings come out via the script's completion value. No catalog.js needed: defs.js
// falls back to an empty CATALOG when window.CATALOG is absent.
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const read = f => fs.readFileSync(path.join(__dirname, f), "utf8");
const { FACETS, fmtMin, answerHtml } = vm.runInNewContext(
  `${read("facets.js")}\n${read("defs.js")}\n;({ FACETS, fmtMin, answerHtml })`,
  { window: {} }
);
// spread into a host-realm array — vm-created arrays have a foreign Array.prototype,
// which deepStrictEqual rejects
const values = (key, q) => [...FACETS.find(f => f.key === key).values(q)];

// --- sol: the derivation's source. Official derivation beats everything; then the AI's
// (sol_ai on keyed questions, the model's stand-in on keyless ones); a keyed question whose
// only derivation is the verification model's dissent counts as "bez".
assert.deepStrictEqual(values("sol", { answer: { correct: "B", solution_html: "s" } }), [
  "z",
  "klucz"
]);
assert.deepStrictEqual(values("sol", { answer: { correct: "B" }, sol_ai: "s" }), ["z", "ai"]);
assert.deepStrictEqual(values("sol", { answer: { model: { solution_html: "s" } } }), ["z", "ai"]);
assert.deepStrictEqual(
  values("sol", { answer: { correct: "", model: { solution_html: "s" } } }),
  ["z", "ai"] // empty-string key = keyless
);
assert.deepStrictEqual(
  values("sol", { answer: { correct: "B", model: { agrees: false, solution_html: "s" } } }),
  ["bez"] // dissent-only derivation, no verdict yet
);
assert.deepStrictEqual(
  values("sol", {
    suspect: true,
    suspect_verdict: "KEY_WRONG",
    answer: { correct: "B", model: { agrees: false, solution_html: "s" } }
  }),
  ["z", "ai"] // adjudicated wrong key: the dissent derivation is the shown solution
);
assert.deepStrictEqual(
  values("sol", {
    suspect: true,
    suspect_verdict: "KEY_CORRECT",
    answer: { correct: "B", model: { agrees: false, solution_html: "s" } }
  }),
  ["bez"] // the AI erred here — a derivation known to be wrong is not a solution
);
assert.deepStrictEqual(values("sol", { annulled: true, answer: {} }), ["bez"]);
assert.deepStrictEqual(
  values("sol", { annulled: true, answer: { solution_html: "s" } }),
  ["z", "klucz"] // the 2 annulled questions with an official derivation
);

// --- weryf: verdict routing. A confirmed suspect lands in `sprawdzony` (and, with
// agrees=true, also `zgodne` — the double-bucketed rows); any other verdict → `podejrzany`;
// an unadjudicated dissent stays `rozbiezne`; annulled beats keyless.
const wq = (m, extra) => ({ answer: { correct: "B", model: m }, ...extra });
assert.deepStrictEqual(values("weryf", wq({ agrees: true })), ["zgodne"]);
assert.deepStrictEqual(values("weryf", wq({ agrees: false })), ["rozbiezne"]);
assert.deepStrictEqual(
  values("weryf", wq({ agrees: false }, { suspect: true, suspect_verdict: "KEY_WRONG" })),
  ["podejrzany"]
);
assert.deepStrictEqual(
  values("weryf", wq({ agrees: true }, { suspect: true, suspect_verdict: "SOLUTION_WRONG" })),
  ["podejrzany", "zgodne"]
);
assert.deepStrictEqual(
  values("weryf", wq({ agrees: true }, { suspect: true, suspect_verdict: "KEY_CORRECT" })),
  ["sprawdzony", "zgodne"]
);
assert.deepStrictEqual(values("weryf", wq({})), ["nieroz"]); // keyed, no verdict from the model
assert.deepStrictEqual(values("weryf", { annulled: true, answer: {} }), ["anulowane"]);
assert.deepStrictEqual(
  values("weryf", { answer: { model: { answer: "7", corroborated: true } } }),
  ["bezklucza"]
);
assert.deepStrictEqual(
  values("weryf", { answer: { model: { answer: "7", corroborated: false } } }),
  ["bezklucza", "niepewne"]
);

// --- czas: est_min bucket as a string value; absent → no value
assert.deepStrictEqual(values("czas", { est_min: 5 }), ["5"]);
assert.deepStrictEqual(values("czas", {}), []);

// --- fig: bezsvg appears only while some bitmap still lacks its SVG redraw
assert.deepStrictEqual(values("fig", { figures: ["a.png"], figsvg: ["a.png"] }), ["z"]);
assert.deepStrictEqual(values("fig", { figures: ["a.png", "b.png"], figsvg: ["a.png"] }), [
  "z",
  "bezsvg"
]);
assert.deepStrictEqual(values("fig", {}), ["bez"]);

// --- powt: dup and sim are independent; a question can carry both
assert.deepStrictEqual(values("powt", { dup: ["x"], sim: ["y"] }), ["duplikat", "wariant"]);
assert.deepStrictEqual(values("powt", {}), []);

// --- fmtMin: minutes under an hour, then d/h/min with zero components dropped
assert.strictEqual(fmtMin(45), "45 min");
assert.strictEqual(fmtMin(60), "1h");
assert.strictEqual(fmtMin(90), "1h 30min");
assert.strictEqual(fmtMin(120), "2h");
assert.strictEqual(fmtMin(1440), "1d");
assert.strictEqual(fmtMin(1441), "1d 1min");
assert.strictEqual(fmtMin(17 * 1440 + 150), "17d 2h 30min");

// --- answerHtml: plain text escapes, <math>…</math> islands pass through wherever they sit
assert.strictEqual(answerHtml("a < b"), "a &lt; b");
assert.strictEqual(answerHtml("<math><mn>1</mn></math>"), "<math><mn>1</mn></math>");
assert.strictEqual(
  answerHtml("a) 12 cm, b) <math><mn>4</mn></math> kw."),
  "a) 12 cm, b) <math><mn>4</mn></math> kw."
);
assert.strictEqual(
  answerHtml("x < 1: <math>A</math> & <math>B</math>"),
  "x &lt; 1: <math>A</math> &amp; <math>B</math>"
);

console.log("defs.test.cjs: all assertions passed");
