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
  podejrzany: "Klucz prawdopodobnie błędny",
  sprawdzony: "Poprawność klucza potwierdzona",
  bezklucza: "Bez klucza",
  niepewne: "Niepewna odpowiedź AI",
  nieroz: "Nierozstrzygnięte",
  anulowane: "Zadanie anulowane"
};

// which model(s) produced an answer, for labelling AI answers in the reveal
const MODEL_LABELS = {
  sonnet: "Sonnet",
  "opus+sonnet": "Sonnet + Opus",
  opus: "Opus",
  fable: "Fable",
  "sonnet+fable": "Sonnet + Fable",
  "opus+fable": "Opus + Fable",
  "opus+sonnet+fable": "Sonnet + Opus + Fable"
};

// "W pamięci": per-question judgements (q.mental / q.mental_hint), not a text heuristic — every
// question was solved by an Opus pass that then ruled whether a pupil could do it with nothing
// written down. Two levels only; absent = not a head task. Values are wire format (URL hash).
// The glyph doubles as the per-question marker: 🧠 you just compute it, 💡 you need the idea.
const MENTAL_LABELS = { wprost: "Od ręki", pomysl: "Z pomysłem" };
const MENTAL_GLYPH = { wprost: "🧠", pomysl: "💡" };
const MENTAL_TITLE = {
  wprost: "W pamięci — liczysz od ręki",
  pomysl: "W pamięci — jedno spostrzeżenie i zadanie się zwija"
};

// explanations behind the ⓘ info icons; `_` is the facet-header note. Only facets/values listed here get an icon.
const FACET_INFO = {
  weryf: {
    _: "Każde zadanie zostało niezależnie rozwiązane przez AI i porównane z oficjalnym kluczem odpowiedzi. Filtr pokazuje wynik tej weryfikacji, m.in. prawdopodobne błędy w kluczach.",
    zgodne: "Odpowiedź AI, uzyskana bez podglądania klucza, zgadza się z oficjalnym kluczem.",
    podejrzany:
      "AI podało inną odpowiedź niż klucz, a analiza AI z kluczem na widoku wskazuje na błąd po stronie organizatora — w samym kluczu albo w jego uzasadnieniu. Przy zadaniu jest wyjaśnienie.",
    sprawdzony:
      "AI początkowo podało inną odpowiedź niż klucz; analiza AI z kluczem na widoku potwierdziła, że klucz jest poprawny, a pomyliło się AI. Przy zadaniu jest wyjaśnienie pomyłki.",
    bezklucza:
      "Organizator nie opublikował klucza. Pokazywana odpowiedź pochodzi od AI — zwykle od dwóch modeli, które rozwiązały zadanie niezależnie i doszły do tego samego wyniku.",
    nieroz:
      "Odpowiedzi AI nie dało się porównać z kluczem — np. klucz jest rysunkiem, którego nie ma w danych.",
    anulowane:
      "Zadanie anulowane przez organizatora (zwykle błąd w treści), zadanie nie ma poprawnej odpowiedzi. Weryfikacja AI nie została przeprowadzona."
  },
  fig: {
    bezsvg: "Zadania z rysunkiem bitmapowym, który nie ma jeszcze wektorowej przerysówki (SVG)."
  },
  powt: {
    _: "Zadania, które pojawiają się w archiwum więcej niż raz. Klik w chip ×N/~N przy zadaniu pokazuje wszystkie wystąpienia.",
    duplikat:
      "To samo zadanie wydrukowane także na innym arkuszu, czasem z przetasowanymi odpowiedziami lub drobnie przeredagowane — chip ×N.",
    wariant:
      "Ten sam schemat zadania z innymi liczbami (lub w innym ujęciu) na innym arkuszu — rozwiązanie go to nadal świeży trening — chip ~N."
  },
  pamiec: {
    _: "Zadania do policzenia bez kartki. Każde zadanie zostało w tym celu rozwiązane przez AI, która oceniła, czy da się je zrobić w głowie — nie decyduje o tym ani długość treści, ani wielkość liczb. Przy zadaniu jest 🧠/💡 i podpowiedź, od czego zacząć.",
    wprost:
      "Liczysz wprost: krótki rachunek, odczyt z rysunku albo kilka prostych kroków. Bez triku, ale i bez kartki.",
    pomysl:
      "Na kartce byłaby dłuższa robota, ale jedno spostrzeżenie zwija zadanie do kilkunastu sekund. To sedno zasady „najpierw uprość, potem licz”."
  }
};

// `weryf` values for a question with no official key — its own function only to keep the
// facet below under Biome's complexity limit
const keylessVerif = (q, m) => {
  // an annulled question has no key because there is nothing to answer — a different gap than
  // a paper published without answers, and the AI answers on it mean nothing
  if (/anulowan/i.test(q.prompt_html)) {
    return ["anulowane"];
  }
  return m.corroborated === false ? ["bezklucza", "niepewne"] : ["bezklucza"];
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

    // the data's own judgement — the per-question display override (mentalOverrides) deliberately
    // does not filter: it only turns the marker on/off on screen and in print
    values: q => (q.mental ? [q.mental] : []),
    order: ["wprost", "pomysl"],
    labelFor: v => MENTAL_LABELS[v] || v
  },
  {
    key: "sol",
    label: "Rozwiązanie",
    values: q => [
      q.sol_ai || q.answer?.model?.solution_html || q.answer?.solution_html ? "z" : "bez"
    ],
    order: ["z", "bez"],
    labelFor: v => (v === "z" ? "Z rozwiązaniem" : "Bez rozwiązania")
  },
  {
    key: "powt",
    label: "Powtórki",

    // build.mjs stamps the clusters into q.dup / q.sim; a question can be in both
    values: q => {
      const o = [];
      if (q.dup) {
        o.push("duplikat");
      }
      if (q.sim) {
        o.push("wariant");
      }
      return o;
    },
    order: ["duplikat", "wariant"],
    labelFor: v => (v === "duplikat" ? "Z duplikatem" : "Z wariantem")
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
    label: "Weryfikacja AI",
    values: q => {
      const a = q.answer || {},
        m = a.model || {},
        hasKey = a.correct != null && a.correct !== "",
        o = [];
      // a key checked and confirmed is no longer suspect: those rows keep their badge and
      // explanation, but belong in `sprawdzony` (the AI erred), not among the likely-wrong keys
      if (q.suspect) {
        o.push(q.suspect_verdict === "KEY_CORRECT" ? "sprawdzony" : "podejrzany");
      }
      if (!hasKey) {
        o.push(...keylessVerif(q, m));
      } else if (m.agrees === true) {
        o.push("zgodne");
      } else if (m.agrees === false) {
        // an adjudicated dissent is settled and lives in its verdict's bucket (`podejrzany` /
        // `sprawdzony`) with an explanation; this one keeps only disputes nobody has ruled on,
        // so it is empty today and stays as the landing spot for the next blind-solve pass
        if (!q.suspect_verdict) {
          o.push("rozbiezne");
        }
      } else {
        o.push("nieroz");
      }
      return o;
    },
    order: [
      "zgodne",
      "sprawdzony",
      "podejrzany",
      "rozbiezne",
      "bezklucza",
      "niepewne",
      "nieroz",
      "anulowane"
    ],
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

// per-question figure size: the –/+ buttons nudge an integer step, each ~15%, clamped so a
// figure can't shrink away or blow up. 0 = default (never stored/serialized). Applied as CSS
// zoom, which scales any figure (width attr or not) and reflows — unlike transform: scale.
const FIG_STEP_MIN = -6,
  FIG_STEP_MAX = 10;
const clampFigStep = n => Math.max(FIG_STEP_MIN, Math.min(FIG_STEP_MAX, n));
const figZoom = step => (1.15 ** step).toFixed(3);

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
