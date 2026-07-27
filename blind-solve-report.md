# Tier-1 blind-solve report — Sonnet (2026-07-27)

Every question in the corpus solved **blind** (no answer key shown) by Sonnet, one agent per paper, then merged into `answer.model` and compared against the extracted key (`answer.correct`). This file records the run and lists **all disagreements** for review. Keyless fills and the data-typing cleanup are summarised, not enumerated (that comes later).

## Summary

| bucket | count | meaning |
|---|---:|---|
| agree | 6833 | model == extracted key (closed/true_false) or open (not auto-judged) |
| **disagree** | **61** | genuine model↔key conflict — the suspected-error candidates below |
| alt-key (false) | 5 | key lists alternatives (e.g. "D lub E"); model picked a listed-valid option — not a conflict |
| keyless | 646 | source had no key; model supplied an answer (to verify in tier-2) |
| format: data-typing | 86 | `closed_single` that is really multi-select/matching; model == key, only the **type tag** is wrong |
| format: genuine | 1 | format anomaly needing a look (keyless/annulled/partial) |
| low-confidence | 45 | model flagged uncertainty (overlaps other buckets) |

Total questions: 7632. Of the 61 disagreements, **6** were already in `suspected_key_errors.tsv`.

> Method note: `answer.model = {answer, by:"sonnet", agrees}` was written into every question surgically (no other field touched). `answer.correct` was never modified. Tier-2 (Opus) will re-solve the contested subset and adjudicate.

## Disagreements — model vs key (61)

Each is a question where Sonnet, solving blind, reached a different closed/true-false answer than the stored key. Some are key-extraction errors, some are model errors — tier-2 decides. `⚠ already flagged` = independently listed in `suspected_key_errors.tsv`.

### `3549f8c1` · rejonowy_2012-2013_malopolskie_q12 · _closed_single_
- **key:** `C` **· model:** `B` **· conf:** high
- **Q:** Kąt zewnętrzny wielokąta – to kąt przyległy do danego kąta wewnętrznego wielokąta. Na rysunku obok zarówno kąty β i β ′ , jak i kąty δ i δ ′ są zewnętrzne do wielokąta w różnych wierzchołkach. Suma wszystkich kątów zewnętrznych trójkąta równobocznego wynosi:
- **choices:** A) 180° · B) 360° · C) 720° · D) 900°
- **model reasoning:** Suma kątów zewnętrznych każdego wielokąta wypukłego (po jednym w wierzchołku) wynosi zawsze 360°, niezależnie od liczby boków.

### `02591d47` · rejonowy_2017-2018_slaskie_q14 · _true_false_
- **key:** `FFPF` **· model:** `FFTF` **· conf:** high
- **Q:** Długość jednej przyprostokątnej trójkąta prostokątnego wynosi 8 cm. Długość drugiej przyprostokątnej stanowi 3 5 długości przeciwprostokątnej. Oceń, czy podane zdania są prawdziwe czy fałszywe. Zaznacz właściwą odpowiedź.
- **choices:** 1) Jeśli niewiadomą długość przyprostokątnej oznaczymy przez x , to obwód trójkąta  … · 2) Pole trójkąta wynosi 48 cm². · 3) Wysokość poprowadzona z wierzchołka kąta prostego ma długość 4,8 cm. · 4) Różnica między najdłuższym i najkrótszym bokiem trójkąta wynosi 2 cm.
- **model reasoning:** Z Pitagorasa: 8²+(0,6h)²=h² ⇒ h=10 (przeciwprostokątna), druga przyprostokątna=6. 1) jeśli x=druga przyprostokątna, to przeciwprostokątna=5/3x, więc obwód=8+x+5/3x≠8+x+0,6x — fałsz. 2) pole=(8·6)/2=24≠48 — fałsz. 3) wysokość z kąta prostego=8·6/10=4,8 cm — prawda. 4) 10−6=4≠2 — fałsz.

### `b974a95a` · rejonowy_2018-2019_slaskie_q11 · _true_false_
- **key:** `PPPP` **· model:** `PPPF` **· conf:** high
- **Q:** Suma dwóch krótszych boków trójkąta jest równa 51 cm, a stosunek długości tych boków wynosi 5 : 12. Oceń, czy podane zdania są prawdziwe, czy fałszywe. Zaznacz właściwą odpowiedź.
- **choices:** 1) Jeśli jest to trójkąt prostokątny, to pole trójkąta jest równe 270 cm². · 2) Jeśli jest to trójkąt prostokątny, to obwód tego trójkąta wynosi 90 cm. · 3) Jeśli jest to trójkąt prostokątny, to wysokość poprowadzona z wierzchołka kąta p … · 4) Jeśli jest to trójkąt rozwartokątny to najdłuższy bok ma długość większą niż 39  …
- **model reasoning:** 5k+12k=51⇒k=3, boki 15 i 36. Jeśli prostokątny: przeciwprostokątna=√(15²+36²)=39. 1) Pole=½·15·36=270 — P. 2) Obwód=15+36+39=90 — P. 3) h=540/39≈13,8→14 — P. 4) Dla trójkąta rozwartokątnego (kąt naprzeciw boku 36) trzeci bok x może spełniać 21<x<32,7, wtedy najdłuższy bok to 36<39 — więc zdanie nie jest zawsze prawdziwe — F.

### `75566c22` · rejonowy_2018-2019_zachodniopomorskie_q27 · _closed_single_
- **key:** `A` **· model:** `C` **· conf:** med
- **Q:** W miejsce liter X , Y , Z wstawiając do wyrażenia X + Y + Z nieparzyste różne cyfry i obliczając jego wartość, otrzymamy w zbiorze liczb naturalnych:
- **choices:** A) jedno rozwiązanie · B) trzy rozwiązania · C) sześć rozwiązań · D) nieskończenie wiele rozwiązań
- **model reasoning:** Wśród trójek różnych nieparzystych cyfr tylko {1,3,5} daje sumę 9 = kwadrat liczby naturalnej (√9=3); pozostałe sumy (11,13,15,17,19,21) nie są kwadratami. Ponieważ X,Y,Z to trzy różne, oznaczone pozycje, cyfry 1,3,5 można w nie wstawić na 3!=6 sposobów — sześć rozwiązań.

### `a938b079` · rejonowy_2018_opolskie_q2 · _true_false_
- **key:** `FPF` **· model:** `FPP` **· conf:** high
- **Q:** Największy wspólny dzielnik dwóch liczb wynosi 15, a ich najmniejsza wspólna wielokrotność 210. Przy każdym zdaniu wpisz TAK lub NIE.
- **choices:** 1) Jest tylko jedna para liczb spełniających te warunki. · 2) Są dwie pary takich liczb. · 3) Są dwie liczby parzyste spełniające te warunki.
- **model reasoning:** a=15m, b=15n, gcd(m,n)=1, mn=210/15=14. Coprime pary (m,n): (1,14) i (2,7) → dwie pary liczb: (15,210) i (30,105). 1) Tylko jedna para → NIE (F). 2) Dwie pary → TAK (P). 3) Liczby parzyste wśród {15,210,30,105}: 210 i 30 → dwie → TAK (P).

### `8eb08acb` · rejonowy_2019-2020_wielkopolskie_q22 · _closed_single_
- **key:** `C` **· model:** `A` **· conf:** high
- **Q:** Liczba a = ( 4,2 · 10 15 ) · ( 1,5 · 10 21 ) 0,2 · 10 49 , zapisana w notacji wykładniczej, jest równa:
- **choices:** A) 31,5 · 10 − 13 · B) 3,15 · 10 − 14 · C) 3,15 · 10 − 12 · D) 31,5 · 10 85
- **model reasoning:** a = (4,2·1,5)/(0,2) · 10^(15+21-49) = (6,3/0,2)·10⁻¹³ = 31,5·10⁻¹³.

### `c533aa3d` · rejonowy_2020-2021_malopolskie_q1 · _closed_single_
- **key:** `C` **· model:** `D` **· conf:** high **· ⚠ already flagged:** Roman-numerals: key says C ('tylko II') but statement II (same symbol 4x in 1-3999) is normally false -> D ('żadne'); stored official C; borderline, verify in blind pass
- **Q:** Poniżej podano stwierdzenia na temat zapisu liczb naturalnych z przedziału od 1 do 3999 w systemie rzymskim. Istnieje co najmniej 7 różnych liczb składających się z dwóch znaków, w których odejmujemy pierwszy ze znaków od drugiego. Można użyć tego samego znaku 4 razy w jednej liczbie. Liczba 1631 zapisana w systemie rzymskim to MLCXXXI. Najwięcej znaków w systemie rzymskim użyjemy przy zapisie liczby 3988. Które stwierdzenia są prawdziwe?
- **choices:** A) wszystkie · B) tylko I i IV · C) tylko II · D) żadne
- **model reasoning:** I: dwuznakowe liczby odejmujące (IV,IX,XL,XC,CD,CM) jest dokładnie 6, nie 7 — fałsz. II: max. dopuszczalne powtórzenie jednego znaku to 3 (np. XXX, III) — 4 razy nigdy nie wystąpi w liczbie 1–3999 — fałsz. III: 1631 = M + DC + XXX + I = MDCXXXI, nie MLCXXXI — fałsz. IV: liczba znaków max. przy 3888 = MMM DCCC LXXX VIII (3+4+4+4=15 znaków), a nie przy 3988 = MMM CM LXXX VIII (13 znaków) — fałsz. Wszystkie stwierdzenia fałszywe → D.

### `3bd325d2` · rejonowy_2020-2021_slaskie_q6 · _true_false_
- **key:** `PPP` **· model:** `PPF` **· conf:** med
- **Q:** Na rysunku odcinki OA i OB są tej samej długości, a odcinki AB i CD są równoległe. Oceń, czy podane zdania są prawdziwe, czy fałszywe.
- **choices:** I) Kąt x ma miarę 70 ° . · II) Kąty x i y mają takie same miary. · III) Suma miar kątów y i z wynosi 180 ° .
- **model reasoning:** Triangle OAB isosceles (OA=OB), angle O=40°⇒base angles=70°. Since AB∥CD, transversals OAC and OBD give x=70° (I true) and by symmetry y=70°, so x=y (II true). z at B is vertically opposite the 70° interior angle ABO, so z=70°, hence y+z=140°≠180° (III false).

### `f179aab0` · rejonowy_2020-2021_swietokrzyskie_1_q1 · _closed_single_
- **key:** `C` **· model:** `B` **· conf:** high **· ⚠ already flagged:** 'which form CANNOT equal -1,2': key says C, but option B (-sqrt(17,28)≈-4,157) also cannot -> two valid answers as printed; stored official C; likely source/print error in option B
- **Q:** Liczby ( − 1,2 ) nie można zapisać w postaci:
- **choices:** A) − 1200 1000 · B) − 6 3 · 2 2 20 2 : 2 3 · C) − 0,0012 · 10 − 3 · D) ( − 3 + 2 13 25 ) · 2,5
- **model reasoning:** A: −1200/1000 = −1,2. D: (−3+2 13/25)·2,5 = (−0,48)·2,5 = −1,2. C: −0,0012·10³ = −1,2 (standard/exponential form). B: −√[(6³·2²)/(20²:2³)] = −√(864/50) = −√17,28 ≈ −4,157 ≠ −1,2. Answer: B.

### `b403994f` · rejonowy_2020-2021_swietokrzyskie_1_q9 · _true_false_
- **key:** `PFP` **· model:** `FFF` **· conf:** high
- **Q:** Na wykresie zestawiono oceny z matematyki uczniów klasy VIII A i klasy VIII B. Oceń prawdziwość zdań:
- **choices:** 1) Średnia ocen uczniów klasy VIII A jest większa niż 3,70. · 2) Średnia ocen uczniów klasy VIII B jest większa od średniej ocen uczniów klasy VI … · 3) Średnia ocen wszystkich uczniów klas ósmych jest większa niż średnia ocen ucznió …
- **model reasoning:** From the chart: VIII A grades(count): 1(2),2(1),3(5),4(6),5(4) → 18 uczniów, suma ocen=63, średnia=3,5. VIII B: 1(1),2(3),3(5),4(7),5(4) → 20 uczniów, suma=70, średnia=3,5. Łącznie: 38 uczniów, suma=133, średnia=3,5. Wszystkie trzy średnie są równe 3,5, więc: 1) 3,5>3,70 — fałsz; 2) 3,5>3,5 — fałsz; 3) 3,5>3,5 — fałsz.

### `627419a5` · rejonowy_2020-2021_swietokrzyskie_2_q5 · _true_false_
- **key:** `FPFP` **· model:** `PPFP` **· conf:** high
- **Q:** Jeśli liczba a jest wynikiem działania 10 20 · 20 10 , to:
- **choices:** 1) Liczba zer występujących w zapisie dziesiętnym liczby a jest równa 30. · 2) Suma cyfr liczby a jest równa 7. · 3) Liczba a + 1 jest podzielna przez 3. · 4) Liczba a + 2 jest podzielna przez 9.
- **model reasoning:** a=10²⁰·20¹⁰=10²⁰·2¹⁰·10¹⁰=1024·10³⁰ (1024 i 30 zer). Zer: 30 (P). Suma cyfr: 1+0+2+4=7 (P). a mod 3 = 7 mod 3 =1, więc a+1 mod3=2 – niepodzielne przez 3 (F). a mod 9 = 7, więc a+2 mod9=0 – podzielne przez 9 (P).

### `bffa1302` · rejonowy_2020_kujawsko-pomorskie_q12 · _closed_single_
- **key:** `A` **· model:** `C` **· conf:** med
- **Q:** Suma zacieniowanych kątów przedstawionych na rysunku, wynosi
- **choices:** A) 360° · B) 540° · C) 180° · D) 420°
- **model reasoning:** Figura to nieregularna pięcioramienna "gwiazda" (linia łamana zamknięta przechodząca przez 5 punktów z samoprzecięciami). Suma kątów przy wierzchołkach takiej gwiazdy (niezależnie od kształtu) wynosi zawsze 180°.

### `9971791c` · rejonowy_2020_lubuskie_q25 · _closed_single_
- **key:** `b` **· model:** `C` **· conf:** low
- **Q:** Z której siatki Julka może złożyć narysowany sześcian?
- **choices:** a)  · b)  · c)  · d) 
- **model reasoning:** Na sześcianie linia jest przekątną ściany górnej połączoną w jednym wierzchołku sześcianu z przekątną ściany bocznej (prawej). W siatce te dwie ściany stykają się tylko w jednym punkcie (przy ścianie sąsiadującej), więc poprawna siatka to ta, w której pogrubiona linia biegnie od zewnętrznego rogu górnego „ramienia” siatki, przez wspólny wierzchołek, do zewnętrznego rogu bocznego „ramienia”. Figura odpowiada wariantowi c) — ocena niepewna ze względu na trudność jednoznacznego odczytania rysunku.

### `964354c1` · rejonowy_2021-2022_zachodniopomorskie_q18 · _closed_single_
- **key:** `D` **· model:** `C` **· conf:** high
- **Q:** Pusta ciężarówka waży 2000 kg. Po załadowaniu towaru ładunek stanowił 80% masy załadowanej ciężarówki. U pierwszego z odbiorców towaru wyładowano czwartą część towaru. Jaki procent masy załadowanej ciężarówki stanowił wówczas pozostały na niej ładunek?
- **choices:** A) 25% · B) 55% · C) 60% · D) 75%
- **model reasoning:** Pusta ciężarówka = 2000 kg = 20% masy załadowanej ⇒ masa załadowana T=10000 kg, ładunek=8000 kg. Po wyładowaniu 1/4 ładunku (2000 kg) pozostało 6000 kg. 6000/10000 = 60% masy załadowanej ciężarówki.

### `eed7cedf` · rejonowy_2022-2023_wielkopolskie_q9 · _closed_single_
- **key:** `A` **· model:** `B` **· conf:** high
- **Q:** Drewniany sześcian pomalowano białą farbą i rozcięto na 64 jednakowe sześciany. Liczba sześcianów, których żadna ściana nie jest pomalowana białą farbą jest równa:
- **choices:** A) 4 · B) 8 · C) 12 · D) 2
- **model reasoning:** 64 sześciany = siatka 4×4×4. Niepomalowane to sześciany wewnętrzne: (4−2)³ = 2³ = 8.

### `baac8087` · rejonowy_2023_lubuskie_q7 · _closed_single_
- **key:** `A` **· model:** `B` **· conf:** med
- **Q:** Na poniższym rysunku przedstawiono kartkę z zeszytu Oli. Narysowała ona cztery figury. Ile spośród tych figur ma oś symetrii, a nie ma środka symetrii?
- **choices:** A) Jedna. · B) Dwie. · C) Trzy. · D) Cztery.
- **model reasoning:** Analiza pikselowa czterech figur: figura 1 (schodkowa) i figura 3 (postrzępiona) mają ukrytą oś symetrii — przekątną (odbicie po transpozycji daje niemal idealne pokrycie), ale nie mają środka symetrii. Figura 2 (prostokąt z dwoma przesuniętymi "uszami") i figura 4 (podwójna strzałka/gwiazda) mają symetrię środkową (obrót o 180°), ale nie mają osi symetrii — mimo pozornie symetrycznego obrysu, wewnętrzne "zęby" zygzaka są obrócone, nie odbite lustrzanie. Zatem dwie figury (1 i 3) mają oś symetrii, a nie mają środka symetrii.

### `7c865f65` · rejonowy_2024_dolnoslaskie_q8 · _closed_single_
- **key:** `D` **· model:** `C` **· conf:** med
- **Q:** W kwadracie ABCD umieszczono cztery jednakowe trójkąty prostokątne T zaznaczone na rysunku obok szarym kolorem. Najkrótszy bok trójkąta T ma długość 9 cm, a najdłuższy 15 cm. Oblicz pole kwadratu ABCD .
- **choices:** A) 135 cm 2 · B) 144 cm 2 · C) 225 cm 2 · D) 288 cm 2
- **model reasoning:** Trójkąt T ma przeciwprostokątną 15 i krótszą przyprostokątną 9, więc druga przyprostokątna = √(15²-9²)=√144=12 (trójkąt 9-12-15). Cztery przystające trójkąty T ułożone wiatraczkowo mają przeciwprostokątne stanowiące boki kwadratu ABCD (klasyczna ilustracja tw. Pitagorasa), więc bok kwadratu = 15 cm. Pole = 15² = 225 cm².

### `c84ef79f` · szkolny_2013-2014_slaskie_q13 · _closed_single_
- **key:** `C` **· model:** `D` **· conf:** med
- **Q:** Mapa jest zorientowana przy pomocy kompasu, gdy igła magnetyczna wyznaczająca północ ustawiona jest
- **choices:** A) równolegle do drogi na mapie. · B) wzdłuż rzeki na mapie. · C) równolegle do lewej ramki mapy. · D) wzdłuż górnej krawędzi mapy.
- **model reasoning:** Mapę orientuje się tak, aby igła kompasu (wskazująca północ) była równoległa do kierunku północy na mapie, czyli wzdłuż górnej krawędzi mapy (standardowo góra mapy = północ).

### `0ed5d7ae` · szkolny_2014-2015_slaskie_q5 · _closed_single_
- **key:** `D` **· model:** `A` **· conf:** high
- **Q:** Aby liczba 3463? była podzielna jednocześnie przez 3 i przez 4, w miejsce „?” należy wpisać cyfrę
- **choices:** A) 8 · B) 6 · C) 4 · D) 2
- **model reasoning:** Podzielność przez 4 zależy od liczby dwucyfrowej „6?”: 60, 64, 68 są podzielne przez 4, czyli ?∈{0,4,8}. Suma cyfr 3+4+6+3+?=16+? musi dzielić się przez 3 ⇒ ?≡2 (mod 3). Z {0,4,8} tylko 8 spełnia oba warunki (16+8=24).

### `1be9eb82` · szkolny_2016-2017_malopolskie_q13 · _true_false_
- **key:** `FP` **· model:** `PP` **· conf:** med
- **Q:** Uchwałą Sejmiku Województwa Małopolskiego i Rady Miasta Krakowa w 2000 roku powołano Muzeum Armii Krajowej imienia gen. Emila Fieldorfa „Nila”. Logo tego muzeum nawiązuje do herbu województwa małopolskiego, którym jest ukoronowany orzeł w czerwonym polu. Oceń prawdziwość podanych zdań. Wybierz P, jeśli zdanie jest prawdziwe, albo F – jeśli zdanie jest fałszywe.
- **choices:** 1) Herb województwa małopolskiego ma jedną oś symetrii. · 2) Krakowskie Muzeum Armii Krajowej powołano w XX wieku.
- **model reasoning:** 1. Herb (koronowany orzeł w polu) jest symetryczny względem pionowej osi – ma dokładnie jedną oś symetrii. P. 2. Muzeum powołano w 2000 roku – rok 2000 należy jeszcze do XX wieku (1901–2000). P.

### `6eeec636` · szkolny_2016-2017_malopolskie_q8 · _closed_single_
- **key:** `D` **· model:** `A` **· conf:** low
- **Q:** Ile wszystkich trójkątów zaznaczono na poniższym rysunku?
- **choices:** A) 6 · B) 8 · C) 10 · D) 11
- **model reasoning:** Figura to trójkąt (lewy „korpus”) połączony w punkcie na swoim boku ze zbieżną w tym samym punkcie linią „spinającą” (poziomą przekątną) z małym trójkątem ("ogon") po prawej stronie. Korpus, przecięty odcinkiem poziomym, daje 3 trójkąty (cały + dwie połówki); ogon analogicznie daje kolejne 3 trójkąty (cały + dwie połówki). Łącznie 3+3 = 6 trójkątów.

### `9d70e737` · szkolny_2017-2018_malopolskie_q5 · _closed_single_
- **key:** `C` **· model:** `D` **· conf:** high
- **Q:** Trzy proste przecinają się tak jak na rysunku. Ile stopni ma kąt α ?
- **choices:** A) 150° · B) 120° · C) 100° · D) 80°
- **model reasoning:** The three lines form a triangle. The shaded 60° at the top is vertical to the triangle's interior angle there, so that interior angle = 60°. The shaded 140° is the exterior angle at the bottom-right vertex, adjacent (supplementary) to the interior angle there, so interior angle = 180−140 = 40°. By the exterior-angle theorem (or angle sum 180°): α = 180−60−40 = 80°.

### `aff9ae09` · szkolny_2018_podkarpackie_2_q1 · _closed_single_
- **key:** `B` **· model:** `C` **· conf:** high **· ⚠ already flagged:** key says B (=38) but arithmetic gives 47 (=C); also choice A missing in source
- **Q:** Antek ma klocki w dwóch pudełkach, łącznie 85 klocków. W pierwszym pudełku jest o 9 klocków więcej niż w drugim. Ile klocków jest w pierwszym pudełku?
- **choices:** B) 38 · C) 47 · D) 29 · E) 76
- **model reasoning:** Suma = 85, różnica = 9. Pierwsze pudełko = (85+9)/2 = 47.

### `5f3fc581` · szkolny_2018_podkarpackie_q17 · _true_false_
- **key:** `FPFF` **· model:** `FPFP` **· conf:** high **· ⚠ already flagged:** true/false: key marks "więcej niż 13" as F though 40/3≈13,33; only defensible under a whole-buns-sold (discrete) reading -- borderline
- **Q:** Janek i Kasia sprzedają na plaży jagodzianki. W czasie w którym Kasia sprzedaje cztery Janek sprzedaje ich trzy. Jeśli Janek sprzedał 10 jagodzianek to Kasia w tym czasie sprzedała:
- **choices:** 1) Mniej niż 11 jagodzianek. · 2) Więcej niż 11 jagodzianek. · 3) Mniej niż 13 jagodzianek. · 4) Więcej niż 13 jagodzianek.
- **model reasoning:** Stosunek Kasia:Janek = 4:3. Janek=10 ⇒ Kasia = 10·4/3 = 40/3 ≈ 13,33. Mniej niż 11 — F; więcej niż 11 — P; mniej niż 13 — F; więcej niż 13 — P.

### `7e3916f6` · szkolny_2019-2020_slaskie_q13 · _true_false_
- **key:** `FPPP` **· model:** `FPFP` **· conf:** med
- **Q:** Oceń, czy poniższe zdania dotyczące zegara tradycyjnego są prawdziwe, czy fałszywe.
- **choices:** 1) Kąt wypukły, który tworzą wskazówki zegara o godzinie 14:25 jest kątem prostym. · 2) Kąt wypukły, który tworzą wskazówki zegara o godzinie 04:40 ma miarę 100°. · 3) Kąt półpełny wskazówki zegara tworzą w ciągu godziny tylko raz. · 4) Od godziny 14:59 do godziny 15:59 wskazówki zegara utworzą kąt prosty dwa razy.
- **model reasoning:** 14:25: minute=150°, hour=72.5°, diff=77.5° ≠90° — F. 04:40: minute=240°, hour=140°, diff=100° — P. Straight-angle (180°) config occurs 11 times in 12h, so one hour (5:00–5:59) has none — the 'only once every hour' claim fails — F. Between 14:59 and 15:59, right angles (90°) occur at exactly 15:00:00 and ≈15:32:44 — two times — P.

### `7bbe0c0c` · szkolny_2019-2020_warminsko-mazurskie_q10 · _closed_single_
- **key:** `B3` **· model:** `B` **· conf:** med
- **Q:** Kasia poprawnie zaokrągliła liczbę 7 462 do pełnych setek i otrzymała liczbę m , a Paweł poprawnie zaokrąglił liczbę 7 492 do pełnych tysięcy i otrzymał liczbę n . Czy liczby m i n są równe? Wybierz odpowiedź A (Tak) albo B (Nie) i jej uzasadnienie spośród 1, 2 albo 3. Uzasadnienia (…, ponieważ): początkowa liczba Kasi jest mniejsza od początkowej liczby Pawła. cyfra tysięcy każdej z początkowych liczb jest taka sama. otrzymane zaokrąglenia różnią się o 500.
- **choices:** A) Tak · B) Nie
- **model reasoning:** m = zaokrąglenie 7462 do pełnych setek = 7500. n = zaokrąglenie 7492 do pełnych tysięcy = 7000. m ≠ n, więc odpowiedź to Nie (B), uzasadnienie 3 — zaokrąglenia różnią się o 500 (7500−7000=500).

### `40319bda` · szkolny_2019-2020_wielkopolskie_q17 · _true_false_
- **key:** `FP` **· model:** `PP` **· conf:** high
- **Q:** Oto dwoje spośród wielu polskich uczonych, którzy zasłynęli na świecie: Maria Skłodowska-Curie i Mikołaj Kopernik. Maria Skłodowska-Curie: 1867–1934. Mikołaj Kopernik: 1473–1543. Czy w poniższych zdaniach prawidłowo zapisano liczby? Zaznacz właściwą odpowiedź.
- **choices:** 1) Mikołaj Kopernik urodził się w roku MCCCCLXXIII. · 2) Maria Skłodowska-Curie żyła LXVII lat.
- **model reasoning:** MCCCCLXXIII = 1000+400+70+3 = 1473 — matches Kopernik's birth year (true). 1934−1867 = 67; LXVII = 50+10+5+1+1 = 67 — matches (true).

### `78dcf737` · szkolny_2020_dolnoslaskie_q17 · _closed_single_
- **key:** `A` **· model:** `D` **· conf:** high
- **Q:** W kwadracie podzielonym na 36 jednakowych mniejszych kwadratów wyznaczono figurę zaznaczoną na rysunku szarym kolorem. Jaką częścią pola dużego kwadratu jest pole tej figury?
- **choices:** A) 2 3 · B) 3 4 · C) 7 12 · D) 4 9
- **model reasoning:** Reading the grid, the shaded polygon's vertices (in grid units of the 6×6 square) are: (3,0),(4,2),(6,3),(4,4),(6,5),(4,6),(3,4),(2,6),(0,5),(2,4),(0,3),(2,2). Shoelace formula gives area = 16 grid-units²; total square = 36. Fraction = 16/36 = 4/9.

### `a306e3aa` · szkolny_2021-2022_swietokrzyskie_q9 · _true_false_
- **key:** `PPP` **· model:** `PPF` **· conf:** med
- **Q:** Dany jest prostokąt, w którym różnica długości dwóch kolejnych boków jest równa 12 cm a stosunek długości tych boków wynosi 7:3. Oceń, czy poniższe zdania są prawdziwe. Zaznacz P, jeśli zdanie jest prawdziwe, lub F – jeśli jest fałszywe.
- **choices:** 1) Pole tego prostokąta wynosi 1,89 dm². · 2) Kwadrat o obwodzie równym obwodowi danego prostokąta ma bok długości 150 mm. · 3) Z danego prostokąta można wyciąć kwadrat o polu 8,1 · 10 − 7 a.
- **model reasoning:** Boki w stosunku 7:3, różnica 12cm → 4k=12, k=3 → boki 21cm i 9cm. 1. Pole=21·9=189 cm² = 1,89 dm² → P. 2. Obwód=2(21+9)=60cm=600mm; bok kwadratu=600/4=150mm → P. 3. Największy kwadrat wycięty z prostokąta ma bok 9cm, pole 81 cm² = 8,1·10⁻⁵ a (1 a = 10⁶ cm²), a nie 8,1·10⁻⁷ a → F.

### `8a764635` · szkolny_2022-2023_malopolskie_q9 · _closed_single_
- **key:** `B, D` **· model:** `D` **· conf:** med
- **Q:** Dane są liczby a = 4 250 , b = 225 20 , c = 9 64 · 5 128 , d = 15 125 . Wybierz nierówność prawdziwą.
- **choices:** A) a < b · B) a < c · C) c < d · D) d < a
- **model reasoning:** a = 4^250 = 2^500 = 16^125. d = 15^125. Ponieważ 16 > 15 i wykładniki są równe (125), 16^125 > 15^125, czyli d < a. (b = 225^20 = 15^40, c = 9^64·5^128 = 15^128, więc b < d < c — te dwie nierówności A i C są fałszywe.)

### `19d5a24a` · szkolny_2022-2023_warminsko-mazurskie_q10 · _closed_single_
- **key:** `C` **· model:** `B` **· conf:** high
- **Q:** Wskaż zdanie prawdziwe:
- **choices:** A) Półprosta ma długość, ale nie ma pola. · B) Odcinek ma początek i koniec. · C) Każdy równoległobok jest trapezem. · D) Środek koła nie należy do koła.
- **model reasoning:** A - fałsz: półprosta jest nieograniczona, więc nie ma określonej (skończonej) długości. B - prawda: odcinek ma dokładnie dwa końce (początek i koniec). C - fałsz (w typowym ujęciu szkolnym trapez ma dokładnie jedną parę boków równoległych, więc równoległobok trapezem nie jest). D - fałsz: koło to figura wraz z wnętrzem, więc środek do niego należy.

### `bb1c8e9e` · szkolny_2023_lodzkie_q11 · _closed_single_
- **key:** `B1` **· model:** `B` **· conf:** high
- **Q:** W klasie 8a jest 10 dziewcząt i 15 chłopców a w dwudziestosześcioosobowej klasie 8b jest tyle samo dziewcząt i chłopców. Średni wzrost dziewcząt w klasie 8a to 151 cm, średni wzrost chłopców w tej klasie to 153 cm. W klasie 8b – średni wzrost dziewcząt to 154 cm a średni wzrost chłopców to 150 cm. Wskaż zdanie prawdziwe A–C oraz jego uzasadnienie 1–3. Uzasadnienia: 1) 152,2 > 152 2) 154 > 153 3) 151 + 153 2 = 154 + 150 2
- **choices:** A) Średni wzrost wszystkich uczniów w obu klasach jest taki sam. · B) Średni wzrost uczniów w klasie 8a jest większy niż średni wzrost uczniów w klasi … · C) Średni wzrost uczniów w klasie 8b jest większy niż średni wzrost uczniów w klasi …
- **model reasoning:** 8a: (10·151+15·153)/25 = 3805/25 = 152,2 cm. 8b: 13 dziewcząt, 13 chłopców: (13·154+13·150)/26 = (154+150)/2 = 152 cm. 152,2 > 152, więc średni wzrost w 8a jest większy (uzasadnienie 1).

### `f4c5a498` · szkolny_2024_lodzkie_q11 · _closed_single_
- **key:** `A1` **· model:** `A` **· conf:** high
- **Q:** Kwota wolna od podatku wynosi w Polsce 30000 zł. Oznacza to, że podatek płacony jest jedynie od dochodów powyżej 30000 zł. Jeśli podatnik zarabia nie więcej niż 120000 zł, to podatek wynosi 12%. Dochód powyżej 120000 zł objęty jest podatkiem 32%. Pan Mateusz zarobił w 2022 roku 150000 zł a pani Zofia - 100000 zł. Niech R oznacza różnicę w zapłaconych przez nich podatkach w 2022 roku. Wskaż zdanie prawdziwe A-C oraz jego uzasadnienie 1-3. Uzasadnienia (…, ponieważ): Pan Mateusz zapłacił 20400 zł  …
- **choices:** A) R to kwota większa niż podatek zapłacony przez panią Zofię · B) R jest równe kwocie podatku zapłaconego przez panią Zofię · C) R to kwota niższa niż podatek zapłacony przez panią Zofię
- **model reasoning:** Mateusz (150000 zł): 12%·90000 + 32%·30000 = 10800+9600 = 20400 zł. Zofia (100000 zł): 12%·70000 = 8400 zł. R = 20400−8400 = 12000 zł, co jest większe niż podatek Zofii (8400 zł) — odpowiedź A, uzasadnienie 1.

### `1c67182f` · szkolny_2024_lubelskie_q7 · _true_false_
- **key:** `FPFPP` **· model:** `FPFFP` **· conf:** med
- **Q:** Poniżej podane zdania dotyczą figur osiowosymetrycznych. Oceń prawdziwość podanych zdań. Wybierz P, jeśli zdanie jest prawdziwe, albo F – jeśli jest fałszywe. Wybraną odpowiedź zaznacz kółkiem.
- **choices:** 1) Każdy trójkąt ma dokładnie trzy osie symetrii. · 2) Istnieje romb, który ma cztery osie symetrii. · 3) Jedną z osi symetrii każdego prostokąta jest prosta zawierająca jego przekątną. · 4) Trapez prostokątny równoramienny ma co najmniej dwie osie symetrii. · 5) Figurą osiowosymetryczną jest trójkąt o kątach wewnętrznych 20°, 20° i 140°.
- **model reasoning:** 1) Only equilateral triangles have 3 axes, not every triangle → F. 2) A square is a rhombus with 4 axes → P. 3) Only for a square is the diagonal an axis; not for every rectangle → F. 4) A right-angled trapezoid cannot also be isosceles (that would force a rectangle, no longer a proper trapezoid) → F. 5) Triangle 20°,20°,140° is isosceles, so it has an axis of symmetry → P.

### `82316831` · szkolny_2024_podlaskie_q9 · _closed_single_
- **key:** `B` **· model:** `A` **· conf:** high
- **Q:** Pole narysowanego obok równoległoboku jest równe:
- **choices:** A) 35 · B) 60 · C) 70 · D) 80
- **model reasoning:** Podstawa równoległoboku ma długość 7, a odpowiadająca jej wysokość (odcinek prostopadły do podstawy) ma długość 5. Pole = podstawa × wysokość = 7 × 5 = 35.

### `f3461a10` · szkolny_2026_kujawsko-pomorskie_q13 · _closed_single_
- **key:** `A` **· model:** `D` **· conf:** low
- **Q:** Wiedząc, że m ∥ n , | BC | = 15 cm, | CD | = 8 cm, | CE | = 20 cm oraz kąty przy wierzchołku B i C są równe i mają miarę α (patrz rysunek). Obwód trapezu ABCD wynosi:
- **choices:** A) 71 cm · B) 63 cm · C) 51 cm · D) nie można obliczyć
- **model reasoning:** Z m∥n i równości kątów α przy B i C wynika jedynie AB∥DC (kąty odpowiadające/naprzemianległe) – to jest automatycznie spełnione i nie wyznacza konkretnej miary α. Przy nieustalonej wartości α (i tym samym kształtu trapezu) długości boków AB oraz AD nie są jednoznacznie wyznaczone przez dane BC=15, CD=8, CE=20 – obwodu nie da się jednoznacznie obliczyć.

### `02a89229` · szkolny_2026_lubelskie_q12 · _true_false_
- **key:** `FFFP` **· model:** `FFPP` **· conf:** med
- **Q:** Poniżej podane są cztery zdania dotyczące figur płaskich. Oceń prawdziwość podanych zdań. Wybierz P, jeśli zdanie jest prawdziwe, albo F – jeśli jest fałszywe. Wybraną odpowiedź zaznacz kółkiem.
- **choices:** 1) W każdym trójkącie równoramiennym wysokość poprowadzona z wierzchołka kąta przy  … · 2) W każdym trójkącie prostokątnym długość przeciwprostokątnej jest równa sumie dłu … · 3) Jeżeli w prostokącie długość przekątnej jest równa długości jego boku, to prosto … · 4) Istnieje czworokąt, który jest jednocześnie rombem, prostokątem i trapezem.
- **model reasoning:** 1. Wysokość z wierzchołka kąta przy podstawie dzieli przeciwległy bok (ramię) na połowy tylko w trójkącie równobocznym, nie w każdym równoramiennym — fałsz. 2. Przeciwprostokątna < suma przyprostokątnych (nierówność trójkąta) — fałsz. 3. Przekątna prostokąta zawsze jest dłuższa niż każdy bok (d=√(a²+b²)>a,b), więc założenie nigdy nie zachodzi — implikacja prawdziwa (pusto spełniona) — prawda. 4. Kwadrat jest jednocześnie rombem, prostokątem i (przy definicji trapezu „co najmniej jedna para boków równoległych”) trapezem — prawda.

### `427ec56e` · wojewodzki_2013_podkarpackie_q11 · _closed_single_
- **key:** `B` **· model:** `A` **· conf:** low
- **Q:** Suma miar wszystkich kątów zaznaczonych na rysunku wynosi:
- **choices:** A) 180° · B) 360° · C) 270° · D) 540°
- **model reasoning:** Figura to trójkąt, którego boki przedłużono tworząc trzy „grociki” z zaznaczonymi kątami. Poprzez rachunek kątów wierzchołkowych i sumy kątów w trójkątach suma zaznaczonych kątów sprowadza się do sumy kątów trójkąta = 180°. (Rekonstrukcja rysunku niepewna — niska pewność.)

### `195936cd` · wojewodzki_2013_podkarpackie_q4 · _closed_single_
- **key:** `A` **· model:** `C` **· conf:** low
- **Q:** Latarnia morska ma wysokość 80 m. Na planie ma ona wysokość 3 cm i 2 5 całej narysowanej latarni. W jakiej skali narysowano ten rysunek?
- **choices:** A) 1:1600 · B) 1:2000 · C) 1: 400 17 · D) nie da się policzyć
- **model reasoning:** Wysokość na planie = 3 2/5 cm = 17/5 cm. Skala = 80 : 17/5 = 400/17. (Niejednoznaczne sformułowanie zadania — pomiar w metrach vs centymetrach budzi wątpliwości, stąd niska pewność.)

### `b12a1c7a` · wojewodzki_2014-2015_slaskie_q16 · _true_false_
- **key:** `FPPF` **· model:** `FFPF` **· conf:** med
- **Q:** Oceń, czy podane zdania są prawdziwe czy fałszywe. Zaznacz właściwą odpowiedź.
- **choices:** 1) Trójkąt o bokach 2 dm, 0,2 m, 20 mm jest trójkątem równobocznym. · 2) Istnieje trapez prostokątny równoramienny. · 3) Przekątne równoległoboku mogą być do siebie prostopadłe. · 4) W równoległoboku przekątne nie muszą się przecinać w połowie.
- **model reasoning:** 1) Boki: 2dm=20cm, 0,2m=20cm, 20mm=2cm → 20,20,2 cm — trójkąt równoramienny, ale NIE równoboczny. Fałsz. 2) Trapez prostokątny ma dwa kąty proste przy jednym ramieniu; aby był równoramienny, oba kąty przy podstawie musiałyby być równe (w tym oba proste), co daje prostokąt — nie jest to właściwy trapez. Fałsz. 3) W rombie (szczególnym równoległoboku) przekątne są prostopadłe. Prawda. 4) W każdym równoległoboku przekątne zawsze przecinają się w połowie (własność równoległoboku) — więc zdanie że „nie muszą” jest fałszywe.

### `90a42c1a` · wojewodzki_2014_podlaskie_sp_q15 · _closed_single_
- **key:** `A` **· model:** `B` **· conf:** med
- **Q:** Czworokąt ABCD jest rombem. Miara kąta x , zaznaczonego na rysunku, jest równa
- **choices:** A) 50° · B) 40° · C) 30° · D) 20°
- **model reasoning:** Z wierzchołka D poprowadzono wysokość na prostą AB (punkt E). W trójkącie prostokątnym ADE kąt A = 50°, więc kąt ADE = 90° − 50° = 40° = x.

### `4c10bc8d` · wojewodzki_2018-2019_zachodniopomorskie_q11 · _closed_single_
- **key:** `C` **· model:** `D` **· conf:** high
- **Q:** Jeśli bok kwadratu zewnętrznego na rysunku ma długość 12, a zakreślone łuki mają promień o połowę mniejszy od boku tego kwadratu, to pole zacieniowanej figury jest równe:
- **choices:** A) 9 π − 18 · B) 18 π − 36 · C) 36 π − 72 · D) 72 π − 144
- **model reasoning:** Kwadrat o boku 12; okręgi o promieniu 6 są środkowane w środkach boków kwadratu (każdy przechodzi przez środek kwadratu i przez dwa sąsiednie wierzchołki). Zacieniowane płatki to soczewki (przecięcia) sąsiednich okręgów. Odległość środków sąsiednich okręgów d=6√2, promień r=6: pole soczewki = 2r²cos⁻¹(d/2r) − (d/2)√(4r²−d²) = 18π−36. Cztery płatki: 4(18π−36) = 72π−144.

### `52adcef5` · wojewodzki_2018_opolskie_q2 · _true_false_
- **key:** `FFF` **· model:** `FFP` **· conf:** high
- **Q:** W urnie znajduje się łącznie 100 kul w kolorach: czerwonym, zielonym, żółtym i niebieskim. Nie wiemy ile jakich jest. Jaką najmniejszą liczbę kul należy wyjąć, aby zawsze mieć pewność, że wśród wylosowanych kul będzie co najmniej 10 w jednym kolorze. Przy każdym zdaniu wpisz TAK lub NIE.
- **choices:** 1) 13 · 2) 25 · 3) 40
- **model reasoning:** Aby uniknąć 10 kul w jednym z 4 kolorów, można wylosować co najwyżej 9 kul każdego koloru: 4·9 = 36 kul bez gwarancji. Zatem dopiero 37. losowanie daje pewność. 13 < 37 — nie gwarantuje; 25 < 37 — nie gwarantuje; 40 > 37 — gwarantuje.

### `2a4c89fc` · wojewodzki_2018_podkarpackie_q6 · _closed_single_
- **key:** `C` **· model:** `D` **· conf:** low
- **Q:** Suma miar wszystkich kątów zaznaczonych na rysunku wynosi:
- **choices:** A) 270° · B) 150° · C) 360° · D) 180°
- **model reasoning:** Figura to dwa trójkąty stykające się w punkcie przecięcia dwóch prostych (kąty przy tym punkcie są wierzchołkowe, więc równe). Suma kątów obu trójkątów = 360°, a suma kątów zaznaczonych = 360° − 2·(kąt przy przecięciu). Przy założeniu, że proste przecinają się pod kątem prostym (jak sugeruje rysunek), suma = 360°−180° = 180°. Odpowiedź niepewna ze względu na czytanie kąta z rysunku.

### `59bc0f61` · wojewodzki_2019-2020_warminsko-mazurskie_q15 · _closed_single_
- **key:** `A3` **· model:** `A` **· conf:** high
- **Q:** Czy liczby 216 i 621 są wielokrotnościami tej samej nieparzystej liczby dwucyfrowej? Wybierz odpowiedź A (Tak) albo B (Nie) i jej uzasadnienie spośród 1, 2 albo 3. Uzasadnienia (…, ponieważ): sumy cyfr w obu liczbach są równe. jedna z liczb jest parzysta, a druga nieparzysta. dzielnikiem każdej z nich jest 3 3 .
- **choices:** A) Tak · B) Nie
- **model reasoning:** 216 = 2³·3³, 621 = 3³·23. Obie liczby są podzielne przez 3³ = 27 — nieparzystą liczbę dwucyfrową. Odpowiedź: Tak, uzasadnienie 3.

### `d8fa6a30` · wojewodzki_2020-2021_zachodniopomorskie_q2 · _closed_single_
- **key:** `A` **· model:** `D` **· conf:** high
- **Q:** W trapezie trzy boki mają tę samą długość. Między miarami kątów α i β tego trapezu zachodzi związek:
- **choices:** A) β = 2 α · B) α = 3 2 β · C) β = 3 2 α · D) α = β
- **model reasoning:** Jedyny niezdegenerowany sposób, by trapezoid miał trzy równe boki (bez zamiany go w równoległobok), to gdy równe są oba ramiona i krótsza podstawa. Trapez o równych ramionach jest zawsze trapezem równoramiennym (dowód przez współrzędne / przystawanie trójkątów), a w trapezie równoramiennym kąty przy dłuższej podstawie są równe. Stąd α = β.

### `e542bec1` · wojewodzki_2020_opolskie_q5 · _true_false_
- **key:** `FPF` **· model:** `PPF` **· conf:** med **· ⚠ already flagged:** official key prints NIE/TAK/NIE=FPF but is internally inconsistent: stmt2 (288√6 cm³ volume) should be NIE given the 60° edge-angle premise (h=2√6 -> V=96√6); key's TAK contradicts its own stmt1 NIE; stored official FPF, verify in blind pass
- **Q:** Wysokość ostrosłupa prawidłowego czworokątnego, którego pole podstawy wynosi 144 cm², tworzy z krawędzią boczną kąt 60°. Przy każdym zdaniu wpisz TAK lub NIE.
- **choices:** 1) Krawędź boczna tego ostrosłupa ma długość 12 2 cm. · 2) Objętość ostrosłupa wynosi 288 6 cm³. · 3) Wysokość ściany bocznej wynosi 3 10 .
- **model reasoning:** Bok podstawy a=12 cm (pole=144), połowa przekątnej d=6√2 cm. Przy kącie 60° między krawędzią boczną a płaszczyzną podstawy: l=d/cos60°=2d=12√2 cm (zgodne ze zdaniem 1). h=l·sin60°=6√6 cm, V=(1/3)·144·6√6=288√6 cm³ (zgodne ze zdaniem 2). Wysokość ściany bocznej: m=√(h²+6²)=√252=6√7 ≠ 3√10 — fałsz. (Uwaga: dosłowny opis kąta między wysokością bryły a krawędzią boczną dałby inne, niepasujące wartości — powyższa interpretacja zgadza się z podanymi liczbami 12√2 i 288√6.)

### `16ba9b1a` · wojewodzki_2022_lubuskie_q21 · _true_false_
- **key:** `PP` **· model:** `FF` **· conf:** med
- **Q:** Prostokąt o bokach: 5 x 2 + x + 3 oraz 8 x 2 + 9 został podzielony odcinkami na cztery mniejsze prostokąty tak, jak pokazano na rysunku. W oparciu o te dane oceń, czy informacje dotyczące zacieniowanego prostokąta są prawdziwe.
- **choices:** 1) Obwód zacieniowanego prostokąta jest równy 8 x 2 + 2 x + 16 . · 2) Pole zacieniowanego prostokąta można opisać wyrażeniem 2 ( 2 x 4 + x 3 + 8 x 2 + …
- **model reasoning:** Shaded (top-left) width = (8x²+9)−(6x²+3)=2x²+6; height = (5x²+x+3)−(1−x²)=6x²+x+2 (sums check out exactly against the given totals). Perimeter = 2(2x²+6+6x²+x+2)=16x²+2x+16 ≠ 8x²+2x+16 (stmt 1 false). Area = (2x²+6)(6x²+x+2)=12x⁴+2x³+40x²+6x+12 ≠ 4x⁴+2x³+16x²+6x+12 (stmt 2 false).

### `5b7181e6` · wojewodzki_2023-2024_swietokrzyskie_q11 · _true_false_
- **key:** `FPP` **· model:** `FFP` **· conf:** high **· ⚠ already flagged:** official key marks statement 2 (parallelogram perimeter = 2√5+2√10) as PRAWDA, but the actual perimeter is 4√5+4√10 (printed value is only one of each side); stored official FPP, likely key error, verify in blind pass
- **Q:** Odcinek o końcach w punktach A = ( 6 , 0 ) i B = ( 4 , 4 ) jest bokiem równoległoboku ABCD , a punkt S = ( 2 , 1 ) jest środkiem symetrii tego równoległoboku. Oceń, czy poniższe zdania są prawdziwe. Zaznacz P, jeśli zdanie jest prawdziwe lub F – jeśli jest fałszywe.
- **choices:** 1) Jeden z wierzchołków tego równoległoboku ma współrzędne ( − 2 , 0 ) . · 2) Obwód tego równoległoboku jest równy 2 5 + 2 10 · 3) Pole tego równoległoboku jest równe 28.
- **model reasoning:** S jest środkiem symetrii: C=2S−A=(−2,2), D=2S−B=(0,−2). Żaden wierzchołek nie ma współrzędnych (−2,0) → F. |AB|=√((−2)²+4²)=2√5, |BC|=√(6²+2²)=2√10. Obwód=2(2√5+2√10)=4√5+4√10 ≠ 2√5+2√10 → F. Pole (iloczyn wektorowy AB×AD)=|(−2)(−2)−4·(−6)|=|4+24|=28 → P.

### `f5277266` · wojewodzki_2023_lubuskie_q23 · _true_false_
- **key:** `FPP` **· model:** `PPP` **· conf:** high
- **Q:** Oceń informacje dotyczące wielokątów.
- **choices:** 1) Podczas lekcji geometrii Zosia narysowała dwa trójkąty (jak na rysunku). Zosia t … · 2) Sześciokąt foremny i trójkąt równoboczny mają jednakowe pola równe 18 3 cm². Sto … · 3) Dla każdej liczby naturalnej n obwód równoległoboku przedstawionego na rysunku j …
- **model reasoning:** 1) Oba trójkąty mają kąty 26°,62°,92°, ale bok 4 cm leży naprzeciw różnych kątów (92° i 62°) – trójkąty są podobne, lecz różnej wielkości, więc nie są przystające – prawda. 2) Pole trójkąta: (√3/4)a²=18√3 ⟹ a=6√2. Pole sześciokąta: (3√3/2)b²=18√3 ⟹ b=2√3. a/b=6√2/(2√3)=√6 – prawda. 3) Obwód równoległoboku=2[2(n+2)+3(n+7)]=10n+50=5(2n+10), zawsze podzielny przez 5 – prawda.

### `479c518d` · wojewodzki_2023_opolskie_q5 · _true_false_
- **key:** `PPF` **· model:** `FFF` **· conf:** low
- **Q:** Siatka ostrosłupa tworzy kwadrat o boku długości 12 cm. Przy każdym zdaniu wpisz TAK lub NIE.
- **choices:** 1) Długość jednej z wysokości tego ostrosłupa jest równa 12 cm. · 2) Objętość ostrosłupa jest równa 72 cm³. · 3) Suma długości krawędzi ostrosłupa wynosi ( 6 2 + 12 5 + 36 ) cm.
- **model reasoning:** Siatka będąca kwadratem 12×12 składająca się z 4 przystających trójkątów prostokątnych równoramiennych (przekątne kwadratu, ramiona 6√2, przeciwprostokątne 12) po złożeniu (dwa przeciwległe wierzchołki się spotykają) daje czworościan o krawędziach 6√2,6√2,6√2 (do wspólnego wierzchołka) i 12,12,12 (podstawa - trójkąt równoboczny). Pole = pole 4 trójkątów = 144 cm² (zgadza się z polem kwadratu 12×12 - kontrola poprawności modelu). Wysokość bryły (do podstawy równobocznej) = 2√6 ≈ 4,9 cm (nie 12) → F. Objętość = 72√2 ≈ 101,8 cm³ (nie 72) → F. Suma krawędzi = 3·6√2+3·12 = 18√2+36 (nie 6√2+12√5+36) …

### `b9c79dff` · wojewodzki_2023_podlaskie_q11 · _closed_single_
- **key:** `TC` **· model:** `C` **· conf:** high
- **Q:** W loterii „Szczęśliwa piątka” jest 5 losów wygrywających i 20 przegrywających, zaś w loterii „Szczęśliwa dwudziestka” jest 20 losów wygrywających i 80 przegrywających. Czy kupując jeden los, prawdopodobieństwo, że będzie to los wygrywający jest takie samo dla obu loterii? Wybierz odpowiedź T (Tak) albo N (Nie) i jej uzasadnienie spośród A , B albo C . (Poprawna odpowiedź podana jest w formacie: litera T/N oraz litera uzasadnienia.)
- **choices:** A) losów wygrywających w loterii „Szczęśliwa dwudziestka” jest więcej niż w loterii … · B) wszystkich losów w loterii „Szczęśliwa piątka” jest mniej niż w loterii „Szczęśl … · C) proporcje liczby losów wygrywających do wszystkich losów w każdej z loterii są t …
- **model reasoning:** Szczęśliwa piątka: p = 5/25 = 1/5. Szczęśliwa dwudziestka: p = 20/100 = 1/5. Prawdopodobieństwa są równe (Tak), bo proporcje losów wygrywających do wszystkich są takie same → uzasadnienie C. Pełna odpowiedź: T, C.

### `4521f604` · wojewodzki_2024_lubelskie_q7 · _true_false_
- **key:** `FFFF` **· model:** `PFFF` **· conf:** med
- **Q:** Poniżej podane są zdania dotyczące ostrosłupów. Oceń prawdziwość podanych zdań. Wybierz P, jeśli zdanie jest prawdziwe, albo F – jeśli jest fałszywe.
- **choices:** 1) Pole powierzchni bocznej ostrosłupa może być równe polu jego podstawy. · 2) Ostrosłup prawidłowy, którego ściany boczne są trójkątami równobocznymi, jest cz … · 3) W ostrosłupach prawidłowych wszystkie krawędzie mają jednakową długość. · 4) Ostrosłup, którego podstawą jest kwadrat, jest ostrosłupem prawidłowym.
- **model reasoning:** 1. Prawda — istnieją ostrosłupy, w których pole boczne równa się polu podstawy (można to skonstruować, zmieniając kształt i wysokość). 2. Fałsz — ostrosłup prawidłowy czworokątny o ścianach bocznych równobocznych (np. "egipska" bryła) nie jest czworościanem foremnym. 3. Fałsz — w ostrosłupie prawidłowym krawędzie boczne mogą mieć inną długość niż krawędzie podstawy. 4. Fałsz — ostrosłup o podstawie kwadratu jest prawidłowy tylko, gdy wierzchołek leży nad środkiem podstawy.

### `929ed70c` · wojewodzki_2025-2026_wielkopolskie_q15 · _closed_single_
- **key:** `C` **· model:** `B` **· conf:** high
- **Q:** Oblicz pole zacieniowanego obszaru trójkąta równobocznego ABC o boku 12 (patrz – rysunek pomocniczy poniżej). Średnicami okręgów o środkach w punktach P i S są odpowiednio boki AB i BC trójkąta.
- **choices:** A) 6 π + 9 3 · B) 12 π · C) 18 π − 9 3 · D) 15 π
- **model reasoning:** Przy A=(0,0), B=(12,0), C=(6,6√3): P=(6,0), r=6; S=(9,3√3), r=6; |PS|=6=r, więc kąty środkowe wspólnej cięciwy KB wynoszą 120°. Pełna soczewka (przecięcie kół) = 24π−18√3, ale część soczewki wystaje poza trójkąt przy wierzchołku B (dwa odcinki kołowe o kącie 60°, łącznie 12π−18√3). Pole zacieniowane = (24π−18√3)−(12π−18√3) = 12π.

### `2a843698` · wojewodzki_2025_lubuskie_q10 · _closed_single_
- **key:** `A, C` **· model:** `A` **· conf:** high
- **Q:** Popularny format papieru A4 jest prostokątem, w którym stosunek v = długość szerokość jest tak wybrany, że zginając kartkę na dwoje przez środek długości, otrzymujemy nowy prostokąt o bokach w tym samym stosunku v = długość szerokość . Stosunek ten spełnia warunek
- **choices:** A) v = 2 · B) v 2 = 4 · C) v 4 = 4 · D) v = 1 + 5 2
- **model reasoning:** Składanie na pół: nowy prostokąt ma boki W i L/2, przy zachowaniu tej samej proporcji: L/W = W/(L/2) ⇒ L²=2W² ⇒ v=L/W=√2. To klasyczny format ISO 216 (A4).

### `da0bf3e0` · wojewodzki_2025_lubuskie_q11 · _closed_single_
- **key:** `B, C, D` **· model:** `C` **· conf:** low
- **Q:** Wartość wyrażenia 2 64 3 jest równa
- **choices:** A) 2 2 · B) 2 0 · 2 · C) 2 4 2 3 · D) 1 : 1 2
- **model reasoning:** ∛√64 = 64^(1/6) = 2 (bo 64=2⁶). Wewnątrz pierwiastka: 2·2=4, więc √4=2. W zestawie odpowiedzi B, C i D redukują się również do 2 (2⁰·2=2; 2⁴/2³=2; 1:½=2), a jedynie A daje 4 — wybrano C jako typowy przykład prawa działań na potęgach, ale odpowiedź jest niepewna z powodu wielokrotnego dopasowania w zestawie.

### `4c1719aa` · wojewodzki_2025_lubuskie_q12 · _closed_single_
- **key:** `A, C` **· model:** `A` **· conf:** med
- **Q:** Objętość ostrosłupa prawidłowego czworokątnego o wysokości 60 mm oraz krawędzi podstawy równej 0,02 m jest równa
- **choices:** A) 8 ml · B) 24 cm³ · C) 0,008 l · D) 800 mm³
- **model reasoning:** V = (1/3)·a²·h = (1/3)·(2 cm)²·6 cm = 8 cm³ = 8 ml. (Opcja C: 0,008 l to ta sama objętość w innej jednostce — wybrano A jako najbardziej bezpośrednie dopasowanie jednostek cm³=ml.)

### `fb3bd243` · wojewodzki_2025_lubuskie_q8 · _closed_single_
- **key:** `A, B` **· model:** `A` **· conf:** med
- **Q:** Wartość wyrażenia 2 − ( ( 0,4 2 2 − 1,3 · 6 13 ) : ( 1 2 ) 2 ) jest
- **choices:** A) równa wartości wyrażenia 2 ( 50 − 18 ) · B) liczbą przeciwną do wartości wyrażenia − ( − 2 ) 4 + 64 3 + 1 0,1 · C) liczbą mniejszą od 20 − 1 · D) liczbą podzielną przez 3
- **model reasoning:** 2 − ((0,4/2² − 1,3·6/13):(1/2)²) = 2 − ((0,1−0,6):0,25) = 2−(−2) = 4. Opcja A: √2(√50−√18)=√100−√36=10−6=4 — zgadza się. (Uwaga: opcja B po przeliczeniu −(−2)⁴+∛√64+1/0,1=−4 też daje „liczbę przeciwną”=4, co jest matematycznym zbiegiem okoliczności w tym zestawie odpowiedzi; A jest najbardziej bezpośrednim dopasowaniem.)

### `5e98c5e0` · wojewodzki_2025_lubuskie_q9 · _closed_single_
- **key:** `A, C` **· model:** `A` **· conf:** med
- **Q:** Jeżeli a ⊕ b = a 2 b + 2 a + b i 3 ⊕ 7 = 2 ⊕ x , to x jest równy
- **choices:** A) 72 5 · B) 7 · C) 14,4 · D) 5 1 3
- **model reasoning:** 3⊕7 = 3²·7+2·3+7 = 76. 2⊕x = 4x+4+x = 5x+4. 5x+4=76 ⇒ x=72/5=14,4. Odpowiada opcji A (forma ułamkowa jest bezpośrednim wynikiem rozwiązania równania; opcja C to ta sama liczba w postaci dziesiętnej).

### `4332683e` · wojewodzki_2025_opolskie_q2 · _true_false_
- **key:** `FPF` **· model:** `FTF` **· conf:** high
- **Q:** Liczbą wymierną nieujemną jest:
- **choices:** 1) − | − 196 | · 2) 5,1 · 10 − 3 · 3) ( 1 − 2 ) 2
- **model reasoning:** 1) −|−√196| = −|−14| = −14 — liczba ujemna, więc F. 2) 5,1·10⁻³ = 0,0051 — liczba wymierna, dodatnia (nieujemna) — T. 3) (1−√2)² = 1−2√2+2 = 3−2√2 — liczba niewymierna (choć dodatnia) — F.

### `4cfa4a34` · wojewodzki_2025_opolskie_q4 · _true_false_
- **key:** `FPP` **· model:** `PFF` **· conf:** high
- **Q:** Janek, Franek i Staszek otrzymali jednakowe prostokątne kartki papieru i mieli zadanie wyciąć z tej kartki jak największy romb. Staszek wykonał zadanie najlepiej. Jego romb miał przekątne długości 30 cm i 40 cm. Większego nie można było wyciąć.
- **choices:** 1) U Staszka odpady stanowiły 50% papierowej kartki. · 2) Każdy bok prostokątnej kartki miał długość mniejszą niż 40 cm. · 3) Obwód prostokątnej kartki wynosił 112 cm.
- **model reasoning:** Największy romb wpisany w prostokąt a×b ma przekątne równe bokom prostokąta (wierzchołki w środkach boków), więc a=30, b=40 cm. 1) Pole rombu = (30·40)/2 = 600 = połowa pola prostokąta (1200) → odpady = 50% — P. 2) Boki prostokąta to 30 cm i 40 cm — jeden bok NIE jest mniejszy niż 40 cm (jest równy 40) — F. 3) Obwód = 2·(30+40) = 140 cm ≠ 112 cm — F.

## Alt-key false positives (5)

Key explicitly lists alternative correct options; the model chose one of them. Not conflicts — recorded for completeness.

### `81b417e8` · rejonowy_2021-2022_malopolskie_q9 · _closed_single_
- **key:** `D lub E` **· model:** `E` **· conf:** high
- **Q:** Filip oglądnął 73 filmy i każdemu z nich przyznał ocenę od 1 do 5 gwiazdek, przy czym każdej z ocen użył co najmniej raz. Gdy posortował te filmy według liczby przyznanych gwiazdek w kolejności od największej do najmniejszej, zauważył, że film znajdujący się dokładnie pośrodku listy otrzymał 3 gwiazdki, tak samo, jak film znajdujący się na ósmym miejscu od końca. Ile filmów otrzymało od Filipa 3 gwiazdki?
- **choices:** A) co najmniej 29 i co najwyżej 34 filmy · B) co najmniej 30 i co najwyżej 35 filmy · C) co najmniej 29 i co najwyżej 68 filmów · D) co najmniej 29 i co najwyżej 69 filmów · E) co najmniej 30 i co najwyżej 69 filmów
- **model reasoning:** 73 filmy posortowane malejąco: pozycja środkowa = 37, pozycja 8 od końca = 66; obie mają 3★, więc (monotoniczność) pozycje 37–66 (30 filmów) muszą mieć dokładnie 3★. Wśród pozycji 1–36 musi wystąpić co najmniej jedna ocena 4★ i jedna 5★ (min. 2 filmy niebędące 3★), a wśród 67–73 co najmniej jedna 1★ i jedna 2★ (min. 2 filmy). Minimum 3★ = 30, maksimum = 73−4 = 69. (Klucz uznaje też odpowiedź D — obie oparte na tym samym przedziale 30–69, tu wybrano dokładny przedział E.)

### `98ecfbef` · szkolny_2022_lodzkie_q2 · _closed_single_
- **key:** `D lub C` **· model:** `D` **· conf:** high
- **Q:** 2021 cyfra rozwinięcia dziesiętnego ułamka 7 11 to:
- **choices:** A) 0 · B) 1 · C) 3 · D) 6 · E) 7
- **model reasoning:** 7/11 = 0,636363... — okres "63" o długości 2. 2021 jest nieparzyste, więc odpowiada pierwszej cyfrze okresu, czyli 6. Odpowiedź D.

### `71adf5b6` · szkolny_2022_lodzkie_q3 · _closed_single_
- **key:** `D lub E` **· model:** `D` **· conf:** high
- **Q:** Odwrotność sumy odwrotności liczb 0,3 i 0,6 jest równa:
- **choices:** A) 9 10 · B) 1 1 9 · C) 5 · D) 1 5 · E) 3 15
- **model reasoning:** 1/0,3 = 10/3, 1/0,6 = 5/3. Suma = 15/3 = 5. Odwrotność 5 to 1/5. Odpowiedź D.

### `d5bb6f98` · wojewodzki_2016_podkarpackie_q14 · _closed_single_
- **key:** `A lub C` **· model:** `C` **· conf:** high
- **Q:** Z trójkąta równobocznego ABC został wycięty trójkąt DEF , którego bokami były odcinki łączące środki boków trójkąta ABC . Jaki procent powierzchni trójkąta ABC stanowi powierzchnia otrzymanej w ten sposób figury?
- **choices:** A) 25% · B) 50% · C) 75% · D) 80%
- **model reasoning:** Trójkąt DEF (środkowy) ma pole równe 1/4 pola ABC. Pozostała figura (trzy narożne trójkąty) ma pole = ABC − DEF = 3/4 = 75% pola ABC.

### `6ae6546d` · wojewodzki_2022-2023_malopolskie_q10 · _closed_single_
- **key:** `C lub D` **· model:** `D` **· conf:** high
- **Q:** Szklanka ma kształt graniastosłupa prawidłowego sześciokątnego, którego wszystkie krawędzie mają taką samą długość. Kieliszek ma kształt ostrosłupa prawidłowego trójkątnego, którego wszystkie krawędzie mają taką samą długość, co krawędź szklanki. Napełniamy szklankę wodą za pomocą kieliszka. Ile najwięcej pełnych kieliszków wody pomieści ta szklanka?
- **choices:** A) 19 · B) 20 · C) 21 · D) 22 · E) 23
- **model reasoning:** Objętość graniastosłupa sześciokątnego o krawędzi s: (3√3/2)s³. Objętość czworościanu foremnego o krawędzi s: s³√2/12. Stosunek = 9√6 ≈ 22,05, więc mieści się dokładnie 22 pełne kieliszki.

## Format — genuine (needs a look) (1)

Format anomalies that are not pure data-typing: empty/annulled keys or partial-match multi-answers.

### `dd3751c9` · rejonowy_2025-2026_pomorskie_q7 · _closed_single_
- **key:** `7.1 – D, 7.2 – A, 7.3 – B, 7.4 – C, 7.5 – C, 7.6 – B, 7.7 – A` **· model:** `7.1: D; 7.2: A; 7.3: B; 7.4: B; 7.5: C; 7.6: B; 7.7: A` **· conf:** high
- **Q:** W zadaniach zamkniętych dokładnie jedna odpowiedź jest poprawna. Wskaż tę odpowiedź otaczając ją kółkiem. 7.1 Ile jest liczb naturalnych czterocyfrowych, których iloczyn cyfr jest równy 5? A. 1 B. 2 C. 3 D. 4 7.2 Jaka cyfra znajduje się na 2025 miejscu po przecinku liczby 20,25(1205)? A. 0 B. 1 C. 2 D. 5 7.3 Średnia arytmetyczna liczb a i b jest równa 3 b 4 . Wartość wyrażenia a b jest równa: A. 1 4 B. 1 2 C. 3 4 D. 1 3 7.4 Wartość wyrażenia ( − | − 1 | − ( − 1 1 4 ) : 0,25 · | − 4,2 + 2 1 5 | ) …
- **model reasoning:** 7.1: iloczyn cyfr=5 (liczba pierwsza) wymaga dokładnie jednej cyfry 5 i trzech jedynek; 4 rozmieszczenia (5111,1511,1151,1115) → D. 7.2: 20,25(1205); po części nieokresowej "25" (2 cyfry) okres "1205" (4 cyfry); pozycja 2025−2=2023, 2023 mod 4=3 → 3. cyfra okresu = 0 → A. 7.3: (a+b)/2=3b/4 ⇒ a=b/2 ⇒ a/b=1/2 → B. 7.4: (−1−(−1,25)):0,25·|−4,2+2,2| = 0,25:0,25·2 = 1·2 = 2 → B. 7.5: 8·4^10+12·4^11+2^5·4^9 = (32+192+32)·4^9 = 256·4^9 = 4^4·4^9 = 4^13 → C. 7.6: skala 8/16=1/2; obwód=(10+14+16)/2=20 cm → B. 7.7: (−0,2)^(−3)=1/(−0,008)=−125 → A.

## Keyless (646) — summary only

Source papers with no published key; the model supplied an answer (stored, `agrees:null`). Not enumerated here — tier-2 verifies these. By stage:

| stage | keyless |
|---|---:|
| rejonowy | 202 |
| szkolny | 195 |
| wojewodzki | 249 |

## Format — data-typing (86) — summary only

`closed_single`-typed questions that are actually multi-select/matching (key like "1–B, 2–C, 3–B, 4–D"). The model answered them **correctly** (matches the key once notation is normalised); only the `type` tag is wrong. Fix by re-typing, not re-solving. Affected question hashes:

`b4996be6` `d7cb2fa0` `2aa0f4c7` `5ecb784e` `ef50772c` `b86841c6` `68833dd5` `f3d2acd5` `78e46e36` `f8d768f9` `268ff34f` `81bc4d38` `109509ca` `37bfde65` `3331a0d5` `c6547d32` `f1509116` `d527048d` `92569357` `af40ae0d` `04f5a1a0` `7ceaa7ad` `9ab31981` `c7af066a` `010a07a2` `adc446f7` `40e8a028` `31b03e1e` `7875cb97` `18f11a1b` `9fcb1e25` `786fddef` `315a09f2` `a138d59a` `d89800ee` `dbd48f65` `bef08ba9` `b3a28f24` `faf0581c` `2771e30c` `835494b6` `2aa1c8a9` `5abb383f` `56a1f236` `1b00e56f` `d8447167` `48d6f7ca` `684ca93d` `63bc8b36` `f6385e77` `633d80e8` `14e0690e` `e55bf31d` `85d37aeb` `28b7b56b` `dd348c75` `979c1399` `b005bd7d` `a429946c` `8d613c52` `07eb6c95` `80c6607d` `1f39696f` `47f81be1` `67864ce4` `4092b71d` `e8d2bb52` `e277d6a9` `12268384` `71849fe9` `7d36acec` `08be15aa` `0fa12b33` `eae4165a` `371bbf8c` `7a6851ab` `9eb9c673` `80f151ca` `8a717e58` `fb9797cb` `2a0e80a5` `b99633dc` `1a2829d2` `5333ed5e` `f1caf5ce` `78a951da`
