# Przegląd końcowy — 2026-08-17

Zakres: całość — siedem plików przeglądarki, `build.mjs`, `facets.test.cjs`, korpus
`data/` (skan integralności na nowo), SCHEMA.md, README.md, kopie ekranowe (teksty
polskie) i dostępność. Metoda: pięć niezależnych przebiegów recenzenckich (CSS/motywy ·
stan i wire-format · render/escaping/facety · build+dane · język/etykiety), każde
podejrzenie zweryfikowane w kodzie po obu stronach, liczby przeliczone ze świeżo
zbudowanych shardów; najważniejsze znaleziska sprawdzone drugi raz ręcznie.

Stan po: naprawach wszystkich 18 pozycji z BROWSER_REVIEW, kampanii czasowej,
flipie domyślnych (weryfikacja AI on, SVG on), splicie facetu „Rozwiązanie",
splashu ładowania.

Ogólnie: **korpus i build są w stanie weryfikowalnie bardzo dobrym** — zero twardych
błędów danych, build bajtowo deterministyczny, escaping szczelny, wire-formaty
symetryczne i wstecznie zgodne, wszystkie naprawy z BROWSER_REVIEW trzymają. Nowe
znaleziska skupiają się w trzech tematach: **11 rekordów `answer.correct` z MathML w
środku tekstu** (jedyny bug klasy „użytkownik widzi zepsute"), **pęknięcia po flipie
domyślnych** (zamrożone stare ustawienia, opisy i komentarze pisane pod stary default)
i **dryf dokumentacji wokół kampanii czasowej**.

Poza zakresem (decyzja z 2026-08-17): hidpi @2x dla 191/855 figur i brak
`width`/`height` na figurach bez `figdim`.

## 0. Migawka korpusu (przeliczone 2026-08-17)

433 pliki (szkolny 126 · rejonowy 147 · wojewódzki 160), **7632 zadania**
(2210/2706/2716; closed 4633 · open 2282 · TF 717; podstawowa 7370 · gimnazjum 262),
id unikatowe. `answer.model` 7626/7632 (braki = 5 anulowanych + 1 nieroz).
`est_min` **7632/7632** ⊆ {1,2,5,10,20} (1381/3839/1805/547/60). `sol_ai` 4847,
0 sierot we wszystkich sidecarach. Mental 5897 (wprost 4966 · pomysl 931). Duplikaty
163 klastry/339 zadań, warianty 49/112, 0 wiszących referencji. Kubełki weryfikacji:
zgodne 6950 · bezklucza 641 · sprawdzony 31 · podejrzany 7 · anulowane 5 · nieroz 1.
Facet sol: z 7568 = klucz 2080 + ai 5488 (= 4847 sol_ai + 641 bezkluczowych), bez 64
(61 z kluczem + 3 anulowane). Figury 855 PNG / 823 SVG / 191 hidpi, 0 brakujących
referencji, 0 sierot. Dwa kolejne buildy i shardy na dysku — identyczne co do bajtu;
payload shardów .js == .json.

## Bugi

> Punkt 1 **NAPRAWIONE 2026-08-17** — `answerHtml` dzieli wartość na wyspy
> `<math>…</math>` (przepuszczane) i tekst pomiędzy (escapowany). Diff nowej vs
> starej funkcji na wszystkich 7632 odpowiedziach: zmienia się dokładnie 11
> problematycznych zadań, pozostałe bajt w bajt identyczne (przy okazji ogony
> tekstu po `</math>` w 8 wartościach też przechodzą przez esc). Zweryfikowane
> w Chrome off file:// na 7308535b — ułamek renderuje się jako MathML.

1. **11 zadań pokazuje dosłowny kod MathML zamiast odpowiedzi.** `answerHtml`
   (`defs.js:363`) przepuszcza bez escapowania tylko wartości *zaczynające się* od
   `<math`; 11 zadań otwartych ma MathML w środku tekstu (np. `"a) 12 cm, b) <math…"`),
   więc reveal (`render.js:618`) i arkusz klucza (`render.js:343`) renderują
   `&lt;math xmlns=…` jako tekst. Hashe: 7308535b, 282ff86c, acbb71ec, 112ff864,
   2493e097, 258c19eb, c7cc8b34, 6aa3ff8e, 3040a4b1, 926b5aaf, a974fe6f. SCHEMA.md:58
   mówi „choice label or short text", więc to naruszenie kształtu danych ujawnione
   przez render — do decyzji: naprawić 11 rekordów u źródła czy poszerzyć
   `answerHtml` o wykrywanie `<math` w środku. (12 wartości czysto-MathML-owych
   przechodzi poprawnie.)

> Punkty 2–3 **NAPRAWIONE 2026-08-17**. `.about-close` dopisany do obu ciemnych
> list (muted + hover, `app.css`); kolor spoczynkowy w dark przełącza się na token
> 52% — zweryfikowane w Chrome. Splash: `splashFail()` w inline'owym skrypcie +
> `onerror` na sześciu kluczowych `<script>` + nasłuch niezłapanych wyjątków
> (non-capture, więc ciche 404 shardów na file:// go nie dotykają) — spinner
> zamienia się w podpowiedź twardego odświeżenia. Zweryfikowane end-to-end na
> kopii aplikacji bez `app.js` po http; zdrowa aplikacja startuje bez zmian.

2. **Ciemny motyw: × zamykający „O serwisie"/„Wskazówki" znika na hoverze.**
   `.about-close:hover` ustawia `color: #333` (`app.css:402`) na ciemnej karcie
   (`--surface` ≈ 20% jasności, kontrast ≈1.4:1); klasa nie występuje w bloku
   `html.dark` w ogóle. Ten sam wzorzec „przycisk dodany po sweepie" co naprawione
   `.mental-toggle`/`.figsize` — wszyscy krewni (`#drawerClose`, `#settingsClose`,
   `#clearSearch`) są w obu ciemnych listach (`app.css:2161–2207`).

3. **Splash zostaje na zawsze, gdy którykolwiek skrypt nie wstanie.** Tylko `init()`
   zdejmuje `#splash`; jeśli po zepsutym deployu (mieszanka stale-cache na GH Pages —
   to już się zdarzało) którykolwiek odroczony skrypt zwróci 404 albo rzuci na
   top-levelu, strona zostaje przykryta wiecznym spinnerem — przed splashem ta sama
   awaria zostawiała widoczną, diagnozowalną stronę. Tani bezpiecznik: timeout
   chowający splash z komunikatem, albo `onerror` na skryptach. (Ścieżki danych są
   bezpieczne: `loadData()` nie umie odrzucić, a „Brak danych" chowa splash.)

## Niespójności

4. **Flip domyślnych (weryfikacja AI on, SVG on) nie dociera do nikogo, kto
   kiedykolwiek zapisał ustawienia.** `saveSettings` (`app.js:767`) fotografuje
   *wszystkie* inputy popupu przy dowolnej zmianie, więc użytkownik sprzed flipa,
   który raz przestawił cokolwiek (np. brudnopis), ma `showAI: false` i
   `figFormat: "bitmap"` zamrożone w `zadania-settings` — nieodróżnialne od świadomej
   rezygnacji. Flip działa tylko dla świeżych przeglądarek. Do decyzji: zaakceptować
   (ustawienia to ustawienia) albo jednorazowa migracja (np. wersjonowany klucz lub
   zapisywanie wyłącznie odstępstw od domyślnych).

5. **`sol=bez` kłamie dla 5 zadań KEY_WRONG.** Zadanie z kluczem, którego jedynym
   wywodem jest dissent modelu weryfikującego, liczy się jako `bez` z komentarzem
   „no solution is shown for it by default or in print" (`defs.js:224`) — ale po
   flipie showAI reveal *domyślnie pokazuje* ten wywód dla 5 zadań agrees=false
   (aff9ae09, 78dcf737, eed7cedf, 5b7181e6, 929ed70c). Nota ⓘ „Ani klucz, ani AI nie
   dostarczyły rozwiązania" (`defs.js:118`) jest dla nich fałszywa (a dla pozostałych
   56 z 61 — myląca: AI dostarczyło, tylko jest tłumione).

> Punkt 6 **NAPRAWIONE 2026-08-17** — reveal pokazuje ostrzeżenie KEY_WRONG
> bezwarunkowo, tą samą regułą co drukowany klucz i w jego kompaktowej formie
> (badge + uzasadnienie + linia „Odpowiedź AI", bez wywodu); z showAI zachowanie
> bez zmian. Zweryfikowane na żywo na aff9ae09 w obu stanach przełącznika.

6. **Ostrzeżenie o błędnym kluczu: druk zawsze, ekran tylko z showAI.** Arkusz klucza
   drukuje ostrzeżenie KEY_WRONG bezwarunkowo (`render.js:611`, „klucz bez ostrzeżenia
   jest gorszy niż brak klucza"), ale badge w reveal jest `showAI ? … : null`
   (`render.js:355`) — przy wyłączonej weryfikacji 6 zadań pokazuje prawdopodobnie
   błędną oficjalną odpowiedź bez żadnego znacznika. Z trzech rzeczy, które wg
   `render.js:336` „muszą drukować się zawsze", reveal pokrywa już stand-in
   bezkluczowy i anulowanie — to ostatnia brakująca.

7. **Mniejsze niespójności etykiet weryfikacji:**
   - 3 zadania agrees=true z zanotowanym dissentem (b3229c02, 281b5059, 17e2944d):
     facet mówi „zgodne", badge przy zadaniu „Niezgodne z kluczem" (`render.js:304`).
   - Jedyne SOLUTION_WRONG ląduje pod wartością „Klucz prawdopodobnie błędny",
     choć własny badge mówi „Klucz poprawny, ale rozwiązanie błędne" (`defs.js:284`
     vs `render.js:291`); nota ⓘ hedguje poprawnie, sama etykieta wartości — nie.

8. **`q.sol_ai` to zaufany surowy HTML spoza udokumentowanej powierzchni.**
   CLAUDE.md zamraża wyjątki jako „pola `*_html` + `answer.correct` przez
   `answerHtml`"; `sol_ai` (interpolowany bez esc w `render.js:412/420/631`) nie
   nazywa się `*_html` — komentarz w `render.js:411` wręcz cytuje regułę, której to
   pole nie spełnia. Ten sam poziom zaufania w praktyce (HTML z własnej kampanii),
   ale dokumentacyjnie powierzchnia się rozjechała — dopisać pole do listy wyjątków
   (albo przemianować w shardach).

9. **Ciemny motyw: `.about-note` traci przygaszenie.** `html.dark .about-body p`
   (`app.css:2261`) wygrywa specyficznością z `.about-note` (`app.css:430`) — stopka
   „Cały kod tej aplikacji…" renderuje się pełną jasnością tekstu zamiast #888.

10. **5 przerysówek SVG jest nieosiągalnych.** Figury inline'owe
    (`rejonowy_2020_lubuskie_q25_fig{2..5}`, `wojewodzki_2023-2024_pomorskie_q1_fig1` —
    `<img>` w `choices[].html`/`prompt_html`, nie w `q.figures`) mają zacommitowane
    SVG, ale `build.mjs:160` emituje `figsvg` tylko z `q.figures`, więc przełącznik
    wektorowy nigdy ich nie dotyczy — mimo że redrawy istnieją. 818/823 SVG osiągalne.

## Język i etykiety

> Punkty 11–15 **NAPRAWIONE 2026-08-17** — cała paczka: hint weryfikacji
> („wyłączenie ukrywa filtr «Weryfikacja AI»"), nagłówek ⓘ weryfikacji i klauzula
> o Rozwiązaniach AI w „O serwisie" z zastrzeżeniem „tam, gdzie istnieje klucz";
> „Tytuł zestawu" w ustawieniach + hincie markera, dopisek o włączeniu tytułu w
> tips; hint brudnopisu „Automatyczny" opisuje realną regułę (wielokrotny wybór
> bez rysunku); `fmtMin` kończy na „min" („≈2h 30min"); trzy `&ndash;` → —, oba
> comma splice'y, hinty rysunków małą literą, placeholdery „id, id, …",
> „rastrowym"/„wersji wektorowej", komunikat importu postępu, `alt` figur używa
> numeracji sekwencyjnej (`seq ?? q.number`), facet „Czas" dostał notę ⓘ o
> proweniencji. Zweryfikowane na żywo w Chrome off file://.

11. **Opisy pisane pod stary default:** hint ustawień „dodaje filtr «Weryfikacja»"
    (`index.html:179`) — filtr jest domyślnie, a nazywa się „Weryfikacja AI";
    nagłówek ⓘ weryfikacji „Każde zadanie … porównane z oficjalnym kluczem"
    (`defs.js:98`) — 641 zadań nie miało klucza, a nota `anulowane` obok sama mówi,
    że weryfikacji nie było; „O serwisie": „wymóg, by *każde* Rozwiązanie AI kończyło
    się dokładnie na odpowiedzi z klucza" (`index.html:527`) — od splitu etykietę
    „Rozwiązanie AI" noszą też wywody bezkluczowe, których nie miało co kotwiczyć
    (są tylko korroborowane).
12. **„Tytuł arkusza" vs „tytuł zestawu".** Ustawienia i hint markera mówią „arkusza"
    (`index.html:150/204/213`), tips — „zestawu" (`index.html:385`); wszędzie indziej
    „arkusz" = oryginalny papier konkursowy. Do tego tips obiecują „Tytuł zestawu
    zmienisz, klikając go nad listą", a przy fabrycznych ustawieniach tytułu nad
    listą *nie ma* (`metaTitle` domyślnie odznaczone → `.sheet-title` ukryty).
13. **Hint brudnopisu „Automatyczny" niedokładny.** „pół strony na zadania zamknięte"
    (`index.html:237`) — realna reguła to `closed_single && !figures`
    (`render.js:658`): prawda/fałsz i zamknięte z rysunkiem dostają całą stronę.
14. **Sumy czasu mieszają formaty.** `fmtMin` (`defs.js:399`): poniżej godziny
    „≈45 min", powyżej „≈2h 30m" — samo „m" nie jest polskim skrótem minut; ta sama
    wielkość, to samo miejsce w podsumowaniu, dwa zapisy.
15. **Drobiazgi jednym zamachem:** trzy `&ndash;` w „O serwisie" tam, gdzie wszędzie
    indziej — (`index.html:498/506/529`, w kroku 7 oba w jednym zdaniu); dwa comma
    splice'y („Rysunki narysowane przez AI…, mogą zawierać błędy" `index.html:189`;
    „…(zwykle błąd w treści), zadanie nie ma…" `defs.js:108`); hinty „Rysunki…"
    wielką literą wśród małych (`index.html:189/196`); placeholdery „hash, hash, …"
    vs „id" wszędzie indziej (`index.html:270/315`); „bitmapowym"/„przerysówki" w ⓘ
    vs „rastrowy (PNG)" w ustawieniach (`defs.js:112`); „wklej tu wynik «Eksportuj»"
    (`app.js:306`); `alt="rysunek do zadania ${q.number}"` cytuje numer z arkusza,
    a lista w trybie id numeruje sekwencyjnie (`render.js:575`); brak noty ⓘ przy
    facecie „Czas" — jedyny facet AI-pochodny bez informacji o proweniencji.

## Dostępność

16. **Klawiatura i czytniki — zaległości punktowe:** ⇄ (transfer postępu,
    `render.js:162`) bez aria-label (nazwa dostępna = „⇄"); `snapBtn` bez
    `aria-pressed`, aria-label ślepy na stan (`app.js:719`); klikane `<span>`y —
    🧠/💡 marker (`render.js:453`), id zadania (`render.js:680`), „N zaznaczone"
    (`app.js:186`) — bez roli i tabindex, akcje tylko myszą, choć title je obiecują;
    title tytułu zestawu mówi tylko „Kliknij…" po naprawie Enter (`index.html:319`),
    a na telefonie klik celowo nie działa; badge ☰ nieanonsowany (aria-label
    nadpisuje treść, `index.html:45`); nazwa dostępna reveala to „👁".

## Wydajność i przypadki brzegowe

17. **Baza drill-down liczona 2× na update.** `facetMatched()` i `allFacetCounts`
    wołają `gatedBase` z identycznymi wejściami (`app.js:64` + `facets.js:143`) —
    jeden zbędny pełny przebieg po 7,6k zadań na każdy klik/keystroke-burst.
    Naprawa z e59030c poprawnie współdzieli bazę *między facetami*; nie współdzieli
    jej z przebiegiem, który `update()` już zrobił. Przy obecnej skali niegroźne.
18. **✓/✗ wciąż przerysowuje całą listę.** Objaw z BROWSER_REVIEW #5 (zamykanie
    reveali) naprawiono przez carry-over, ale sam chip nie jest aktualizowany w
    miejscu — każde kliknięcie to pełny rebuild `innerHTML` + recount, a klawiaturowy
    użytkownik traci fokus po każdym oznaczeniu (`app.js:567`).
19. **Uśpione, dziś niewidoczne:** `aiAnswers`/`keyVerifLines` bez guardu
    `q.annulled` (gdyby anulowane kiedyś dostało `model.answer`, reveal pokaże
    odpowiedzi, które „nic nie znaczą" — dziś 0 takich); sieroty sidecarów
    ignorowane po cichu, podczas gdy nieznane id w near-dups.tsv wywala build
    (asymetria — tania linijka ostrzeżenia łapałaby bit-rot po rename'ach id);
    `readdirSync` sidecarów bez sortowania (dziś deterministyczne — 0 duplikatów id
    między plikami); stary URL `weryf=rozbiezne` po cichu gubi filtr (pusta wartość
    wypada z INDEX); ręczny hash `title=` czyści H1; zmiana priorytetu formatu figur
    kasuje piny fr/fv przez `replaceState` — Back nie cofa.

## Dokumentacja (dryf po kampanii czasowej)

20. **`data/time/` nie istnieje w dokumentach:** drzewo plików SCHEMA.md:16 i drzewo
    Layout README.md:144–167 wymieniają `solutions/ mental/ dups/`, bez `time/`
    (w README jedynie wzmianka w kroku 10); `data/time/README.md:42` wciąż każe
    „scalenie dopisać przy pierwszej partii" — scalenie i UI istnieją od 9067ec2.
21. **Dwa nity liczbowe:** `data/dups/README.md:36` „109 SAME" vs 111 w TSV
    (2 pary ex-`DUP_FIGURE_OK` odnotowane tylko w kolumnie note); README.md:189
    „38 papers (641 questions) shipped without any answer key" — plików bez
    answers-PDF jest 37 (640 zadań), 641. bezkluczowe to q20 warmińsko-mazurskie,
    którego arkusz answers *ma* (rozstrzygnięty przypadek bez linii „Odp:").

## Testy

22. **Cała logika `values()` w defs.js jest poza harnessem.** Świeży split sol
    (najbardziej misterna nowa logika — znaleziska 5 i 7 mieszkają dokładnie tam),
    routing weryfikacji, kubełki czasu i `fmtMin` są czyste i DOM-free — własna
    konwencja projektu (wzorzec `facets.test.cjs`) kwalifikuje je pod test node;
    dziś testowalne wyłącznie ręcznie. W samym `facets.test.cjs` brak asercji dla
    `allFacetCounts` z *kilkoma* naraz zaznaczonymi facetami OR.

## Zweryfikowane jako czyste

- **Korpus**: wszystkie liczby z §0 przeliczone niezależnie; 0 sierot figur/sidecarów/
  hashy; przykłady jq z README działają (pipeline `shasum` odtwarza hash id 1:1).
- **Build**: deterministyczny (3× ten sam bajtowo wynik), payload .js == .json, brak
  U+2028/`</script>` w payloadach, catalog.js == categories.json.
- **Escaping**: pełna inwentaryzacja interpolacji — wszystko przez `esc()` albo w
  udokumentowanym zaufanym zbiorze (wyjątki: definicyjny #8, teoretyczny `q.number`);
  `esc()` escapuje `"`, konteksty atrybutów w porządku.
- **Wire-formaty**: serialize/applyState dokładnie symetryczne; stare URL-e (`sol=z`,
  hashe sprzed `czas`, piny fv/fr sprzed flipa — absolutne, więc nieodwrócone)
  restaurują się poprawnie; localStorage odporny na śmieci i stare bloby.
- **CSS**: sweep dark/touch/phone wszystkich nowo generowanych klas kompletny
  (estmin, splash, drawrow, nokey, ai-sol, progmark…); zero martwego CSS ze 159
  selektorów (martwy jedynie token `--btn-hover` i hook `splash-wm`); mapowanie
  toggli druku poprawne w obu kierunkach; z-index splasha ponad wszystkim.
- **Naprawy z BROWSER_REVIEW (1–18)**: wszystkie zweryfikowane ponownie w aktualnym
  kodzie — żadna nie zregresowała.
- **Ekran vs druk**: anulowanie, stand-in bezkluczowy, prefiks „Rozwiązanie AI:",
  legenda i toggle solai — zgodne po obu stronach (jedyny wyjątek: #6).
- **`npm run check` i `npm test`** przechodzą.

## Sugerowana kolejność ataku

Najpierw to, co użytkownik widzi: MathML w 11 odpowiedziach (#1 — decyzja
dane-czy-kod), × w ciemnym motywie (#2, jedna linia), bezpiecznik splasha (#3).
Potem paczka językowa (#11–15) i dostępność (#16) — same drobne diffy. #4 (migracja
domyślnych) i #5–6 (filozofia showAI-off) wymagają decyzji przed kodem; #20–21 to
kwadrans w dokumentach; #22 przy następnej zmianie w defs.js.
