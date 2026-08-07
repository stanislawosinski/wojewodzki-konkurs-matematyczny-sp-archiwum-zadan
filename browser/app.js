"use strict";

// Question browser: loads per-stage data shards, filters in memory, renders at most
// PAGE_SIZE questions into the DOM (paged). Runs off file:// and http(s). The facet
// index is built from DATA at startup (~1 ms); facet counts (browser/facets.js) update
// live per the drill-down rule.
//
// This file orchestrates: update() (filter → page → render) and the event wiring.
// Definitions live in defs.js, HTML producers in render.js, state + URL-hash
// serialization in state.js — classic deferred scripts sharing the global scope,
// loaded in that order (see index.html).

// phone layout active? Mirrors the app.css phone block — the 600 must stay in sync with it.
// Checked at event time, so crossing the breakpoint needs no resize listeners.
const isPhone = () => matchMedia("(max-width: 600px)").matches;

function update() {
  const incIds = idList(inc.value),
    useInc = incIds.length > 0;
  const excSet = new Set(idList(exc.value));
  const terms = search.value.toLowerCase().split(/\s+/).filter(Boolean);

  // topic AND mode: a question must carry ALL selected topics (default OR = any of them)
  const andKeys = topicAnd ? new Set(["topic"]) : new Set();

  let matched, countSel, countGate;
  if (useInc) {
    // "Pokaż tylko id" is an override: exactly those ids, in pasted order, deduped
    const seen = new Set();
    matched = incIds.filter(h => byHash[h] && !seen.has(h) && seen.add(h)).map(h => byHash[h]);
    const shown = new Set(matched.map(q => q.hash)); // facets inert; counts describe the shown set
    countSel = EMPTY_SELECTIONS;
    countGate = h => shown.has(h);
  } else {
    const gate = h =>
      !excSet.has(h) &&
      (showPrzyroda || !byHash[h].topics?.includes("przyroda")) &&
      terms.every(t => byHash[h]._search.includes(t));
    const hits = new Set(Facets.matchedHashes(INDEX, selections, gate, universe, andKeys));
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
    const counts = Facets.facetCounts(INDEX, countSel, countGate, f.key, universe, andKeys);
    const spans = countSpans[f.key];
    for (const v in spans) {
      const n = counts[v] || 0;
      spans[v].textContent = n;
      spans[v].closest(".facet-opt").classList.toggle("dim", n === 0 && !selections[f.key].has(v));
    }
  }

  // topic selected-count (independent of the tree's own search box, which only hides rows)
  const kTopics = selections.topic.size;
  topicCountEl.innerHTML = kTopics
    ? `Zaznaczono ${kTopics} ${pluralTopics(kTopics)} <button type="button" class="topic-clear">(wyczyść)</button>`
    : "";

  const anyFacet = FACETS.some(f => selections[f.key].size);
  const active = useInc || excSet.size > 0 || terms.length > 0 || anyFacet;
  clearFilters.hidden = !active; // "Wyczyść wszystko": any filtering at all
  clearFacets.hidden = !anyFacet; // "Wyczyść filtry": facet checkboxes only
  clearRow.hidden = !active; // their sidebar row collapses with them (kills its flex-gap slot)

  // phone hamburger badge (iPhone-style count bubble on the ☰ corner); runs at all widths
  // (harmless while the button is display:none)
  const nSel = FACETS.reduce((n, f) => n + selections[f.key].size, 0);
  filtersBadge.textContent = nSel || "";
  filtersBadge.hidden = !nSel;

  // keep --tbh (the snap-mode scroll offsets) in step with the real topbar height, which the
  // button toggles above can change. Not re-measured on resize — a rotation while in snap mode
  // shows stale offsets until the next filter change, accepted.
  document.documentElement.style.setProperty(
    "--tbh",
    `${document.querySelector(".topbar").offsetHeight}px`
  );
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
    `${shownCount} ${pluralQuestions(shownCount)}` +
    (k
      ? ` (<span class="selcopy" title="kliknij, aby skopiować listę id">${k} ${pluralSelected(k)}</span>)`
      : "");
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
  syncTopicParents(); // clear the derived parent checkboxes (checked/indeterminate) too
}

// Temat "(wyczyść)": drop just the topic selection (state + its checkboxes), push + refilter
function clearTopicSelection() {
  selections.topic.clear();
  facetsEl.querySelectorAll('.facet[data-facet="topic"] .facet-opt input').forEach(i => {
    i.checked = false;
  });
  syncTopicParents(); // clear the derived parent checkboxes too
  writeUrl(true);
  refilter(); // push, so Back restores the cleared topics
}

// reset every filter (facets + search + include/exclude); leaves the print selection alone
function clearAllFilters() {
  clearFacetSelections();
  search.value = inc.value = exc.value = "";
  writeUrl(true);
  refilter(); // push, so Back restores the filters you cleared
}

// Temat parent checkbox: select/deselect every present leaf under this category
function toggleTopicCategory(catCheck) {
  const on = catCheck.checked;
  for (const leaf of catCheck.closest(".facet-cat").querySelectorAll(".facet-opt input")) {
    leaf.checked = on;
    on ? selections.topic.add(leaf.value) : selections.topic.delete(leaf.value);
  }
  catCheck.indeterminate = false;
}

// delegated facet change: mode toggle, parent checkbox, or a leaf toggle — all push + refilter
function onFacetChange(e) {
  const t = e.target;

  // Temat AND/OR mode: reshapes the whole result set, so re-filter like a facet toggle
  if (t.matches('input[name="topicMode"]')) {
    topicAnd = t.value === "and";
  } else if (t.matches(".cat-check")) {
    toggleTopicCategory(t);
  } else if (t.matches(".facet-opt input")) {
    const key = t.closest(".facet").dataset.facet;
    t.checked ? selections[key].add(t.value) : selections[key].delete(t.value);
    if (key === "topic") {
      syncTopicParents(); // keep the parent checkbox/indeterminate in step with its leaves
    }
  } else {
    return;
  }
  writeUrl(true);
  refilter(); // push, so Back undoes it
}

function wireFacets() {
  facetsEl.addEventListener("change", onFacetChange);
  facetsEl.addEventListener("click", e => {
    // ⓘ info icons: show the explanation popover
    const icon = e.target.closest(".info-i");
    if (icon) {
      e.preventDefault();
      e.stopPropagation();
      showInfotip(icon, icon.dataset.info);
      return;
    }

    // "(wyczyść)" next to the topic selected-count
    if (e.target.closest(".topic-clear")) {
      clearTopicSelection();
    }
  });

  // in-tree topic search: purely visual (hide/highlight rows); never touches the filter or URL
  topicSearchEl.oninput = () => filterTopicTree(topicSearchEl.value.trim());
}

function wireSearch() {
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
}

function wirePagers() {
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
}

function wireQlist() {
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
  // one delegate for the per-question controls; each action has its own handler below
  qlist.addEventListener("click", e => {
    const qnum = e.target.closest(".qnum"); // click "Zadanie N" to flip its print checkbox
    if (qnum) {
      if (isPhone()) {
        return; // the checkbox is hidden on phones — don't silently edit the selection
      }
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
      toggleFigureFormat(svgBtn);
      return;
    }
    const scratchBtn = e.target.closest(".scratch-toggle"); // –/½/1: per-question brudnopis override (print reserved space)
    if (scratchBtn) {
      toggleScratchPin(scratchBtn);
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
    if (btn) {
      reorderIdList(btn);
    }
  });
}

function toggleFigureFormat(svgBtn) {
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
}

function toggleScratchPin(scratchBtn) {
  const q = scratchBtn.closest(".q"),
    h = q.dataset.hash;
  const auto = autoScratch(q.classList.contains("phalf"), scratchMode());

  // 2-state toggle: default (grey = auto) ↔ the only override that changes the size (the value ≠ auto).
  // Pinning the value equal to auto is dropped — it wouldn't change the print, just grey→green.
  const s = scratchBtn.dataset.scratch ? "" : auto === "half" ? "full" : "half";
  scratchBtn.dataset.scratch = s;
  scratchBtn.textContent = scratchGlyph(s || auto); // grey shows the auto size, green the pinned size
  scratchBtn.title = scratchTitle(s, auto);
  scratchBtn.classList.toggle("on", !!s);
  q.classList.toggle("scratch-pin-half", s === "half");
  q.classList.toggle("scratch-pin-full", s === "full");
  if (s) {
    scratchOverrides.set(h, s);
  } else {
    scratchOverrides.delete(h); // scratchOverrides is the truth; render + hash read it
  }
  writeUrl(false);
}

function reorderIdList(btn) {
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
}

function wireToolbar() {
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
  printBtn.onclick = () => window.print();

  // Dark-mode toggle: a device setting with its own localStorage key (separate from the settings
  // blob). The initial class is set pre-paint by the inline <head> script; here we sync the glyph.
  const syncThemeButton = () => {
    const dark = document.documentElement.classList.contains("dark");
    themeBtn.textContent = dark ? "☀" : "🌙";
    themeBtn.title = dark ? "Włącz jasny motyw" : "Włącz ciemny motyw";
  };
  syncThemeButton();
  themeBtn.onclick = () => {
    const dark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch (_e) {
      // localStorage blocked → theme just won't persist
    }
    syncThemeButton();
  };
  // phone filter drawer: body class only (all mechanics in the app.css phone block); the
  // outside-click and Escape closers live with the settings ones in wireSettings()
  filtersBtn.onclick = e => {
    e.stopPropagation();
    document.body.classList.toggle("drawer-open");
  };
  drawerClose.onclick = () => document.body.classList.remove("drawer-open");

  // Tryb kartkowy (phone-only button): one question per swipe via scroll-snap. Same shape as
  // the theme toggle above — html class + own localStorage key, not URL state. Class applied
  // here, before the first render, so there's no snap-in jump.
  const syncSnapButton = () => {
    const snap = document.documentElement.classList.contains("snap");
    snapBtn.textContent = snap ? "▤" : "□";
    snapBtn.title = snap ? "Wyłącz tryb kartkowy" : "Tryb kartkowy: jedno zadanie na ekran";
  };
  try {
    if (localStorage.getItem("snap") === "on") {
      document.documentElement.classList.add("snap");
    }
  } catch (_e) {
    // localStorage blocked → snap just won't persist
  }
  syncSnapButton();
  snapBtn.onclick = () => {
    const snap = document.documentElement.classList.toggle("snap");
    try {
      localStorage.setItem("snap", snap ? "on" : "off");
    } catch (_e) {
      // localStorage blocked → snap just won't persist
    }
    syncSnapButton();
  };
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
}

// Settings persistence: every settings-popup control (checkboxes by id, radios by name) in
// localStorage. ponytail: one generic pass over #settingsPop inputs, not per-control wiring.
// The key and the stored id/name strings are wire format — do not rename.
const SETTINGS_KEY = "zadania-settings";

function saveSettings() {
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
}

function restoreSettings() {
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
}

function wireSettings() {
  restoreSettings(); // BEFORE the apply* handlers below, so the body classes reflect saved state
  settingsPop.addEventListener("change", () => {
    saveSettings();
    applyMarker(); // the mark depends on two settings checkboxes (showMarker, metaTitle)
  });

  // print page-break mode (radio): one/two questions per page, or none. Only affects print.
  const applyPageMode = () => {
    const mode = document.querySelector('input[name="pageMode"]:checked').value;
    document.body.classList.toggle("scratch-auto", mode === "auto");
    document.body.classList.toggle("scratch-half", mode === "half");
    document.body.classList.toggle("scratch-full", mode === "full");
    document.body.classList.toggle("scratch-off", mode === "off"); // hides the per-question override buttons

    // 'off' → no scratch-auto/half/full class → continuous print
    // default (unpinned) buttons show what "auto" now resolves to; pinned ones keep their own size
    for (const btn of qlist.querySelectorAll(".scratch-toggle")) {
      if (btn.dataset.scratch) {
        continue;
      }
      const auto = autoScratch(btn.closest(".q").classList.contains("phalf"), mode);
      btn.textContent = scratchGlyph(auto);
      btn.title = scratchTitle("", auto);
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

  // "Brudnopis w kratkę" (default nigdy): body.grid draws the print-only grid; body.grid-geometry-only
  // (see app.css) then hides it on non-.geometry questions so it shows only under geometry ones.
  // The radio name "kratka" is wire format (localStorage settings key) — do not rename.
  const applyGrid = () => {
    const mode = document.querySelector('input[name="kratka"]:checked').value;
    document.body.classList.toggle("grid", mode !== "never");
    document.body.classList.toggle("grid-geometry-only", mode === "geom");
  };
  for (const r of document.querySelectorAll('input[name="kratka"]')) {
    r.onchange = applyGrid;
  }
  applyGrid();

  // meta type toggles: each checkbox hides its tag type via a body class (default checked = shown).
  // screen uses hide-*; print uses print-* (independent — see app.css @media print), same generic wiring.
  // The Polish ids (metaWoj, ...) are wire format — localStorage settings are keyed by them — while
  // the classes are internal and English; hence the mixed-language pairs.
  for (const [id, cls] of [
    ["metaTitle", "hide-title"],
    ["metaWoj", "hide-region"],
    ["metaRok", "hide-year"],
    ["metaEtap", "hide-stage"],
    ["metaTopics", "hide-topics"],
    ["printTitle", "print-hide-title"],
    ["printWoj", "print-hide-region"],
    ["printRok", "print-hide-year"],
    ["printEtap", "print-hide-stage"],
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

  // "Pokaż zadania przyrodnicze" (default off): the update() gate drops przyroda-tagged
  // questions, body.hide-przyroda hides their leaf in the Temat tree. Off also clears a
  // przyroda topic selection, so the hidden leaf can't keep filtering from the hash.
  const przCb = $("showPrzyroda"),
    applyPrzyroda = rerender => {
      showPrzyroda = przCb.checked;
      document.body.classList.toggle("hide-przyroda", !showPrzyroda);
      if (!showPrzyroda && selections.topic.has("przyroda")) {
        selections.topic.delete("przyroda");
        const inp = facetsEl.querySelector(
          '.facet[data-facet="topic"] .facet-opt input[value="przyroda"]'
        );
        if (inp) {
          inp.checked = false;
        }
        syncTopicParents();
      }
      if (rerender) {
        writeUrl(false);
        refilter();
      }
    };
  przCb.onchange = () => applyPrzyroda(true);
  applyPrzyroda(false);

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
  settingsClose.onclick = () => {
    settingsPop.hidden = true;
  };
  document.addEventListener("click", e => {
    if (!settingsPop.hidden && !e.target.closest(".settings")) {
      settingsPop.hidden = true;
    }
    if (!infotip.hidden && !e.target.closest(".info-i") && !e.target.closest(".infotip")) {
      hideInfotip();
    }

    // phone drawer: backdrop clicks target <body> = outside the sidebar → close
    // (the Filtry toggle itself never lands here — its handler stops propagation)
    if (!e.target.closest(".sidebar")) {
      document.body.classList.remove("drawer-open");
    }
  });
  addEventListener("keydown", e => {
    if (e.key === "Escape") {
      settingsPop.hidden = true;
      hideInfotip();
      document.body.classList.remove("drawer-open");
    }
  });
}

// Favicon mark: derived from the current sheet title (markFromTitle) when the "Marker"
// setting is on AND the title is shown on screen (the metaTitle toggle) — a hidden title
// gives no visual anchor for what the mark means. Called from setTitle() and on settings
// changes; falls back to the plain favicon file when off or markless.
function applyMarker() {
  const mark =
    $("showMarker").checked && $("metaTitle").checked
      ? markFromTitle(computeTitle(lastMatched, lastUseInc))
      : "";
  document.querySelector('link[rel="icon"]').href = mark
    ? `data:image/svg+xml,${encodeURIComponent(faviconWithMarker(mark))}`
    : "favicon.svg";
}

function wireTitle() {
  // Sheet title: click to edit inline (contentEditable). Enter/blur commits, Escape cancels.
  // An edited (non-empty) title becomes the sticky override; clearing it reverts to auto.
  sheetTitle.addEventListener("click", () => {
    // no editing on phones: the only cancel path is Escape, which mobile keyboards don't have
    if (sheetTitle.isContentEditable || isPhone()) {
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
}

function init(data) {
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
  topicSearchEl = facetsEl.querySelector(".topic-search");
  topicCountEl = facetsEl.querySelector(".topic-count");

  wireFacets();
  wireSearch();
  addEventListener("popstate", applyState);
  wirePagers();
  wireQlist();
  wireToolbar();
  wireSettings(); // before applyState, so its weryf guard sees the restored showAI
  wireTitle();

  applyState(); // restore filters from the URL hash (empty hash => same as a bare update())
}

loadData().then(init);
