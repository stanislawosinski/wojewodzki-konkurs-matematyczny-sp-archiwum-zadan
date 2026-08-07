// biome-ignore-all lint/correctness/noUnusedVariables: top-level bindings here are cross-file globals, used by the later classic scripts (see index.html load order)
"use strict";

// Static definitions + small pure helpers shared by the whole app: the facet catalog,
// UI label maps, escaping and Polish plurals. No DOM access, no mutable state.
// Load order (index.html): facets.js → catalog.js → defs.js → render.js → state.js → app.js;
// classic deferred scripts share the global lexical environment, so top-level bindings
// declared here are visible to the later files.

// Two-level catalog: category -> ordered leaves. Generated from categories.json (the single source of
// truth) by build.mjs into catalog.js, loaded via <script> before this file — no hand-copy to drift.
const CATALOG = window.CATALOG || []; // ponytail: [] if catalog.js is missing/unbuilt → empty topic facet, not a crash

// leaf topic -> description, for the ⓘ info popovers in the Temat tree. Same source as CATALOG
// (categories.json → build.mjs), so it can't drift. {} when unbuilt → topics just get no icon.
const TOPIC_DESC = window.TOPIC_DESC || {};

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

// The faceted filters. `values(q)` mirrors build.mjs so a missing index can be
// rebuilt from DATA; `order` fixes non-alphabetical display order; `labelFor` prettifies.
// Facet keys and their values are wire format (serialized into URL hashes) — do not rename.
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

// Signals the "W pamięci" presets below are built from. Derived from the question text at index
// time — nothing is stored in the data, so retuning a threshold is an edit here plus a reload.
const plainText = html => String(html || "").replace(/<[^>]*>/g, " ");
const promptLen = q => plainText(q.prompt_html).replace(/\s+/g, " ").trim().length;
const demandsWork = q =>
  /uzasadnij|wykaż|udowodnij|zapisz oblicz|opisz sposób|przedstaw oblicz|zapisz rozwiąz/i.test(
    plainText(q.prompt_html)
  );

// biggest number anywhere in the question; 0 when it has no digits at all (a purely verbal task)
function biggestNumber(q) {
  const text = plainText(q.prompt_html) + (q.choices || []).map(c => plainText(c.html)).join(" ");
  let max = 0;
  for (const n of text.match(/\d+(?:[.,]\d+)?/g) || []) {
    max = Math.max(max, Number.parseFloat(n.replace(",", ".")));
  }
  return max;
}

// Ready-made "can I do this in my head?" heuristics — one click each, and a question may match
// several. `desc` is the ⓘ note on that row, so the thresholds are always visible in the UI.
// Keys are wire format (URL hash) — do not rename. blysk ⊂ std by construction.
const MENTAL_PRESETS = [
  {
    key: "blysk",
    label: "Błyskawiczne",
    desc: "Zadanie zamknięte za 1 punkt, treść do 120 znaków, żadna liczba nie przekracza 20, bez rysunku.",
    test: q =>
      q.type !== "open" &&
      q.points <= 1 &&
      !q.figures?.length &&
      promptLen(q) <= 120 &&
      biggestNumber(q) <= 20
  },
  {
    key: "std",
    label: "Standardowe",
    desc: "Zamknięte albo prawda/fałsz najwyżej za 2 punkty, treść do 250 znaków, liczby do 100, bez rysunku.",
    test: q =>
      q.type !== "open" &&
      q.points <= 2 &&
      !q.figures?.length &&
      promptLen(q) <= 250 &&
      biggestNumber(q) <= 100
  },
  {
    key: "rys",
    label: "Z rysunkiem",
    desc: "Zadanie ma rysunek — geometria, którą ogarniasz wzrokiem, bez dorysowywania czegokolwiek.",
    test: q =>
      q.type !== "open" &&
      q.points <= 2 &&
      q.figures?.length &&
      promptLen(q) <= 250 &&
      biggestNumber(q) <= 100
  },
  {
    key: "otw",
    label: "Bez podpowiedzi",
    desc: "Zadania otwarte: wynik podajesz sam, nie ma czego zgadywać z podanych odpowiedzi. Treść do 200 znaków, liczby do 100, bez żądania uzasadnienia.",
    test: q =>
      q.type === "open" &&
      q.points <= 2 &&
      !q.figures?.length &&
      promptLen(q) <= 200 &&
      biggestNumber(q) <= 100 &&
      !demandsWork(q)
  }
];
const MENTAL_LABELS = Object.fromEntries(MENTAL_PRESETS.map(p => [p.key, p.label]));

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
  },
  fig: {
    bezsvg: "Zadania z rysunkiem bitmapowym, który nie ma jeszcze wektorowej przerysówki (SVG)."
  },
  pamiec: {
    _: "Gotowe zestawy warunków do liczenia bez kartki, przydatne przy przeglądaniu na telefonie. Zadanie może pasować do kilku naraz.",
    ...Object.fromEntries(MENTAL_PRESETS.map(p => [p.key, p.desc]))
  }
};
const FACETS = [
  { key: "topic", label: "Temat", values: q => q.topics || [] },
  { key: "etap", label: "Etap", values: q => [q.stage], order: STAGES },
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
    key: "form",
    label: "Forma",
    values: q => [q.type],
    order: Object.keys(TYPE_LABELS),
    labelFor: v => TYPE_LABELS[v] || v
  },
  {
    key: "fig",
    label: "Rysunek",
    values: q => {
      const o = [q.figures?.length ? "z" : "bez"];

      // figsvg ⊆ figures, so a length mismatch means some bitmap still lacks an SVG redraw
      if (q.figures?.length && (q.figsvg?.length || 0) < q.figures.length) {
        o.push("bezsvg");
      }
      return o;
    },
    order: ["z", "bezsvg", "bez"],
    labelFor: v =>
      v === "z" ? "Z rysunkiem" : v === "bezsvg" ? "Bez wersji wektorowej" : "Bez rysunku"
  },
  {
    key: "pamiec",
    label: "W pamięci",
    values: q => MENTAL_PRESETS.filter(p => p.test(q)).map(p => p.key),
    order: MENTAL_PRESETS.map(p => p.key),
    labelFor: v => MENTAL_LABELS[v] || v
  },
  {
    key: "sol",
    label: "Rozwiązanie",
    values: q => [q.answer?.model?.solution_html || q.answer?.solution_html ? "z" : "bez"],
    order: ["z", "bez"],
    labelFor: v => (v === "z" ? "Z rozwiązaniem" : "Bez rozwiązania")
  },
  {
    key: "annul",
    label: "Anulowane",
    values: q => [q.annulled ? "tak" : "nie"],
    order: ["nie", "tak"],
    labelFor: v => (v === "tak" ? "Anulowane" : "Nie anulowane")
  },
  {
    key: "school",
    label: "Typ szkoły",
    values: q => [q.school_type],
    order: Object.keys(SCHOOL_LABELS),
    labelFor: v => SCHOOL_LABELS[v] || v
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

// The favicon mark derived from a sheet title: a part number ("Kąty, cz. 2: …" /
// "część 2" → "2"), else the first number, else the first letter uppercased; "" = no mark.
function markFromTitle(title) {
  const t = String(title || "");
  const part = t.match(/\b(?:cz\.?|część)\s*(\d+)/iu);
  if (part) {
    return part[1];
  }
  const num = t.match(/\d+/);
  if (num) {
    return num[0];
  }
  const letter = t.match(/\p{L}/u);
  return letter ? letter[0].toUpperCase() : "";
}

// favicon.svg with the mark as the radicand: the radical's tick is squeezed left and drawn
// thinner than in browser/favicon.svg (whose rect/grid this duplicates — keep in sync) so
// the mark can fill the space under the bar; the text's alphabetic baseline sits on the
// tick's bottom vertex, like real radical typesetting, and multi-digit marks shrink to fit.
// Inlined instead of drawn on a canvas because a file://-loaded image taints the canvas
// and toDataURL throws.
function faviconWithMarker(ch) {
  const n = [...ch].length;
  const size = n === 1 ? 20 : n === 2 ? 14 : 9;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">` +
    `<rect width="32" height="32" rx="6.5" fill="#34406e"/>` +
    `<g stroke="#4d5b93" stroke-width="1">` +
    `<path d="M4 10H28 M4 16H28 M4 22H28 M10 4V28 M16 4V28 M22 4V28"/></g>` +
    `<path d="M2.5 16.5 L5.5 25.5 L8.5 6 L29.5 6" fill="none" stroke="#f0f2fa"` +
    ` stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<text x="19.5" y="25.5" font-family="system-ui, sans-serif" font-size="${size}"` +
    ` font-weight="600" fill="#f0f2fa" text-anchor="middle">${esc(ch)}</text>` +
    `</svg>`
  );
}

// answer.correct is either plain text (escape it — answers like "a < b" would otherwise
// eat the rest of the line as a bogus tag) or, by schema, raw MathML (pass through)
const answerHtml = v => (String(v).startsWith("<math") ? v : esc(v));

const idList = s => (s.match(/[0-9a-f]{8}/gi) || []).map(x => x.toLowerCase());

const scratchGlyph = s => (s === "half" ? "½" : s === "full" ? "1" : "–");

// what the global brudnopis mode gives one question: short-closed (phalf) → half, else full; half/full force it
const autoScratch = (phalf, mode) =>
  mode === "half" ? "half" : mode === "full" ? "full" : phalf ? "half" : "full";
const scratchTitle = (override, auto) =>
  "Brudnopis dla tego zadania: " +
  (override === "half"
    ? "pół strony (wymuszone)"
    : override === "full"
      ? "cała strona (wymuszone)"
      : `domyślny — ${auto === "half" ? "pół strony" : "cała strona"}`);

const capitalize = s => (s ? s[0].toUpperCase() + s.slice(1) : s);

// Polish plurals — isPolishFew = the 2/3/4 branch (not 12–14); the "one" form covers 1 (and 2–4 too here)
const isPolishFew = n => n % 10 >= 2 && n % 10 <= 4 && !(n % 100 >= 12 && n % 100 <= 14);
const pluralQuestions = n => (n === 1 ? "zadanie" : isPolishFew(n) ? "zadania" : "zadań");
const pluralSelected = n => (n === 1 || isPolishFew(n) ? "zaznaczone" : "zaznaczonych");
const pluralTopics = n => (n === 1 ? "temat" : isPolishFew(n) ? "tematy" : "tematów");

const debounce = (fn, ms) => {
  let t;
  return () => {
    clearTimeout(t);
    t = setTimeout(fn, ms);
  };
};
