"use strict";

// Run: node browser/facets.test.cjs   (exits 0 on success)
const assert = require("node:assert");
const { matchedHashes, facetCounts, encodeHash, decodeHash } = require("./facets.js");

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

console.log("facets.test.cjs: all assertions passed");
