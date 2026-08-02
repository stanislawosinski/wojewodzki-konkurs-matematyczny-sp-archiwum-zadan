// biome-ignore-all lint/correctness/noUnusedVariables: top-level bindings here are cross-file globals, used by the later classic scripts (see index.html load order)
"use strict";

// Element references, all mutable app state, data loading and the URL-hash
// serialization. The JS structures here are the working truth; the hash is their
// serialization (see serialize/applyState/writeUrl at the bottom). Hash keys and
// the 'zadania-settings' localStorage shape are wire format — do not rename.

const $ = id => document.getElementById(id);
const search = $("search"),
  inc = $("include"),
  exc = $("exclude"),
  setsummary = $("setsummary"),
  qlist = $("qlist"),
  answerkey = $("answerkey"),
  facetsEl = $("facets"),
  clearFilters = $("clearFilters"),
  clearFacets = $("clearFacets"),
  clearSearch = $("clearSearch"),
  clearSelBar = $("clearSelBar"),
  printBtn = $("printBtn"),
  sheetTitle = $("sheetTitle"),
  settingsBtn = $("settingsBtn"),
  settingsPop = $("settingsPop");
const pagers = [...document.querySelectorAll(".pager")];

// biome-ignore lint/style/useConst: DATA/INDEX/universe are reassigned by app.js init() — cross-file globals
let DATA = [],
  byHash = {},
  INDEX = {},
  universe = new Set();
let page = 1;

// Eksperymenty toggles (settings popup, localStorage-persisted). showAI: reveal the AI verification
// (Weryfikacja facet + AI answers/key status), off by default. vectorPriority: figures default to the
// SVG redraw (△ then switches to PNG) instead of the reverse. Read by renderQuestion/renderKeyEntry.
// biome-ignore lint/style/useConst: reassigned by app.js wireSettings() — cross-file globals
let showAI = false,
  vectorPriority = false;
const selectedSet = new Set(); // hashes; lives outside the DOM — articles are destroyed on re-render
const scratchOverrides = new Map(); // hash -> 'half' | 'full'; per-question brudnopis override (default not stored)
const svgOverrides = new Map(); // hash -> 'png' | 'svg'; per-question figure format pin (default follows vectorPriority; cleared when the setting changes). Serialized to the hash so it survives reload/sharing.
const brudMode = () => document.querySelector('input[name="pageMode"]:checked').value;

// Sheet title (the .sheet-title header + document.title). titleOverride = a user-typed title
// (sticky, wins over auto); null = derive it. lastMatched/lastUseInc cache update()'s result so a
// title edit can refresh without a re-render. See computeTitle / setTitle.
let titleOverride = null,
  lastMatched = [],
  lastUseInc = false;
const DEFAULT_TITLE = "Wszystkie zadania";

// most frequent topic leaf across the questions; ties → shortest name; capitalized. null if none tagged.
function autoTitle(qs) {
  const freq = new Map();
  for (const q of qs) {
    for (const t of q.topics || []) {
      freq.set(t, (freq.get(t) || 0) + 1);
    }
  }
  let best = null,
    bestN = 0;
  for (const [t, n] of freq) {
    if (n > bestN || (n === bestN && t.length < best.length)) {
      best = t;
      bestN = n;
    }
  }
  return best ? capitalize(best) : null;
}

// override wins; else with a pasted id list → the dominant topic; else the plain default
const computeTitle = (matched, useInc) =>
  titleOverride != null ? titleOverride : useInc ? autoTitle(matched) || "Zadania" : DEFAULT_TITLE;

// reflect the computed title into the header + tab; skipped mid-edit so typing isn't clobbered
function setTitle() {
  if (sheetTitle.isContentEditable) {
    return;
  }
  document.title = sheetTitle.textContent = computeTitle(lastMatched, lastUseInc);
}
const selections = {},
  EMPTY_SELECTIONS = {}; // facetKey -> Set<value>
for (const f of FACETS) {
  selections[f.key] = new Set();
  EMPTY_SELECTIONS[f.key] = new Set();
}

// file:// blocks fetch(), so load JS-wrapped shards via <script>; http(s) fetches plain JSON
function loadData() {
  if (location.protocol === "file:") {
    window.DATA = [];
    return Promise.all(
      STAGES.map(
        s =>
          new Promise(res => {
            const el = document.createElement("script");
            el.src = `data.${s}.js`;
            el.onload = el.onerror = res; // missing shard (stage not extracted yet) = silent skip
            document.head.append(el);
          })
      )
    ).then(() => window.DATA);
  }

  // cache:'no-cache' => revalidate the shards every load (conditional GET), so a redeploy's
  // new data shows up immediately; unchanged data still 304s cheaply. Avoids stale-data confusion.
  return Promise.all(
    STAGES.map(s =>
      fetch(`data.${s}.json`, { cache: "no-cache" })
        .then(r => (r.ok ? r.json() : []))
        .catch(() => [])
    )
  ).then(a => a.flat());
}

// inverted index for faceting: facet -> value -> [hash, ...]. Built from DATA at startup
// (~1 ms for ~3k questions), which the browser holds fully in memory anyway.
function buildIndexFromData() {
  const idx = Object.fromEntries(FACETS.map(f => [f.key, {}]));
  for (const q of DATA) {
    for (const f of FACETS) {
      for (const v of f.values(q)) {
        if (v != null) {
          idx[f.key][v] ||= [];
          idx[f.key][v].push(q.hash);
        }
      }
    }
  }
  return idx;
}

// the hashes of the print-selected questions, in original document order
const selectedHashes = () => DATA.filter(q => selectedSet.has(q.hash)).map(q => q.hash);

// --- URL hash <-> state. The JS structures are the working truth; the hash is their
// serialization. Written on every change (facet toggles push a history entry, everything
// else replaces — see writeUrl). Read on load and on Back/Forward (popstate). page is not
// stored. pushState/replaceState are silent (no popstate/hashchange), so writes never loop.
function serialize() {
  const o = {};
  for (const f of FACETS) {
    if (selections[f.key].size) {
      o[f.key] = [...selections[f.key]];
    }
  }
  if (search.value.trim()) {
    o.q = [search.value.trim()];
  }
  const incIds = idList(inc.value);
  if (incIds.length) {
    o.inc = incIds;
  }
  const excIds = idList(exc.value);
  if (excIds.length) {
    o.exc = excIds;
  }
  if (selectedSet.size) {
    o.sel = selectedHashes();
  }

  // brudnopis overrides split by target height; defaults aren't stored (absent = follow the global setting)
  const bh = [],
    bf = [];
  for (const [h, v] of scratchOverrides) {
    (v === "half" ? bh : bf).push(h);
  }
  if (bh.length) {
    o.bh = bh;
  }
  if (bf.length) {
    o.bf = bf;
  }

  // per-question figure format pins, split by target format (default follows the vectorPriority setting, not stored)
  const fr = [],
    fv = [];
  for (const [h, v] of svgOverrides) {
    (v === "svg" ? fv : fr).push(h);
  }
  if (fr.length) {
    o.fr = fr;
  }
  if (fv.length) {
    o.fv = fv;
  }
  if (titleOverride != null) {
    o.title = [titleOverride]; // only the edited title; auto/default aren't stored
  }
  return o;
}

// Keep the per-question overrides in step with the "Pokaż tylko id" worksheet: when an explicit id
// list is active, an override for a question no longer on the list is dropped, so bh/bf/fr/fv never
// outlive the sheet (Maps stay == hash). No list → overrides apply globally, nothing to prune.
function pruneScratchToInclude() {
  const incIds = idList(inc.value);
  if (!incIds.length) {
    return;
  }
  const keep = new Set(incIds);
  for (const m of [scratchOverrides, svgOverrides]) {
    for (const h of [...m.keys()]) {
      if (!keep.has(h)) {
        m.delete(h);
      }
    }
  }
}

function writeUrl(push) {
  pruneScratchToInclude();
  const h = Facets.encodeHash(serialize());
  if (h === location.hash.slice(1)) {
    return; // unchanged: don't spawn a dup history entry
  }
  history[push ? "pushState" : "replaceState"](
    null,
    "",
    h ? `#${h}` : location.pathname + location.search
  );
}

function applyState() {
  const o = Facets.decodeHash(location.hash.slice(1));
  for (const f of FACETS) {
    // drop unknown/stale values so state matches the checkboxes that exist
    selections[f.key] = new Set(
      f.key === "weryf" && !showAI
        ? [] // AI off → the hidden Weryfikacja facet never filters
        : (o[f.key] || []).filter(v => INDEX[f.key] && INDEX[f.key][v])
    );
  }
  facetsEl.querySelectorAll(".facet-opt input").forEach(inp => {
    inp.checked = selections[inp.closest(".facet").dataset.facet].has(inp.value);
  });
  search.value = (o.q || []).join(" ");
  inc.value = (o.inc || []).join(", ");
  exc.value = (o.exc || []).join(", ");
  selectedSet.clear();
  for (const h of o.sel || []) {
    if (byHash[h]) {
      selectedSet.add(h);
    }
  }
  scratchOverrides.clear();
  for (const h of o.bh || []) {
    if (byHash[h]) {
      scratchOverrides.set(h, "half");
    }
  }
  for (const h of o.bf || []) {
    if (byHash[h]) {
      scratchOverrides.set(h, "full");
    }
  }
  svgOverrides.clear();
  for (const h of o.fr || []) {
    if (byHash[h]) {
      svgOverrides.set(h, "png");
    }
  }
  for (const h of o.fv || []) {
    if (byHash[h]) {
      svgOverrides.set(h, "svg");
    }
  }
  titleOverride = o.title && o.title[0] != null ? o.title[0] : null; // update() below reflects it via setTitle
  page = 1;
  update();
}
