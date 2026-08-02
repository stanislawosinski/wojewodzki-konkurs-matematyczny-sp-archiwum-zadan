"use strict";

// Question browser: loads per-stage data shards, filters in memory, renders at most
// PAGE_SIZE questions into the DOM (paged). Runs off file:// and http(s). The facet
// index is built from DATA at startup (~1 ms); facet counts (browser/facets.js) update
// live per the drill-down rule.

// Two-level catalog: category -> ordered leaves. Generated from categories.json (the single source of
// truth) by build.mjs into catalog.js, loaded via <script> before this file — no hand-copy to drift.
const CATALOG = window.CATALOG || []; // ponytail: [] if catalog.js is missing/unbuilt → empty topic facet, not a crash

// leaves under the two Geometria categories — drives the "Brudnopis w kratkę: tylko w geometrii" option
const GEOM_LEAVES = new Set(
  CATALOG.filter(([c]) => c.startsWith("Geometria")).flatMap(([, ls]) => ls)
);
const TYPE_LABELS = {
  closed_single: "Wielokrotny wybór",
  true_false: "Prawda/Fałsz",
  open: "Otwarte"
};
const SCHOOL_LABELS = { podstawowa: "Szkoła podstawowa", gimnazjum: "Gimnazjum" };
const PAGE_SIZE = 100;
const STAGES = ["szkolny", "rejonowy", "wojewodzki"];

// Print brudnopis kratka: the 5 mm grid must be a real inline <svg> (vector), NOT a CSS
// background-image. Chrome's print-to-PDF rasterizes background-images (gradient AND svg alike) at
// ~screen DPI, then upscales to the physical size → blurry. An inline <svg> path is emitted as
// vector (and, being foreground, prints without the "Background graphics" toggle). Defined once as a
// <defs> path in absolute px (1 CSS px = 1/96 in, so 5 mm prints true); each .scratch <use>s it and
// its own 100%-sized viewport clips the grid to the (variable) scratch height. MAX ≥ any A4 scratch.
const [KRATKA_DEF, KRATKA_SVG] = (() => {
  const PXMM = 96 / 25.4,
    MAX = 300,
    px = mm => +(mm * PXMM).toFixed(2),
    sw = px(0.125);
  let d = "";
  for (let mm = 5; mm <= MAX; mm += 5) {
    d += `M0 ${px(mm)}H${px(MAX)}M${px(mm)} 0V${px(MAX)}`; // interior lines only (start 5); the CSS border draws the box edges
  }
  const def =
    `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>` +
    `<path id="kratka5" d="${d}" fill="none" stroke="#d6d6d6" stroke-width="${sw}"/></defs></svg>`;

  // Just the interior grid; the frame/edges are a CSS border on the box (see app.css .kratka rule),
  // which round()-snaps to whole 5 mm cells so the border sits one cell past the last line, no sliver.
  const svg = `<svg class="kratka" width="100%" height="100%" aria-hidden="true"><use href="#kratka5"/></svg>`;
  return [def, svg];
})();
document.body.insertAdjacentHTML("afterbegin", KRATKA_DEF); // deferred script → body exists

// The faceted filters. `values(q)` mirrors build.mjs so a missing index can be
// rebuilt from DATA; `order` fixes non-alphabetical display order; `labelFor` prettifies.
const VERIF_LABELS = {
  zgodne: "AI zgodne z kluczem",
  rozbiezne: "AI niezgodne z kluczem",
  podejrzany: "Klucz podejrzany",
  bezklucza: "Bez klucza",
  niepewne: "Niepewna odpowiedź AI",
  nieroz: "Nierozstrzygnięte"
};

// which model(s) produced an answer, for labelling AI answers in the reveal
const MODEL_LABELS = { sonnet: "Sonnet", "opus+sonnet": "Sonnet + Opus", opus: "Opus" };

// explanations behind the ⓘ info icons; `_` is the facet-header note. Only facets/values listed here get an icon.
const FACET_INFO = {
  weryf: {
    _: "Każde zadanie zostało rozwiązane niezależnie przez AI, bez podglądania klucza („na ślepo”). Ten filtr pokazuje, jak odpowiedź AI ma się do oficjalnego klucza — pomaga wyłapać możliwe błędy w kluczu.",
    zgodne: "Odpowiedź AI zgadza się z oficjalnym kluczem odpowiedzi.",
    rozbiezne:
      "Odpowiedź AI różni się od klucza — najczęściej pomyłka AI, czasem przypadek sporny.",
    podejrzany:
      "Ręcznie oznaczone jako możliwy błąd w kluczu: dwa niezależne modele AI dały tę samą odpowiedź sprzeczną z kluczem. Czeka na weryfikację człowieka.",
    bezklucza:
      "Zadanie nie ma oficjalnego klucza odpowiedzi (np. arkusz opublikowany bez odpowiedzi).",
    niepewne:
      "Zadanie bez klucza, w którym modele AI nie były ze sobą zgodne — odpowiedź AI traktuj ostrożnie.",
    nieroz: "Weryfikacji nie udało się jednoznacznie rozstrzygnąć."
  }
};
const FACETS = [
  { key: "topic", label: "Temat", values: q => q.topics || [] },
  {
    key: "form",
    label: "Forma",
    values: q => [q.type],
    order: Object.keys(TYPE_LABELS),
    labelFor: v => TYPE_LABELS[v] || v
  },
  { key: "etap", label: "Etap", values: q => [q.stage], order: STAGES },
  {
    key: "school",
    label: "Typ szkoły",
    values: q => [q.school_type],
    order: Object.keys(SCHOOL_LABELS),
    labelFor: v => SCHOOL_LABELS[v] || v
  },
  { key: "woj", label: "Województwo", values: q => [q.wojewodztwo] },
  { key: "year", label: "Rok", values: q => [q.school_year] },
  {
    key: "points",
    label: "Punkty",
    values: q => [String(q.points)],
    numeric: true,
    labelFor: v => `${v}p`
  },
  {
    key: "annul",
    label: "Anulowane",
    values: q => [q.annulled ? "tak" : "nie"],
    order: ["nie", "tak"],
    labelFor: v => (v === "tak" ? "Anulowane" : "Nie anulowane")
  },
  {
    key: "sol",
    label: "Rozwiązanie",
    values: q => [q.answer?.model?.solution_html || q.answer?.solution_html ? "z" : "bez"],
    order: ["z", "bez"],
    labelFor: v => (v === "z" ? "Z rozwiązaniem" : "Bez rozwiązania")
  },
  {
    key: "fig",
    label: "Rysunek",
    values: q => [q.figures?.length ? "z" : "bez"],
    order: ["z", "bez"],
    labelFor: v => (v === "z" ? "Z rysunkiem" : "Bez rysunku")
  },

  // verification status from the blind-solve pass (answer.model.agrees / corroborated + suspect flag) — last filter
  {
    key: "weryf",
    label: "Weryfikacja",
    values: q => {
      const a = q.answer || {},
        m = a.model || {},
        hasKey = a.correct != null && a.correct !== "",
        o = [];
      if (q.suspect) {
        o.push("podejrzany");
      }
      if (!hasKey) {
        o.push("bezklucza");
        if (m.corroborated === false) {
          o.push("niepewne");
        }
      } else if (m.agrees === true) {
        o.push("zgodne");
      } else if (m.agrees === false) {
        o.push("rozbiezne");
      } else {
        o.push("nieroz");
      }
      return o;
    },
    order: ["zgodne", "rozbiezne", "podejrzany", "bezklucza", "niepewne", "nieroz"],
    labelFor: v => VERIF_LABELS[v] || v
  }
];

const esc = s =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

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

let DATA = [],
  byHash = {},
  INDEX = {},
  universe = new Set();
let page = 1;

// Eksperymenty toggles (settings popup, localStorage-persisted). showAI: reveal the AI verification
// (Weryfikacja facet + AI answers/key status), off by default. vectorPriority: figures default to the
// SVG redraw (△ then switches to PNG) instead of the reverse. Read by renderQuestion/renderKeyEntry.
let showAI = false,
  vectorPriority = false;
const selectedSet = new Set(); // hashes; lives outside the DOM — articles are destroyed on re-render
const scratchOverrides = new Map(); // hash -> 'half' | 'full'; per-question brudnopis override (default not stored)
const svgOverrides = new Map(); // hash -> 'png' | 'svg'; per-question figure format pin (default follows vectorPriority; cleared when the setting changes). Serialized to the hash so it survives reload/sharing.
const brudGlyph = s => (s === "half" ? "½" : s === "full" ? "1" : "–");

// what the global brudnopis mode gives one question: short-closed (phalf) → half, else full; half/full force it
const autoBrud = (phalf, mode) =>
  mode === "half" ? "half" : mode === "full" ? "full" : phalf ? "half" : "full";
const brudMode = () => document.querySelector('input[name="pageMode"]:checked').value;
const brudTitle = (override, auto) =>
  "Brudnopis dla tego zadania: " +
  (override === "half"
    ? "pół strony (wymuszone)"
    : override === "full"
      ? "cała strona (wymuszone)"
      : `domyślny — ${auto === "half" ? "pół strony" : "cała strona"}`);

// Sheet title (the .sheet-title header + document.title). titleOverride = a user-typed title
// (sticky, wins over auto); null = derive it. lastMatched/lastUseInc cache update()'s result so a
// title edit can refresh without a re-render. See computeTitle / setTitle.
let titleOverride = null,
  lastMatched = [],
  lastUseInc = false;
const DEFAULT_TITLE = "Wszystkie zadania";
const capitalize = s => (s ? s[0].toUpperCase() + s.slice(1) : s);

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
const countSpans = {}; // facetKey -> { value: <span> }

const idList = s => (s.match(/[0-9a-f]{8}/gi) || []).map(x => x.toLowerCase());

// copy to clipboard via a throwaway textarea + execCommand — works off file:// too,
// where navigator.clipboard (secure-context only) is unavailable
const copyText = t => {
  const ta = document.createElement("textarea");
  ta.value = t;
  ta.style.cssText = "position:fixed;top:0;opacity:0";
  document.body.append(ta);
  ta.select();
  try {
    document.execCommand("copy");
  } catch (_e) {}
  ta.remove();
};

// reusable "copied" popover, shown just below whatever was clicked; auto-hides after 1s
const copytip = Object.assign(document.createElement("div"), {
  className: "copytip",
  textContent: "Skopiowano do schowka",
  hidden: true
});
document.body.append(copytip);
let copytipTimer;
const flashCopied = el => {
  const r = el.getBoundingClientRect();
  copytip.style.left = `${r.left + r.width / 2}px`;
  copytip.style.top = `${r.bottom}px`;
  copytip.hidden = false;
  clearTimeout(copytipTimer);
  copytipTimer = setTimeout(() => {
    copytip.hidden = true;
  }, 1000);
};

// shared info popover for the facet ⓘ icons: click an icon to show its note under it,
// click the same icon / anywhere else / Escape to dismiss. Positioned fixed, clamped to viewport.
const infotip = Object.assign(document.createElement("div"), {
  className: "infotip",
  hidden: true
});
document.body.append(infotip);
let infotipFor = null;
const hideInfotip = () => {
  infotip.hidden = true;
  infotipFor = null;
};
const showInfotip = (icon, text) => {
  if (infotipFor === icon) {
    return hideInfotip(); // same icon again = toggle off
  }
  infotip.textContent = text;
  infotip.hidden = false;
  infotipFor = icon;
  const r = icon.getBoundingClientRect(),
    w = infotip.offsetWidth;
  infotip.style.left = `${Math.max(8, Math.min(r.left + r.width / 2 - w / 2, innerWidth - w - 8))}px`;
  infotip.style.top = `${r.bottom + 6}px`;
};

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

// ordered checkbox entries for a facet: {header} rows (topic categories) or {value} rows
function facetEntries(f, present) {
  if (f.key === "topic") {
    const has = new Set(present),
      seen = new Set(),
      out = [];
    for (const [cat, leaves] of CATALOG) {
      const hit = leaves.filter(l => has.has(l));
      if (!hit.length) {
        continue;
      }
      out.push({ header: cat });
      for (const l of hit) {
        out.push({ value: l });
        seen.add(l);
      }
    }
    const extra = present.filter(l => !seen.has(l)).sort();
    if (extra.length) {
      out.push({ header: "(poza katalogiem)" });
      for (const l of extra) {
        out.push({ value: l });
      }
    }
    return out;
  }
  let vals;
  if (f.order) {
    vals = [
      ...f.order.filter(v => present.includes(v)),
      ...present.filter(v => !f.order.includes(v)).sort()
    ];
  } else if (f.numeric) {
    vals = present.slice().sort((a, b) => Number(a) - Number(b));
  } else {
    vals = present.slice().sort();
  }
  return vals.map(v => ({ value: v }));
}

function buildFacetUI() {
  for (const f of FACETS) {
    countSpans[f.key] = {};
    const info = FACET_INFO[f.key] || {};
    const iconFor = t =>
      t
        ? ` <button type="button" class="info-i" aria-label="Wyjaśnienie" data-info="${esc(t)}">ⓘ</button>`
        : "";
    const box = document.createElement("div");
    box.className = "facet";
    box.dataset.facet = f.key;
    box.innerHTML = `<div class="facet-h">${esc(f.label)}${iconFor(info._)}</div>`;
    const ul = document.createElement("ul");
    ul.className = "facet-list";
    for (const entry of facetEntries(f, Object.keys(INDEX[f.key] || {}))) {
      const li = document.createElement("li");
      if (entry.header) {
        li.className = "facet-cat";
        li.textContent = entry.header;
        ul.append(li);
        continue;
      }
      const v = entry.value,
        label = f.labelFor ? f.labelFor(v) : v;
      li.className = "facet-opt";
      li.innerHTML =
        `<label><input type="checkbox" value="${esc(v)}">` +
        `<span class="opt-l">${esc(label)}</span><span class="opt-c"></span></label>` +
        iconFor(info[v]); // ⓘ sits outside the label so clicking it never toggles the checkbox
      countSpans[f.key][v] = li.querySelector(".opt-c");
      ul.append(li);
    }
    box.append(ul);
    facetsEl.append(box);
  }
}

// single verification badge for the reveal, given how many AI answers are shown (aiCount).
// The badge tracks the SHOWN answers so it never contradicts them (e.g. one dissenting Opus
// answer under a green "zgodne" badge). null = stay quiet (keyed, unresolved, nothing to show).
function verifBadge(q, aiCount) {
  const a = q.answer || {},
    m = a.model || {},
    hasKey = a.correct != null && a.correct !== "";
  if (q.suspect) {
    const b = {
      // badge label & colour by Opus verdict; blank verdict → generic suspect flag
      KEY_WRONG: { cls: "suspect", text: "Klucz prawdopodobnie błędny" },
      KEY_CORRECT: { cls: "ok", text: "Klucz zweryfikowany — poprawny" },
      SOLUTION_WRONG: { cls: "warn", text: "Klucz poprawny, ale rozwiązanie błędne" }
    }[q.suspect_verdict] || { cls: "suspect", text: "Klucz podejrzany — możliwy błąd w kluczu" };
    return { ...b, reason: q.suspect_reason };
  }

  // no key → the reveal's "Brak klucza" note states the status; no green "confirmed" badge (nothing to confirm against), only flag genuine AI disagreement
  if (!hasKey) {
    return aiCount > 1 ? { cls: "warn", text: "Modele AI niezgodne" } : null;
  }
  if (aiCount > 1) {
    return { cls: "warn", text: "Modele AI niezgodne" }; // key + ≥2 differing AI answers
  }
  if (aiCount === 1) {
    return { cls: "warn", text: "niezgodne z kluczem" }; // one AI answer differs from key
  }
  if (m.agrees === true) {
    return { cls: "ok", text: "zgodne z kluczem" }; // AI matched key, nothing to show
  }
  return null;
}

// AI answers worth showing: none when the key is confirmed (agrees); the AI's own answer when
// there's no key or the AI dissented; plus a distinct Opus dissent. Shared by the reveal + key sheet.
function aiAnswers(q) {
  const m = q.answer?.model || {},
    correct = q.answer?.correct;
  const hasKey = correct != null && correct !== "",
    primaryLabel = MODEL_LABELS[m.by] || "AI";
  const ai = [];
  if (!hasKey) {
    if (m.answer != null) {
      ai.push({ label: primaryLabel, answer: m.answer, sol: m.solution_html });
    }
  } else if (m.agrees === false && m.answer != null) {
    ai.push({ label: primaryLabel, answer: m.answer, sol: m.solution_html });
  }
  if (m.dissent && m.dissent.answer != null) {
    ai.push({ label: "Opus", answer: m.dissent.answer, sol: m.dissent.solution_html });
  }
  return ai;
}
const aiLine = x =>
  `Odpowiedź AI${x.label && x.label !== "AI" ? ` (${esc(x.label)})` : ""}: <b>${esc(x.answer)}</b>`;

// Compact answer-key entry for the print-only key sheet: number + answer + AI verification
// (status, justification, differing AI answers). No derivations — it's a quick reference.
function renderKeyEntry(q, seq) {
  const correct = q.answer?.correct;
  const ai = showAI ? aiAnswers(q) : [],
    badge = showAI ? verifBadge(q, ai.length) : null; // no AI content unless enabled
  const p = [
    `<div class="kq"><span class="kn">Zadanie ${seq ?? q.number}.</span> <span class="hash">(${q.hash})</span>`
  ];
  if (correct) {
    p.push(` <span class="ka">Odpowiedź: <b>${correct}</b></span>`);
  }
  if (badge) {
    p.push(
      `<div class="kverif">Weryfikacja AI: <b class="${badge.cls}">${esc(badge.text)}</b></div>`
    );
    if (badge.reason) {
      p.push(`<div class="kreason">${esc(badge.reason)}</div>`);
    }
  }
  for (const x of ai) {
    p.push(`<div class="kai">${aiLine(x)}</div>`);
  }
  return `${p.join("")}</div>`;
}

function renderQuestion(q, seq) {
  // print "Brudnopis: auto" sizing: short closed (a–d) questions get half a page (two per sheet);
  // open, true/false series and anything with a figure get a whole page.
  const half = q.type === "closed_single" && !(q.figures || []).length;
  const geom = (q.topics || []).some(t => GEOM_LEAVES.has(t)) ? " geom" : ""; // kratka "tylko w geometrii" target
  const bo = scratchOverrides.get(q.hash) || ""; // '' | 'half' | 'full' — per-question brudnopis override
  const parts = [
    `<article class="q ${half ? "phalf" : "pfull"}${geom}${bo ? ` brud-${bo}` : ""}" id="${esc(q.id)}" data-hash="${q.hash}">`
  ];

  // left-gutter controls wrapped in one .gutter group so they dim together and hover as a unit
  const reorder =
    seq == null
      ? "" // ordered "Pokaż tylko id" mode: arrows reorder the id list, × drops it
      : `<button type="button" class="reorder remove" title="Usuń z listy id" aria-label="usuń">×</button>` +
        `<button type="button" class="reorder up" title="Przesuń w górę" aria-label="w górę"><span>▾</span></button>` +
        `<button type="button" class="reorder down" title="Przesuń w dół" aria-label="w dół">▾</button>`;
  parts.push(
    `<div class="gutter">${reorder}<label class="selectbox" title="zaznacz do wydruku"><input type="checkbox"${selectedSet.has(q.hash) ? " checked" : ""}></label></div>`
  );

  // per-question brudnopis override, left of the eye; hidden in print & when global brudnopis is off.
  // grey glyph = the size "auto" resolves to under the current global mode; green (.on) = a pinned override.
  const autoBo = autoBrud(half, brudMode());
  parts.push(
    `<button type="button" class="brudtoggle${bo ? " on" : ""}" title="${brudTitle(bo, autoBo)}" aria-label="brudnopis zadania" data-brud="${bo}">${brudGlyph(bo || autoBo)}</button>`
  );

  // figure format shown for this question: a per-question pin (svgOverrides) or the global default (vectorPriority).
  const figDefault = vectorPriority ? "svg" : "png",
    figFmt = svgOverrides.get(q.hash) || figDefault;
  if ((q.figsvg || []).length) {
    parts.push(
      // only for questions whose figures have a vector redraw
      // glyph = current format (⊞ raster / △ vector); green (.on) = pinned away from the current default (see the click handler)
      `<button type="button" class="svgtoggle${figFmt !== figDefault ? " on" : ""}" title="${figFmt === "svg" ? "Pokaż rysunek rastrowy (PNG)" : "Pokaż rysunek wektorowy (SVG)"}" aria-label="przełącz format rysunku">${figFmt === "svg" ? "△" : "⊞"}</button>`
    );
  }

  // meta tags inline in the header, right-aligned; each type toggled from the settings popup
  const metaHtml = [
    q.wojewodztwo && `<span class="tag ctx woj">${esc(q.wojewodztwo)}</span>`,
    q.school_year && `<span class="tag ctx rok">${esc(q.school_year)}</span>`,
    q.stage && `<span class="tag ctx etap">${esc(q.stage)}</span>`,
    ...(q.topics || []).map(t => `<span class="tag topic">${esc(t)}</span>`)
  ]
    .filter(Boolean)
    .join("");
  parts.push('<div class="qbody">'); // wraps the content so the print brudnopis .scratch below can flex-fill the rest of the page
  parts.push(
    `<div class="qhead"><span class="qnum">Zadanie ${seq ?? q.number}.</span>` +
      `<span class="qid">(${q.points}p, <span class="hash" title="kliknij, aby skopiować id">${q.hash}</span>)</span>` +
      `<span class="qmeta">${metaHtml}</span></div>`
  );
  parts.push(`<div class="prompt">${q.prompt_html}</div>`);
  const hasSvg = new Set(q.figsvg || []);
  for (const fig of q.figures || []) {
    // A 400 dpi figure is laid out at its 200 dpi size, so the extra pixels go to
    // sharpness rather than to a picture twice as large. (srcset "2x" does NOT do this:
    // src joins the candidate list as 1x and wins on a non-retina display.)
    const d = q.figdim?.[fig];
    const dim = d ? ` width="${d[0]}" height="${d[1]}"` : "";

    // the gutter △ swaps src between these two; the SVG shares the bitmap's viewBox, so dim still holds
    const hasVec = hasSvg.has(fig),
      png = `figures/${esc(fig)}`,
      svg = `figures/svg/${esc(fig.replace(/\.png$/, ".svg"))}`;
    const alt = hasVec ? ` data-png="${png}" data-svg="${svg}"` : "";
    parts.push(
      `<img class="fig" src="${hasVec && figFmt === "svg" ? svg : png}"${dim}${alt} loading="lazy" alt="rysunek do zadania ${q.number}">`
    );
  }
  const correct = q.answer?.correct;
  if (q.choices?.length) {
    parts.push('<ol class="choices">');
    for (const c of q.choices) {
      parts.push(
        `<li class="choice${c.label === correct ? " correct" : ""}" value="${esc(c.label)}"><span class="lbl">${esc(c.label)}.</span> ${c.html}</li>`
      );
    }
    parts.push("</ol>");
  }
  const sol = q.answer?.solution_html;
  const ai = showAI ? aiAnswers(q) : [],
    badge = showAI ? verifBadge(q, ai.length) : null; // no AI content unless enabled

  // the eye is always shown; no-key questions state "Brak klucza" (AI answers, if enabled, still appear below)
  parts.push(
    '<details class="reveal"><summary title="Pokaż odpowiedź"><span class="eye">👁</span></summary>'
  );
  if (correct) {
    parts.push(`<div class="answer">Odpowiedź: <b>${correct}</b></div>`);
  }
  if (sol) {
    parts.push(`<div class="answer solution">${sol}</div>`); // key's derivation kept with its answer
  }
  if (!correct && !sol) {
    parts.push('<div class="answer nokey">Brak klucza</div>'); // no official key → always state it
  }
  if (badge) {
    // AI section: 2rem gap divides it from the key content above
    parts.push(
      `<p class="verif">Weryfikacja AI: <b class="${badge.cls}">${esc(badge.text)}</b></p>`
    );
    if (badge.reason) {
      parts.push(`<p class="verif-reason">${esc(badge.reason)}</p>`); // AI's justification for questioning/confirming the key
    }
  }
  for (const x of ai) {
    parts.push(`<div class="answer ai">${aiLine(x)}</div>`);
  }
  if (ai.length === 1 && ai[0].sol) {
    parts.push(`<div class="answer solution ai-sol">${ai[0].sol}</div>`); // sole AI answer → show its reasoning
  }
  parts.push("</details>");
  parts.push("</div>"); // /.qbody
  parts.push(`<div class="scratch" aria-hidden="true">${KRATKA_SVG}</div>`); // print brudnopis filler (grows to fill the reserved page space; carries the 5 mm kratka)
  parts.push("</article>");
  return parts.join("\n");
}

// Short A–D choices read better as one row than as four lines. But "short" is a rendered
// width — a fraction in MathML is two characters and half a line tall — so nothing is
// guessed from the text: every list is laid out inline and the row is kept only where it
// measurably did not wrap. Batched write → read → write, so a page costs one reflow.
function layoutChoices(root) {
  const lists = [...root.querySelectorAll(".choices")].filter(
    ol => ol.children.length > 1 && !ol.querySelector("img")
  ); // an image not yet loaded measures 0 wide
  for (const ol of lists) {
    ol.classList.add("inline");
  }
  const wrapped = lists.filter(ol => {
    const k = ol.children;
    return k[0].offsetTop !== k[k.length - 1].offsetTop || ol.scrollWidth > ol.clientWidth;
  });
  for (const ol of wrapped) {
    ol.classList.remove("inline");
  }
}

function update() {
  const incIds = idList(inc.value),
    useInc = incIds.length > 0;
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
  const shownPage = matched.slice(start, start + PAGE_SIZE);
  qlist.innerHTML = shownPage
    .map((q, i) => renderQuestion(q, useInc ? start + i + 1 : null))
    .join("\n");

  // print-only key sheet mirrors the questions on the page, in the same order (see @media print)
  answerkey.innerHTML = shownPage.length
    ? "<h2>Klucz odpowiedzi</h2>" +
      shownPage.map((q, i) => renderKeyEntry(q, useInc ? start + i + 1 : null)).join("")
    : "";
  layoutChoices(qlist);
  for (const p of pagers) {
    p.hidden = pages === 1;
    p.querySelector(".pageinfo").textContent = `Strona ${page} z ${pages}`;
    p.querySelector(".prev").disabled = page === 1;
    p.querySelector(".next").disabled = page === pages;
  }

  // facet counts (drill-down); ponytail: O(facets × universe) per change, fine at ~3k rows
  for (const f of FACETS) {
    const counts = Facets.facetCounts(INDEX, countSel, countGate, f.key, universe);
    const spans = countSpans[f.key];
    for (const v in spans) {
      const n = counts[v] || 0;
      spans[v].textContent = n;
      spans[v].closest(".facet-opt").classList.toggle("dim", n === 0 && !selections[f.key].has(v));
    }
  }

  const anyFacet = FACETS.some(f => selections[f.key].size);
  const active = useInc || excSet.size > 0 || terms.length > 0 || anyFacet;
  clearFilters.hidden = !active; // "Wyczyść wszystko": any filtering at all
  clearFacets.hidden = !anyFacet; // "Wyczyść filtry": facet checkboxes only
  clearSearch.hidden = !search.value; // the "×" inside the search box
  clearSelBar.hidden = !selectedSet.size; // "Wyczyść zaznaczenie": only with a print selection
  shownCount = matched.length;
  renderSummary();
  lastMatched = matched;
  lastUseInc = useInc;
  setTitle();
}

// summary: "<n> zadanie/zadania/zadań [(<k> zaznaczone/zaznaczonych)]". shownCount is cached so
// ticking a print checkbox can refresh just this line (no full re-render).
let shownCount = 0;
const renderSummary = () => {
  const k = selectedSet.size; // content is numbers + fixed words, so innerHTML is safe here
  setsummary.innerHTML =
    `${shownCount} ${plZadania(shownCount)}` +
    (k
      ? ` (<span class="selcopy" title="kliknij, aby skopiować listę id">${k} ${plZaznaczone(k)}</span>)`
      : "");
};

// Polish plurals — pl2_4 = the 2/3/4 branch (not 12–14); the "one" form covers 1 (and 2–4 too here)
const pl2_4 = n => n % 10 >= 2 && n % 10 <= 4 && !(n % 100 >= 12 && n % 100 <= 14);
const plZadania = n => (n === 1 ? "zadanie" : pl2_4(n) ? "zadania" : "zadań");
const plZaznaczone = n => (n === 1 || pl2_4(n) ? "zaznaczone" : "zaznaczonych");

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

const debounce = (fn, ms) => {
  let t;
  return () => {
    clearTimeout(t);
    t = setTimeout(fn, ms);
  };
};
const refilter = () => {
  page = 1;
  update();
  scrollTo(0, 0);
}; // filter change: back to page 1, top

// uncheck every facet checkbox (state + DOM); callers push the URL and refilter
function clearFacetSelections() {
  for (const f of FACETS) {
    selections[f.key].clear();
  }
  facetsEl.querySelectorAll(".facet-opt input").forEach(i => {
    i.checked = false;
  });
}

// reset every filter (facets + search + include/exclude); leaves the print selection alone
function clearAllFilters() {
  clearFacetSelections();
  search.value = inc.value = exc.value = "";
  writeUrl(true);
  refilter(); // push, so Back restores the filters you cleared
}

loadData().then(data => {
  DATA = data;
  if (!DATA.length) {
    setsummary.textContent = "Brak danych — uruchom: node build.mjs";
    return;
  }
  const scratch = document.createElement("textarea"); // reused entity decoder
  for (const q of DATA) {
    // plain-text of prompt + choices for the free-text search (tags stripped, lowercased)
    scratch.innerHTML = (
      q.prompt_html +
      " " +
      (q.choices || []).map(c => c.html).join(" ")
    ).replace(/<[^>]+>/g, " ");
    q._search = scratch.value.replace(/\s+/g, " ").trim().toLowerCase();
    byHash[q.hash] = q;
  }
  INDEX = buildIndexFromData();
  universe = new Set(Object.keys(byHash));
  buildFacetUI();

  // events
  facetsEl.addEventListener("change", e => {
    if (!e.target.matches(".facet-opt input")) {
      return;
    }
    const key = e.target.closest(".facet").dataset.facet,
      v = e.target.value;
    e.target.checked ? selections[key].add(v) : selections[key].delete(v);
    writeUrl(true);
    refilter(); // facet toggle: push, so Back undoes it
  });
  facetsEl.addEventListener("click", e => {
    // ⓘ info icons: show the explanation popover
    const icon = e.target.closest(".info-i");
    if (icon) {
      e.preventDefault();
      e.stopPropagation();
      showInfotip(icon, icon.dataset.info);
    }
  });
  const replace = () => {
    writeUrl(false);
    refilter();
  };
  search.oninput = debounce(() => {
    // push only when a search first appears (empty -> non-empty), so the pre-search view is one
    // Back away; edits within the burst replace in place. Keeps the URL live either way.
    const had = new URLSearchParams(location.hash.slice(1)).has("q");
    writeUrl(had ? false : !!search.value.trim());
    refilter();
  }, 200);
  inc.oninput = exc.oninput = replace;
  search.addEventListener("input", () => {
    clearSearch.hidden = !search.value;
  }); // instant, not debounced
  clearSearch.onclick = () => {
    if (!search.value) {
      return;
    }
    search.value = "";
    clearSearch.hidden = true;
    search.focus();
    writeUrl(false);
    refilter(); // clearing removes q in place, like backspacing to empty
  };
  addEventListener("popstate", applyState);
  for (const p of pagers) {
    p.querySelector(".prev").onclick = () => {
      page--;
      update();
      scrollTo(0, 0);
    };
    p.querySelector(".next").onclick = () => {
      page++;
      update();
      scrollTo(0, 0);
    };
  }
  qlist.addEventListener("change", e => {
    if (!e.target.matches(".selectbox input")) {
      return;
    }
    const h = e.target.closest(".q").dataset.hash;
    e.target.checked ? selectedSet.add(h) : selectedSet.delete(h);
    clearSelBar.hidden = !selectedSet.size; // keep the toolbar link + count in sync without a full re-render
    renderSummary();
    writeUrl(false);
  });
  qlist.addEventListener("click", e => {
    const qnum = e.target.closest(".qnum"); // click "Zadanie N" to flip its print checkbox
    if (qnum) {
      const cb = qnum.closest(".q").querySelector(".selectbox input");
      cb.checked = !cb.checked;
      cb.dispatchEvent(new Event("change", { bubbles: true })); // reuse the selection handler
      return;
    }
    const hashEl = e.target.closest(".hash"); // click the id to copy it to the clipboard
    if (hashEl) {
      copyText(hashEl.closest(".q").dataset.hash);
      flashCopied(hashEl);
      return;
    }
    const svgBtn = e.target.closest(".svgtoggle"); // △: swap this question between bitmap and vector redraw
    if (svgBtn) {
      const q = svgBtn.closest(".q"),
        h = q.dataset.hash,
        def = vectorPriority ? "svg" : "png";
      const next = (svgOverrides.get(h) || def) === "svg" ? "png" : "svg";
      if (next === def) {
        svgOverrides.delete(h);
      } else {
        svgOverrides.set(h, next); // only the pin ≠ default is stored
      }
      const showSvg = next === "svg";
      for (const img of q.querySelectorAll(".fig[data-svg]")) {
        img.src = showSvg ? img.dataset.svg : img.dataset.png;
      }
      svgBtn.classList.toggle("on", next !== def);
      svgBtn.textContent = showSvg ? "△" : "⊞"; // glyph reflects the now-current format
      svgBtn.title = showSvg ? "Pokaż rysunek rastrowy (PNG)" : "Pokaż rysunek wektorowy (SVG)";
      writeUrl(false); // persist the pin in the URL hash
      return;
    }
    const brudBtn = e.target.closest(".brudtoggle"); // –/½/1: per-question brudnopis override (print reserved space)
    if (brudBtn) {
      const q = brudBtn.closest(".q"),
        h = q.dataset.hash;
      const auto = autoBrud(q.classList.contains("phalf"), brudMode());

      // 2-state toggle: default (grey = auto) ↔ the only override that changes the size (the value ≠ auto).
      // Pinning the value equal to auto is dropped — it wouldn't change the print, just grey→green.
      const s = brudBtn.dataset.brud ? "" : auto === "half" ? "full" : "half";
      brudBtn.dataset.brud = s;
      brudBtn.textContent = brudGlyph(s || auto); // grey shows the auto size, green the pinned size
      brudBtn.title = brudTitle(s, auto);
      brudBtn.classList.toggle("on", !!s);
      q.classList.toggle("brud-half", s === "half");
      q.classList.toggle("brud-full", s === "full");
      if (s) {
        scratchOverrides.set(h, s);
      } else {
        scratchOverrides.delete(h); // scratchOverrides is the truth; render + hash read it
      }
      writeUrl(false);
      return;
    }
    const rm = e.target.closest(".reorder.remove"); // × : drop this question's hash from the id box
    if (rm) {
      inc.value = idList(inc.value)
        .filter(h => h !== rm.closest(".q").dataset.hash)
        .join(", ");
      writeUrl(false);
      refilter();
      return;
    }
    const btn = e.target.closest(".reorder"); // reorder arrows: swap adjacent hashes in the id box
    if (!btn) {
      return;
    }
    const ids = idList(inc.value);
    const i = ids.indexOf(btn.closest(".q").dataset.hash);
    const j = i + (btn.classList.contains("up") ? -1 : 1);
    if (i < 0 || j < 0 || j >= ids.length) {
      return;
    }
    [ids[i], ids[j]] = [ids[j], ids[i]];
    inc.value = ids.join(", ");
    writeUrl(false);
    update(); // keep current page & scroll, just re-render in the new order
  });

  // "Zaznaczone ↑": drop the print-selected question ids into the "Pokaż tylko id" box
  $("useSel").onclick = () => {
    inc.value = selectedHashes().join(", ");
    writeUrl(false);
    refilter();
  };

  // "Skopiuj": copy the id box to the clipboard
  $("copySel").onclick = e => {
    inc.select();
    try {
      document.execCommand("copy");
    } catch (_e) {}
    flashCopied(e.currentTarget);
  };

  // "Wyczyść": clear only the "Pokaż tylko id" textarea (selection has its own link in the bar)
  $("clearSel").onclick = () => {
    inc.value = "";
    writeUrl(false);
    refilter();
  };
  clearFilters.onclick = e => {
    e.preventDefault();
    clearAllFilters();
  };
  clearFacets.onclick = e => {
    e.preventDefault();
    clearFacetSelections();
    writeUrl(true);
    refilter();
  };

  // persist every settings-popup control (checkboxes by id, radios by name) in localStorage.
  // ponytail: one generic pass over #settingsPop inputs, not per-control save/load wiring.
  const SETTINGS_KEY = "zadania-settings";
  const saveSettings = () => {
    const s = {};
    for (const i of settingsPop.querySelectorAll("input")) {
      if (i.type === "radio") {
        if (i.checked) {
          s[i.name] = i.value;
        }
      } else {
        s[i.id] = i.checked;
      }
    }
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    } catch {}
  };
  (() => {
    // restore BEFORE the apply* handlers below, so the body classes reflect saved state
    let s;
    try {
      s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
    } catch {}
    if (!s) {
      return;
    }
    for (const i of settingsPop.querySelectorAll("input")) {
      if (i.type === "radio") {
        if (i.value === s[i.name]) {
          i.checked = true;
        }
      } else if (typeof s[i.id] === "boolean") {
        i.checked = s[i.id];
      }
    }
  })();
  settingsPop.addEventListener("change", saveSettings);

  // print page-break mode (radio): one/two questions per page, or none. Only affects print.
  const applyPageMode = () => {
    const mode = document.querySelector('input[name="pageMode"]:checked').value;
    document.body.classList.toggle("brudnopis-auto", mode === "auto");
    document.body.classList.toggle("brudnopis-half", mode === "half");
    document.body.classList.toggle("brudnopis-full", mode === "full");
    document.body.classList.toggle("brudnopis-off", mode === "off"); // hides the per-question override buttons

    // 'off' → no brudnopis-auto/half/full class → continuous print
    // default (unpinned) buttons show what "auto" now resolves to; pinned ones keep their own size
    for (const btn of qlist.querySelectorAll(".brudtoggle")) {
      if (btn.dataset.brud) {
        continue;
      }
      const auto = autoBrud(btn.closest(".q").classList.contains("phalf"), mode);
      btn.textContent = brudGlyph(auto);
      btn.title = brudTitle("", auto);
    }
  };
  for (const r of document.querySelectorAll('input[name="pageMode"]')) {
    r.onchange = applyPageMode;
  }
  applyPageMode();

  // "Klucz odpowiedzi" (default on): body.print-key shows the print-only key sheet, hides inline reveals
  const keyCb = $("answerKey"),
    applyKey = () => document.body.classList.toggle("print-key", keyCb.checked);
  keyCb.onchange = applyKey;
  applyKey();

  // "Brudnopis w kratkę" (default nigdy): body.kratka draws the print-only grid; body.kratka-geomonly
  // (see app.css) then hides it on non-.geom questions so it shows only under geometry ones.
  const applyKratka = () => {
    const mode = document.querySelector('input[name="kratka"]:checked').value;
    document.body.classList.toggle("kratka", mode !== "never");
    document.body.classList.toggle("kratka-geomonly", mode === "geom");
  };
  for (const r of document.querySelectorAll('input[name="kratka"]')) {
    r.onchange = applyKratka;
  }
  applyKratka();

  // meta type toggles: each checkbox hides its tag type via a body class (default checked = shown).
  // screen uses hide-*; print uses print-* (independent — see app.css @media print), same generic wiring.
  for (const [id, cls] of [
    ["metaTitle", "hide-title"],
    ["metaWoj", "hide-woj"],
    ["metaRok", "hide-rok"],
    ["metaEtap", "hide-etap"],
    ["metaTopics", "hide-topics"],
    ["printTitle", "print-hide-title"],
    ["printWoj", "print-hide-woj"],
    ["printRok", "print-hide-rok"],
    ["printEtap", "print-hide-etap"],
    ["printTopics", "print-hide-topics"]
  ]) {
    const cb = $(id),
      apply = () => document.body.classList.toggle(cls, !cb.checked);
    cb.onchange = apply;
    apply();
  }

  // Eksperymenty — "Pokaż weryfikację AI" (default off): body.hide-ai hides the Weryfikacja facet;
  // showAI gates the AI content in renderQuestion/renderKeyEntry. Off also clears any weryf selection
  // so the hidden facet can't filter (and it drops from the hash on the next write). Runs before the
  // init applyState() below, so its weryf guard sees the right showAI.
  const aiCb = $("showAI"),
    applyAI = rerender => {
      showAI = aiCb.checked;
      document.body.classList.toggle("hide-ai", !showAI);
      if (!showAI && selections.weryf.size) {
        selections.weryf.clear();
        facetsEl.querySelectorAll('.facet[data-facet="weryf"] .facet-opt input').forEach(i => {
          i.checked = false;
        });
      }
      if (rerender) {
        writeUrl(false);
        refilter();
      }
    };
  aiCb.onchange = () => applyAI(true);
  applyAI(false);

  // "Rysunki wektorowe" (radio, default bitmap): vectorPriority sets the default figure format. Changing
  // it clears every per-question pin so all figures snap back to the new default (discarding overrides).
  const applyVector = rerender => {
    vectorPriority = document.querySelector('input[name="figFormat"]:checked').value === "vector";
    if (rerender) {
      svgOverrides.clear();
      writeUrl(false);
      update();
    } // setup call skips this: applyState restores the pins
  };
  for (const r of document.querySelectorAll('input[name="figFormat"]')) {
    r.onchange = () => applyVector(true);
  }
  applyVector(false);

  // settings popup: toggle on the gear, close on outside click or Escape
  settingsBtn.onclick = e => {
    e.stopPropagation();
    settingsPop.hidden = !settingsPop.hidden;
  };
  document.addEventListener("click", e => {
    if (!settingsPop.hidden && !e.target.closest(".settings")) {
      settingsPop.hidden = true;
    }
    if (!infotip.hidden && !e.target.closest(".info-i") && !e.target.closest(".infotip")) {
      hideInfotip();
    }
  });
  addEventListener("keydown", e => {
    if (e.key === "Escape") {
      settingsPop.hidden = true;
      hideInfotip();
    }
  });
  printBtn.onclick = () => window.print();
  clearSelBar.onclick = e => {
    // "Wyczyść zaznaczenie": clear the print selection only
    e.preventDefault();
    selectedSet.clear();
    qlist.querySelectorAll(".selectbox input").forEach(b => {
      b.checked = false;
    });
    writeUrl(false);
    update();
  };

  // click the "N zaznaczone" in the summary to copy the selected ids (", "-separated, DATA order)
  setsummary.addEventListener("click", e => {
    const sc = e.target.closest(".selcopy");
    if (sc) {
      copyText(selectedHashes().join(", "));
      flashCopied(sc);
    }
  });

  // Sheet title: click to edit inline (contentEditable). Enter/blur commits, Escape cancels.
  // An edited (non-empty) title becomes the sticky override; clearing it reverts to auto.
  sheetTitle.addEventListener("click", () => {
    if (sheetTitle.isContentEditable) {
      return;
    }
    sheetTitle.contentEditable = "true";
    sheetTitle.focus();
    getSelection().selectAllChildren(sheetTitle);
  });
  sheetTitle.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      sheetTitle.blur();
    } else if (e.key === "Escape") {
      e.preventDefault();
      sheetTitle.dataset.cancel = "1";
      sheetTitle.blur();
    }
  });
  sheetTitle.addEventListener("blur", () => {
    sheetTitle.contentEditable = "false";
    if (sheetTitle.dataset.cancel) {
      delete sheetTitle.dataset.cancel;
      setTitle();
      return;
    } // discard edits
    titleOverride = sheetTitle.textContent.trim() || null; // textContent → HTML stripped; empty → back to auto
    writeUrl(false);
    setTitle(); // reflect the committed/auto title (no re-render needed — title depends only on lastMatched)
  });

  applyState(); // restore filters from the URL hash (empty hash => same as a bare update())
});
