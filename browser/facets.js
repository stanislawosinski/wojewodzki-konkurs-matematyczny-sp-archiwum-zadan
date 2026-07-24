'use strict';
// Pure faceting core, no DOM. UMD: window.Facets in the browser, module.exports in node.
// Shapes:
//   index      = { facetKey: { value: [hash, ...] } }   (the precomputed inverted index)
//   selections = { facetKey: Set<value> }               (checkboxes; empty set = no constraint)
//   gate(hash) -> bool                                   (free-text search + "Pomiń id")
//   universe   = Set<hash>                               (all hashes; used when nothing narrows)
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Facets = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const selectedKeys = selections =>
    Object.keys(selections).filter(k => selections[k] && selections[k].size);

  // union of the id-sets for the chosen values of one facet (OR within a facet)
  function facetUnion(index, key, values) {
    const out = new Set();
    for (const v of values)
      for (const h of (index[key] && index[key][v]) || []) out.add(h);
    return out;
  }

  // intersect Sets, smallest first (AND across facets); [] -> null = "no constraint"
  function intersectAll(sets) {
    if (!sets.length) return null;
    sets.sort((a, b) => a.size - b.size);
    let acc = sets[0];
    for (let i = 1; i < sets.length; i++) {
      const b = sets[i], next = new Set();
      for (const h of acc) if (b.has(h)) next.add(h);
      acc = next;
    }
    return acc;
  }

  // hashes matching all facet selections (OR within, AND across) that also pass the gate
  function matchedHashes(index, selections, gate, universe) {
    let base = intersectAll(selectedKeys(selections).map(k => facetUnion(index, k, selections[k])));
    if (base === null) base = universe;
    const out = [];
    for (const h of base) if (gate(h)) out.push(h);
    return out;
  }

  // drill-down counts for one facet: every OTHER selected facet + gate applied, then
  // tally |base ∩ index[key][value]| per value — so a facet never constrains its own counts.
  function facetCounts(index, selections, gate, key, universe) {
    let base = intersectAll(
      selectedKeys(selections).filter(k => k !== key).map(k => facetUnion(index, k, selections[k])));
    if (base === null) base = universe;
    const gated = new Set();
    for (const h of base) if (gate(h)) gated.add(h);
    const counts = {}, facet = index[key] || {};
    for (const v of Object.keys(facet)) {
      let n = 0;
      for (const h of facet[v]) if (gated.has(h)) n++;
      counts[v] = n;
    }
    return counts;
  }

  // URL-fragment (de)serialization. Generic: no facet knowledge, so it stays pure/testable.
  //   obj = { key: [value, ...] }  <->  "key=value&key=value2&..." (URLSearchParams-encoded)
  function encodeHash(obj) {
    const p = new URLSearchParams();
    for (const k of Object.keys(obj))
      for (const v of obj[k]) p.append(k, v);
    return p.toString();
  }
  function decodeHash(str) {
    const o = {};
    for (const [k, v] of new URLSearchParams(str)) (o[k] ||= []).push(v);
    return o;
  }

  return { matchedHashes, facetCounts, encodeHash, decodeHash };
});
