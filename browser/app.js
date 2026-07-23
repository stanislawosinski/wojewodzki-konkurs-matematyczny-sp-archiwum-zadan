'use strict';
// Question browser: loads per-stage data shards, filters in memory, renders
// at most PAGE_SIZE questions into the DOM (paged). Runs off file:// and http(s).

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
  return Promise.all(STAGES.map(s =>
    fetch(`data.${s}.json`).then(r => r.ok ? r.json() : []).catch(() => [])
  )).then(a => a.flat());
}

const $ = id => document.getElementById(id);
const search = $('search'), topic = $('topic'), form = $('form'), etap = $('etap'),
  school = $('school'), woj = $('woj'), year = $('year'), points = $('points'),
  inc = $('include'), exc = $('exclude'), count = $('count'), selected = $('selected'),
  setsummary = $('setsummary'), qlist = $('qlist');
const attrSelects = [topic, form, etap, school, woj, year, points];
const pagers = [...document.querySelectorAll('.pager')];

let DATA = [], byHash = {};
let page = 1;
const selectedSet = new Set(); // hashes; lives outside the DOM — articles are destroyed on re-render

const idList = s => (s.match(/[0-9a-f]{8}/gi) || []).map(x => x.toLowerCase());

function applyFilters() {
  const order = idList(inc.value), incSet = new Set(order),
    excSet = new Set(idList(exc.value)), useInc = incSet.size > 0,
    terms = search.value.toLowerCase().split(/\s+/).filter(Boolean);
  let matched;
  if (useInc) {
    // "Pokaż tylko id" is an override: exactly those ids, in pasted order, deduped
    const seen = new Set();
    matched = order.filter(h => byHash[h] && !seen.has(h) && seen.add(h)).map(h => byHash[h]);
  } else {
    matched = DATA.filter(q =>
      terms.every(t => q._search.includes(t))
      && (!topic.value || q.topics.includes(topic.value))
      && (!form.value || q.type === form.value)
      && (!etap.value || q.stage === etap.value)
      && (!school.value || q.school_type === school.value)
      && (!woj.value || q.wojewodztwo === woj.value)
      && (!year.value || q.school_year === year.value)
      && (!points.value || String(q.points) === points.value)
      && !excSet.has(q.hash));
  }
  const active = useInc || excSet.size > 0 || terms.length > 0 || attrSelects.some(s => s.value);
  return { matched, useInc, active };
}

function renderQuestion(q, seq) {
  const src = `${q.source_file}, s.${q.page}, zad. ${q.number}`;
  const parts = [`<article class="q" id="${esc(q.id)}" data-hash="${q.hash}">`];
  parts.push(`<label class="selectbox" title="zaznacz do wydruku"><input type="checkbox"${selectedSet.has(q.hash) ? ' checked' : ''}></label>`);
  parts.push(`<div class="qhead"><span class="qnum">Zadanie ${seq ?? q.number}.</span>`
    + `<span class="pts">${q.points}p</span>`
    + `<span class="hash" title="identyfikator zadania">(${q.hash})</span>`
    + `<span class="src" title="źródło">${esc(src)}</span></div>`);
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
  const { matched, useInc, active } = applyFilters();
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
  const arks = new Set(matched.map(q => q._ark));
  setsummary.textContent = `${matched.length} zadań z ${arks.size} arkuszy`;
  count.textContent = active ? `${matched.length} zadań` : '';
}

function updateSelected() {
  // DATA order = original document order (matches the old browser's semantics)
  selected.value = DATA.filter(q => selectedSet.has(q.hash)).map(q => q.hash).join(', ');
}

const debounce = (fn, ms) => { let t; return () => { clearTimeout(t); t = setTimeout(fn, ms); }; };
const refilter = () => { page = 1; update(); };

loadData().then(data => {
  DATA = data;
  if (!DATA.length) { setsummary.textContent = 'Brak danych — uruchom: node build.mjs'; return; }
  const scratch = document.createElement('textarea'); // reused entity decoder
  for (const q of DATA) {
    // plain-text of prompt + choices for the free-text search (tags stripped, lowercased)
    scratch.innerHTML = (q.prompt_html + ' ' + (q.choices || []).map(c => c.html).join(' ')).replace(/<[^>]+>/g, ' ');
    q._search = scratch.value.replace(/\s+/g, ' ').trim().toLowerCase();
    q._ark = q.id.replace(/_q\d+$/, '');
    byHash[q.hash] = q;
  }
  // populate selects from values present in the data
  const addOpt = (parent, value, label) => {
    const o = document.createElement('option');
    o.value = value; o.textContent = label;
    parent.append(o);
  };
  const present = new Set(DATA.flatMap(q => q.topics || [])), seen = new Set();
  for (const [cat, leaves] of CATALOG) {
    const hit = leaves.filter(l => present.has(l));
    hit.forEach(l => seen.add(l));
    if (!hit.length) continue;
    const g = document.createElement('optgroup');
    g.label = cat;
    hit.forEach(l => addOpt(g, l, l));
    topic.append(g);
  }
  const extra = [...present].filter(l => !seen.has(l)).sort();
  if (extra.length) {
    const g = document.createElement('optgroup');
    g.label = '(poza katalogiem)';
    extra.forEach(l => addOpt(g, l, l));
    topic.append(g);
  }
  const distinct = f => [...new Set(DATA.map(f))].filter(v => v != null).sort();
  Object.keys(TYPE_LABELS).filter(t => DATA.some(q => q.type === t)).forEach(t => addOpt(form, t, TYPE_LABELS[t]));
  distinct(q => q.stage).forEach(v => addOpt(etap, v, v));
  distinct(q => q.school_type).forEach(v => addOpt(school, v, SCHOOL_LABELS[v] || v));
  distinct(q => q.wojewodztwo).forEach(v => addOpt(woj, v, v));
  distinct(q => q.school_year).forEach(v => addOpt(year, v, v));
  [...new Set(DATA.map(q => q.points))].sort((a, b) => a - b).forEach(v => addOpt(points, String(v), `${v}p`));
  // events
  attrSelects.forEach(s => s.onchange = refilter);
  search.oninput = debounce(refilter, 200);
  inc.oninput = exc.oninput = refilter;
  for (const p of pagers) {
    p.querySelector('.prev').onclick = () => { page--; update(); scrollTo(0, 0); };
    p.querySelector('.next').onclick = () => { page++; update(); scrollTo(0, 0); };
  }
  qlist.addEventListener('change', e => {
    if (!e.target.matches('.selectbox input')) return;
    const h = e.target.closest('.q').dataset.hash;
    e.target.checked ? selectedSet.add(h) : selectedSet.delete(h);
    updateSelected();
  });
  $('useSel').onclick = () => { inc.value = selected.value; refilter(); };
  $('clearSel').onclick = () => {
    selectedSet.clear();
    qlist.querySelectorAll('.selectbox input').forEach(b => b.checked = false);
    updateSelected();
  };
  $('copySel').onclick = () => { selected.select(); try { document.execCommand('copy'); } catch (e) {} };
  update();
});
