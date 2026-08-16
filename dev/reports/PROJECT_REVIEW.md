# Przegląd projektu — 2026-08-16

Stan po: kampanii „W pamięci" (433/433 sidecarów, scalone 3 ręczne oceny z partii 1),
popoverze „Wskazówki" z cross-linkami do „O tym serwisie". Skan integralności całego
korpusu przeprowadzony na nowo (skrypt jednorazowy, wyniki niżej).

## 0. Migawka korpusu

433 pliki (szkolny 126 · rejonowy 147 · wojewódzki 160), **7632 zadania**
(closed_single 4633 · open 2282 · true_false 717). Figury: 855 PNG (831 zadań),
823 SVG, 191 hidpi. Mental: **5897 zadań oflagowanych** (wprost 4966 · pomysl 931),
0 podpowiedzi ponad limit 110 znaków, 0 wpisów-sierot. `answer.model` przy 7626/7632 —
6 braków to dokładnie 5 anulowanych + 1 `nieroz`, spójne.

## 1. Dane — wynik skanu integralności

- **Zero twardych błędów**: brak duplikatów id, brak brakujących PNG na dysku, brak
  artefaktów fontowych (`Ŝ`), `total_questions` == liczba zadań we wszystkich 433 plikach.
- **Suma punktów ≠ `max_points` w 2 plikach — do sprawdzenia z PDF-em** (jedyne 2 na 433):
  - `rejonowy_2012_podlaskie_sp` — suma 31 vs `max_points` 30;
  - `wojewodzki_2011_podlaskie_gim` — suma 42 vs `max_points` 45.
  Albo błąd ekstrakcji (`points` lub `max_points`), albo tak drukował arkusz.
- **„5 osieroconych PNG" — FAŁSZYWY ALARM (sprawdzone 2026-08-16, nic nie kasować).**
  `rejonowy_2020_lubuskie_q25_fig{2..5}.png` i `wojewodzki_2023-2024_pomorskie_q1_fig1.png`
  są referencjonowane inline jako `<img src="figures/…">` w `choices[].html` (siatki
  sześcianu do wyboru, ilustracje wariantów P/F) — skan patrzył tylko na `q.figures`.
  Konwencja dopisana do SCHEMA.md.
- **`choices` poza szablonem — sprawdzone, to konwencja, nie błąd**: ~14 zadań
  `closed_single` z `choices: []` (wieloczęściowe pomorskie — podpunkty z wyborami
  siedzą w `prompt_html`) i true_false z 6–9 wpisami (jeden wpis na stwierdzenie).
  Nieopisane w SCHEMA.md — patrz §2.
- Przeniesione z 2026-08-15, bez zmian: `bezklucza` 641 (kryte przez corroborated AI),
  hidpi tylko 191/855, rubryki punktowania z 16 plików (wartość marginalna).

## 2. Opisy — luki w SCHEMA.md

README jest aktualne (mental pass, przykłady `jq` — obie wczorajsze pozycje domknięte).
SCHEMA.md nie dogonił danych:

- **`school_type`** (`podstawowa` 420 · `gimnazjum` 13) — pole jest w każdym pliku,
  w tabeli obiektu testu go nie ma.
- **`answer.model`** — cały blok weryfikacji (by/agrees/corroborated/solution_html)
  opisuje tylko `dev/docs/VERIFICATION.md`; SCHEMA powinien mieć chociaż jedną linię
  z odsyłaczem, bo to pole siedzi w źródle prawdy.
- **Konwencje `choices`** z §1: `closed_single` z pustymi choices (wieloczęściowe)
  i true_false jeden-wpis-na-stwierdzenie.
- Sidecary `dev/mental/` — celowo poza SCHEMA (opisane w swoim README), OK.

## 3. Co agenci mogą jeszcze wyekstrahować

Posortowane wg wartość/koszt:

1. **Rozwiązania AI dla 4850 zadań (64%), które mają klucz, ale bez drogi dojścia.**
   Klucz podaje tylko literkę/krótką odpowiedź; oficjalne `solution_html` ma 2080 zadań,
   `model.solution_html` — 744 (wszystkie 641 bezkluczowych + 103 z adjudykacji, 42
   nakładają się z oficjalnymi). Znany wynik z klucza działa jako walidacja
   wygenerowanego rozwiązania. Infrastruktura już istnieje:
   pole, render na arkuszu klucza, oznaczenie proweniencji AI. Kampania w stylu
   mental (jeden agent na arkusz, ~433 przebiegi), wynik do `model.solution_html`
   lub osobnego sidecara. Naturalny kandydat na następną kampanię.
2. ~~**Klastry duplikatów**~~ — **ZROBIONE (2026-08-16)**: dokładne klastry
   (znormalizowany prompt+choices, prompt >60 znaków; choices sortowane, więc
   przetasowane odpowiedzi pod innymi literami też łapią) liczone w `build.mjs` → pole
   `dup` w shardach, chip ×N przy zadaniu z infotipem, klik pokazuje cały klaster przez
   „Pokaż tylko id". Wynik: **73 klastry / 149 zadań**. Zadania z figurami wykluczone
   poza 2 parami zweryfikowanymi wizualnie (`DUP_FIGURE_OK`) — 4 kandydackie klastry
   figurowe (śląskie gridy, lubelskie kąty) to ten sam tekst z INNYM rysunkiem; redrawy
   SVG są niezależne, więc automatyczne porównanie figur nie istnieje.
   ~~Poziom 2, *opcjonalnie, LLM*~~ — **ZROBIONE (2026-08-16)**: warianty liczbowe łapie
   deterministyczny klucz ślepy na cyfry (`sim` → chip ~N), a 249 par-kandydatek
   (Jaccard ≥ 0.5, w tym pary figurowe porównywane wizyjnie z PNG) osądziła kampania
   Sonnet (`dev/scripts/neardup.workflow.mjs`) → `dev/dups/near-dups.tsv`. Po scaleniu:
   **163 klastry duplikatów / 339 zadań** i **49 klastrów wariantów / 112 zadań**.
   Werdykty krzyżówek śląskich obniżone do DIFFERENT (sprzeczne między partiami);
   szczegóły i przepis wznowienia w `dev/dups/README.md`.
3. **Tagi metody rozwiązania** (równanie, rozbiór przypadków, niezmiennik, zasada
   szufladkowa, …) jako nowy facet — wartość średnia, `topics` częściowo to kryje.
   Nie robić na zapas.
4. Rubryki punktowania z 16 plików (przeniesione z 2026-08-15) — niski priorytet.

## 4. UI — sensowne ulepszenia

- **Szukaj bez ogonków** (~5 linii): search nie zwija diakrytyków — „trojkat" nie
  znajdzie „trójkąt". Złożyć NFD + mapka `ł→l` po obu stronach (`q._search` i termy).
  Tanie, realna wygoda przy szybkim pisaniu.
- **„Wylosuj N zadań"** z aktualnych filtrów — jednoprzyciskowy generator kartkówki;
  średni koszt, wysoka wartość dla trenowania. Do decyzji.
- Znacznik duplikatów — razem z §3.2, nie osobno. **ZROBIONE** — chip ×N, dla wariantów
  liczbowych osobny chip ~N, plus facet „Powtórki" (Z duplikatem / Z wariantem;
  klucz URL `powt`) (2026-08-16).

Poza tym bez wymyślania na siłę — wskazówki, wydruk, mental i facety są spójne.

## 5. Kubełki weryfikacji (bez zmian od 2026-08-15)

`zgodne 6950 · bezklucza 641 · sprawdzony 31 · podejrzany 7 · anulowane 5 ·
nieroz 1 · rozbiezne 0 · niepewne 0`. `agrees:false` przy 35 zadaniach — to
adjudykowane przypadki, spójne z `suspected_key_errors.tsv` (38 werdyktów).

---

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
