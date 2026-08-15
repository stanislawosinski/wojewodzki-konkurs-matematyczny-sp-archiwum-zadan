# Przegląd projektu — 2026-08-15

Stan po: dwustopniowej weryfikacji AI (blind solve + adjudykacja), rozstrzygnięciu
kubełków `nieroz`/`niepewne`/`rozbiezne`, przebudowie facetu „Weryfikacja AI",
arkuszu klucza z uzasadnieniami i split-buttonie Drukuj.

## 1. Dane — co jeszcze wisi

- **`nieroz` (1)**: `szkolny_2022_dolnoslaskie_q20` — klucz jest rysunkiem w answers-PDF;
  jedyna droga to pole `answer.figures[]` + wycinek z PDF. Odpuszczone dla 1 zadania.
- **`wojewodzki_2017-2018_warminsko-mazurskie_q20` — SPRAWDZONE, nie jest luką.** Klucz PDF
  przy zadaniu 20 (dowód „kąt DCE ma 135°") jako jedynym nie drukuje linii „Odp:", tylko
  rubrykę punktowania — teza jest w treści zadania. `correct: null` to stan faktyczny.
  Encja `&angmsd;` w `model.answer` naprawiona (2026-08-15).
- **`bezklucza` (641 zadań w 38 plikach)** — 37 plików nie ma answers-PDF; jedyna realna
  droga to polowanie na klucze na stronach kuratoriów. Warstwa AI już to kryje (wszystkie
  odpowiedzi corroborated), więc opcjonalne.
- **Figury: 32 PNG bez SVG — SPRAWDZONE, kampania kompletna.** 15 to „przyroda" (śląski
  konkurs „z Elementami Przyrody" 2010–2014), pozostałe 17 to fotografie i infografiki
  (portrety matematyków, cennik parkowania, herb…) — żadna nie trafiła do
  `redraw-queue.tsv` celowo, bo SVG nie ma tam sensu. Nic do zrobienia.
- **Kontradykcje figur: kampania domknięta** — 29 wierszy w `FIGURE_CONTRADICTIONS.md`,
  wszystkie przejrzane (25 ok / 8 feedback, 6 Fixed). Pozostałe „high" stoją „as scanned"
  świadomą decyzją (rule 2).
- **`suspected_key_errors.tsv`**: komplet 38/38 werdyktów (31 KEY_CORRECT, 6 KEY_WRONG,
  1 SOLUTION_WRONG) — zamknięte. `data-todo.txt` pusty — resztkowe cropy zrobione.
- Drobne/opcjonalne: hidpi @2x tylko dla 191/855 figur.
- **Oficjalne `solution_html` przy 27% zadań — ZWERYFIKOWANE, nie jest to luka ekstrakcji.**
  16 plików z answers-PDF ma zadania otwarte i zero rozwiązań; próbka dwóch rodzin
  (szkolny_2025_dolnoslaskie, wojewodzki_2022-2023_warminsko-mazurskie) pokazuje, że te
  klucze drukują tylko odpowiedź końcową + rubrykę punktowania („5 pkt za…, 4 pkt za… LUB…"),
  bez rozwiązań. Ewentualne do rozważenia: ekstrakcja rubryk punktowania z tych 16 plików
  do `solution_html` — wartość marginalna (w większości boilerplate), niski priorytet.

Kubełki weryfikacji (2026-08-15): `zgodne 6950 · bezklucza 641 · sprawdzony 31 ·
podejrzany 7 · anulowane 5 · nieroz 1 · rozbiezne 0 · niepewne 0`.

## 2. UI — sensowne ulepszenia

- ~~Trzecia pozycja w menu Drukuj: „Drukuj sam klucz"~~ — ZROBIONE (2026-08-15, `6ad0287`).
- **Wariant klucza bez uzasadnień** — dopiero gdy arkusze okażą się w praktyce za długie;
  nie dodawać na zapas.
- ~~Facet `bezsvg` do emerytury~~ — zostaje: 32 pozostałe bitmapy to zdjęcia/infografiki
  nie do przerysowania, więc facet trwale pokazuje właśnie je.
- Notatka z `browser-todo.txt` (plik już usunięty; „LLM-based selection of questions, jq")
  — `jq` po `data.*.json` działa już dziś; wystarczy przykład w README.

Poza tym bez wymyślania na siłę — reveal, wydruk i facety są spójne.

## 3. Pliki do sprzątnięcia — WYKONANE (2026-08-15)

Wszystkie pliki deweloperskie przeniesione do `dev/` (`scripts/`, `docs/`, `reports/`,
`figures/`); artefakty kampanii kontradykcji zacommitowane razem z przenosinami, puste
todo usunięte, `__pycache__` skasowany, `.gitignore` ignoruje cały `/.idea/`.
W rootcie zostały tylko wejścia builda (`categories.json`, `suspected_key_errors.tsv`)
i dokumenty pierwszego kontaktu (`README.md`, `SCHEMA.md`, `CLAUDE.md`, `LICENSE`).

## 4. Kod przeglądarki — martwe fragmenty

Skan klas z selektorów `app.css` przeciwko `index.html`+JS oraz top-level globali każdego
pliku JS przeciwko całości: **zero martwych klas CSS, zero martwych globali** (jedyny „hit"
— `$` w `state.js` — to fałszywy alarm regexu, ma 27 użyć). `rozbiezne`/`niepewne`
w `VERIF_LABELS`/`order` to celowe miejsca lądowania przyszłych przebiegów weryfikacji,
a wszystkie 7 kombinacji `MODEL_LABELS` występuje w danych. Nie ma czego wycinać.
