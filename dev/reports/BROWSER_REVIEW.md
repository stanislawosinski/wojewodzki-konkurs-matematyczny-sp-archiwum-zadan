# Browser app review — 2026-08-17

Scope: all seven browser files (`index.html`, `app.css`, `facets.js`, `defs.js`,
`render.js`, `state.js`, `app.js`), `build.mjs`, `facets.test.cjs`; suspicious spots
verified against the built data shards.

Overall: the core is in good shape — escaping discipline is consistent, wire formats
are respected everywhere, the facets engine is clean and tested, the print machinery
carefully reasoned. Findings cluster around two themes: **the newer per-question
buttons (mental-toggle, figsize) missed three existing CSS sweeps**, and **the AI-off
default makes some screen content disagree with the facets and the printed key**.

## Bugs

> Items 1–5 **FIXED 2026-08-17** (CSS sweeps; reveal carry-over in `update()`;
> draw row moved out of `.idbox` into `.selrow.drawrow`). Verified in Chrome over
> http and file://, desktop + 400px, light + dark.

1. **Dark mode: the 🧠 override and −/+ figure-size buttons stay light.** The
   dark-surface list (`app.css:2178`) covers `.reorder`, `.reveal > summary`,
   `.scratch-toggle`, `.svgtoggle` but not `.mental-toggle` or `.figsize`, and the
   dark `.on` group (`app.css:2259`) has `.mental-toggle.on`/`.svgtoggle.on` but not
   `.figsize.on`. In dark theme those buttons are white boxes with light-mode ink —
   bright squares among correctly darkened siblings.

2. **Touch tablets: same two buttons sit permanently dimmed.** The
   `@media (hover: none)` full-opacity list (`app.css:1751`) has `.gutter`,
   `.reveal > summary`, `.scratch-toggle` — `.mental-toggle` and `.figsize` keep
   `opacity: 0.7` with no hover to ever lift it.

3. **Phones: `.mental-toggle` renders off-screen but stays focusable.** The phone
   hide list (`app.css:1779`) hides `.scratch-toggle`, `.svgtoggle`, `.figsize` — but
   not `.mental-toggle`, which sits absolutely positioned ~7rem left of the viewport:
   invisible, yet in tab order. Findings 1–3 share one root cause: the button was
   added after those sweeps were written.

4. **🎲 Wylosuj is unreachable on phones, but the code expects otherwise.** The draw
   row lives inside `.idbox` (`index.html:260`), which the phone block hides
   entirely — yet `drawRandom()` explicitly closes the phone drawer "to show the
   result" (`app.js:362`), and the drawer even floats the "W pamięci" facet to the
   top as the phone training hub. Either the draw row should move out of `.idbox`
   (it's a training feature, not worksheet curation), or that drawer-close line is
   dead code.

5. **Marking ✓ collapses your open answer.** `toggleProgressMark` runs a full
   `update()` (`app.js:536`), which rebuilds `qlist.innerHTML` — every open 👁 reveal
   snaps shut. The natural flow hits this every time: solve → open the answer →
   check → click ✓ → the answer you were reading disappears. The full re-render is
   only needed when a Postęp filter is active; otherwise the chip and facet counts
   could update in place.

6. **The sheet title isn't actually keyboard-editable.** It has `tabindex="0"` and
   the Biome suppression claims "click/keyboard-editable" (`index.html:298`), but the
   keydown handler (`app.js:952`) only commits/cancels an edit in progress — pressing
   Enter on a focused, non-editing title just blurs it. Keyboard users can never
   start editing.

7. **Annulled questions' reveal says "Brak klucza".** `revealHtml` (`render.js:619`)
   has no annulment branch, so the 5 annulled questions show the same note as papers
   published without keys — misleading (there's no key because there's nothing to
   answer). The key sheet gets this right ("Zadanie anulowane — bez poprawnej
   odpowiedzi"); the prompt's own annulment note softens it, but the reveal still
   misstates the reason.

## Inconsistencies

> Item 8 **FIXED 2026-08-17**, both halves. The facet now splits by the derivation's
> source — "z" stays as the umbrella value (old `sol=z` links verified working) with
> new sub-values `klucz` (2080) / `ai` (5488), plus `bez` (64: 61 keyed questions
> with no derivation anywhere + 3 annulled), all with `FACET_INFO` ⓘ notes. And the
> reveal now always shows the keyless AI stand-in (answer + derivation, labeled)
> regardless of showAI — `revealAi` in render.js — so screen, print and facet agree.
> Verified live in Chrome off file://, both showAI states.

8. **The "Rozwiązanie" facet overcounts under default settings.** Its values
   (`defs.js:197`) count `answer.model.solution_html` — measured **702 questions**
   whose only derivation is that field. With "Pokaż weryfikację AI" off (the
   default), none of them shows any solution on screen; the 641 keyless ones even
   show "Brak klucza" in the reveal while the *printed key* shows their AI answer and
   derivation regardless of the toggle (deliberately — `render.js:335` says the sheet
   would mislead without them). So screen and print follow opposite philosophies, and
   the facet sides with print. At minimum the facet deserves an ⓘ; arguably the
   reveal should show the corroborated AI answer for keyless questions even with AI
   off, by the key sheet's own reasoning.

> Item 9 **FIXED 2026-08-17** (the keyless model derivation now gets the
> *"Rozwiązanie AI:"* prefix + `kai-sol` class, so the existing "Rozwiązania AI w
> kluczu" toggle and legend cover it; deliberate behavior change: unchecking the
> toggle now hides the derivation — the AI answer line still always prints).
> Verified via `renderKeyEntry` in Chrome off file://.

9. **Keyless AI derivations print unlabeled and untogglable.** For keyless questions
   `renderKeyEntry` (`render.js:412`) prints `model.solution_html` as plain `.ksol` —
   no *"Rozwiązanie AI:"* prefix, not covered by the "Rozwiązania AI w kluczu" print
   toggle (which only targets `.kai-sol`). The labeled AI answer above and the legend
   partially cover it, but the derivation itself is indistinguishable from an
   official one.

> Items 10–11 **FIXED 2026-08-17** (`q.annulled` replaces the regex — flag and regex
> verified to mark the same 5 questions; gutter length token renamed `--gbtn`;
> print-menu elements declared in state.js; ☰ badge counts id list / search /
> exclusions; `alt` → `swap`). Verified live in Chrome.

10. **Annulment detected by regex despite the data flag.** `keylessVerif`
    (`defs.js:132`) and `renderKeyEntry` (`render.js:403`) test `/anulowan/i` on
    `prompt_html`, while build.mjs ships an authoritative `q.annulled` and the
    Anulowane facet already uses it. The regex would false-positive on any prompt
    merely mentioning annulment.

11. **Smaller ones:**
    - `--btn` means a color at `:root` (`app.css:12`) but a length inside `.q`
      (`app.css:807`) — no live conflict, pure footgun.
    - The print-menu elements are used as implicit `window.printMenuBtn`-style
      globals (`app.js:613`) while everything else goes through the `$()` refs in
      state.js.
    - The phone ☰ badge counts only facet selections (`app.js:117`), so after
      tapping a ×N chip on a phone a filter is active with no badge and no visible
      id box explaining why the list shrank.
    - In `figuresHtml` the variable holding the `data-png`/`data-svg` attributes is
      named `alt` (`render.js:569`) right next to a real `alt` attribute.

## Labels & language

> Items 12–15 **FIXED 2026-08-17** ("z rozwiązaniem" in tips; "linkiem"/"Link" →
> "przyciskiem"/"Przycisk"; "strzałki ▴/▾"; badge texts capitalized to match).

12. The tips popover (`index.html:349`) lists a filter "z kluczem odpowiedzi" — no
    such facet exists by default (Weryfikacja AI is hidden, and "Rozwiązanie" is
    about solutions, not keys).
13. "przeniesiesz je na inne urządzenie **linkiem** ⇄" (`defs.js:113`, echoed in tips
    `index.html:399`) — ⇄ is a button, and "linkiem" is actively confusing one clause
    after "nie w linku" meaning the URL. Same for "**Link** ✓ widoczne" in the tips
    (`index.html:395`) — it's a button too.
14. Tips say "strzałki ▾ do zmiany kolejności" (`index.html:364`) — the UI shows a
    ▴/▾ pair.
15. `verifBadge` texts mix capitalization after "Weryfikacja AI:" — lowercase
    "zgodne z kluczem" vs capitalized "Modele AI niezgodne" / "Klucz prawdopodobnie
    błędny" (`render.js:298–308`).

## Performance

> Items 16–18 **FIXED 2026-08-17** (id boxes debounced 200 ms; `allFacetCounts` in
> facets.js shares one gated base across unselected facets, equality-tested against
> `facetCounts`; key sheet built on `beforeprint`). Verified live in Chrome.

16. **`inc`/`exc` inputs are un-debounced** (`app.js:294`): every keystroke in the id
    boxes runs a full filter + render + `replaceState`. Hand-typing a hash is 8 full
    updates, and Chrome rate-limits history writes (~100/30s). Debounce them like
    search.
17. **`facetCounts` recomputes the gated base 14×,** once per facet, but every facet
    *without its own selection* excludes nothing and shares the identical base —
    computing it once would cut most of the set passes per update. Fine at 7.6k
    questions today; a free win if it ever feels sluggish.
18. **The print-only key sheet is rebuilt on every update** (`app.js:76`) —
    string-building plus innerHTML parse for a `display:none` section on every
    keystroke. Could move to a `beforeprint` handler.
19. **Non-hidpi figures ship without `width`/`height`** — only `figdim` figures get
    them (`build.mjs:160`), so lazy-loading images cause layout shift while
    scrolling. build.mjs could read PNG dimensions and stamp them for all figures.

## Suggested order of attack

The user-visible ones first: the CSS sweeps (1–3, one small diff), the
reveal-collapse on ✓ (5), Wylosuj on phones (4). Then the label/language batch
(12–15) and the cheap perf wins (16, 19). Items 8–9 need a design decision about the
AI-off default before touching code.
