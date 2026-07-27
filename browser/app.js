'use strict';
// Question browser: loads per-stage data shards, filters in memory, renders at most
// PAGE_SIZE questions into the DOM (paged). Runs off file:// and http(s). The facet
// index is built from DATA at startup (~1 ms); facet counts (browser/facets.js) update
// live per the drill-down rule.

// Two-level catalog: category -> ordered leaves. Mirrors SCHEMA.md.
const CATALOG = [
  ['Liczby i podzielność', ['podzielność', 'reszta z dzielenia', 'NWW / NWD', 'liczby rzymskie', 'procenty']],
  ['Wyrażenia: potęgi, pierwiastki, przekształcenia', ['potęgi i pierwiastki', 'usuwanie niewymierności z mianownika', 'wzory skróconego mnożenia', 'wyłączanie jednomianu przed nawias']],
  ['Równania, nierówności, proporcje', ['równania z jedną zmienną', 'układy równań', 'nierówności', 'proporcjonalność prosta', 'proporcjonalność odwrotna', 'prędkość / droga / czas']],
  ['Geometria płaska', ['geometria', 'trójkąty', 'sześciokąty foremne', 'koła / okręgi', 'pierścień kołowy', 'okrąg wpisany i opisany', 'dwusieczna kąta / symetralna odcinka']],
  ['Geometria przestrzenna', ['bryły']],
  ['Kombinatoryka i prawdopodobieństwo', ['zliczanie / metody zliczania', 'kombinatoryka', 'prawdopodobieństwo']],
  ['Statystyka', ['statystyka opisowa']],
  ['Metody i rozumowanie', ['dowodzenie / dowody', 'szacowanie (zamiast obliczania)', 'zagadki logiczne']],
  ['Inne', ['inne', 'przyroda']],
];
const TYPE_LABELS = { closed_single: 'Wielokrotny wybór', true_false: 'Prawda/Fałsz', open: 'Otwarte' };
const SCHOOL_LABELS = { podstawowa: 'Szkoła podstawowa', gimnazjum: 'Gimnazjum' };
const PAGE_SIZE = 100;
const STAGES = ['szkolny', 'rejonowy', 'wojewodzki'];

// The seven faceted filters. `values(q)` mirrors build.mjs so a missing index can be
// rebuilt from DATA; `order` fixes non-alphabetical display order; `labelFor` prettifies.
const FACETS = [
  { key: 'topic',  label: 'Temat',       values: q => q.topics || [] },
  { key: 'form',   label: 'Forma',       values: q => [q.type],         order: Object.keys(TYPE_LABELS), labelFor: v => TYPE_LABELS[v] || v },
  { key: 'etap',   label: 'Etap',        values: q => [q.stage],        order: STAGES },
  { key: 'school', label: 'Typ szkoły',  values: q => [q.school_type],  order: Object.keys(SCHOOL_LABELS), labelFor: v => SCHOOL_LABELS[v] || v },
  { key: 'woj',    label: 'Województwo',  values: q => [q.wojewodztwo] },
  { key: 'year',   label: 'Rok',         values: q => [q.school_year] },
  { key: 'points', label: 'Punkty',      values: q => [String(q.points)], numeric: true, labelFor: v => `${v}p` },
  { key: 'annul',  label: 'Anulowane',   values: q => [q.annulled ? 'tak' : 'nie'], order: ['nie', 'tak'], labelFor: v => v === 'tak' ? 'Anulowane' : 'Nie anulowane' },
];

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// file:// blocks fetch(), so load JS-wrapped shards via <script>; http(s) fetches plain JSON
function loadData() {
  if (location.protocol === 'file:') {
    window.DATA = [];
    return Promise.all(STAGES.map(s => new Promise(res => {
      const el = document.createElement('script');
      el.src = `data.${s}.js`;
      el.onload = el.onerror = res; // missing shard (stage not extracted yet) = silent skip
      document.head.append(el);
    }))).then(() => window.DATA);
  }
  // cache:'no-cache' => revalidate the shards every load (conditional GET), so a redeploy's
  // new data shows up immediately; unchanged data still 304s cheaply. Avoids stale-data confusion.
  return Promise.all(STAGES.map(s =>
    fetch(`data.${s}.json`, { cache: 'no-cache' }).then(r => r.ok ? r.json() : []).catch(() => [])
  )).then(a => a.flat());
}

const $ = id => document.getElementById(id);
const search = $('search'), inc = $('include'), exc = $('exclude'),
  setsummary = $('setsummary'),
  qlist = $('qlist'), facetsEl = $('facets'),
  clearFilters = $('clearFilters'), clearFacets = $('clearFacets'), clearSearch = $('clearSearch'),
  clearSelBar = $('clearSelBar'), printBtn = $('printBtn'), onePerPage = $('onePerPage'),
  metaToggle = $('metaToggle');
const pagers = [...document.querySelectorAll('.pager')];

let DATA = [], byHash = {}, INDEX = {}, universe = new Set();
let page = 1;
const selectedSet = new Set(); // hashes; lives outside the DOM — articles are destroyed on re-render
const selections = {}, EMPTY_SELECTIONS = {}; // facetKey -> Set<value>
for (const f of FACETS) { selections[f.key] = new Set(); EMPTY_SELECTIONS[f.key] = new Set(); }
const countSpans = {}; // facetKey -> { value: <span> }

const idList = s => (s.match(/[0-9a-f]{8}/gi) || []).map(x => x.toLowerCase());

// copy to clipboard via a throwaway textarea + execCommand — works off file:// too,
// where navigator.clipboard (secure-context only) is unavailable
const copyText = t => {
  const ta = document.createElement('textarea');
  ta.value = t; ta.style.cssText = 'position:fixed;top:0;opacity:0';
  document.body.append(ta); ta.select();
  try { document.execCommand('copy'); } catch (e) {}
  ta.remove();
};

// inverted index for faceting: facet -> value -> [hash, ...]. Built from DATA at startup
// (~1 ms for ~3k questions), which the browser holds fully in memory anyway.
function buildIndexFromData() {
  const idx = Object.fromEntries(FACETS.map(f => [f.key, {}]));
  for (const q of DATA)
    for (const f of FACETS)
      for (const v of f.values(q)) if (v != null) (idx[f.key][v] ||= []).push(q.hash);
  return idx;
}

// ordered checkbox entries for a facet: {header} rows (topic categories) or {value} rows
function facetEntries(f, present) {
  if (f.key === 'topic') {
    const has = new Set(present), seen = new Set(), out = [];
    for (const [cat, leaves] of CATALOG) {
      const hit = leaves.filter(l => has.has(l));
      if (!hit.length) continue;
      out.push({ header: cat });
      for (const l of hit) { out.push({ value: l }); seen.add(l); }
    }
    const extra = present.filter(l => !seen.has(l)).sort();
    if (extra.length) { out.push({ header: '(poza katalogiem)' }); for (const l of extra) out.push({ value: l }); }
    return out;
  }
  let vals;
  if (f.order) vals = [...f.order.filter(v => present.includes(v)), ...present.filter(v => !f.order.includes(v)).sort()];
  else if (f.numeric) vals = present.slice().sort((a, b) => Number(a) - Number(b));
  else vals = present.slice().sort();
  return vals.map(v => ({ value: v }));
}

function buildFacetUI() {
  for (const f of FACETS) {
    countSpans[f.key] = {};
    const box = document.createElement('div');
    box.className = 'facet';
    box.dataset.facet = f.key;
    box.innerHTML = `<div class="facet-h">${esc(f.label)}</div>`;
    const ul = document.createElement('ul');
    ul.className = 'facet-list';
    for (const entry of facetEntries(f, Object.keys(INDEX[f.key] || {}))) {
      const li = document.createElement('li');
      if (entry.header) { li.className = 'facet-cat'; li.textContent = entry.header; ul.append(li); continue; }
      const v = entry.value, label = f.labelFor ? f.labelFor(v) : v;
      li.className = 'facet-opt';
      li.innerHTML = `<label><input type="checkbox" value="${esc(v)}">`
        + `<span class="opt-l">${esc(label)}</span><span class="opt-c"></span></label>`;
      countSpans[f.key][v] = li.querySelector('.opt-c');
      ul.append(li);
    }
    box.append(ul);
    facetsEl.append(box);
  }
}

function renderQuestion(q, seq) {
  const parts = [`<article class="q" id="${esc(q.id)}" data-hash="${q.hash}">`];
  if (seq != null) parts.push( // ordered "Pokaż tylko id" mode: gutter arrows reorder the id list
    `<button type="button" class="reorder up" title="Przesuń w górę" aria-label="w górę">↑</button>`
    + `<button type="button" class="reorder down" title="Przesuń w dół" aria-label="w dół">↓</button>`);
  parts.push(`<label class="selectbox" title="zaznacz do wydruku"><input type="checkbox"${selectedSet.has(q.hash) ? ' checked' : ''}></label>`);
  // meta tags inline in the header, right-aligned: województwo, rok, etap | topics — toggled by "Meta"
  const ctx = [q.wojewodztwo, q.school_year, q.stage].filter(Boolean), topics = q.topics || [];
  const metaHtml = ctx.map(t => `<span class="tag ctx">${esc(t)}</span>`).join('')
    + topics.map(t => `<span class="tag">${esc(t)}</span>`).join('');
  parts.push(`<div class="qhead"><span class="qnum">Zadanie ${seq ?? q.number}.</span>`
    + `<span class="pts">${q.points}p</span>`
    + `<span class="hash" title="kliknij, aby skopiować id">(${q.hash})</span>`
    + `<span class="qmeta">${metaHtml}</span></div>`);
  parts.push(`<div class="prompt">${q.prompt_html}</div>`);
  for (const fig of q.figures || [])
    parts.push(`<img class="fig" src="figures/${esc(fig)}" loading="lazy" alt="rysunek do zadania ${q.number}">`);
  const correct = q.answer && q.answer.correct;
  if (q.choices && q.choices.length) {
    parts.push('<ol class="choices">');
    for (const c of q.choices)
      parts.push(`<li class="choice${c.label === correct ? ' correct' : ''}" value="${esc(c.label)}"><span class="lbl">${esc(c.label)}.</span> ${c.html}</li>`);
    parts.push('</ol>');
  }
  const sol = q.answer && q.answer.solution_html;
  if (correct || sol) {
    parts.push('<details class="reveal"><summary title="Pokaż odpowiedź"><span class="eye">👁</span></summary>');
    if (correct) parts.push(`<div class="answer">Odpowiedź: <b>${correct}</b></div>`);
    if (sol) parts.push(`<div class="answer solution">${sol}</div>`);
    parts.push('</details>');
  }
  parts.push('</article>');
  return parts.join('\n');
}

function update() {
  const incIds = idList(inc.value), useInc = incIds.length > 0;
  const excSet = new Set(idList(exc.value));
  const terms = search.value.toLowerCase().split(/\s+/).filter(Boolean);

  let matched, countSel, countGate;
  if (useInc) {
    // "Pokaż tylko id" is an override: exactly those ids, in pasted order, deduped
    const seen = new Set();
    matched = incIds.filter(h => byHash[h] && !seen.has(h) && seen.add(h)).map(h => byHash[h]);
    const shown = new Set(matched.map(q => q.hash)); // facets inert; counts describe the shown set
    countSel = EMPTY_SELECTIONS;
    countGate = h => shown.has(h);
  } else {
    const gate = h => !excSet.has(h) && terms.every(t => byHash[h]._search.includes(t));
    const hits = new Set(Facets.matchedHashes(INDEX, selections, gate, universe));
    matched = DATA.filter(q => hits.has(q.hash)); // DATA order = original document order
    countSel = selections;
    countGate = gate;
  }

  // page + render
  const pages = Math.max(1, Math.ceil(matched.length / PAGE_SIZE));
  page = Math.min(Math.max(1, page), pages);
  const start = (page - 1) * PAGE_SIZE;
  qlist.innerHTML = matched.slice(start, start + PAGE_SIZE)
    .map((q, i) => renderQuestion(q, useInc ? start + i + 1 : null)).join('\n');
  for (const p of pagers) {
    p.hidden = pages === 1;
    p.querySelector('.pageinfo').textContent = `Strona ${page} z ${pages}`;
    p.querySelector('.prev').disabled = page === 1;
    p.querySelector('.next').disabled = page === pages;
  }

  // facet counts (drill-down); ponytail: O(facets × universe) per change, fine at ~3k rows
  for (const f of FACETS) {
    const counts = Facets.facetCounts(INDEX, countSel, countGate, f.key, universe);
    const spans = countSpans[f.key];
    for (const v in spans) {
      const n = counts[v] || 0;
      spans[v].textContent = n;
      spans[v].closest('.facet-opt').classList.toggle('dim', n === 0 && !selections[f.key].has(v));
    }
  }

  const anyFacet = FACETS.some(f => selections[f.key].size);
  const active = useInc || excSet.size > 0 || terms.length > 0 || anyFacet;
  clearFilters.hidden = !active;   // "Wyczyść wszystko": any filtering at all
  clearFacets.hidden = !anyFacet;  // "Wyczyść filtry": facet checkboxes only
  clearSearch.hidden = !search.value; // the "×" inside the search box
  clearSelBar.hidden = !selectedSet.size; // "Wyczyść zaznaczenie": only with a print selection
  shownCount = matched.length;
  renderSummary();
}

// summary: "<n> zadanie/zadania/zadań [(<k> zaznaczone/zaznaczonych)]". shownCount is cached so
// ticking a print checkbox can refresh just this line (no full re-render).
let shownCount = 0;
const renderSummary = () => {
  const k = selectedSet.size; // content is numbers + fixed words, so innerHTML is safe here
  setsummary.innerHTML = `${shownCount} ${plZadania(shownCount)}`
    + (k ? ` (<span class="selcopy" title="kliknij, aby skopiować listę id">${k} ${plZaznaczone(k)}</span>)` : '');
};
// Polish plurals — pl2_4 = the 2/3/4 branch (not 12–14); the "one" form covers 1 (and 2–4 too here)
const pl2_4 = n => n % 10 >= 2 && n % 10 <= 4 && !(n % 100 >= 12 && n % 100 <= 14);
const plZadania = n => n === 1 ? 'zadanie' : pl2_4(n) ? 'zadania' : 'zadań';
const plZaznaczone = n => n === 1 || pl2_4(n) ? 'zaznaczone' : 'zaznaczonych';

// the hashes of the print-selected questions, in original document order
const selectedHashes = () => DATA.filter(q => selectedSet.has(q.hash)).map(q => q.hash);

// --- URL hash <-> state. The JS structures are the working truth; the hash is their
// serialization. Written on every change (facet toggles push a history entry, everything
// else replaces — see writeUrl). Read on load and on Back/Forward (popstate). page is not
// stored. pushState/replaceState are silent (no popstate/hashchange), so writes never loop.
function serialize() {
  const o = {};
  for (const f of FACETS) if (selections[f.key].size) o[f.key] = [...selections[f.key]];
  if (search.value.trim()) o.q = [search.value.trim()];
  const incIds = idList(inc.value); if (incIds.length) o.inc = incIds;
  const excIds = idList(exc.value); if (excIds.length) o.exc = excIds;
  if (selectedSet.size) o.sel = selectedHashes();
  return o;
}

function writeUrl(push) {
  const h = Facets.encodeHash(serialize());
  if (h === location.hash.slice(1)) return; // unchanged: don't spawn a dup history entry
  history[push ? 'pushState' : 'replaceState'](null, '', h ? '#' + h : location.pathname + location.search);
}

function applyState() {
  const o = Facets.decodeHash(location.hash.slice(1));
  for (const f of FACETS) // drop unknown/stale values so state matches the checkboxes that exist
    selections[f.key] = new Set((o[f.key] || []).filter(v => INDEX[f.key] && INDEX[f.key][v]));
  facetsEl.querySelectorAll('.facet-opt input').forEach(inp => {
    inp.checked = selections[inp.closest('.facet').dataset.facet].has(inp.value);
  });
  search.value = (o.q || []).join(' ');
  inc.value = (o.inc || []).join(', ');
  exc.value = (o.exc || []).join(', ');
  selectedSet.clear();
  for (const h of o.sel || []) if (byHash[h]) selectedSet.add(h);
  page = 1; update();
}

const debounce = (fn, ms) => { let t; return () => { clearTimeout(t); t = setTimeout(fn, ms); }; };
const refilter = () => { page = 1; update(); scrollTo(0, 0); }; // filter change: back to page 1, top

// uncheck every facet checkbox (state + DOM); callers push the URL and refilter
function clearFacetSelections() {
  for (const f of FACETS) selections[f.key].clear();
  facetsEl.querySelectorAll('.facet-opt input').forEach(i => { i.checked = false; });
}
// reset every filter (facets + search + include/exclude); leaves the print selection alone
function clearAllFilters() {
  clearFacetSelections();
  search.value = inc.value = exc.value = '';
  writeUrl(true); refilter(); // push, so Back restores the filters you cleared
}

loadData().then(data => {
  DATA = data;
  if (!DATA.length) { setsummary.textContent = 'Brak danych — uruchom: node build.mjs'; return; }
  const scratch = document.createElement('textarea'); // reused entity decoder
  for (const q of DATA) {
    // plain-text of prompt + choices for the free-text search (tags stripped, lowercased)
    scratch.innerHTML = (q.prompt_html + ' ' + (q.choices || []).map(c => c.html).join(' ')).replace(/<[^>]+>/g, ' ');
    q._search = scratch.value.replace(/\s+/g, ' ').trim().toLowerCase();
    byHash[q.hash] = q;
  }
  INDEX = buildIndexFromData();
  universe = new Set(Object.keys(byHash));
  buildFacetUI();

  // events
  facetsEl.addEventListener('change', e => {
    if (!e.target.matches('.facet-opt input')) return;
    const key = e.target.closest('.facet').dataset.facet, v = e.target.value;
    e.target.checked ? selections[key].add(v) : selections[key].delete(v);
    writeUrl(true); refilter(); // facet toggle: push, so Back undoes it
  });
  const replace = () => { writeUrl(false); refilter(); };
  search.oninput = debounce(() => {
    // push only when a search first appears (empty -> non-empty), so the pre-search view is one
    // Back away; edits within the burst replace in place. Keeps the URL live either way.
    const had = new URLSearchParams(location.hash.slice(1)).has('q');
    writeUrl(had ? false : !!search.value.trim());
    refilter();
  }, 200);
  inc.oninput = exc.oninput = replace;
  search.addEventListener('input', () => { clearSearch.hidden = !search.value; }); // instant, not debounced
  clearSearch.onclick = () => {
    if (!search.value) return;
    search.value = ''; clearSearch.hidden = true; search.focus();
    writeUrl(false); refilter(); // clearing removes q in place, like backspacing to empty
  };
  addEventListener('popstate', applyState);
  for (const p of pagers) {
    p.querySelector('.prev').onclick = () => { page--; update(); scrollTo(0, 0); };
    p.querySelector('.next').onclick = () => { page++; update(); scrollTo(0, 0); };
  }
  qlist.addEventListener('change', e => {
    if (!e.target.matches('.selectbox input')) return;
    const h = e.target.closest('.q').dataset.hash;
    e.target.checked ? selectedSet.add(h) : selectedSet.delete(h);
    clearSelBar.hidden = !selectedSet.size; // keep the toolbar link + count in sync without a full re-render
    renderSummary();
    writeUrl(false);
  });
  qlist.addEventListener('click', e => {
    const qnum = e.target.closest('.qnum'); // click "Zadanie N" to flip its print checkbox
    if (qnum) {
      const cb = qnum.closest('.q').querySelector('.selectbox input');
      cb.checked = !cb.checked;
      cb.dispatchEvent(new Event('change', { bubbles: true })); // reuse the selection handler
      return;
    }
    const hashEl = e.target.closest('.hash'); // click the id to copy it to the clipboard
    if (hashEl) { copyText(hashEl.closest('.q').dataset.hash); return; }
    const btn = e.target.closest('.reorder'); // reorder arrows: swap adjacent hashes in the id box
    if (!btn) return;
    const ids = idList(inc.value);
    const i = ids.indexOf(btn.closest('.q').dataset.hash);
    const j = i + (btn.classList.contains('up') ? -1 : 1);
    if (i < 0 || j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    inc.value = ids.join(', ');
    writeUrl(false); update(); // keep current page & scroll, just re-render in the new order
  });
  // "Zaznaczone ↑": drop the print-selected question ids into the "Pokaż tylko id" box
  $('useSel').onclick = () => { inc.value = selectedHashes().join(', '); writeUrl(false); refilter(); };
  // "Skopiuj": copy the id box to the clipboard
  $('copySel').onclick = () => { inc.select(); try { document.execCommand('copy'); } catch (e) {} };
  // "Wyczyść": clear only the "Pokaż tylko id" textarea (selection has its own link in the bar)
  $('clearSel').onclick = () => { inc.value = ''; writeUrl(false); refilter(); };
  clearFilters.onclick = e => { e.preventDefault(); clearAllFilters(); };
  clearFacets.onclick = e => { e.preventDefault(); clearFacetSelections(); writeUrl(true); refilter(); };
  onePerPage.onchange = () => document.body.classList.toggle('onePerPage', onePerPage.checked); // print layout only
  document.body.classList.toggle('onePerPage', onePerPage.checked); // honor the default (checked)
  const applyMeta = () => document.body.classList.toggle('hide-meta', !metaToggle.checked); // per-question source+tags
  metaToggle.onchange = applyMeta; applyMeta();
  printBtn.onclick = () => window.print();
  clearSelBar.onclick = e => { // "Wyczyść zaznaczenie": clear the print selection only
    e.preventDefault();
    selectedSet.clear();
    qlist.querySelectorAll('.selectbox input').forEach(b => b.checked = false);
    writeUrl(false); update();
  };
  // click the "N zaznaczone" in the summary to copy the selected ids (", "-separated, DATA order)
  setsummary.addEventListener('click', e => {
    if (e.target.closest('.selcopy')) copyText(selectedHashes().join(', '));
  });

  applyState(); // restore filters from the URL hash (empty hash => same as a bare update())
});
