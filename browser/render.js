// biome-ignore-all lint/correctness/noUnusedVariables: top-level bindings here are cross-file globals, used by the later classic scripts (see index.html load order)
"use strict";

// HTML producers + shared DOM widgets: the question/key-sheet renderers, the facet
// checkbox UI, the print kratka SVG and the copy/info popovers. Reads mutable app
// state (state.js, loaded after this file) at call time only — nothing here runs
// before all scripts have loaded, except the self-contained widget setup below.

// Print brudnopis kratka: the 5 mm grid must be a real inline <svg> (vector), NOT a CSS
// background-image. Chrome's print-to-PDF rasterizes background-images (gradient AND svg alike) at
// ~screen DPI, then upscales to the physical size → blurry. An inline <svg> path is emitted as
// vector (and, being foreground, prints without the "Background graphics" toggle). Defined once as a
// <defs> path in absolute px (1 CSS px = 1/96 in, so 5 mm prints true); each .scratch <use>s it and
// its own 100%-sized viewport clips the grid to the (variable) scratch height. MAX ≥ any A4 scratch.
const [GRID_DEF, GRID_SVG] = (() => {
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
    `<path id="grid5mm" d="${d}" fill="none" stroke="#d6d6d6" stroke-width="${sw}"/></defs></svg>`;

  // Just the interior grid; the frame/edges are a CSS border on the box (see app.css .grid rule),
  // which round()-snaps to whole 5 mm cells so the border sits one cell past the last line, no sliver.
  const svg = `<svg class="grid" width="100%" height="100%" aria-hidden="true"><use href="#grid5mm"/></svg>`;
  return [def, svg];
})();
document.body.insertAdjacentHTML("afterbegin", GRID_DEF); // deferred script → body exists

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

// topic tree: present leaves grouped under their catalog categories in catalog order;
// leaves missing from the catalog trail under "(poza katalogiem)". [{cat, leaves:[...]}, ...]
function topicGroups(present) {
  const has = new Set(present),
    seen = new Set(),
    out = [];
  for (const [cat, leaves] of CATALOG) {
    const hit = leaves.filter(l => has.has(l));
    if (!hit.length) {
      continue;
    }
    out.push({ cat, leaves: hit });
    for (const l of hit) {
      seen.add(l);
    }
  }
  const extra = present.filter(l => !seen.has(l)).sort();
  if (extra.length) {
    out.push({ cat: "(poza katalogiem)", leaves: extra });
  }
  return out;
}

// ordered checkbox entries for a non-topic facet ({value} rows). The topic facet builds its
// own tree in buildTopicFacet, so it never reaches here.
function facetEntries(f, present) {
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

const countSpans = {}; // facetKey -> { value: <span> }

// the ⓘ explanation button; empty string when there's no note for this row
const infoIcon = t =>
  t
    ? ` <button type="button" class="info-i" aria-label="Wyjaśnienie" data-info="${esc(t)}">ⓘ</button>`
    : "";

function buildFacetUI() {
  for (const f of FACETS) {
    countSpans[f.key] = {};
    const box = document.createElement("div");
    box.className = "facet";
    box.dataset.facet = f.key;
    if (f.key === "topic") {
      buildTopicFacet(box);
      facetsEl.append(box);
      continue;
    }
    const info = FACET_INFO[f.key] || {};
    box.innerHTML = `<div class="facet-h">${esc(f.label)}${infoIcon(info._)}</div>`;
    const ul = document.createElement("ul");
    ul.className = "facet-list";
    for (const entry of facetEntries(f, Object.keys(INDEX[f.key] || {}))) {
      const v = entry.value,
        label = f.labelFor ? f.labelFor(v) : v,
        li = document.createElement("li");
      li.className = "facet-opt";
      li.innerHTML =
        `<label><input type="checkbox" value="${esc(v)}">` +
        `<span class="opt-l">${esc(label)}</span><span class="opt-c"></span></label>` +
        infoIcon(info[v]); // ⓘ sits outside the label so clicking it never toggles the checkbox
      countSpans[f.key][v] = li.querySelector(".opt-c");
      ul.append(li);
    }
    box.append(ul);
    facetsEl.append(box);
  }
}

// The Temat facet is a tree: each present category is a parent checkbox (toggles all its
// leaves) with its leaves nested under it, plus an OR/AND mode toggle, an in-tree search box,
// and a live selected-count. Leaves stay .facet-opt so the generic selection/count/URL code
// (which targets ".facet-opt input") reaches them; the parent's .cat-check is deliberately not
// a ".facet-opt input" so it never round-trips into the URL — it's pure UI derived from leaves.
function buildTopicFacet(box) {
  box.innerHTML =
    `<div class="facet-h">Temat` +
    `<span class="topic-mode" role="radiogroup" aria-label="Dopasowanie tematów">` +
    `<span class="mode-opt"><label><input type="radio" name="topicMode" value="or" checked> dowolny</label>` +
    infoIcon("Zadanie pasuje, jeśli ma choć jeden z zaznaczonych tematów.") +
    `</span><span class="mode-opt"><label><input type="radio" name="topicMode" value="and"> każdy</label>` +
    infoIcon("Zadanie pasuje tylko wtedy, gdy ma wszystkie zaznaczone tematy naraz.") +
    `</span></span></div>` +
    `<input type="text" class="topic-search" placeholder="szukaj tematu…" aria-label="Szukaj tematu">`;
  const ul = document.createElement("ul");
  ul.className = "facet-list";
  for (const { cat, leaves } of topicGroups(Object.keys(INDEX.topic || {}))) {
    const catLi = document.createElement("li");
    catLi.className = "facet-cat";

    // parent checkbox + category label; data-label keeps the plain text for search highlighting
    catLi.innerHTML =
      `<label><input type="checkbox" class="cat-check">` +
      `<span class="cat-l" data-label="${esc(cat)}">${esc(cat)}</span></label>`;
    const kids = document.createElement("ul");
    kids.className = "topic-leaves";
    for (const v of leaves) {
      const li = document.createElement("li");
      li.className = "facet-opt";
      li.innerHTML =
        `<label><input type="checkbox" value="${esc(v)}">` +
        `<span class="opt-l" data-label="${esc(v)}">${esc(v)}</span><span class="opt-c"></span></label>` +
        infoIcon(TOPIC_DESC[v]);
      countSpans.topic[v] = li.querySelector(".opt-c");
      kids.append(li);
    }
    catLi.append(kids);
    ul.append(catLi);
  }
  box.append(ul);
  box.insertAdjacentHTML("beforeend", `<div class="topic-count"></div>`);
}

// reflect each topic parent checkbox from its leaves: all on = checked, some on = indeterminate
function syncTopicParents() {
  for (const catLi of facetsEl.querySelectorAll('.facet[data-facet="topic"] .facet-cat')) {
    const cb = catLi.querySelector(".cat-check");
    const kids = [...catLi.querySelectorAll(".facet-opt input")];
    const on = kids.filter(k => k.checked).length;
    cb.checked = on > 0 && on === kids.length;
    cb.indeterminate = on > 0 && on < kids.length;
  }
}

// wrap every case-insensitive occurrence of q (non-empty, lowercased) in <mark>; text is escaped
function highlightMatch(text, q) {
  const low = text.toLowerCase();
  let out = "",
    i = 0;
  for (;;) {
    const j = low.indexOf(q, i);
    if (j < 0) {
      return out + esc(text.slice(i));
    }
    out += `${esc(text.slice(i, j))}<mark class="thl">${esc(text.slice(j, j + q.length))}</mark>`;
    i = j + q.length;
  }
}

// live topic-tree search: show leaves whose name contains the query (a whole category shows
// when ITS name matches), hide the rest, and highlight the match. Empty query restores everything.
// Selection is untouched — this only changes what's visible.
function filterTopicTree(query) {
  const q = query.toLowerCase();
  for (const catLi of facetsEl.querySelectorAll('.facet[data-facet="topic"] .facet-cat')) {
    const catL = catLi.querySelector(".cat-l"),
      catText = catL.dataset.label,
      catMatch = !!q && catText.toLowerCase().includes(q);
    catL.innerHTML = catMatch ? highlightMatch(catText, q) : esc(catText);
    let anyLeaf = false;
    for (const leafLi of catLi.querySelectorAll(".facet-opt")) {
      const opt = leafLi.querySelector(".opt-l"),
        text = opt.dataset.label,
        leafMatch = !!q && text.toLowerCase().includes(q),
        show = !q || catMatch || leafMatch;
      leafLi.hidden = !show;
      anyLeaf = anyLeaf || show;
      opt.innerHTML = leafMatch ? highlightMatch(text, q) : esc(text);
    }
    catLi.hidden = !(!q || catMatch || anyLeaf);
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
      KEY_CORRECT: { cls: "ok", text: "Poprawność klucza potwierdzona" },
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
    p.push(` <span class="ka">Odpowiedź: <b>${answerHtml(correct)}</b></span>`);
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

// the left-gutter block (select box + optional reorder arrows) and the two per-question
// pin buttons (brudnopis size, figure format) that sit beside the question body
function questionControlsHtml(q, seq, half, override, figFmt, figDefault) {
  // left-gutter controls wrapped in one .gutter group so they dim together and hover as a unit
  const reorder =
    seq == null
      ? "" // ordered "Pokaż tylko id" mode: arrows reorder the id list, × drops it
      : `<button type="button" class="reorder remove" title="Usuń z listy id" aria-label="usuń">×</button>` +
        `<button type="button" class="reorder up" title="Przesuń w górę" aria-label="w górę"><span>▾</span></button>` +
        `<button type="button" class="reorder down" title="Przesuń w dół" aria-label="w dół">▾</button>`;
  const parts = [
    `<div class="gutter">${reorder}<label class="selectbox" title="zaznacz do wydruku"><input type="checkbox"${selectedSet.has(q.hash) ? " checked" : ""}></label></div>`
  ];

  // per-question brudnopis override, left of the eye; hidden in print & when global brudnopis is off.
  // grey glyph = the size "auto" resolves to under the current global mode; green (.on) = a pinned override.
  const autoSize = autoScratch(half, scratchMode());
  parts.push(
    `<button type="button" class="scratch-toggle${override ? " on" : ""}" title="${scratchTitle(override, autoSize)}" aria-label="brudnopis zadania" data-scratch="${override}">${scratchGlyph(override || autoSize)}</button>`
  );
  if ((q.figsvg || []).length) {
    parts.push(
      // only for questions whose figures have a vector redraw
      // glyph = current format (⊞ raster / △ vector); green (.on) = pinned away from the current default (see the click handler)
      `<button type="button" class="svgtoggle${figFmt !== figDefault ? " on" : ""}" title="${figFmt === "svg" ? "Pokaż rysunek rastrowy (PNG)" : "Pokaż rysunek wektorowy (SVG)"}" aria-label="przełącz format rysunku">${figFmt === "svg" ? "△" : "⊞"}</button>`
    );
  }

  parts.push(figSizeButtonsHtml(q)); // –/+ figure-size row; "" when the question has no figure
  return parts.filter(Boolean).join("\n");
}

// the –/+ figure-size buttons (figure-controls row); "" when there's nothing to resize.
// Both light green (.on) while a size is pinned for this question.
function figSizeButtonsHtml(q) {
  if (!(q.figures || []).length) {
    return "";
  }
  const on = figSizeOverrides.get(q.hash) ? " on" : "";
  return (
    `<button type="button" class="figsize dec${on}" title="Zmniejsz rysunek" aria-label="zmniejsz rysunek" data-dir="-1">−</button>` +
    `<button type="button" class="figsize inc${on}" title="Powiększ rysunek" aria-label="powiększ rysunek" data-dir="1">+</button>`
  );
}

// the lazy <img> tags for a question's figures, honouring the current format pin
function figuresHtml(q, figFmt) {
  const hasSvg = new Set(q.figsvg || []);
  const step = figSizeOverrides.get(q.hash) || 0;

  // per-question size pin (CSS zoom; prints too). max-width:none is load-bearing: a
  // percentage max-width re-resolves in the zoomed coordinate space and would cancel the
  // zoom out entirely — the .figs flex parent re-centers whatever overflows the column.
  const zoom = step ? ` style="zoom:${figZoom(step)};max-width:none"` : "";
  const parts = [];
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
      `<img class="fig" src="${hasVec && figFmt === "svg" ? svg : png}"${dim}${zoom}${alt} loading="lazy" alt="rysunek do zadania ${q.number}">`
    );
  }
  if (!parts.length) {
    return "";
  }
  return `<div class="figs">\n${parts.join("\n")}\n</div>`;
}

// the A–D choice list; the correct one is tagged for the reveal styling
function choicesHtml(q, correct) {
  if (!q.choices?.length) {
    return "";
  }
  const parts = ['<ol class="choices">'];
  for (const c of q.choices) {
    parts.push(
      `<li class="choice${c.label === correct ? " correct" : ""}"><span class="lbl">${esc(c.label)}.</span> ${c.html}</li>`
    );
  }
  parts.push("</ol>");
  return parts.join("\n");
}

// the collapsed answer reveal: official key (answer + derivation), the "Brak klucza"
// note, and — when the AI experiment is on — the verification badge and AI answers
function revealHtml(q) {
  const correct = q.answer?.correct;
  const sol = q.answer?.solution_html;
  const ai = showAI ? aiAnswers(q) : [],
    badge = showAI ? verifBadge(q, ai.length) : null; // no AI content unless enabled

  // the eye is always shown; no-key questions state "Brak klucza" (AI answers, if enabled, still appear below)
  const parts = [
    '<details class="reveal"><summary title="Pokaż odpowiedź"><span class="eye">👁</span></summary>'
  ];
  if (correct) {
    parts.push(`<div class="answer">Odpowiedź: <b>${answerHtml(correct)}</b></div>`);
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
  return parts.join("\n");
}

function renderQuestion(q, seq) {
  // print "Brudnopis: auto" sizing: short closed (a–d) questions get half a page (two per sheet);
  // open, true/false series and anything with a figure get a whole page.
  const half = q.type === "closed_single" && !(q.figures || []).length;
  const geom = (q.topics || []).some(t => GEOM_LEAVES.has(t)) ? " geometry" : ""; // kratka "tylko w geometrii" target
  const override = scratchOverrides.get(q.hash) || ""; // '' | 'half' | 'full' — per-question brudnopis override

  // figure format shown for this question: a per-question pin (svgOverrides) or the global default (vectorPriority).
  const figDefault = vectorPriority ? "svg" : "png",
    figFmt = svgOverrides.get(q.hash) || figDefault;

  // meta tags inline in the header, right-aligned; each type toggled from the settings popup
  const metaHtml = [
    q.wojewodztwo && `<span class="tag ctx region">${esc(q.wojewodztwo)}</span>`,
    q.school_year && `<span class="tag ctx year">${esc(q.school_year)}</span>`,
    q.stage && `<span class="tag ctx stage">${esc(q.stage)}</span>`,
    ...(q.topics || []).map(t => `<span class="tag topic">${esc(t)}</span>`)
  ]
    .filter(Boolean)
    .join("");
  return [
    `<article class="q ${half ? "phalf" : "pfull"}${geom}${override ? ` scratch-pin-${override}` : ""}" id="${esc(q.id)}" data-hash="${q.hash}">`,
    questionControlsHtml(q, seq, half, override, figFmt, figDefault),
    '<div class="qbody">', // wraps the content so the print brudnopis .scratch below can flex-fill the rest of the page
    `<div class="qhead"><span class="qnum">Zadanie ${seq ?? q.number}.</span>` +
      `<span class="qid">(${q.points}p, <span class="hash" title="kliknij, aby skopiować id">${q.hash}</span>)</span>` +
      `<span class="qmeta">${metaHtml}</span></div>`,
    `<div class="prompt">${q.prompt_html}</div>`,
    figuresHtml(q, figFmt),
    choicesHtml(q, q.answer?.correct),
    revealHtml(q),
    "</div>", // /.qbody
    `<div class="scratch" aria-hidden="true">${GRID_SVG}</div>`, // print brudnopis filler (grows to fill the reserved page space; carries the 5 mm kratka)
    "</article>"
  ]
    .filter(Boolean)
    .join("\n");
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
