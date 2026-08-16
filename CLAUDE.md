# CLAUDE.md

Guidance for working in this repository. Read it before writing or changing code.

## What this is

`konkurs-mat` is a searchable practice bank of past Polish regional math-competition
papers (see `README.md`). Two halves:

- **The data pipeline** — official PDFs under `pdfs/` turned into per-question JSON in
  `data/questions/` (the **source of truth**), largely by LLM agents. Everything else
  `build.mjs` reads also lives under `data/`: campaign sidecars (`solutions/`, `mental/`,
  `dups/`), `categories.json`, `suspected_key_errors.tsv`. Procedures live in
  `SCHEMA.md` and `dev/docs/EXTRACTION_PLAYBOOK.md`; one-off pipeline tools in `dev/scripts/`.
- **The browser app** — a static, no-build question browser (`browser/`). `build.mjs`
  generates the data shards (`data.*.js` / `data.*.json`) and `catalog.js` from the JSON;
  generated files are not committed.

## Working principles

Adapted from Karpathy's coding guidelines.

### 1. Think before coding
State assumptions explicitly; if uncertain, ask. If there are multiple interpretations,
present them — don't silently pick one. If a simpler approach exists, say so. When
something is unclear, stop and name what's confusing.

### 2. Simplicity first
Write the minimum code that solves the problem. No features beyond what was asked, no
abstractions for single-use code, no configurability that wasn't requested, no error
handling for impossible scenarios.

### 3. Surgical changes
Touch only what the task requires. Don't "improve" adjacent code, comments, or formatting;
match the existing style even if you'd do it differently. Remove imports/variables your
change orphaned, but leave pre-existing dead code alone (mention it instead). Every
changed line should trace to the request.

### 4. Goal-driven execution
Turn tasks into verifiable goals: "fix the bug" → "show it broken in the browser, then
show it fixed". For pure logic, a node test (the `facets.test.cjs` pattern) is the right
success criterion. Loop until the verification commands below pass.

## Project conventions

### The no-build invariant
The browser app must run **both** off `file://` (open `index.html` directly) and over
http(s). That means:

- **Classic scripts only** — no ESM (`import` fails on `file://`), no framework, no build
  step, no runtime dependencies (Biome is dev-only).
- Scripts share the global lexical environment; the `<script defer>` order in
  `index.html` is load-bearing: `facets → catalog → defs → render → state → app`.
- Pure, DOM-free logic goes in UMD modules with node tests (`facets.js` +
  `facets.test.cjs`); everything else is plain top-level script code.
- Biome analyzes each file in isolation, so cross-file globals need the documented
  suppressions (`biome-ignore-all` headers, the `useConst` ignores in `state.js`). When
  adding a global that a *later* file reassigns, keep it `let` and say why.

### Escaping
Every interpolated data value goes through `esc()`. The named exceptions, trusted HTML by
design: `*_html` fields (`prompt_html`, `choices[].html`, `solution_html`) and
`answer.correct` via `answerHtml()` (plain text escaped, `<math...` passed through).
Don't widen this surface.

### Wire formats are frozen
Renaming any of these silently breaks shared URLs or saved settings — the Polish names
there are deliberate:

- **URL hash** keys and values (`woj`, `etap`, `weryf`, `tak/nie`, `z/bez`, `bh/bf/fr/fv`,
  …) — see `serialize()`/`applyState()` in `state.js`.
- **localStorage** `'zadania-settings'` and the input ids/names stored in it (`metaWoj`,
  radio `name="kratka"`, …).
- **The JSON data schema** (`q.wojewodztwo`, stage values, …) — see `SCHEMA.md`.

New UI state must pick its home deliberately: URL hash = shareable view state (goes
through `writeUrl`; facet toggles push history, the rest replaces), localStorage = device
settings, in-memory Maps keyed by hash = per-question overrides.

### Comment style
- Put a **blank line before every whole-line `//` comment block.** Biome doesn't enforce
  this; do it by hand.
- Comments explain **why**, not what — well-named code already says what it does.
- UI strings are Polish; identifiers are English (wire formats above excepted).

### Formatting (Biome 2.5.x)
Biome owns mechanical formatting — don't hand-format, let `npm run check:fix` do it.
Generated files, `data/`, `pdfs/` and `dev/` are excluded (see
`biome.json`). Conventions Biome **doesn't** enforce, do by hand:
- The blank line before `//` comment blocks (above).
- Always use `{ }`, even for single-statement bodies — Biome flags this
  (`useBlockStatements`) but write it that way to begin with.

Never blanket-run `biome check --write --unsafe` on the browser files: unsafe fixes are
applied per-file and have already tried to remove load-bearing `'use strict'` directives
and to `const`-ify cross-file globals. Apply unsafe fixes selectively and re-verify in
the browser.

## Before you commit

Run from the repo root and make sure each passes:

```sh
npm run check      # biome lint + format check (use check:fix to auto-fix)
npm test           # node browser/facets.test.cjs
cd browser && node build.mjs   # rebuild the data shards
```

For browser changes, also:
- Load the app **both ways**: serve `browser/` over http AND open `index.html` via
  `file://` — the data-loading paths differ.
- If you touched state/URL code: exercise a hash round trip (filters + pins + title),
  and paste an old-format URL to confirm wire compat.
- If you touched print CSS or the scratchpad/grid machinery: print-preview — it's
  print-only and breaks silently on screen.

## Git etiquette
- **Only commit when explicitly asked.**
- Stage specific files by name; never `git add -A`.
- Commit message style: `<area>: <imperative summary>` matching the existing history
  (e.g. `Browser: add editable sheet title`).
- Don't push, force-push, or amend published commits unless asked.
