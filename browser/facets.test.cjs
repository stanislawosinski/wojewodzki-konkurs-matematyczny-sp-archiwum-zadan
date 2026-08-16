"use strict";

// Run: node browser/facets.test.cjs   (exits 0 on success)
const assert = require("node:assert");
const {
  matchedHashes,
  facetCounts,
  allFacetCounts,
  progressStatus,
  encodeHash,
  decodeHash
} = require("./facets.js");

// 4 questions across two facets (2 topics x 2 województwa)
const index = {
  topic: { potęgi: ["h1", "h2"], pierwiastki: ["h3", "h4"] },
  woj: { slaskie: ["h1", "h3"], malopolskie: ["h2", "h4"] }
};
const universe = new Set(["h1", "h2", "h3", "h4"]);
const yes = () => true;
const sel = o => {
  const s = { topic: new Set(), woj: new Set() };
  for (const k in o) {
    s[k] = new Set(o[k]);
  }
  return s;
};
const sorted = a => a.slice().sort();

// no selection -> everything
assert.deepStrictEqual(sorted(matchedHashes(index, sel({}), yes, universe)), [
  "h1",
  "h2",
  "h3",
  "h4"
]);

// single value -> that value's set
assert.deepStrictEqual(sorted(matchedHashes(index, sel({ topic: ["potęgi"] }), yes, universe)), [
  "h1",
  "h2"
]);

// OR within a facet -> union
assert.deepStrictEqual(
  sorted(matchedHashes(index, sel({ topic: ["potęgi", "pierwiastki"] }), yes, universe)),
  ["h1", "h2", "h3", "h4"]
);

// AND across facets -> intersection
assert.deepStrictEqual(
  sorted(matchedHashes(index, sel({ topic: ["potęgi"], woj: ["slaskie"] }), yes, universe)),
  ["h1"]
);

// drill-down: a facet ignores its OWN selection (siblings show what they'd add)
assert.deepStrictEqual(facetCounts(index, sel({ topic: ["potęgi"] }), yes, "topic", universe), {
  potęgi: 2,
  pierwiastki: 2
});

// drill-down: OTHER facets reflect the selection (breakdown of the potęgi set)
assert.deepStrictEqual(facetCounts(index, sel({ topic: ["potęgi"] }), yes, "woj", universe), {
  slaskie: 1,
  malopolskie: 1
});

// gate (e.g. "Pomiń id" h1 / a search term) applies to both matched and counts
const notH1 = h => h !== "h1";
assert.deepStrictEqual(sorted(matchedHashes(index, sel({}), notH1, universe)), ["h2", "h3", "h4"]);
assert.deepStrictEqual(facetCounts(index, sel({}), notH1, "topic", universe), {
  potęgi: 1,
  pierwiastki: 2
});

// --- AND within a facet (andKeys). Separate fixture whose topic buckets OVERLAP:
// h1 carries both potęgi & dowody, h3 carries both pierwiastki & dowody.
const andIndex = {
  topic: { potęgi: ["h1", "h2"], pierwiastki: ["h3", "h4"], dowody: ["h1", "h3"] }
};
const andUni = new Set(["h1", "h2", "h3", "h4"]);
const andSel = o => {
  const s = { topic: new Set() };
  for (const k in o) {
    s[k] = new Set(o[k]);
  }
  return s;
};
const TOPIC_AND = new Set(["topic"]);

// default (no andKeys) still ORs → union; andKeys intersects → only the shared question
assert.deepStrictEqual(
  sorted(matchedHashes(andIndex, andSel({ topic: ["potęgi", "dowody"] }), yes, andUni)),
  ["h1", "h2", "h3"]
);
assert.deepStrictEqual(
  sorted(matchedHashes(andIndex, andSel({ topic: ["potęgi", "dowody"] }), yes, andUni, TOPIC_AND)),
  ["h1"]
);

// AND drill-down KEEPS the facet's own selection: with potęgi selected (matches h1,h2), each
// value's count is how many of those also carry it — dowody→1 (h1), pierwiastki→0, potęgi→2.
assert.deepStrictEqual(
  facetCounts(andIndex, andSel({ topic: ["potęgi"] }), yes, "topic", andUni, TOPIC_AND),
  { potęgi: 2, pierwiastki: 0, dowody: 1 }
);

// allFacetCounts (shared-base fast path) must agree with per-key facetCounts — with a
// selection (own-base path for topic, shared base for woj), with a gate, and in AND mode
{
  const s = sel({ topic: ["potęgi"] });
  const all = allFacetCounts(index, s, notH1, ["topic", "woj"], universe);
  assert.deepStrictEqual(all.topic, facetCounts(index, s, notH1, "topic", universe));
  assert.deepStrictEqual(all.woj, facetCounts(index, s, notH1, "woj", universe));
  const sAnd = andSel({ topic: ["potęgi"] });
  assert.deepStrictEqual(
    allFacetCounts(andIndex, sAnd, yes, ["topic"], andUni, TOPIC_AND).topic,
    facetCounts(andIndex, sAnd, yes, "topic", andUni, TOPIC_AND)
  );
}

// encode/decode round-trips: multi-value facets + special chars (diacritics, '/', spaces) + scalars
const hashObj = {
  topic: ["NWW / NWD", "potęgi i pierwiastki"],
  form: ["Prawda/Fałsz"],
  q: ["pole trójkąta"],
  sel: ["d60f0d0e", "fda169ad"]
};
assert.deepStrictEqual(decodeHash(encodeHash(hashObj)), hashObj);

// encoding is reversible even for keys/values the app doesn't know (validation happens later, in app.js)
assert.deepStrictEqual(decodeHash(encodeHash({ bogus: ["x"] })), { bogus: ["x"] });

// empty object -> empty string -> empty object
assert.strictEqual(encodeHash({}), "");
assert.deepStrictEqual(decodeHash(""), {});

// --- progressStatus: own mark > duplicate's mark ('blad' outranking 'zrob') > 'nie'.
// q.dup carries the full cluster, self included — self is skipped (no own mark = checked first).
const marks = new Map([
  ["h1", { s: "zrob" }],
  ["h2", { s: "blad" }]
]);
assert.strictEqual(progressStatus("h1", null, marks), "zrob"); // own mark, no cluster
assert.strictEqual(progressStatus("h9", null, marks), "nie"); // unmarked, no cluster
assert.strictEqual(progressStatus("h2", ["h2", "h1"], marks), "blad"); // own mark beats the duplicate's
assert.strictEqual(progressStatus("h9", ["h9", "h1"], marks), "zrob"); // inherited from the duplicate
assert.strictEqual(progressStatus("h9", ["h9", "h1", "h2"], marks), "blad"); // 'blad' outranks 'zrob'
assert.strictEqual(progressStatus("h9", ["h9", "h8"], marks), "nie"); // cluster wholly unmarked

console.log("facets.test.cjs: all assertions passed");
