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
