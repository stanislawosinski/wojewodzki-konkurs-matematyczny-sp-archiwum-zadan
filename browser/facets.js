"use strict";

// Pure faceting core, no DOM. UMD: window.Facets in the browser, module.exports in node.
// Shapes:
//   index      = { facetKey: { value: [hash, ...] } }   (the precomputed inverted index)
//   selections = { facetKey: Set<value> }               (checkboxes; empty set = no constraint)
//   gate(hash) -> bool                                   (free-text search + "Pomiń id")
//   universe   = Set<hash>                               (all hashes; used when nothing narrows)
((root, factory) => {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.Facets = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, () => {
  "use strict";

  const selectedKeys = selections => Object.keys(selections).filter(k => selections[k]?.size);

  // union of the id-sets for the chosen values of one facet (OR within a facet)
  function facetUnion(index, key, values) {
    const out = new Set();
    for (const v of values) {
      for (const h of index[key]?.[v] || []) {
        out.add(h);
      }
    }
    return out;
  }

  // intersection of the id-sets for the chosen values of one facet (AND within a facet)
  function facetIntersect(index, key, values) {
    let acc = null;
    for (const v of values) {
      const set = new Set(index[key]?.[v] || []);
      if (acc === null) {
        acc = set;
        continue;
      }
      const next = new Set();
      for (const h of acc) {
        if (set.has(h)) {
          next.add(h);
        }
      }
      acc = next;
    }
    return acc || new Set();
  }

  // one facet's contribution: AND within it when key ∈ andKeys, else OR (the default)
  const facetCombine = (index, key, values, andKeys) =>
    andKeys?.has(key) ? facetIntersect(index, key, values) : facetUnion(index, key, values);

  // intersect Sets, smallest first (AND across facets); [] -> null = "no constraint"
  function intersectAll(sets) {
    if (!sets.length) {
      return null;
    }
    sets.sort((a, b) => a.size - b.size);
    let acc = sets[0];
    for (let i = 1; i < sets.length; i++) {
      const b = sets[i],
        next = new Set();
      for (const h of acc) {
        if (b.has(h)) {
          next.add(h);
        }
      }
      acc = next;
    }
    return acc;
  }

  // hashes passing every selected facet except excludeKey (AND across; within a facet OR,
  // or AND when its key ∈ andKeys) and the gate; the whole universe when nothing narrows.
  // Shared core of matchedHashes/facetCounts.
  function gatedBase(index, selections, gate, universe, excludeKey, andKeys) {
    let base = intersectAll(
      selectedKeys(selections)
        .filter(k => k !== excludeKey)
        .map(k => facetCombine(index, k, selections[k], andKeys))
    );
    if (base === null) {
      base = universe;
    }
    const out = new Set();
    for (const h of base) {
      if (gate(h)) {
        out.add(h);
      }
    }
    return out;
  }

  // hashes matching all facet selections (AND across; within a facet OR, or AND per andKeys)
  // that also pass the gate. andKeys defaults to no AND facets (all-OR, the historical behaviour).
  function matchedHashes(index, selections, gate, universe, andKeys) {
    return [...gatedBase(index, selections, gate, universe, null, andKeys)];
  }

  // tally |gated ∩ index[key][value]| for every value of one facet
  function tallyCounts(index, key, gated) {
    const counts = {},
      facet = index[key] || {};
    for (const v of Object.keys(facet)) {
      let n = 0;
      for (const h of facet[v]) {
        if (gated.has(h)) {
          n++;
        }
      }
      counts[v] = n;
    }
    return counts;
  }

  // drill-down counts for one facet: every OTHER selected facet + gate applied, then
  // tally |base ∩ index[key][value]| per value — so an OR facet never constrains its own
  // counts. An AND facet is the exception: it KEEPS its own selection in the base (excludeKey
  // = null) so each value's count shows how far adding it would narrow the current matches.
  function facetCounts(index, selections, gate, key, universe, andKeys) {
    return tallyCounts(
      index,
      key,
      gatedBase(index, selections, gate, universe, andKeys?.has(key) ? null : key, andKeys)
    );
  }

  // counts for many facets in one pass, same results as facetCounts per key. The drill-down
  // base is identical for every facet WITHOUT its own OR selection (excluding an unselected
  // key excludes nothing, and an AND facet keeps its selection anyway), so that shared base
  // is computed once; only selected OR facets pay for a base of their own.
  function allFacetCounts(index, selections, gate, keys, universe, andKeys) {
    let shared = null;
    const out = {};
    for (const key of keys) {
      let gated;
      if (selections[key]?.size && !andKeys?.has(key)) {
        gated = gatedBase(index, selections, gate, universe, key, andKeys);
      } else {
        shared ||= gatedBase(index, selections, gate, universe, null, andKeys);
        gated = shared;
      }
      out[key] = tallyCounts(index, key, gated);
    }
    return out;
  }

  // Progress status of one question ("Postęp" facet value): its own ✓/✗ mark wins; else a
  // mark inherited from an exact duplicate (dup = the full cluster's hashes, self included —
  // the same question reprinted elsewhere is not new work). Among duplicates 'blad' outranks
  // 'zrob', so an error anywhere in the cluster keeps the question in the redo pile.
  //   marks = Map<hash, {s: 'zrob'|'blad'}>  ->  'zrob' | 'blad' | 'nie'
  function progressStatus(hash, dup, marks) {
    const own = marks.get(hash);
    if (own) {
      return own.s;
    }
    let s = "nie";
    for (const h of dup || []) {
      const m = marks.get(h);
      if (m && (s === "nie" || m.s === "blad")) {
        s = m.s;
      }
    }
    return s;
  }

  // URL-fragment (de)serialization. Generic: no facet knowledge, so it stays pure/testable.
  //   obj = { key: [value, ...] }  <->  "key=value&key=value2&..." (URLSearchParams-encoded)
  function encodeHash(obj) {
    const p = new URLSearchParams();
    for (const k of Object.keys(obj)) {
      for (const v of obj[k]) {
        p.append(k, v);
      }
    }
    return p.toString();
  }
  function decodeHash(str) {
    const o = {};
    for (const [k, v] of new URLSearchParams(str)) {
      o[k] ||= [];
      o[k].push(v);
    }
    return o;
  }

  return { matchedHashes, facetCounts, allFacetCounts, progressStatus, encodeHash, decodeHash };
});
