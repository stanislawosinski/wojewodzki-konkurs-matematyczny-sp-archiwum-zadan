# Tier-2 adjudication — Opus vs Sonnet vs key (2026-07-27)

Opus re-solved the 739 contested questions **blind** (never shown the key or Sonnet's answer), giving an independent third vote. Verdicts below come from a local 3-way compare. **No key was modified** — `key_suspect` cases are candidates for `suspected_key_errors.tsv` pending your review.

## Verdict tally

| verdict | count | meaning |
|---|---:|---|
| key_suspect | 22 | Opus + Sonnet agree *against* the stored key (likely key error) |
| three_way_split | 7 | key, Sonnet, Opus all differ (needs human) |
| new_dispute | 1 | Opus disputes a low-conf answer that had agreed with the key |
| key_confirmed | 33 | Opus sides with the key; Sonnet had erred |
| keyless_split | 19 | no key; Opus and Sonnet disagree (low confidence) |
| keyless_review | 2 | no key; answers unresolvable to auto-compare |
| agree_review | 17 | low-conf; Opus answer unresolvable to auto-compare |
| keyless_agreed | 625 | no key; Opus and Sonnet agree (high-confidence fill) |
| agree_confirmed | 13 | low-conf answer confirmed by Opus |
| **total** | **739** | |

## KEY SUSPECT — Opus + Sonnet agree *against* the stored key (likely key error) (22)

### `75566c22` · rejonowy_2018-2019_zachodniopomorskie_q27 · _closed_single_
- **key:** `A` · **sonnet:** `C`(med) · **opus:** `C`(high)
- **Q:** W miejsce liter X , Y , Z wstawiając do wyrażenia X + Y + Z nieparzyste różne cyfry i obliczając jego wartość, otrzymamy w zbiorze liczb naturalnych:
- **choices:** A) jedno rozwiązanie · B) trzy rozwiązania · C) sześć rozwiązań · D) nieskończenie wiele rozwiązań
- **opus reasoning:** Cyfry nieparzyste: 1, 3, 5, 7, 9. Suma trzech różnych cyfr nieparzystych jest nieparzysta i mieści się w przedziale od 1 + 3 + 5 = 9 do 5 + 7 + 9 = 21 . Jedyny nieparzysty kwadrat w tym przedziale to 9 = 3 2 , więc X + Y + Z = 9 , co daje zbiór {1, 3, 5}. Cyfry 1, 3, 5 można wstawić w miejsca X, Y, Z na 3 ! = 6 sposobów — sześć rozwiązań.

### `a938b079` · rejonowy_2018_opolskie_q2 · _true_false_
- **key:** `FPF` · **sonnet:** `FPP`(high) · **opus:** `FPP`(med)
- **Q:** Największy wspólny dzielnik dwóch liczb wynosi 15, a ich najmniejsza wspólna wielokrotność 210. Przy każdym zdaniu wpisz TAK lub NIE.
- **choices:** 1) Jest tylko jedna para liczb spełniających te warunki. · 2) Są dwie pary takich liczb. · 3) Są dwie liczby parzyste spełniające te warunki.
- **opus reasoning:** Niech liczby to 15 m i 15 n , gdzie NWD ( m , n ) = 1 . Wtedy NWW = 15 m n = 210 , więc m n = 14 . Rozkłady na czynniki względnie pierwsze: 1 · 14 oraz 2 · 7 , czyli pary liczb: (15, 210) i (30, 105). Są więc dwie pary (1: NIE = F, 2: TAK = P). Liczby parzyste wśród rozwiązań: 210 i 30 — dokładnie dwie (3: TAK = P). W każdej parze jest jedna liczba parzysta i jedna nieparzysta, bo NWD = 15 jest nieparzyste.

### `c533aa3d` · rejonowy_2020-2021_malopolskie_q1 · _closed_single_
- **key:** `C` · **sonnet:** `D`(high) · **opus:** `D`(high)
- **Q:** Poniżej podano stwierdzenia na temat zapisu liczb naturalnych z przedziału od 1 do 3999 w systemie rzymskim. Istnieje co najmniej 7 różnych liczb składających się z dwóch znaków, w których odejmujemy pierwszy ze znaków od drugiego. Można użyć tego samego znaku 4 razy w jednej liczbie. Liczba 1631 zapisana w systemie rzymskim to MLCXXXI. Najwięcej znaków w systemie rzymskim użyjemy przy zapisie liczby 3988. Które stwierdzenia są prawdziwe?
- **choices:** A) wszystkie · B) tylko I i IV · C) tylko II · D) żadne
- **opus reasoning:** I: dwuznakowe liczby odejmowane to tylko IV, IX, XL, XC, CD, CM = 6, a nie co najmniej 7 → fałsz. II: w systemie rzymskim tego samego znaku nie używa się 4 razy (najwyżej 3) → fałsz. III: 1631 = 1000+600+30+1 = MDCXXXI, a nie MLCXXXI → fałsz. IV: 3988 = MMMCMLXXXVIII (13 znaków), ale 3888 = MMMDCCCLXXXVIII ma 15 znaków → fałsz. Żadne stwierdzenie nie jest prawdziwe → odpowiedź D.

### `f179aab0` · rejonowy_2020-2021_swietokrzyskie_1_q1 · _closed_single_
- **key:** `C` · **sonnet:** `B`(high) · **opus:** `B`(med)
- **Q:** Liczby ( − 1,2 ) nie można zapisać w postaci:
- **choices:** A) − 1200 1000 · B) − 6 3 · 2 2 20 2 : 2 3 · C) − 0,0012 · 10 − 3 · D) ( − 3 + 2 13 25 ) · 2,5
- **opus reasoning:** Cel: która forma nie daje − 1,2 . A: − 1200 1000 = −1,2 ✓. D: ( − 3 + 2,52 ) · 2,5 = −0,48·2,5 = −1,2 ✓. C (0,0012·10³) = −1,2 ✓. B: 6 3 · 2 2 /(20²:2³) = 864/50 = 17,28, więc −√17,28 ≈ −4,16 (liczba niewymierna) ≠ −1,2. Zatem B.

### `9971791c` · rejonowy_2020_lubuskie_q25 · _closed_single_
- **key:** `b` · **sonnet:** `C`(low) · **opus:** `C`(med)
- **Q:** Z której siatki Julka może złożyć narysowany sześcian?
- **choices:** a)  · b)  · c)  · d) 
- **opus reasoning:** Na sześcianie linia biegnie po trzech ścianach (górnej, przedniej, prawej), więc siatka musi mieć zaznaczenie na 3 kwadratach — to eliminuje warianty a i b, gdzie prosta przekątna obejmuje tylko 2 kwadraty. Linia na sześcianie załamuje się w wierzchołku (przedni-dolny-prawy róg) oraz w punkcie wewnątrz krawędzi górna/przednia. W siatce c wierzchołek „ptaszka” leży w narożniku kwadratu (dochodzi do dolnej krawędzi), co po złożeniu daje załamanie w wierzchołku sześcianu; w siatce d wierzchołek jest w połowie krawędzi (środek), co nie pasuje. Zatem poprawna jest siatka c .

### `57e15264` · rejonowy_2020_mazowieckie_q5 · _open_
- **key:** `39 białych klocków` · **sonnet:** `7 białych klocków`(low) · **opus:** `7`(low)
- **Q:** Bartek ma białe i szare klocki sześcienne. Białych klocków ma trzy razy więcej niż szarych. Ze wszystkich szarych klocków skleił bryłę przedstawioną na rysunku, składającą się z dwóch jednakowych elementów w kształcie litery E i łącznika w kształcie litery S. Oblicz, ile białych klocków zostałoby Bartkowi po uzupełnieniu tej bryły do najmniejszego sześcianu.
- **opus reasoning:** Szara bryła składa się z dwóch cienkich (grubości 1) liter E oraz łącznika w kształcie litery S. Każda litera E to pionowy słupek wysokości 5 z trzema wypustkami po 2 klocki: 5 + 3 · 2 = 11 klocków; podobnie litera S ≈ 11 klocków, więc szarych jest 2 · 11 + 11 = 33 . Bryła ma wymiary mieszczące się w sześcianie o boku 5 (litera E ma wysokość 5), więc najmniejszy sześcian to 5 × 5 × 5 = 125 klocków. Białych jest 3 · 33 = 99 . Do uzupełnienia potrzeba 125 − 33 = 92 białych klocków, zostaje 99 − 92 = 7 . (Uwaga: dokładna liczba szarych klocków zależy od odczytu rysunku; przyjęto 33.)

### `964354c1` · rejonowy_2021-2022_zachodniopomorskie_q18 · _closed_single_
- **key:** `D` · **sonnet:** `C`(high) · **opus:** `C`(med)
- **Q:** Pusta ciężarówka waży 2000 kg. Po załadowaniu towaru ładunek stanowił 80% masy załadowanej ciężarówki. U pierwszego z odbiorców towaru wyładowano czwartą część towaru. Jaki procent masy załadowanej ciężarówki stanowił wówczas pozostały na niej ładunek?
- **choices:** A) 25% · B) 55% · C) 60% · D) 75%
- **opus reasoning:** Empty truck = 2000 kg = 20% of the loaded truck, so the loaded truck weighs 2000 : 0 , 2 = 10000 kg and the cargo is 8000 kg. Unloading 1 4 of the cargo removes 2000 kg, leaving 6000 kg of cargo. As a percent of the (defined) loaded-truck mass 10000 kg: 6000 / 10000 = 60 % → C. (Distractor D 75% comes from dividing by the current mass 8000 kg.)

### `eed7cedf` · rejonowy_2022-2023_wielkopolskie_q9 · _closed_single_
- **key:** `A` · **sonnet:** `B`(high) · **opus:** `B`(high)
- **Q:** Drewniany sześcian pomalowano białą farbą i rozcięto na 64 jednakowe sześciany. Liczba sześcianów, których żadna ściana nie jest pomalowana białą farbą jest równa:
- **choices:** A) 4 · B) 8 · C) 12 · D) 2
- **opus reasoning:** 64 małych sześcianów oznacza podział 4 × 4 × 4 . Niepomalowane są tylko sześciany wewnętrzne: ( 4 − 2 ) 3 = 2 3 = 8 .

### `c583d3c3` · rejonowy_2025_lodzkie_q9 · _open_
- **key:** `H₁ = 147/16·√3 lub H₂ = 12√3 (przy podanych danych taki ostrosłup w rzeczywistości nie istnieje)` · **sonnet:** `Przypadek 1 (podstawa 3,5; krawędź boczna 4): h = √158/4 ≈ 3,14; Przypadek 2 (podstawa 4; krawędź boczna 3,5): h = √17/2 ≈ 2,06`(low) · **opus:** `Dwa przypadki (ostrosłup prawidłowy czworokątny): a) podstawa a=4, krawędź boczna 3,5: h = √17/2 ≈ 2,06; b) podstawa a=3,5, krawędź boczna 4: h = √158/4 ≈ 3,14`(med)
- **Q:** W pewnym graniastosłupie prawidłowym sześć krawędzi ma długość 7, a trzy krawędzie mają długość 4. Graniastosłup nie ma więcej krawędzi. Ostrosłup prawidłowy o tej samej objętości ma cztery krawędzie długości 3,5 i cztery krawędzie długości 4. Oblicz wysokość ostrosłupa. Rozważ wszystkie przypadki.
- **opus reasoning:** Graniastosłup ma 9 krawędzi → prawidłowy trójkątny: 6 krawędzi podstaw = 7, 3 krawędzie boczne = 4. Ostrosłup ma 8 krawędzi → prawidłowy czworokątny (kwadrat w podstawie): 4 krawędzie podstawy + 4 krawędzie boczne, czyli para {3,5; 4}. Przekątna kwadratu = a 2 , odległość środka od wierzchołka = a 2 2 , więc h 2 = l 2 - a 2 2 . a) a=4, l=3,5: h 2 = 12,25 - 8 = 4,25 , h = √17/2 ≈ 2,06. b) a=3,5, l=4: h 2 = 16 - 6,125 = 9,875 , h = √158/4 ≈ 3,14. (Uwaga: podana „ta sama objętość” jest niespójna — V graniastosłupa = 49√3 ≈ 84,9, a każdego z ostrosłupów ≈ 11–13; wysokość liczona jest z krawędzi.)

### `aff9ae09` · szkolny_2018_podkarpackie_2_q1 · _closed_single_
- **key:** `B` · **sonnet:** `C`(high) · **opus:** `C`(high)
- **Q:** Antek ma klocki w dwóch pudełkach, łącznie 85 klocków. W pierwszym pudełku jest o 9 klocków więcej niż w drugim. Ile klocków jest w pierwszym pudełku?
- **choices:** B) 38 · C) 47 · D) 29 · E) 76
- **opus reasoning:** Niech w drugim pudełku będzie y klocków, w pierwszym y + 9 . 2 y + 9 = 85 , więc y = 38 , a pierwsze pudełko: 38 + 9 = 47 .

### `5f3fc581` · szkolny_2018_podkarpackie_q17 · _true_false_
- **key:** `FPFF` · **sonnet:** `FPFP`(high) · **opus:** `FPFP`(high)
- **Q:** Janek i Kasia sprzedają na plaży jagodzianki. W czasie w którym Kasia sprzedaje cztery Janek sprzedaje ich trzy. Jeśli Janek sprzedał 10 jagodzianek to Kasia w tym czasie sprzedała:
- **choices:** 1) Mniej niż 11 jagodzianek. · 2) Więcej niż 11 jagodzianek. · 3) Mniej niż 13 jagodzianek. · 4) Więcej niż 13 jagodzianek.
- **opus reasoning:** Stosunek Kasia:Janek = 4:3. Janek sprzedał 10, więc Kasia sprzedała 10 · 4 3 = 40 3 ≈ 13,33. 1) mniej niż 11 — F; 2) więcej niż 11 — P; 3) mniej niż 13 — F; 4) więcej niż 13 — P.

### `78dcf737` · szkolny_2020_dolnoslaskie_q17 · _closed_single_
- **key:** `A` · **sonnet:** `D`(high) · **opus:** `D`(high)
- **Q:** W kwadracie podzielonym na 36 jednakowych mniejszych kwadratów wyznaczono figurę zaznaczoną na rysunku szarym kolorem. Jaką częścią pola dużego kwadratu jest pole tej figury?
- **choices:** A) 2 3 · B) 3 4 · C) 7 12 · D) 4 9
- **opus reasoning:** Duży kwadrat to siatka 6×6 = 36 małych kwadratów. Figura jest symetryczna względem osi x = 3 ; jej wierzchołki na siatce (licząc od lewego dolnego rogu 0..6) to (3,6),(4,4),(6,3),(4,2),(6,1),(4,0),(3,2),(2,0),(0,1),(2,2),(0,3),(2,4). Pole liczone wzorem Gaussa (shoelace): P = 1 2 | − 32 | = 16 małych kwadratów. Stąd udział figury: 16 36 = 4 9 .

### `19d5a24a` · szkolny_2022-2023_warminsko-mazurskie_q10 · _closed_single_
- **key:** `C` · **sonnet:** `B`(high) · **opus:** `B`(high)
- **Q:** Wskaż zdanie prawdziwe:
- **choices:** A) Półprosta ma długość, ale nie ma pola. · B) Odcinek ma początek i koniec. · C) Każdy równoległobok jest trapezem. · D) Środek koła nie należy do koła.
- **opus reasoning:** A: półprosta jest nieskończona (nie ma skończonej długości) — nieprecyzyjne. C: w polskiej (klasycznej) definicji trapez ma dokładnie jedną parę boków równoległych, więc równoległobok trapezem nie jest — fałsz. D: środek koła należy do koła (koło zawiera wnętrze) — fałsz. B: odcinek ma dwa końce (początek i koniec) — prawda.

### `1c67182f` · szkolny_2024_lubelskie_q7 · _true_false_
- **key:** `FPFPP` · **sonnet:** `FPFFP`(med) · **opus:** `FPFFP`(med)
- **Q:** Poniżej podane zdania dotyczą figur osiowosymetrycznych. Oceń prawdziwość podanych zdań. Wybierz P, jeśli zdanie jest prawdziwe, albo F – jeśli jest fałszywe. Wybraną odpowiedź zaznacz kółkiem.
- **choices:** 1) Każdy trójkąt ma dokładnie trzy osie symetrii. · 2) Istnieje romb, który ma cztery osie symetrii. · 3) Jedną z osi symetrii każdego prostokąta jest prosta zawierająca jego p … · 4) Trapez prostokątny równoramienny ma co najmniej dwie osie symetrii. · 5) Figurą osiowosymetryczną jest trójkąt o kątach wewnętrznych 20°, 20° i …
- **opus reasoning:** Tylko trójkąt równoboczny ma 3 osie symetrii; dowolny trójkąt nie musi (np. różnoboczny ma 0) → F . Kwadrat jest rombem i ma 4 osie symetrii, więc istnieje romb o 4 osiach → P . Osiami symetrii prostokąta są symetralne boków, a nie proste zawierające przekątne (przekątna jest osią tylko w kwadracie) → F . Trapez jednocześnie prostokątny i równoramienny musiałby być prostokątem, a taki trapez (przy szkolnej definicji: dokładnie jedna para boków równoległych) nie istnieje; zwykły trapez równoramienny ma tylko jedną oś, nie co najmniej dwie → F . Trójkąt o kątach 20°, 20°, 140° jest równoramienny …

### `82316831` · szkolny_2024_podlaskie_q9 · _closed_single_
- **key:** `B` · **sonnet:** `A`(high) · **opus:** `A`(high)
- **Q:** Pole narysowanego obok równoległoboku jest równe:
- **choices:** A) 35 · B) 60 · C) 70 · D) 80
- **opus reasoning:** Pole równoległoboku = podstawa × wysokość. Odcinek długości 5 jest prostopadły do podstawy (znak kąta prostego), więc jest wysokością, a podstawa = 7. 7 · 5 = 35 . Kąt 45° dotyczy dołączonego trójkąta i nie wpływa na pole równoległoboku.

### `b12a1c7a` · wojewodzki_2014-2015_slaskie_q16 · _true_false_
- **key:** `FPPF` · **sonnet:** `FFPF`(med) · **opus:** `FFPF`(high)
- **Q:** Oceń, czy podane zdania są prawdziwe czy fałszywe. Zaznacz właściwą odpowiedź.
- **choices:** 1) Trójkąt o bokach 2 dm, 0,2 m, 20 mm jest trójkątem równobocznym. · 2) Istnieje trapez prostokątny równoramienny. · 3) Przekątne równoległoboku mogą być do siebie prostopadłe. · 4) W równoległoboku przekątne nie muszą się przecinać w połowie.
- **opus reasoning:** 1) Boki: 2 dm = 20 cm, 0,2 m = 20 cm, 20 mm = 2 cm, wiec 20, 20, 2 cm — nie jest rownoboczny. F 2) Trapez prostokatny i rownoramienny jednoczesnie musialby miec wszystkie katy proste, czyli bylby prostokatem — taki trapez wlasciwy nie istnieje. F 3) W rombie (ktory jest rownoleglobokiem) przekatne sa prostopadle. P 4) Przekatne rownolegloboku zawsze dziela sie na polowy, wiec zdanie o tym, ze nie musza, jest falszywe. F

### `52adcef5` · wojewodzki_2018_opolskie_q2 · _true_false_
- **key:** `FFF` · **sonnet:** `FFP`(high) · **opus:** `FFP`(med)
- **Q:** W urnie znajduje się łącznie 100 kul w kolorach: czerwonym, zielonym, żółtym i niebieskim. Nie wiemy ile jakich jest. Jaką najmniejszą liczbę kul należy wyjąć, aby zawsze mieć pewność, że wśród wylosowanych kul będzie co najmniej 10 w jednym kolorze. Przy każdym zdaniu wpisz TAK lub NIE.
- **choices:** 1) 13 · 2) 25 · 3) 40
- **opus reasoning:** Aby na pewno mieć 10 kul jednego koloru przy 4 kolorach, w najgorszym przypadku (skład zrównoważony) można wyciągnąć po 9 kul każdego koloru: 4 ⋅ 9 = 36 kul bez 10 jednego koloru. Zatem dopiero 37 kul gwarantuje 10 w jednym kolorze niezależnie od składu urny. 13 — nie wystarcza (NIE, F); 25 — nie wystarcza (NIE, F); 40 ≥ 37 — wystarcza (TAK, P).

### `5b7181e6` · wojewodzki_2023-2024_swietokrzyskie_q11 · _true_false_
- **key:** `FPP` · **sonnet:** `FFP`(high) · **opus:** `FFP`(high)
- **Q:** Odcinek o końcach w punktach A = ( 6 , 0 ) i B = ( 4 , 4 ) jest bokiem równoległoboku ABCD , a punkt S = ( 2 , 1 ) jest środkiem symetrii tego równoległoboku. Oceń, czy poniższe zdania są prawdziwe. Zaznacz P, jeśli zdanie jest prawdziwe lub F – jeśli jest fałszywe.
- **choices:** 1) Jeden z wierzchołków tego równoległoboku ma współrzędne ( − 2 , 0 ) . · 2) Obwód tego równoległoboku jest równy 2 5 + 2 10 · 3) Pole tego równoległoboku jest równe 28.
- **opus reasoning:** Środek symetrii S = ( 2 , 1 ) jest środkiem przekątnych, więc C = 2 S − A = ( − 2 , 2 ) oraz D = 2 S − B = ( 0 , − 2 ) . (1) Wierzchołki to (6,0),(4,4),(−2,2),(0,−2) — żaden nie ma współrzędnych (−2,0) → F. (2) AB = 20 = 2 5 , BC = 40 = 2 10 , obwód = 4 5 + 4 10 , a nie 2 5 + 2 10 → F. (3) Pole = |iloczyn wektorowy AB → =(−2,4), BC → =(−6,−2)| = |(−2)(−2)−(4)(−6)| = 28 → P.

### `a21eaa1f` · wojewodzki_2023_mazowieckie_q8 · _open_
- **key:** `Dwie różne siatki czworościanu — pięciokąt należy podzielić dorysowanymi odcinkami na cztery trójkąty tworzące siatkę (dwa różne podziały dają dwa różne czworościany)` · **sonnet:** `Rys.1: z jednego wierzchołka pięciokąta poprowadzić obie przekątne (dzielą kąt 108° na trzy kąty 36°, dzieląc pięciokąt na 3 trójkąty), a do boku przeciwległego temu wierzchołkowi dorysować na zewnątrz trójkąt równoboczny o boku równym bokowi pięciokąta – po złożeniu wzdłuż przekątnych i tego boku powstaje czworościan o 4 krawędziach równych bokowi pięciokąta i 2 równych przekątnej. Rys.2: analogiczną konstrukcję wykonać w inny sposób (np. dorysowując dodatkowy trójkąt do innego boku / z innym podziałem), tak by otrzymać czworościan o innym zestawie długości krawędzi (nieprzystający do pierwszego).`(low) · **opus:** `Zadanie konstrukcyjne (rysunek) — przykładowe siatki dwóch różnych czworościanów; odpowiedź niejednoznaczna. Np. na każdym pięciokącie ABCDE zaznaczamy punkt F na jednym z boków i rysujemy odcinki (linie zgięcia) z F do trzech przeciwległych wierzchołków, dzieląc pięciokąt na 4 trójkąty; dla dwóch rysunków wybieramy różne układy linii zgięcia, otrzymując dwa nieprzystające czworościany.`(low)
- **Q:** Na rysunkach 1. i 2. są przystające pięciokąty foremne. Uzupełnij te rysunki tak, aby otrzymać dwie siatki różnych czworościanów.
- **opus reasoning:** Siatka czworościanu składa się z 4 trójkątnych ścian i ma 6 krawędzi brzegowych sklejanych w 3 pary. Sam pięciokąt (5 boków) trójkątuje się przekątnymi tylko na 3 trójkąty, więc trzeba poprowadzić linie zgięcia tak, by koniec jednej z nich trafił w wnętrze pewnego boku — dzieli go na dwie krawędzie (razem 6 krawędzi brzegowych). Przykład: w pięciokącie ABCDE obieramy punkt F na boku AB i rysujemy odcinki FC , FD , FE . Powstają 4 trójkąty ( FBC , FCD , FDE , FEA ) tworzące siatkę czworościanu. Aby otrzymać drugi, nieprzystający czworościan, na drugim rysunku wybieramy inne linie zgięcia (np. i …

### `6d8d923e` · wojewodzki_2024-2025_slaskie_q1 · _open_
- **key:** `GEOMETRIA EUKLIDESOWA` · **sonnet:** `1. okrąg 2. procent 3. wierzchołek 4. romb 5. wartość bezwzględna 6. trapez 7. przyległe 8. oś liczbowa 9. hektar 10. dzielna 11. ostrosłup 12. trójkąt 13. symetralna 14. wykładnik 15. odcinek 16. ułamek 17. suma 18. prosty 19. mianownik 20. średnica`(low) · **opus:** `1. OKRĄG; 2. PROCENT; 3. WIERZCHOŁEK; 4. ROMB; 5. WARTOŚĆ BEZWZGLĘDNA; 6. TRAPEZ; 7. PRZYLEGŁE; 8. OŚ LICZBOWA; 9. HEKTAR; 10. DZIELNA; 11. OSTROSŁUP; 12. TRÓJKĄT; 13. SYMETRALNA; 14. WYKŁADNIK; 15. ODCINEK; 16. UŁAMEK; 17. SUMA; 18. PROSTY; 19. MIANOWNIK; 20. ŚREDNICA (hasło nie jest oceniane)`(med)
- **Q:** Rozwiąż krzyżówkę, wpisując litery w odpowiednie pola. Hasło to nazwa dziedziny matematyki, z którą stykasz się podczas lekcji tego przedmiotu w szkole. Hasło nie jest oceniane. Zbiór wszystkich punktów płaszczyzny równoodległych od określonego punktu tej płaszczyzny. 10 razy więcej niż promil. Punkt wspólny kilku krawędzi graniastosłupa. Równoległobok, który nie jest prostokątem, a jego przekątne przecinają się pod kątem prostym. Jej interpretacją geometryczną jest odległość …
- **opus reasoning:** Definicje kolejnych haseł: 1 zbiór punktów równoodległych od punktu = okrąg ; 2 10·promil = 1% = procent ; 3 punkt wspólny krawędzi = wierzchołek ; 4 równoległobok z prostopadłymi przekątnymi = romb ; 5 odległość od zera na osi = wartość bezwzględna (feminine „jej"); 6 czworokąt z 1 parą boków równoległych = trapez ; 7 kąty o wspólnym ramieniu, pozostałe tworzą prostą = przyległe ; 8 geom. interpretacja liczb rzeczywistych = oś liczbowa ; 9 100 arów = hektar ; 10 licznik jako dzielenie = dzielna ; 11 bryła jak czworościan = ostrosłup ; 12 suma kątów 180° = trójkąt ; 13 prosta prostopadła przez …

### `929ed70c` · wojewodzki_2025-2026_wielkopolskie_q15 · _closed_single_
- **key:** `C` · **sonnet:** `B`(high) · **opus:** `B`(high)
- **Q:** Oblicz pole zacieniowanego obszaru trójkąta równobocznego ABC o boku 12 (patrz – rysunek pomocniczy poniżej). Średnicami okręgów o środkach w punktach P i S są odpowiednio boki AB i BC trójkąta.
- **choices:** A) 6 π + 9 3 · B) 12 π · C) 18 π − 9 3 · D) 15 π
- **opus reasoning:** Współrzędne: A = ( 0 , 0 ) , B = ( 12 , 0 ) , C = ( 6 , 6 3 ) . Środki P = ( 6 , 0 ) , S = ( 9 , 3 3 ) , oba promienie 6. Punkt K (środek AC ) = ( 3 , 3 3 ) leży na obu okręgach; S leży na okręgu P , a P na okręgu S . Obszar to czworokąt krzywoliniowy K S B P : łuk KS (okrąg P , kąt 60°), odcinek SB , odcinek BP , łuk PK (okrąg S , kąt 60°). Pole wielokąta KSBP = 18 3 . Każdy odcinek kołowy (60°, r=6) = 6 π − 9 3 . Razem: 18 3 + 2 ( 6 π − 9 3 ) = 12 π . Odpowiedź B.

### `4cfa4a34` · wojewodzki_2025_opolskie_q4 · _true_false_
- **key:** `FPP` · **sonnet:** `PFF`(high) · **opus:** `PFF`(high)
- **Q:** Janek, Franek i Staszek otrzymali jednakowe prostokątne kartki papieru i mieli zadanie wyciąć z tej kartki jak największy romb. Staszek wykonał zadanie najlepiej. Jego romb miał przekątne długości 30 cm i 40 cm. Większego nie można było wyciąć.
- **choices:** 1) U Staszka odpady stanowiły 50% papierowej kartki. · 2) Każdy bok prostokątnej kartki miał długość mniejszą niż 40 cm. · 3) Obwód prostokątnej kartki wynosił 112 cm.
- **opus reasoning:** Największy romb wpisany w prostokąt ma wierzchołki w środkach boków, więc prostokąt ma wymiary równe przekątnym: 40 cm × 30 cm. 1) Pole rombu = 1 2 · 30 · 40 = 600 ; pole prostokąta = 1200 ; odpady = 600 = 50 % → P. 2) Boki prostokąta to 40 cm i 30 cm; bok 40 cm nie jest mniejszy niż 40 → F. 3) Obwód = 2 ( 40 + 30 ) = 140 cm, nie 112 → F.

## THREE-WAY SPLIT — key, Sonnet, Opus all differ (needs human) (7)

### `b3229c02` · szkolny_2013-2014_slaskie_q16 · _open_
- **key:** `A. południowo-wschodnim;  B. północno-wschodniej (dopuszczalne: północnej)` · **sonnet:** `A. w kierunku południowo-wschodnim; B. od strony północno-wschodniej`(low) · **opus:** `A. na południowy wschód (zgodnie ze strzałką i spadkiem terenu); B. od strony północno-wschodniej (szeroko rozstawione poziomice)`(low)
- **Q:** Uzupełnij zdanie korzystając z rysunku poniżej. A. Rzeka płynie w kierunku … B. Łagodne zbocze doliny rzecznej znajduje się od strony …
- **opus reasoning:** Strzałka N wskazuje górę mapy. Strzałka rzeki skierowana jest w dół i w prawo, czyli na południowy wschód (rzeka płynie w dół, ku niższym poziomicom 50 m). Zbocze łagodne to strona z rzadko rozstawionymi poziomicami (górna/NE część), zbocze strome — z gęsto rozstawionymi (SW, poziomice 80-70-60-50).
- **sonnet reasoning:** Strzałka w zacienionej dolinie wskazuje kierunek spływu — w prawo w dół względem strzałki N (górny lewy róg), czyli na południowy wschód. Zbocze łagodniejsze to strona z mniejszą liczbą warstwic (60, 50) — strona północno-wschodnia; strona z gęstymi warstwicami (80,70,60,50) jest stroma.

### `7e3916f6` · szkolny_2019-2020_slaskie_q13 · _true_false_
- **key:** `FPPP` · **sonnet:** `FPFP`(med) · **opus:** `FTFT`(med)
- **Q:** Oceń, czy poniższe zdania dotyczące zegara tradycyjnego są prawdziwe, czy fałszywe.
- **choices:** 1) Kąt wypukły, który tworzą wskazówki zegara o godzinie 14:25 jest kątem … · 2) Kąt wypukły, który tworzą wskazówki zegara o godzinie 04:40 ma miarę 1 … · 3) Kąt półpełny wskazówki zegara tworzą w ciągu godziny tylko raz. · 4) Od godziny 14:59 do godziny 15:59 wskazówki zegara utworzą kąt prosty  …
- **opus reasoning:** 1) 14:25: wsk. godz. 2 · 30 + 25 · 0,5 = 72,5 °, wsk. min. 25 · 6 = 150 °, różnica 77,5 ° ≠ 90° → F . 2) 04:40: godz. 4 · 30 + 40 · 0,5 = 140 °, min. 40 · 6 = 240 °, różnica 100° → P . 3) Kąt półpełny (180°) wskazówki tworzą 11 razy na 12 godzin, a w godzinie 5:00–6:00 ani razu (zdarza się dokładnie o 6:00), więc nie zawsze raz na godzinę → F . 4) W przedziale 14:59–15:59 kąt prosty powstaje o 15:00:00 oraz o ~15:32:44 – dwa razy → P .
- **sonnet reasoning:** 14:25: minute=150°, hour=72.5°, diff=77.5° ≠90° — F. 04:40: minute=240°, hour=140°, diff=100° — P. Straight-angle (180°) config occurs 11 times in 12h, so one hour (5:00–5:59) has none — the 'only once every hour' claim fails — F. Between 14:59 and 15:59, right angles (90°) occur at exactly 15:00:00 and ≈15:32:44 — two times — P.

### `eea35a3c` · szkolny_2022_dolnoslaskie_q20 · _open_
- **key:** `Brakujący kwadrat w każdej siatce należy dorysować w jednym z miejsc oznaczonych krzyżykiem w kluczu.` · **sonnet:** `Lewa siatka: dorysować brakujący kwadrat nad lewym lub nad prawym polem górnej pary (albo pod lewym lub pod prawym polem dolnej pary) — np. nad lewym górnym polem. Prawa siatka: dorysować brakujący kwadrat nad lewym lub nad prawym polem górnej pary (albo z lewej strony środkowego lub dolnego pola) — np. nad prawym górnym polem.`(low) · **opus:** `Zadanie rysunkowe: do każdej niepełnej siatki dorysować jeden kwadrat tak, by powstała poprawna siatka sześcianu. Przykład: w lewej siatce (środkowy pionowy pasek 3 kwadratów, z klapkami u góry z lewej i u dołu z prawej) dorysować kwadrat pod dolnym kwadratem tego paska (albo nad górnym), przedłużając pasek do 4 kwadratów; w prawej siatce (schodki) dorysować kwadrat nad lewym kwadratem górnej pary (albo z lewej strony środkowej pary). Dopuszczalne jest każde uzupełnienie dające poprawną siatkę sześcianu.`(high)
- **Q:** Na rysunkach przedstawiono niepełne siatki sześcianu – w każdej z nich brakuje jednej ściany. Uzupełnij rysunki tak, aby otrzymać dwie pełne siatki sześcianu.
- **opus reasoning:** Każda z podanych figur ma 5 kwadratów, więc do siatki sześcianu (6 ścian) brakuje jednej ściany. Lewa siatka (kształt XX. / .X. / .XX ): środkowa pionowa kolumna 3 kwadratów zwija się na ścianę górną–przednią–dolną, a dwie klapki dają ściany lewą i prawą. Brakuje ściany tylnej — wystarczy dorysować kwadrat przedłużający pionowy pasek (np. pod dolnym lub nad górnym kwadratem paska). Prawa siatka (schodki .XX / XX. / X.. ): zwija się na 5 ścian (przednia, górna, lewa, prawa, dolna) — brakuje tylnej. Wystarczy dorysować kwadrat, który złoży się na tylną ścianę, np. nad lewym kwadratem górnej pary …
- **sonnet reasoning:** To zadanie na uzupełnienie rysunku (siatki sześcianu) — brak jednoznacznego tekstowego wyniku, tu podano opis. Symulacja "toczenia sześcianu" po obu pięciopolowych kształtach (Z-pentomino i W-pentomino) pokazuje, że każdej z nich brakuje ściany odpowiadającej jednej konkretnej ścianie sześcianu, a pole to można dorysować w jednym z 4 równoważnych miejsc (na obu końcach "łańcucha" kształtu, po obu  …

### `e373c440` · szkolny_2022_podkarpackie_q19 · _open_
- **key:** `19.1: 27; 19.2: 46; 19.3: 69` · **sonnet:** `19.1. 28; 19.2. 48; 19.3. 72`(low) · **opus:** `19.1) 44; 19.2) 56; 19.3) 96`(med)
- **Q:** Uzupełnij luki tak, aby zdania były prawdziwe. Dane są dwie bryły A i B. 19.1. Suma wszystkich ścian brył A i B jest równa: … 19.2. Suma wszystkich wierzchołków tych brył wynosi: … 19.3. Suma wszystkich krawędzi brył A i B jest równa: …
- **opus reasoning:** Bryła A to graniastosłup o podstawie w kształcie litery E (12-kąt): ścian 12 + 2 = 14 , wierzchołków 24 , krawędzi 36 . Bryła B to przestrzenny krzyż z 7 sześcianów jednostkowych (środkowy + 6 ramion): ścian 6 · 5 = 30 , wierzchołków 32 , krawędzi 60 (sprawdzenie Eulera: 32 - 60 + 30 = 2 ). Sumy: ściany 14 + 30 = 44 ; wierzchołki 24 + 32 = 56 ; krawędzie 36 + 60 = 96 .
- **sonnet reasoning:** Bryła A (litera E) i bryła B (krzyż) to graniastosłupy o 12-kątnej (nie wypukłej) podstawie każda: V=24, K=36, Ś=14 (sprawdzenie Eulera: 24-36+14=2). Suma ścian=14+14=28, suma wierzchołków=24+24=48, suma krawędzi=36+36=72.

### `02a89229` · szkolny_2026_lubelskie_q12 · _true_false_
- **key:** `FFFP` · **sonnet:** `FFPP`(med) · **opus:** `FFPF`(low)
- **Q:** Poniżej podane są cztery zdania dotyczące figur płaskich. Oceń prawdziwość podanych zdań. Wybierz P, jeśli zdanie jest prawdziwe, albo F – jeśli jest fałszywe. Wybraną odpowiedź zaznacz kółkiem.
- **choices:** 1) W każdym trójkącie równoramiennym wysokość poprowadzona z wierzchołka  … · 2) W każdym trójkącie prostokątnym długość przeciwprostokątnej jest równa … · 3) Jeżeli w prostokącie długość przekątnej jest równa długości jego boku, … · 4) Istnieje czworokąt, który jest jednocześnie rombem, prostokątem i trap …
- **opus reasoning:** 1) F. Wysokość poprowadzona z wierzchołka kąta przy podstawie pada na ramię trójkąta i na ogół nie dzieli go na połowy (bisektuje ramię tylko w trójkącie równobocznym). Przykład: A=(0,4), B=(−3,0), C=(3,0), AB=AC=5; spodek prostopadłej z B na AC wypada w 7 25 długości, nie w połowie. Zdanie mówi „w każdym", więc fałsz. 2) F. Przeciwprostokątna to a 2 + b 2 , a nie a + b . 3) P. W prostokącie przekątna jest przeciwprostokątną, więc zawsze dłuższa od każdego boku — założenie „przekątna = bok" nie jest spełnione dla żadnego prostokąta. Implikacja o fałszywym poprzedniku jest prawdziwa. (Uwaga: ni …
- **sonnet reasoning:** 1. Wysokość z wierzchołka kąta przy podstawie dzieli przeciwległy bok (ramię) na połowy tylko w trójkącie równobocznym, nie w każdym równoramiennym — fałsz. 2. Przeciwprostokątna < suma przyprostokątnych (nierówność trójkąta) — fałsz. 3. Przekątna prostokąta zawsze jest dłuższa niż każdy bok (d=√(a²+b²)>a,b), więc założenie nigdy nie zachodzi — implikacja prawdziwa (pusto spełniona) — prawda. 4. K …

### `e542bec1` · wojewodzki_2020_opolskie_q5 · _true_false_
- **key:** `FPF` · **sonnet:** `PPF`(med) · **opus:** `FFF`(low)
- **Q:** Wysokość ostrosłupa prawidłowego czworokątnego, którego pole podstawy wynosi 144 cm², tworzy z krawędzią boczną kąt 60°. Przy każdym zdaniu wpisz TAK lub NIE.
- **choices:** 1) Krawędź boczna tego ostrosłupa ma długość 12 2 cm. · 2) Objętość ostrosłupa wynosi 288 6 cm³. · 3) Wysokość ściany bocznej wynosi 3 10 .
- **opus reasoning:** Podstawa: 12 2 = 144 , wiec a = 12 cm; przekatna 12 2 , polowa przekatnej 6 2 . Kat 60° miedzy wysokoscia a krawedzia boczna jest przy wierzcholku: tg 60 ° = 6 2 H , wiec H = 2 6 . (1) Krawedz boczna L = 6 2 sin 60 ° = 4 6 (nie 12 2 ) → F. (2) V = 1 3 · 144 · 2 6 = 96 6 (nie 288 6 ) → F. (3) Wysokosc sciany H 2 + 6 2 = 60 = 2 15 (nie 3 10 ) → F. Uwaga: wartosci 12√2 i 288√6 pasuja do wersji, gdy 60° to nachylenie krawedzi do podstawy ( H = 6 6 ); wtedy klucz bylby PPF. Przy doslownym brzmieniu (kat wysokosc-krawedz = 60°) odpowiedz to FFF.
- **sonnet reasoning:** Bok podstawy a=12 cm (pole=144), połowa przekątnej d=6√2 cm. Przy kącie 60° między krawędzią boczną a płaszczyzną podstawy: l=d/cos60°=2d=12√2 cm (zgodne ze zdaniem 1). h=l·sin60°=6√6 cm, V=(1/3)·144·6√6=288√6 cm³ (zgodne ze zdaniem 2). Wysokość ściany bocznej: m=√(h²+6²)=√252=6√7 ≠ 3√10 — fałsz. (Uwaga: dosłowny opis kąta między wysokością bryły a krawędzią boczną dałby inne, niepasujące wartości …

### `17e2944d` · wojewodzki_2023-2024_warminsko-mazurskie_q18 · _open_
- **key:** `Średnia wieku tych trzech osób to 30⅔ lub 22⅔.` · **sonnet:** `30 2/3 roku (92/3 ≈ 30,67)`(low) · **opus:** `Kasia 20 lat; Ela 16 lub 24 lata, Piotr 32 lub 48; średnia = 68/3 ≈ 22,67 lat lub 92/3 ≈ 30,67 lat`(med)
- **Q:** Wiek Kasi jest równy wartości wyrażenia: 7 2 − | 5 − 5 2 | + ( − 2 ) 3 − 5 0 . Wiek Eli różni się od wieku Kasi o 4 lata, zaś Piotr jest dwukrotnie starszy od Eli. Oblicz średnią arytmetyczną wieku tych trzech osób.
- **opus reasoning:** Wiek Kasi: 7 2 − | 5 − 5 2 | + ( − 2 ) 3 − 5 0 = 49 − |5 − 25| + (−8) − 1 = 49 − 20 − 8 − 1 = 20. Wiek Eli różni się o 4, więc 16 lub 24; Piotr = 2·Ela. Przypadek Ela = 16: Piotr = 32, średnia = (20+16+32)/3 = 68/3 ≈ 22,67. Przypadek Ela = 24: Piotr = 48, średnia = (20+24+48)/3 = 92/3 ≈ 30,67.
- **sonnet reasoning:** Wiek Kasi: 7² − |5−5²| + (−2)³ − 5⁰ = 49 − 20 − 8 − 1 = 20 lat. Przyjmując, że Ela jest starsza o 4 lata: Ela=24, Piotr=2·24=48 (kierunek różnicy wieku nie jest jednoznacznie podany w treści). Średnia: (20+24+48)/3 = 92/3 ≈ 30,67 roku.

## NEW DISPUTE — Opus disputes a low-conf answer that had agreed with the key (1)

### `281b5059` · szkolny_2019_podkarpackie_q10 · _closed_single_
- **key:** `C` · **sonnet:** `C`(low) · **opus:** `A`(med)
- **Q:** Z jednakowych sześciennych kostek, których krawędź ma długość 1, sklejono bryłę przedstawioną na rysunku. Aby otrzymać wypełniony takimi kostkami sześcian, należy do tej bryły dokleić co najmniej
- **choices:** A) 15 kostek. · B) 17 kostek · C) 52 kostki. · D) 54 kostki
- **opus reasoning:** Bryła jest szeroka na 3 i wysoka na 3, więc najmniejszy pełny sześcian, w którym się mieści, ma bok 3: 3 3 = 27 kostek. Bryła to warstwa głębokości 2 o profilu wysokości 3, 1, 2 z przodu, czyli ( 3 + 1 + 2 ) · 2 = 12 kostek. Aby otrzymać pełny sześcian, trzeba dokleić 27 − 12 = 15 kostek. Odpowiedzi 52 i 54 zakładają błędnie sześcian 4×4×4.
- **sonnet reasoning:** Bryła mieści się w prostopadłościanie o wymiarach 4×4×4 (najdłuższy wymiar = 4 jednostki), więc do wypełnienia sześcianu potrzeba sześcianu 4×4×4=64 kostek. Bryła składa się z ok. 12 kostek, więc trzeba dokleić około 64−12=52 kostki.

## KEY CONFIRMED — Opus sides with the key; Sonnet had erred (33)

### `3549f8c1` · rejonowy_2012-2013_malopolskie_q12 · _closed_single_
- **key:** `C` · **sonnet:** `B`(high) · **opus:** `C`(high)
- **Q:** Kąt zewnętrzny wielokąta – to kąt przyległy do danego kąta wewnętrznego wielokąta. Na rysunku obok zarówno kąty β i β ′ , jak i kąty δ i δ ′ są zewnętrzne do wielokąta w różnych wierzchołkach. Suma wszystkich kątów zewnętrznych trójkąta równobocznego wynosi:
- **choices:** A) 180° · B) 360° · C) 720° · D) 900°
- **opus reasoning:** Definicja i rysunek pokazują, że przy każdym wierzchołku są dwa kąty zewnętrzne (np. β i β ′ ), każdy przyległy do kąta wewnętrznego. W trójkącie równobocznym kąt wewnętrzny = 60°, więc każdy kąt zewnętrzny = 180° − 60° = 120°. Suma wszystkich kątów zewnętrznych = 3 wierzchołki × 2 kąty × 120° = 720° → odpowiedź C.

### `02591d47` · rejonowy_2017-2018_slaskie_q14 · _true_false_
- **key:** `FFPF` · **sonnet:** `FFTF`(high) · **opus:** `FFPF`(high)
- **Q:** Długość jednej przyprostokątnej trójkąta prostokątnego wynosi 8 cm. Długość drugiej przyprostokątnej stanowi 3 5 długości przeciwprostokątnej. Oceń, czy podane zdania są prawdziwe czy fałszywe. Zaznacz właściwą odpowiedź.
- **choices:** 1) Jeśli niewiadomą długość przyprostokątnej oznaczymy przez x , to obwód … · 2) Pole trójkąta wynosi 48 cm². · 3) Wysokość poprowadzona z wierzchołka kąta prostego ma długość 4,8 cm. · 4) Różnica między najdłuższym i najkrótszym bokiem trójkąta wynosi 2 cm.
- **opus reasoning:** Leg a = 8 , other leg b = 3 5 c . Pythagoras: 8 2 + 9 25 c 2 = c 2 gives c = 10 , b = 6 . Triangle 6-8-10. (1) With leg x =6, hypotenuse = 5 3 x not 0,6x, so perimeter is 8+x+(5/3)x — F. (2) Area = ½·6·8 = 24 cm², not 48 — F. (3) Height to hypotenuse = 6·8/10 = 4,8 cm — P. (4) 10−6 = 4 cm, not 2 — F.

### `b974a95a` · rejonowy_2018-2019_slaskie_q11 · _true_false_
- **key:** `PPPP` · **sonnet:** `PPPF`(high) · **opus:** `PPPP`(high)
- **Q:** Suma dwóch krótszych boków trójkąta jest równa 51 cm, a stosunek długości tych boków wynosi 5 : 12. Oceń, czy podane zdania są prawdziwe, czy fałszywe. Zaznacz właściwą odpowiedź.
- **choices:** 1) Jeśli jest to trójkąt prostokątny, to pole trójkąta jest równe 270 cm² … · 2) Jeśli jest to trójkąt prostokątny, to obwód tego trójkąta wynosi 90 cm … · 3) Jeśli jest to trójkąt prostokątny, to wysokość poprowadzona z wierzcho … · 4) Jeśli jest to trójkąt rozwartokątny to najdłuższy bok ma długość więks …
- **opus reasoning:** Krótsze boki w stosunku 5:12, suma 51: 17 x = 51 , więc x = 3 → boki 15 cm i 36 cm. 1) Prostokątny: przyprostokątne 15 i 36, pole = 1 2 · 15 · 36 = 270 cm². P 2) Przeciwprostokątna = 15 2 + 36 2 = 1521 = 39 ; obwód 15+36+39=90 cm. P 3) Wysokość z kąta prostego = 15 · 36 39 = 13,85 ≈ 14 cm. P 4) 15 i 36 to krótsze boki, więc trzeci bok jest najdłuższy; dla rozwartokątnego c 2 > 15 2 + 36 2 = 1521 , więc c > 39 cm. P

### `8eb08acb` · rejonowy_2019-2020_wielkopolskie_q22 · _closed_single_
- **key:** `C` · **sonnet:** `A`(high) · **opus:** `C`(high)
- **Q:** Liczba a = ( 4,2 · 10 15 ) · ( 1,5 · 10 21 ) 0,2 · 10 49 , zapisana w notacji wykładniczej, jest równa:
- **choices:** A) 31,5 · 10 − 13 · B) 3,15 · 10 − 14 · C) 3,15 · 10 − 12 · D) 31,5 · 10 85
- **opus reasoning:** Licznik: 4,2 · 1,5 = 6,3 , a 10 15 · 10 21 = 10 36 , czyli licznik = 6,3 · 10 36 . Dzieląc: 6,3 ÷ 0,2 = 31,5 , a 10 36 ÷ 10 49 = 10 − 13 . Wynik 31,5 · 10 − 13 w notacji wykładniczej to 3,15 · 10 − 12 (odp. C).

### `ef8b9007` · rejonowy_2019_opolskie_q9 · _open_
- **key:** `21 m` · **sonnet:** `650 cm (6,5 m)`(low) · **opus:** `21 m (2100 cm)`(high)
- **Q:** Do ułożenia chodnika wykorzystano prostokątne płyty kamienne o wymiarach 35 cm × 60 cm. Płyty układano kolejno tak, jak na rysunku, na zewnątrz szerszą stroną do brzegu, a po środku węższą. W ten sposób ułożono segment, który miał kształt pełnego prostokąta. Chodnik zakończono układać, gdy ułożono 5 takich segmentów. Jakiej długości chodnik ułożono?
- **opus reasoning:** Płyty przy obu brzegach leżą dłuższym bokiem wzdłuż chodnika, więc styki wypadają co 60 cm ; płyty w środku leżą krótszym bokiem wzdłuż, więc ich styki wypadają co 35 cm . Szerokość chodnika to 35 + 60 + 35 = 130 cm. Pełny prostokąt (segment) powstaje tam, gdzie styki obu rzędów pokrywają się, czyli po długości równej NWW ( 60 , 35 ) = 420 cm. Sprawdzenie: 7+7 płyt na brzegach i 12 w środku = 26 płyt, pole 26 · 2100 = 54600 = 420 · 130 cm². 5 segmentów daje długość 5 · 420 = 2100 cm = 21 m.

### `3bd325d2` · rejonowy_2020-2021_slaskie_q6 · _true_false_
- **key:** `PPP` · **sonnet:** `PPF`(med) · **opus:** `PPP`(med)
- **Q:** Na rysunku odcinki OA i OB są tej samej długości, a odcinki AB i CD są równoległe. Oceń, czy podane zdania są prawdziwe, czy fałszywe.
- **choices:** I) Kąt x ma miarę 70 ° . · II) Kąty x i y mają takie same miary. · III) Suma miar kątów y i z wynosi 180 ° .
- **opus reasoning:** Trójkąt OAB jest równoramienny ( OA = OB ), kąt przy O ma 40 ° , więc kąty przy podstawie ∠ OAB = ∠ OBA = 180 ° − 40 ° 2 = 70 ° . I. Ponieważ AB ∥ CD , kąt x przy C (kąt odpowiadający) równy jest kątowi przy podstawie: x = 70 ° — PRAWDA. II. Kąt y przy D (ostry, między CD a dolnym ramieniem) jako kąt naprzemianległy również równy 70 ° , zatem x = y — PRAWDA. III. Kąt z przy B jest rozwarty: z = 180 ° − 70 ° = 110 ° . Kąty y i z to kąty jednostronne wewnętrzne przy prostych równoległych, więc y + z = 70 ° + 110 ° = 180 ° — PRAWDA. (Rysunek nieco niejednoznaczny co do kąta y ; gdyby y = 110 ° ,  …

### `b403994f` · rejonowy_2020-2021_swietokrzyskie_1_q9 · _true_false_
- **key:** `PFP` · **sonnet:** `FFF`(high) · **opus:** `PFP`(high)
- **Q:** Na wykresie zestawiono oceny z matematyki uczniów klasy VIII A i klasy VIII B. Oceń prawdziwość zdań:
- **choices:** 1) Średnia ocen uczniów klasy VIII A jest większa niż 3,70. · 2) Średnia ocen uczniów klasy VIII B jest większa od średniej ocen ucznió … · 3) Średnia ocen wszystkich uczniów klas ósmych jest większa niż średnia o …
- **opus reasoning:** Z wykresu VIII A (oceny 1–6): 2,1,5,6,4,2 (20 uczniów), suma ocen 75, średnia 75/20 = 3,75. VIII B: 1,3,5,7,4,0 (20 uczniów), suma 70, średnia 70/20 = 3,5. 1) 3,75 > 3,70 → P. 2) 3,5 > 3,75? nie → F. 3) średnia wszystkich = 145/40 = 3,625 > 3,5 → P. Odpowiedź: PFP.

### `627419a5` · rejonowy_2020-2021_swietokrzyskie_2_q5 · _true_false_
- **key:** `FPFP` · **sonnet:** `PPFP`(high) · **opus:** `FPFP`(high)
- **Q:** Jeśli liczba a jest wynikiem działania 10 20 · 20 10 , to:
- **choices:** 1) Liczba zer występujących w zapisie dziesiętnym liczby a jest równa 30. · 2) Suma cyfr liczby a jest równa 7. · 3) Liczba a + 1 jest podzielna przez 3. · 4) Liczba a + 2 jest podzielna przez 9.
- **opus reasoning:** a = 10 20 · 20 10 = 10 20 · 2 10 · 10 10 = 1024 · 10 30 , czyli 1024 i 30 zer. 1) Zer jest 1 (w 1024) + 30 = 31, nie 30 → F. 2) Suma cyfr = 1+0+2+4 = 7 → P. 3) a ma sumę cyfr 7, więc reszta z dzielenia przez 3 to 1; a + 1 daje resztę 2 → F. 4) a ≡ 7 ( mod 9 ) , więc a + 2 ≡ 0 , podzielna przez 9 → P.

### `bffa1302` · rejonowy_2020_kujawsko-pomorskie_q12 · _closed_single_
- **key:** `A` · **sonnet:** `C`(med) · **opus:** `A`(high)
- **Q:** Suma zacieniowanych kątów przedstawionych na rysunku, wynosi
- **choices:** A) 360° · B) 540° · C) 180° · D) 420°
- **opus reasoning:** Rysunek przedstawia dwa nakładające się (przecinające się) trójkąty; zacieniowanych jest 6 kątów — po jednym w każdym z 6 wierzchołków, czyli wszystkie kąty wewnętrzne obu trójkątów. Suma kątów wewnętrznych jednego trójkąta wynosi 180 ° , zatem dla dwóch trójkątów: 2 · 180 ° = 360 ° . Odpowiedź: 360° (A).

### `baac8087` · rejonowy_2023_lubuskie_q7 · _closed_single_
- **key:** `A` · **sonnet:** `B`(med) · **opus:** `A`(high)
- **Q:** Na poniższym rysunku przedstawiono kartkę z zeszytu Oli. Narysowała ona cztery figury. Ile spośród tych figur ma oś symetrii, a nie ma środka symetrii?
- **choices:** A) Jedna. · B) Dwie. · C) Trzy. · D) Cztery.
- **opus reasoning:** Analiza czterech figur na kratce: Figura 1 (lewa górna, kształt litery L/strzałki): ma przekątną oś symetrii (odbicie względem przekątnej zamienia ramię poziome na pionowe), a nie ma środka symetrii. Spełnia warunek. Figura 2 (prawa górna, prostokąt z występem u góry i przesuniętym występem u dołu): ma tylko środek symetrii (obrót o 180°), nie ma osi symetrii. Figura 3 (lewa dolna, wiatraczek): ma środek symetrii, więc odpada. Figura 4 (prawa dolna, kokarda): ma środek symetrii (a także osie), więc odpada, bo posiada środek symetrii. Tylko jedna figura ma oś symetrii i nie ma środka symetrii.  …

### `7c865f65` · rejonowy_2024_dolnoslaskie_q8 · _closed_single_
- **key:** `D` · **sonnet:** `C`(med) · **opus:** `D`(high)
- **Q:** W kwadracie ABCD umieszczono cztery jednakowe trójkąty prostokątne T zaznaczone na rysunku obok szarym kolorem. Najkrótszy bok trójkąta T ma długość 9 cm, a najdłuższy 15 cm. Oblicz pole kwadratu ABCD .
- **choices:** A) 135 cm 2 · B) 144 cm 2 · C) 225 cm 2 · D) 288 cm 2
- **opus reasoning:** Trójkąt T jest prostokątny: najkrótszy bok (przyprostokątna) 9, najdłuższy (przeciwprostokątna) 15, więc druga przyprostokątna 15 2 − 9 2 = 12 . Cztery trójkąty stykają się kątami prostymi w środku kwadratu (wiatraczek), a dłuższa przyprostokątna (12) każdego z nich leży wzdłuż połowy przekątnej i sięga wierzchołka. Zatem połowa przekątnej = 12, cała przekątna = 24. Pole kwadratu = 24 2 2 = 288 cm². Sprawdzenie podziału: każda ćwiartka (pole 72) = trójkąt T (½·9·12=54) + biały wycinek (18); 4·72 = 288 cm². Odpowiedź D.

### `807570af` · szkolny_2012-2013_slaskie_q17 · _open_
- **key:** `a) 780 m n.p.m.;  b) 150 m` · **sonnet:** `a) 780 m n.p.m.; b) ok. 180 m (A≈600 m, B=780 m)`(low) · **opus:** `a) 780 m; b) 150 m`(med)
- **Q:** Korzystając z mapy poziomicowej uzupełnij zdania. a) Wysokość bezwzględna szczytu jest równa …………………… . b) Wysokość względna między punktami A i B jest równa ………… .
- **opus reasoning:** a) Szczyt oznaczony jest punktem wysokościowym (X) z wartością 780 , więc jego wysokość bezwzględna to 780 m. b) Poziomice mają cięcie co 50 m (600, 650, 700, 750). Punkt A leży na poziomicy 600 m, a punkt B na najbliższej szczytu poziomicy 750 m. Wysokość względna to różnica: 750 - 600 = 150 m.

### `c84ef79f` · szkolny_2013-2014_slaskie_q13 · _closed_single_
- **key:** `C` · **sonnet:** `D`(med) · **opus:** `C`(high)
- **Q:** Mapa jest zorientowana przy pomocy kompasu, gdy igła magnetyczna wyznaczająca północ ustawiona jest
- **choices:** A) równolegle do drogi na mapie. · B) wzdłuż rzeki na mapie. · C) równolegle do lewej ramki mapy. · D) wzdłuż górnej krawędzi mapy.
- **opus reasoning:** Mapa zorientowana ma północ u góry; boczne ramki biegną w kierunku N–S. Igła wskazująca północ musi więc być ustawiona równolegle do (lewej) bocznej ramki mapy.

### `0ed5d7ae` · szkolny_2014-2015_slaskie_q5 · _closed_single_
- **key:** `D` · **sonnet:** `A`(high) · **opus:** `D`(high)
- **Q:** Aby liczba 3463? była podzielna jednocześnie przez 3 i przez 4, w miejsce „?” należy wpisać cyfrę
- **choices:** A) 8 · B) 6 · C) 4 · D) 2
- **opus reasoning:** Podzielność przez 4: dwie ostatnie cyfry 3? muszą tworzyć liczbę podzielną przez 4, więc ? ∈ {2, 6} (32, 36). Podzielność przez 3: suma cyfr 3+4+6+3+?=16+? podzielna przez 3, więc ? ∈ {2, 5, 8}. Wspólne rozwiązanie: ? = 2. Liczba 34632 jest podzielna przez 3 i przez 4 → odpowiedź D.

### `1be9eb82` · szkolny_2016-2017_malopolskie_q13 · _true_false_
- **key:** `FP` · **sonnet:** `PP`(med) · **opus:** `FP`(high)
- **Q:** Uchwałą Sejmiku Województwa Małopolskiego i Rady Miasta Krakowa w 2000 roku powołano Muzeum Armii Krajowej imienia gen. Emila Fieldorfa „Nila”. Logo tego muzeum nawiązuje do herbu województwa małopolskiego, którym jest ukoronowany orzeł w czerwonym polu. Oceń prawdziwość podanych zdań. Wybierz P, jeśli zdanie jest prawdziwe, albo F – jeśli zdanie jest fałszywe.
- **choices:** 1) Herb województwa małopolskiego ma jedną oś symetrii. · 2) Krakowskie Muzeum Armii Krajowej powołano w XX wieku.
- **opus reasoning:** 1) Orzeł w herbie ma głowę zwróconą w jedną stronę, co łamie symetrię pionową – herb nie ma osi symetrii, więc zdanie o jednej osi jest fałszywe (F) . 2) Muzeum powołano w 2000 roku; XX wiek to lata 1901–2000, więc rok 2000 należy do XX wieku – prawda (P) .

### `6eeec636` · szkolny_2016-2017_malopolskie_q8 · _closed_single_
- **key:** `D` · **sonnet:** `A`(low) · **opus:** `D`(high)
- **Q:** Ile wszystkich trójkątów zaznaczono na poniższym rysunku?
- **choices:** A) 6 · B) 8 · C) 10 · D) 11
- **opus reasoning:** Ciało (czworokąt) z dwiema przekątnymi daje 4 małe trójkąty + 4 złożone = 8. Ogon to trójkąt podzielony przedłużeniem osi poziomej na 2 części, więc 3 trójkąty. Razem 8 + 3 = 11 .

### `9d70e737` · szkolny_2017-2018_malopolskie_q5 · _closed_single_
- **key:** `C` · **sonnet:** `D`(high) · **opus:** `C`(high)
- **Q:** Trzy proste przecinają się tak jak na rysunku. Ile stopni ma kąt α ?
- **choices:** A) 150° · B) 120° · C) 100° · D) 80°
- **opus reasoning:** Wierzchołek górny: kąt 60 ° jest wierzchołkowy do kąta wewnętrznego trójkąta, więc kąt wewnętrzny = 60°. Przy prawym dole kąt 140 ° to kąt zewnętrzny, więc kąt wewnętrzny = 180° − 140° = 40°. α jest kątem zewnętrznym trójkąta przy lewym dole, więc α = 60° + 40° = 100°.

### `db2c37a6` · szkolny_2017_podkarpackie_q19 · _open_
- **key:** `Figura IV: 28 patyczków; obwód figury VI: 20` · **sonnet:** `a) 11; b) 20`(low) · **opus:** `IV: 28 patyczków; obwód figury VI: 20`(med)
- **Q:** Ania budowała z patyczków o równej długości kolejne wielokąty, dokładając taką samą ilość patyczków. Uzupełnij zdania, wpisując w wykropkowane miejsca odpowiednie liczby. Figura o numerze IV zostanie zbudowana z …… patyczków. Obwód figury I jest równy 10, obwód figury II jest równy 12, obwód figury o numerze VI jest równy ……
- **opus reasoning:** Obwody tworzą ciąg arytmetyczny: 10 , 12 , ... o różnicy 2, więc obwód figury n to 2 n + 8 ; dla VI: 2 · 6 + 8 = 20 . Liczba patyczków figury n : brzeg ( 2 n + 8 ) plus ( n - 1 ) wewnętrznych zygzaków po 4 patyczki, czyli 6 n + 4 : I=10, II=16, III=22 (co +6). Figura IV: 6 · 4 + 4 = 28 patyczków.

### `40319bda` · szkolny_2019-2020_wielkopolskie_q17 · _true_false_
- **key:** `FP` · **sonnet:** `PP`(high) · **opus:** `FP`(med)
- **Q:** Oto dwoje spośród wielu polskich uczonych, którzy zasłynęli na świecie: Maria Skłodowska-Curie i Mikołaj Kopernik. Maria Skłodowska-Curie: 1867–1934. Mikołaj Kopernik: 1473–1543. Czy w poniższych zdaniach prawidłowo zapisano liczby? Zaznacz właściwą odpowiedź.
- **choices:** 1) Mikołaj Kopernik urodził się w roku MCCCCLXXIII. · 2) Maria Skłodowska-Curie żyła LXVII lat.
- **opus reasoning:** Zdanie 1: MCCCCLXXIII ma wartość 1000+400+70+3 = 1473 (rok urodzenia Kopernika), ale zapis jest błędny — symbol C powtórzono cztery razy; poprawnie 400 to CD , czyli MCDLXXIII . Zatem liczbę zapisano niepoprawnie → F. Zdanie 2: LXVII = 67, zapisane poprawnie. Maria żyła 1934 − 1867 = 67 lat, więc liczba się zgadza → P.

### `a306e3aa` · szkolny_2021-2022_swietokrzyskie_q9 · _true_false_
- **key:** `PPP` · **sonnet:** `PPF`(med) · **opus:** `PPP`(high)
- **Q:** Dany jest prostokąt, w którym różnica długości dwóch kolejnych boków jest równa 12 cm a stosunek długości tych boków wynosi 7:3. Oceń, czy poniższe zdania są prawdziwe. Zaznacz P, jeśli zdanie jest prawdziwe, lub F – jeśli jest fałszywe.
- **choices:** 1) Pole tego prostokąta wynosi 1,89 dm². · 2) Kwadrat o obwodzie równym obwodowi danego prostokąta ma bok długości 1 … · 3) Z danego prostokąta można wyciąć kwadrat o polu 8,1 · 10 − 7 a.
- **opus reasoning:** Boki w stosunku 7:3, różnica 7 x − 3 x = 4 x = 12 cm, więc x = 3 ; boki 21 cm i 9 cm. 1) Pole 21 · 9 = 189 cm² = 1,89 dm² (1 dm²=100 cm²) — P. 2) Obwód 2 ( 21 + 9 ) = 60 cm; bok kwadratu 15 cm = 150 mm — P. 3) 8,1 · 10 − 7 a = 0,81 cm² (bok 0,9 cm) — mieści się w prostokącie 21×9, więc można wyciąć — P.

### `f3461a10` · szkolny_2026_kujawsko-pomorskie_q13 · _closed_single_
- **key:** `A` · **sonnet:** `D`(low) · **opus:** `A`(high)
- **Q:** Wiedząc, że m ∥ n , | BC | = 15 cm, | CD | = 8 cm, | CE | = 20 cm oraz kąty przy wierzchołku B i C są równe i mają miarę α (patrz rysunek). Obwód trapezu ABCD wynosi:
- **choices:** A) 71 cm · B) 63 cm · C) 51 cm · D) nie można obliczyć
- **opus reasoning:** Prosta m zawiera bok AD , a prosta n odcinek EC , więc AD ∥ EC . Ponieważ też AE ∥ DC , czworokąt AECD jest równoległobokiem. Stąd | AE | = | DC | = 8 cm oraz | AD | = | EC | = 20 cm. W trójkącie EBC kąty przy B i C są równe ( α ), więc trójkąt jest równoramienny i | EB | = | EC | = 20 cm. Zatem | AB | = 8 + 20 = 28 cm, a obwód = 28 + 15 + 8 + 20 = 71 cm.

### `427ec56e` · wojewodzki_2013_podkarpackie_q11 · _closed_single_
- **key:** `B` · **sonnet:** `A`(low) · **opus:** `B`(high)
- **Q:** Suma miar wszystkich kątów zaznaczonych na rysunku wynosi:
- **choices:** A) 180° · B) 360° · C) 270° · D) 540°
- **opus reasoning:** Rysunek to trójkąt środkowy z trzema trójkątami przy jego wierzchołkach (kąty wierzchołkowe równe kątom trójkąta środkowego). Kąty trójkąta środkowego: α + β + γ = 180 ° . Dwa zaznaczone kąty każdego trójkąta zewnętrznego dają 180 ° minus kąt wierzchołkowy. Suma = 3 · 180 ° − 180 ° = 360 ° .

### `195936cd` · wojewodzki_2013_podkarpackie_q4 · _closed_single_
- **key:** `A` · **sonnet:** `C`(low) · **opus:** `A`(high)
- **Q:** Latarnia morska ma wysokość 80 m. Na planie ma ona wysokość 3 cm i 2 5 całej narysowanej latarni. W jakiej skali narysowano ten rysunek?
- **choices:** A) 1:1600 · B) 1:2000 · C) 1: 400 17 · D) nie da się policzyć
- **opus reasoning:** Niech H to wysokość całej narysowanej latarni. Z treści: H = 3 cm + 2 5 H , więc 3 5 H = 3 , czyli H = 5 cm. Skala: 5 cm : 80 m = 5 cm : 8000 cm = 1 : 1600.

### `90a42c1a` · wojewodzki_2014_podlaskie_sp_q15 · _closed_single_
- **key:** `A` · **sonnet:** `B`(med) · **opus:** `A`(high)
- **Q:** Czworokąt ABCD jest rombem. Miara kąta x , zaznaczonego na rysunku, jest równa
- **choices:** A) 50° · B) 40° · C) 30° · D) 20°
- **opus reasoning:** W rombie A B C D kąt przy A = 50°, więc kąt przy B = 130°. Z D poprowadzono dwie prostopadłe: do A B (punkt P ) i do B C (punkt Q ). W czworokącie D P B Q : x = 360 ° - 90 ° - 90 ° - 130 ° = 50 ° .

### `4c10bc8d` · wojewodzki_2018-2019_zachodniopomorskie_q11 · _closed_single_
- **key:** `C` · **sonnet:** `D`(high) · **opus:** `C`(high)
- **Q:** Jeśli bok kwadratu zewnętrznego na rysunku ma długość 12, a zakreślone łuki mają promień o połowę mniejszy od boku tego kwadratu, to pole zacieniowanej figury jest równe:
- **choices:** A) 9 π − 18 · B) 18 π − 36 · C) 36 π − 72 · D) 72 π − 144
- **opus reasoning:** Bok kwadratu = 12, promień łuków = 6. Kwadrat wewnętrzny (romb) łączy środki boków; każdy łuk to ćwiartka okręgu o promieniu 6 zakreślona ze środka w wierzchołku kwadratu, wygięta do wewnątrz. Zacieniowane są 4 odcinki kołowe między krawędzią rombu a łukiem, każdy odpowiadający kątowi środkowemu 90 ° . Pole jednego odcinka: 1 2 6 2 ( π 2 − 1 ) = 9 π − 18 . Cztery odcinki: 4 ( 9 π − 18 ) = 36 π − 72 — odpowiedź C.

### `2a4c89fc` · wojewodzki_2018_podkarpackie_q6 · _closed_single_
- **key:** `C` · **sonnet:** `D`(low) · **opus:** `C`(high)
- **Q:** Suma miar wszystkich kątów zaznaczonych na rysunku wynosi:
- **choices:** A) 270° · B) 150° · C) 360° · D) 180°
- **opus reasoning:** Trzy proste przecinają się w jednym punkcie O , tworząc trzy trójkąty; zaznaczone są po dwa kąty przy podstawie każdego z nich (6 kątów). Kąty przy O to trzy z sześciu kątów utworzonych przez trzy proste; leżą naprzemianlegle, więc ich suma wynosi 180 ° (połowa pełnego kąta). Suma zaznaczonych kątów = 3 · 180 ° − 180 ° = 360 ° .

### `d8fa6a30` · wojewodzki_2020-2021_zachodniopomorskie_q2 · _closed_single_
- **key:** `A` · **sonnet:** `D`(high) · **opus:** `A`(high)
- **Q:** W trapezie trzy boki mają tę samą długość. Między miarami kątów α i β tego trapezu zachodzi związek:
- **choices:** A) β = 2 α · B) α = 3 2 β · C) β = 3 2 α · D) α = β
- **opus reasoning:** Trapez równoramienny: ramiona i krótsza podstawa równe (AB=BC=CD), przekątna AC. Z BC ∥ AD: ∠ B C A = ∠ C A D (kąty naprzemianległe). Trójkąt ABC jest równoramienny (AB=BC), więc ∠ B A C = ∠ B C A = α . Zatem kąt przy podstawie ∠ B A D = 2 α , a z równoramienności β = ∠ A D C = 2 α .

### `16ba9b1a` · wojewodzki_2022_lubuskie_q21 · _true_false_
- **key:** `PP` · **sonnet:** `FF`(med) · **opus:** `PP`(high)
- **Q:** Prostokąt o bokach: 5 x 2 + x + 3 oraz 8 x 2 + 9 został podzielony odcinkami na cztery mniejsze prostokąty tak, jak pokazano na rysunku. W oparciu o te dane oceń, czy informacje dotyczące zacieniowanego prostokąta są prawdziwe.
- **choices:** 1) Obwód zacieniowanego prostokąta jest równy 8 x 2 + 2 x + 16 . · 2) Pole zacieniowanego prostokąta można opisać wyrażeniem 2 ( 2 x 4 + x 3 …
- **opus reasoning:** Left column width = ( 8 x 2 + 9 ) - ( 6 x 2 + 3 ) = 2 x 2 + 6 ; top row height = ( 5 x 2 + x + 3 ) - ( 3 x 2 + 1 ) = 2 x 2 + x + 2 . (1) Perimeter = 2 ( 4 x 2 + x + 8 ) = 8 x 2 + 2 x + 16 — true. (2) Area = ( 2 x 2 + 6 ) ( 2 x 2 + x + 2 ) = 4 x 4 + 2 x 3 + 16 x 2 + 6 x + 12 , which equals 2 ( 2 x 4 + x 3 + 8 x 2 + 3 x + 6 ) — true.

### `f5277266` · wojewodzki_2023_lubuskie_q23 · _true_false_
- **key:** `FPP` · **sonnet:** `PPP`(high) · **opus:** `FPP`(high)
- **Q:** Oceń informacje dotyczące wielokątów.
- **choices:** 1) Podczas lekcji geometrii Zosia narysowała dwa trójkąty (jak na rysunku … · 2) Sześciokąt foremny i trójkąt równoboczny mają jednakowe pola równe 18  … · 3) Dla każdej liczby naturalnej n obwód równoległoboku przedstawionego na …
- **opus reasoning:** 1) Oba trójkąty mają kąty 26°, 62°, 92°, a bok 4 cm leży naprzeciw kąta 62° w obu → są przystające (ASA). Twierdzenie Zosi (nieprzystające) jest fałszywe → F. 2) Trójkąt: 3 4 a 2 = 18 3 → a = 6 2 . Sześciokąt: 3 3 2 b 2 = 18 3 → b = 2 3 . Stosunek a b = 6 → P. 3) Obwód = 2 ( 2 ( n + 2 ) + 3 ( n + 7 ) ) = 10 ( n + 5 ) , zawsze podzielny przez 5 → P.

### `479c518d` · wojewodzki_2023_opolskie_q5 · _true_false_
- **key:** `PPF` · **sonnet:** `FFF`(low) · **opus:** `PPF`(high)
- **Q:** Siatka ostrosłupa tworzy kwadrat o boku długości 12 cm. Przy każdym zdaniu wpisz TAK lub NIE.
- **choices:** 1) Długość jednej z wysokości tego ostrosłupa jest równa 12 cm. · 2) Objętość ostrosłupa jest równa 72 cm³. · 3) Suma długości krawędzi ostrosłupa wynosi ( 6 2 + 12 5 + 36 ) cm.
- **opus reasoning:** Kwadrat 12×12 (pole 144) jest siatką ostrosłupa trójkątnego — „narożnika” o trzech wzajemnie prostopadłych krawędziach 6, 6 i 12 cm. Ściany: trójkąty prostokątne o przyprostokątnych 6&6 (pole 18), 6&12 (pole 36), 6&12 (pole 36) oraz trójkąt o bokach 6 2 , 6 5 , 6 5 (pole 54). Suma pól = 18+36+36+54 = 144 ✓. (1) Biorąc za podstawę trójkąt prostokątny o przyprostokątnych 6&6, krawędź 12 cm jest do niej prostopadła, więc jedna z wysokości = 12 cm — PRAWDA . (2) Objętość = 1 3 ·18·12 = 72 cm³ — PRAWDA . (3) Suma krawędzi = 6+6+12+ 6 2 + 6 5 + 6 5 = 24 + 6 2 + 12 5 , a nie 36 + 6 2 + 12 5 — FAŁSZ .

### `b2dea76b` · wojewodzki_2024-2025_malopolskie_q15 · _open_
- **key:** `a) 4(√3 − 1) cm²;  b) ⅓√2 + ⅔;  c) a = 2(2√3 − 1) cm;  d) b = 2(√3 − 1) cm` · **sonnet:** `a) Pole ABCD = 4√3-4 cm²; b) obwód I : obwód II = √2; c) a ≈ 2+2√3 cm; d) b = 2√2 cm`(low) · **opus:** `a) 4√3 − 4 cm² (≈ 2,93 cm²); b) (√2 + 1)/2 = ½√2 + ½; c) a = 2√3 cm (≈ 3,46 cm); d) b = 2√3 − 2 cm (≈ 1,46 cm)`(low)
- **Q:** W trójkącie równobocznym ACD o boku długości 4 cm zaznaczono punkt B tak, że trójkąt ACB jest prostokątny i równoramienny (rysunek obok). a) (2p) Oblicz pole czworokąta ABCD . Zapisz obliczenia. Filip wyciął z papieru 12 czworokątów przystających do czworokąta ABCD i ułożył z nich dwa dwunastokąty: dwunastokąt I oraz dwunastokąt II (rysunek poniżej). b) (3p) Oblicz stosunek obwodu dwunastokąta I do obwodu dwunastokąta II. Zapisz obliczenia. Odpowiedź przedstaw w postaci p q + …
- **opus reasoning:** Czworokąt ABCD (dart): ACD równoboczny bok 4; ACB prostokątny równoramienny z kątem prostym w B, więc AC=4 to przeciwprostokątna, przyprostokątne AB=BC=4/√2=2√2. Boki DA=CD=4, kąty A=C=15°, D=60°, kąt wklęsły B=270°. a) Pole ABCD = pole(ACD) − pole(ACB) = (√3/4)·4² − ½·(2√2)² = 4√3 − 4 ≈ 2,93 cm². b) Dwunastokąt II (gwiazda) = 6 dartów złączonych wierzchołkami D (60°·6=360°) w środku; na obwodzie 12 krótkich boków: obwód II = 12·2√2 = 24√2. Dwunastokąt I ma na brzegu 6 boków długich i 6 krótkich (dzielone: 3 długie + 3 krótkie), więc obwód I = 6·4 + 6·2√2 = 24 + 12√2. Stosunek = (24+12√2)/(24√ …

### `4521f604` · wojewodzki_2024_lubelskie_q7 · _true_false_
- **key:** `FFFF` · **sonnet:** `PFFF`(med) · **opus:** `FFFF`(high)
- **Q:** Poniżej podane są zdania dotyczące ostrosłupów. Oceń prawdziwość podanych zdań. Wybierz P, jeśli zdanie jest prawdziwe, albo F – jeśli jest fałszywe.
- **choices:** 1) Pole powierzchni bocznej ostrosłupa może być równe polu jego podstawy. · 2) Ostrosłup prawidłowy, którego ściany boczne są trójkątami równobocznym … · 3) W ostrosłupach prawidłowych wszystkie krawędzie mają jednakową długość … · 4) Ostrosłup, którego podstawą jest kwadrat, jest ostrosłupem prawidłowym …
- **opus reasoning:** 1) Rzuty ścian bocznych pokrywają dokładnie podstawę, a pole każdej ściany jest większe od pola jej rzutu (ściana jest nachylona), więc pole boczne jest zawsze większe od pola podstawy, nie może być mu równe → F. 2) Ostrosłup prawidłowy o ścianach bocznych będących trójkątami równobocznymi to niekoniecznie czworościan foremny — kontrprzykład: ostrosłup o podstawie kwadratowej ze ścianami z trójkątów równobocznych (połowa ośmiościanu) → F. 3) W ostrosłupie prawidłowym krawędzie podstawy i krawędzie boczne mają na ogół różne długości → F. 4) Ostrosłup o podstawie kwadratowej może być pochyły (sp …

### `4332683e` · wojewodzki_2025_opolskie_q2 · _true_false_
- **key:** `FPF` · **sonnet:** `FTF`(high) · **opus:** `FPF`(high)
- **Q:** Liczbą wymierną nieujemną jest:
- **choices:** 1) − | − 196 | · 2) 5,1 · 10 − 3 · 3) ( 1 − 2 ) 2
- **opus reasoning:** 1) − | − 196 | = − | − 14 | = − 14 — wymierna, ale ujemna → F. 2) 5,1 · 10 − 3 = 0,0051 — wymierna i dodatnia → P. 3) ( 1 − 2 ) 2 = 3 − 2 2 — niewymierna → F.

## KEYLESS SPLIT — no key; Opus and Sonnet disagree (low confidence) (19)

### `d091ef6c` · rejonowy_2012_podkarpackie_q23 · _open_
- **key:** `(none)` · **sonnet:** `27 czekoladek; z pozostałych 8: Ola powinna dostać 3, Ania 5 (Kasia 0)`(high) · **opus:** `27 czekoladek; Kasia ma już 9 (sprawiedliwo), z 8 pozostałych Oli należą się 3, a Ani 5`(high)
- **Q:** Mama kupiła swoim trzem córkom Kasi, Oli i Ani czekoladki. Ponieważ dziewczynki nie przyszły jeszcze ze szkoły położyła czekoladki na stole w kuchni. Napisała karteczkę, aby podzieliły czekoladki równo między siebie i wyszła. Gdy przyszła ze szkoły Kasia zobaczyła na stole czekoladki, zgodnie z prośbą mamy przeliczyła je, wzięła jedną trzecią i poszła do koleżanki. Następnie przyszła ze szkoły Ola, zobaczyła na stole czekoladki, przeliczyła je, wzięła jedną trzecią i poszła d …
- **opus reasoning:** Po każdej zostaje 2/3: ( 2 3 ) ³ x = 8 27 x = 8 ⇒ x = 27 . Sprawiedliwy podział = 9 na osobę. Kasia wzięła 9, Ola 6, Ania 4. Z 8 pozostałych: Ola +3, Ania +5 (każda ma po 9).

### `45dc25db` · rejonowy_2012_podlaskie_sp_q19 · _open_
- **key:** `(none)` · **sonnet:** `125°`(high) · **opus:** `135°`(high)
- **Q:** W trójkącie prostokątnym ABC przedłużono przeciwprostokątną AB i odłożono odcinek AD o długości równej przyprostokątnej AC oraz odcinek BE o długości równej przyprostokątnej BC . Miara kąta CAB jest równa 40°. Wykonaj rysunek. Oblicz, jaką miarę ma kąt DCE ?
- **opus reasoning:** Kąt prosty przy C. Trójkąt ACD (AC=AD) ma kąt przy A = 180°−40° = 140°, więc ∠ACD = 20°. Trójkąt BCE (BC=BE): kąt przy B = 180°−50° = 130°, więc ∠BCE = 25°. ∠DCE = 20° + 90° + 25° = 135°.

### `ff16af86` · rejonowy_2020_podkarpackie_q15 · _open_
- **key:** `(none)` · **sonnet:** `15.1. 3,5²−3·4=0,25; 8,5²−9·10=0,25; 99,5²−99·100=0,25 | 15.2. (n+0,5)²−n(n+1)=0,25 dla naturalnego n | 15.3. dowód przez rozwinięcie: (n+0,5)²−n(n+1)=n²+n+0,25−n²−n=0,25`(high) · **opus:** `15.1. 3,5²−3·4=0,25; 9,5²−9·10=0,25; 99,5²−99·100=0,25. 15.2. (n+0,5)²−n(n+1)=0,25. 15.3. (n+0,5)²−n(n+1)=n²+n+0,25−n²−n=0,25`(high)
- **Q:** Zauważ, że 1,5 2 − 1 · 2 = 2,25 − 2 = 0,25 2,5 2 − 2 · 3 = 6,25 − 6 = 0,25 15.1. Wykorzystując regułę zastosowaną w powyższych równościach, uzupełnij zapisy: 3,5 2 − … · … = … … − 9 · 10 = … 99,5 2 − … · … = … 15.2. Oznacz przez n dowolną liczbę naturalną i zapisz w postaci ogólnego wzoru zależność zachodzącą w równościach powyżej. 15.3. Udowodnij, że zapisany przez Ciebie wzór jest prawdziwy dla każdej liczby naturalnej n .
- **opus reasoning:** Reguła: ( n + 0,5 ) 2 − n ( n + 1 ) = 0,25 . Uzupełnienia: n=3, n=9, n=99. Dowód: n 2 + n + 0,25 − n 2 − n = 0,25 .

### `bc9f8b00` · rejonowy_2021_podkarpackie_q19 · _open_
- **key:** `(none)` · **sonnet:** `≈28,57% (dokładnie 200/7 %)`(high) · **opus:** `o 2/7 ≈ 28,57%`(high)
- **Q:** Mariusz ma o 40% więcej pieniędzy niż Adam. O ile procent mniej pieniędzy ma Adam od Mariusza? Zapisz obliczenia i odpowiedź.
- **opus reasoning:** Adam = 100, Mariusz = 140. Różnica = 40. 40/140 = 2/7 ≈ 28,57% mniej.

### `dbad9e7c` · szkolny_2019_lodzkie_q17 · _open_
- **key:** `(none)` · **sonnet:** `Dla naturalnych a, b niepodzielnych przez 3: a≡1 lub 2 (mod 3), więc a²≡1 (mod 3) (bo 1²=1, 2²=4≡1). Analogicznie b²≡1 (mod 3). Zatem a²+b²≡1+1=2 (mod 3).`(high) · **opus:** `Liczba niepodzielna przez 3 ma postać 3k±1; jej kwadrat = 9k²±6k+1 daje resztę 1 z dzielenia przez 3. Suma dwóch takich kwadratów daje resztę 1+1 = 2. c.n.d.`(high)
- **Q:** Udowodnij, że suma kwadratów dwóch liczb naturalnych niepodzielnych przez 3 daje przy dzieleniu przez 3 resztę 2.
- **opus reasoning:** Liczba niepodzielna przez 3: 3 k ± 1 . Kwadrat: 9 k 2 ± 6 k + 1 ≡ 1 (mod 3). Suma dwóch takich kwadratów ≡ 1 + 1 = 2 (mod 3). c.n.d.

### `e97df540` · szkolny_2024_dolnoslaskie_q9 · _open_
- **key:** `(none)` · **sonnet:** `Zadanie anulowane (brak liczby naturalnej k spełniającej 3/k = 2/5)`(high) · **opus:** `6 (zadanie anulowane)`(med)
- **Q:** Dodatnie liczby naturalne k , m spełniają warunek 3 k = 2 5 = m 75 . Wartość wyrażenia k m k + m jest równa _____ . Zadanie anulowano — nie istnieje liczba naturalna k spełniająca pierwszą równość.
- **opus reasoning:** Z 2 5 = m 75 wynika m = 30 . Z 3 k = 2 5 wynika k = 7,5 — nie jest to liczba naturalna, więc zadanie anulowano. Formalnie k m k + m = 225 37,5 = 6 .

### `2297dbc6` · wojewodzki_2011-2012_warminsko-mazurskie_q20 · _open_
- **key:** `(none)` · **sonnet:** `Tak, lis zdąży uciec do nory.`(high) · **opus:** `Tak, lis zdąży uciec`(high)
- **Q:** Pies goni lisa. Prędkość psa to 8 m/s, a lisa 6 m/s. Odległość między nimi na początku wynosi 360 m. Lis ma do nory 1 km. Czy lis zdąży uciec? Przedstaw obliczenia.
- **opus reasoning:** Lis dobiega do nory w 1000/6 ≈ 166,7 s. Pies zmniejsza dystans 2 m/s, dogoniłby po 360/2 = 180 s. 166,7 s < 180 s, więc lis ucieka (z zapasem ok. 27 m).

### `83cc57f7` · wojewodzki_2012_podkarpackie_q19 · _open_
- **key:** `(none)` · **sonnet:** `≈5,19 cm (140/27 cm)`(med) · **opus:** `3,5 cm`(high)
- **Q:** Plac zabaw zagospodarowano w sposób przedstawiony na rysunku. Do pokrycia asfaltem wyznaczonego terenu użyto 19,6 ton asfaltu. Oblicz, ile centymetrów grubości ma warstwa asfaltu na wyznaczonym terenie. Przyjmij, że metr sześcienny asfaltu waży 1,4 tony, a asfalt pokryto równą warstwą na całej powierzchni.
- **opus reasoning:** Objętość asfaltu = 19,6 : 1,4 = 14 m³. Pole trapezu (asfalt): podstawy 27 m i 27−8−6 = 13 m, wysokość 20 m → 13 + 27 2 · 20 = 400 m². Grubość = 14 : 400 = 0,035 m = 3,5 cm.

### `5225503c` · wojewodzki_2012_podkarpackie_q20 · _open_
- **key:** `(none)` · **sonnet:** `64/9 kg ≈ 7,11 kg`(high) · **opus:** `7 1/9 kg (≈ 7,11 kg)`(high)
- **Q:** Świeżo zerwany arbuz zawiera 92% wody. Pan Maciej w swoim ogródku wyhodował dorodnego arbuza, który zaraz po zerwaniu ważył 8 kg. Po dwóch tygodniach arbuz stracił część zawartej w nim wody i teraz zawartość wody w arbuzie wynosi 91%. Ile waży arbuz po dwóch tygodniach od zerwania?
- **opus reasoning:** Sucha masa = 8% z 8 kg = 0,64 kg i się nie zmienia. Po dwóch tygodniach stanowi 9% masy: m = 0,64 0,09 = 64 9 ≈ 7,11 kg.

### `4e109c05` · wojewodzki_2012_podkarpackie_q3 · _closed_single_
- **key:** `(none)` · **sonnet:** `C`(med) · **opus:** `B`(med)
- **Q:** Michał rozłożył na stole cztery poniższe karty. Które z nich mają jedną oś symetrii?
- **choices:** A) tylko 2♥ · B) tylko A♣ · C) A♣ i 2♥ i 3♣ · D) A♣ i 3♣
- **opus reasoning:** Uwzględniamy cyfry/litery w rogach kart. Litera A jest symetryczna względem osi pionowej, cyfry 2 i 3 nie są. As trefl (♣, 1 oś pionowa) ma dokładnie jedną oś. As karo (♦) ma 2 osie (romb). Karty 2♥ i 3♣ nie mają osi (cyfry 2,3 psują symetrię). Zatem tylko A♣.

### `ed8ff003` · wojewodzki_2012_podkarpackie_q6 · _closed_single_
- **key:** `(none)` · **sonnet:** `A`(high) · **opus:** `D`(low)
- **Q:** Tylko jeden z poniższych wzorów nie pasuje do pozostałych. Który?
- **choices:** A) 4 · B) 3 · C) 2 · D) 5
- **opus reasoning:** Cztery spirale są skręcone w tę samą stronę, jedna jest odbiciem lustrzanym (przeciwny kierunek skrętu). Ta niepasująca to spirala nr 5.

### `a4079629` · wojewodzki_2019_lodzkie_q1 · _closed_single_
- **key:** `(none)` · **sonnet:** `A`(high) · **opus:** `B`(med)
- **Q:** Każdy ułamek dziesiętny można zamienić na ułamek zwykły:
- **choices:** A) Prawda · B) Fałsz
- **opus reasoning:** Istnieją ułamki (rozwinięcia) dziesiętne nieskończone nieokresowe, np. 0,101001000100001…, które są liczbami niewymiernymi i nie da się ich zapisać jako ułamek zwykły. Zatem twierdzenie „każdy” jest fałszywe. (Uwaga: zależy od przyjętej definicji „ułamka dziesiętnego”; jeśli ograniczyć do skończonych/okresowych — byłaby Prawda.)

### `5d79d187` · wojewodzki_2019_lodzkie_q17 · _open_
- **key:** `(none)` · **sonnet:** `9,11 km/h`(high) · **opus:** `≈ 9,11 km/h`(high)
- **Q:** Turysta podzielił trasę na trzy jednakowe odcinki. Pierwszy z nich przeszedł krokiem spacerowym idąc 6 km/h, drugi odcinek przebiegł z prędkością 10 km/h, a trzeci przejechał rowerem jadąc 16 km/h. Jaka była średnia prędkość turysty na całej trasie? Wynik zaokrąglij do dwóch miejsc po przecinku.
- **opus reasoning:** Odcinki równe (d). Prędkość średnia = droga/czas = 3 1 6 + 1 10 + 1 16 = 720 79 ≈ 9,11 km/h.

### `849c14b2` · wojewodzki_2020_lodzkie_q18 · _open_
- **key:** `(none)` · **sonnet:** `Pole kwadratu / pole trójkąta = 3√3/4 ≈ 1,3 > 1, więc pole kwadratu jest większe.`(high) · **opus:** `Pole kwadratu (P²/16) > pole trójkąta (√3·P²/36) — dowód`(high)
- **Q:** Wykaż, że jeśli obwody kwadratu i trójkąta równobocznego są równe, to pole kwadratu jest większe od pola trójkąta.
- **opus reasoning:** Wspólny obwód P. Bok kwadratu P/4, pole P 2 16 . Bok trójkąta P/3, pole 3 4 · P 2 9 = 3 P 2 36 . Ponieważ 1 16 ≈ 0,0625 > 3 36 ≈ 0,0481 , pole kwadratu jest większe.

### `27c8bc68` · wojewodzki_2020_lodzkie_q8 · _closed_single_
- **key:** `(none)` · **sonnet:** `D`(high) · **opus:** `B`(high)
- **Q:** Punkty A = ( 2 , − 8 ) i B = ( − 4 , 3 ) są symetryczne względem punktu C . Współrzędne punktu C są równe:
- **choices:** A) ( 3 , − 5 1 2 ) · B) ( − 1 , − 2 1 2 ) · C) ( 1 , − 2 1 2 ) · D) ( − 1 , − 5 1 2 )
- **opus reasoning:** C to środek AB: ( 2 − 4 2 , − 8 + 3 2 ) = ( − 1 , − 2 1 2 ) .

### `49ea651c` · wojewodzki_2020_podkarpackie_q12 · _open_
- **key:** `(none)` · **sonnet:** `Dowód: k=5m+2 ⇒ k²=25m²+20m+4, więc k²≡4 (mod 5), zatem 3k²≡12≡2 (mod 5) — reszta z dzielenia 3k² przez 5 zawsze wynosi 2.`(high) · **opus:** `Dowód: dla k = 5n+2 mamy 3k² = 5(15n²+12n+2)+2, więc reszta z dzielenia 3k² przez 5 wynosi 2.`(high)
- **Q:** Udowodnij, że każda liczba całkowita k , która przy dzieleniu przez 5 daje resztę 2, ma tę własność, że reszta z dzielenia liczby 3 k 2 przez 5 jest równa 2.
- **opus reasoning:** k = 5n+2 ⇒ k² = 25n²+20n+4 ⇒ 3k² = 75n²+60n+12 = 5(15n²+12n+2)+2. Reszta = 2. ∎

### `5b43a954` · wojewodzki_2021_lodzkie_q15 · _open_
- **key:** `(none)` · **sonnet:** `y < z < x`(high) · **opus:** `y < z < x (−8/3 < −5/6 < −1/10)`(high)
- **Q:** Uporządkuj rosnąco liczby x , y , z jeśli: 1 x + 1 1 + 1 1 + 1 2 = 2 1 1 + 1 y + 1 1 + 1 2 = 2 1 1 + 1 1 + 1 z + 1 2 = 2
- **opus reasoning:** Wspólny fragment 1+½=3/2. Równanie 1: x+3/5=½ ⇒ x=−1/10. Równanie 2: y+2/3=−2 ⇒ y=−8/3. Równanie 3: z+½=−1/3 ⇒ z=−5/6. Rosnąco: y

### `d606eb87` · wojewodzki_2024_lubuskie_q11 · _closed_single_
- **key:** `(none)` · **sonnet:** `B`(low) · **opus:** `C`(med)
- **Q:** Obwód trójkąta ABC jest równy 7 cm. Długości boków wyrażają się liczbami naturalnymi. Zatem
- **choices:** A) trójkąt ABC jest rozwartokątny. · B) trójkąt ABC jest równoramienny. · C) co najmniej jeden bok ma długość 3 cm. · D) co najmniej jeden bok ma długość 2 cm.
- **opus reasoning:** Boki naturalne, obwód 7 i nierówność trójkąta dają tylko (1,3,3) oraz (2,2,3). Oba mają bok długości 3 → C prawdziwe zawsze. Oba są też równoramienne, więc B również zawsze prawdziwe (błąd arkusza); (2,2,3) rozwartokątny, ale (1,3,3) ostrokątny, więc A nie zawsze; D fałszywe (brak boku 2 w (1,3,3)). Wybieram C.

### `f5b968c0` · wojewodzki_2024_lubuskie_q17 · _open_
- **key:** `(none)` · **sonnet:** `15√7 + 13√3 + 6√15 ≈ 85,44`(high) · **opus:** `15√7 + 13√3 + 6√15 cm² ≈ 85,4 cm²`(high)
- **Q:** Wzór Herona pozwala obliczyć pole P △ trójkąta o bokach długości a , b oraz c . Niech p oznacza połowę obwodu trójkąta. Wtedy P △ = p ( p − a ) ( p − b ) ( p − c ) . Korzystając z powyższej informacji, oblicz pole powierzchni całkowitej ostrosłupa ABCDE , którego podstawą jest trapez równoramienny ABCD , w którym AB ∥ CD , | AB | = 6 , | CD | = 4 , | BC | = | AD | = 8 , ściana ABE oraz ściana CDE to trójkąty równoboczne.
- **opus reasoning:** Podstawa (trapez 6,4,ramiona 8): h = √(8²−1²) = 3√7, pole = ½(6+4)·3√7 = 15√7. Ściany równoboczne: ABE (bok 6) = 9√3, CDE (bok 4) = 4√3. Ściany BCE i ADE mają boki 8,6,4; Heron p=9: pole = √(9·1·3·5) = 3√15 każda, razem 6√15. Suma = 15√7 + 13√3 + 6√15 ≈ 85,4 cm².

## KEYLESS REVIEW — no key; answers unresolvable to auto-compare (2)

_Summarised (hashes):_ `e102e151` `80d6ed38`

## AGREE REVIEW — low-conf; Opus answer unresolvable to auto-compare (17)

_Summarised (hashes):_ `81b417e8` `7bbe0c0c` `8a764635` `98ecfbef` `71adf5b6` `bb1c8e9e` `f4c5a498` `d5bb6f98` `59bc0f61` `6ae6546d` `e8d2bb52` `b9c79dff` `fb3bd243` `5e98c5e0` `2a843698` `da0bf3e0` `4c1719aa`

## KEYLESS AGREED — no key; Opus and Sonnet agree (high-confidence fill) (625)

_Summarised (hashes):_ `663a9340` `04d905a1` `32ecb404` `84a0561f` `af5effac` `94ac75d7` `31c1d940` `6ccc966c` `decae42e` `769aa834` `c6268f61` `1e451309` `31383916` `2d070ca5` `4ebdc95b` `742d18c7` `ca9d73a2` `8444077b` `b8f7fac2` `d57c957e` `87667a2c` `dd8254b2` `a30dd3af` `c2e249f3` `b04e94e9` `d00fd88f` `dff12180` `10dbdbad` `afa99533` `9bee5751` `29bed187` `24d0d551` `487d264b` `b65de6d0` `89f9205a` `ed7969bb` `a52ecda9` `2e01dc8f` `cc428018` `17b9c010` `309afc5d` `8566ba58` `0d9db0ff` `3264c0ae` `9cf1b166` `14185629` `624d24ef` `11682dc7` `adf704a0` `b4fa66c4` `90c6033e` `e7fdb629` `fdff3a0d` `20ffc34a` `2bcc81f2` `078bb5aa` `b1268ebb` `e2504025` `3d9c9cc9` `616b5947` `1f5afc57` `a1a8ccef` `b15cc010` `51f7b53e` `04c1678c` `82d7215d` `39d7fcb3` `7745fc25` `70dac3da` `367c636b` `c1a52e30` `4f42ddc6` `f199cc94` `6928447c` `f2c8c585` `6dcf112a` `544c1526` `3a680fb5` `95f06c13` `e19ed0a4` `dfbf5308` `faf3f3e1` `183fa976` `8aba695e` `d1cde1f2` `cd1798e7` `b00461f7` `fb1fc38d` `e47e5765` `9d08709a` `00f2d6f3` `9b3706cd` `b00b179e` `7a4ce8c6` `3e52302f` `f4eb7e33` `15178f45` `e97f22d7` `b1e6c16f` `9a483d80` `ff62b097` `8c01d045` `bfee4d27` `5ba92f56` `3354e676` `da43083e` `83449a49` `5c1b2533` `249907b6` `796cadf5` `a779847b` `a61c795d` `4b1a998b` `453f08bf` `90b49952` `eb5e5a88` `e8e0f60e` `1034b91c` `a3aead2c` `5dcb41f4` `b6b69409` `53d55574` `da8e26e4` `a535d786` `b2aa64f2` `a7a996cf` `3c889e06` `3a5c0ede` `24c6a4b4` `f26807aa` `2d1e6885` `19fcda24` `7d4686a7` `799ff34f` `bc167f9e` `e3e15a2e` `df64154e` `cba1349b` `317e2941` `16ea3e54` `29ee351c` `7b0f0850` `f50c8bc1` `edaf85c1` `b5e4a574` `d9c13a3b` `b4b96e68` `aad56a85` `b10db80c` `04784e97` `ef7e2226` `3194e011` `12161c74` `a15b7426` `8c71c534` `cd199855` `51e00220` `eac4df93` `2d4e077a` `bb2d880e` `4307f4a2` `7a1508b4` `5f0c857a` `c6dd7735` `640fed02` `bc9560b9` `e1604072` `3fdf3d76` `5a84a6e0` `6b138381` `44afee6d` `a2c0d714` `22707e4b` `e2d837f9` `3ec864d5` `aeef27ba` `d4eed4c2` `97cee85e` `deaca366` `8610c4d9` `daece19b` `57201df3` `2a7fddc2` `695c0d19` `72dc4160` `1a20eecd` `8a2e2c62` `3c5a659a` `ee3a2ace` `3fd831ae` `4b69c830` `10b88775` `6f396cb8` `592508cb` `9e8b8662` `f9cce2d6` `dbc29d4b` `bfcad17e` `0aed2cb5` `f939b3c9` `6fbb92dc` `1585acb6` `5a76af10` `24d8e763` `4a9ae492` `4540e6b9` `9613ba6c` `dd89d3ca` `160140ac` `a58c88bf` `c9f1923a` `043822a6` `ea640209` `fbd648ba` `8e207e3b` `b66d99cb` `d865c9d4` `8cf4972f` `751baff2` `f59d6f06` `e4c33de6` `36d5bb5d` `5b2c74aa` `d1b7f165` `4178160f` `208415ce` `58c56665` `9eb5fc12` `2ba679d5` `c8c9e07c` `b62cc07f` `453f8aaa` `257cc265` `6cd0d1a0` `9744f3ce` `de90fc06` `9756d2e0` `a53a8df2` `abfd09ff` `c66fe508` `a9cb136b` `91e3654f` `af72c63d` `d1a50628` `27f40e71` `2f4df339` `c50308ad` `8c6e1910` `e4792be7` `b6c912a8` `88a92ceb` `2c16becb` `1237f826` `8f0af9c0` `1c53b761` `5231ca0b` `c3c5c396` `923f4290` `fb166d44` `2b4294bf` `f9187e3d` `e35bad15` `c5e13cff` `7336bd2e` `3bae8f57` `51ee5757` `4f292226` `25eb5894` `d0505d8f` `4d945038` `ff143bc4` `3f90690a` `6fd4c168` `547d5557` `46c37f7f` `7f047e8a` `9fdf6af7` `5c424fa4` `8d8df3b2` `896d9de7` `20c67e0b` `93aaaca0` `3095e4f1` `07bdbd6c` `a403b662` `537275dd` `5b642f00` `0df5a4d3` `eba83bc7` `abebe03b` `31b9d266` `69177578` `0389a790` `a835b847` `c767480a` `6b5b863e` `48bcc7bb` `541cf142` `4f99fdd8` `794662d9` `c231f5da` `ef58c40b` `9cdde770` `fc64b5ad` `44c95181` `453c5d6c` `0668c557` `0a097ee4` `5f93ac5e` `a16917ba` `d60eb731` `65543413` `8a94e508` `bf465808` `560bec22` `478fa0cf` `00c5ced2` `cf1f593f` `3e78b407` `0d094114` `bb14d1ee` `261d5a00` `84f65abe` `963dab3c` `726fe3b5` `6a53b7c0` `8e49f368` `f2888b0b` `5131fb90` `e647c58e` `95a2185f` `e793874d` `2e9648dd` `4536ffd7` `8b3ba915` `9b0f64aa` `4bb6aec9` `0bb8e1b7` `db6c7c0a` `6e49e881` `433e9ac4` `6f9b82b1` `b09d5bb7` `39626058` `1be2e65f` `99ee639e` `539b7063` `44a19f85` `5cd26643` `d60353ab` `59d06074` `d27d6e59` `38e5e038` `18a6fb23` `e6a957b6` `3725a447` `3d63abff` `d50c0694` `57e91965` `1f49fd25` `efa69f32` `07a588af` `5d64843c` `0e988073` `c34c4852` `77240649` `d7bad089` `617e5a9c` `243ff07c` `59b758b6` `258a1d63` `2b618185` `e7c33be6` `e436b362` `64516470` `cbcdd69e` `4e1519d0` `efc3b83c` `6866a8d7` `bb022307` `1477f18c` `c7ec3878` `44acd1fd` `edf2151c` `cba1bdc3` `dace02d1` `51adc929` `c4afdeb5` `21b7c321` `1f066741` `bf8c5292` `bf883dd3` `0171f771` `24b79440` `5b94c6be` `daf394f5` `0fba5158` `e3d4ba1e` `035cb483` `a942e9fd` `d79373c9` `aa23ee0d` `22e8f27a` `218b3c2d` `f5fb12ad` `92fa8cce` `291f350e` `51222074` `39ed8cef` `b7fc7040` `755d785b` `00b9a7e5` `7c3ade57` `94e5fb1d` `41dddfa4` `3046fcd9` `f0881ce1` `0957ae18` `5e8997b6` `39822623` `4678c14b` `b0153d37` `3acbacbc` `7632dcf7` `c0cc66eb` `ac543151` `a45d81dc` `7df3f755` `e62d7fa4` `0622f340` `49c8f3a7` `8db4d61c` `45236010` `05f73550` `69902157` `bab4bd0e` `d13adddf` `81c8caf1` `c1909ac7` `71ef47ab` `e431d2df` `b8ef9d1e` `0f84e5b7` `99c7d31e` `6cdd1ef0` `b8b5f78d` `2ca58623` `7bcbfb68` `3b4d9fde` `d5408e76` `7cc2e3f3` `046bdd54` `1a4e6e7c` `62d57a8f` `a2c97fc2` `06b13a70` `2757a8bf` `1391433f` `f8046bc4` `8614d6b8` `7da19c45` `a810a8f8` `0a24809a` `ebb36d34` `a1e3ea27` `8d44e6ca` `458aa3c3` `43b0e92b` `c1652616` `cc896c82` `eb740a38` `6f85c6dd` `ad98dbd5` `4723ddb1` `f00748c6` `31633c06` `abc3fc54` `256cba1f` `e0e0f2ee` `c675672e` `b711b052` `7b4e6f52` `3269d47f` `51b243d8` `aebf5919` `45631d0f` `5a0fd11b` `3ff5fd66` `707136e5` `b4f5db2e` `f4b621d8` `5f0eb0a3` `0dc03d48` `f888eee7` `07e8286f` `ce10dd8a` `8c4dabc5` `8567cfe4` `c7cfb440` `0c8416d5` `80b39386` `141ca58e` `f934eb82` `9d83ac0a` `ecc77cc0` `b1f209f2` `b9bff4d8` `e4987214` `9f7bf9e8` `2ab1ebaa` `036897b0` `451bae03` `b22f3b2d` `27848916` `4c4f1af5` `39a0ebdc` `fdd6b1d5` `666939b0` `8266bff7` `c5533a24` `964f058d` `88f41f68` `4a0f9ba9` `054110e6` `fc8190c2` `766dfec7` `a71afd5e` `4c579c4e` `b2ac14e5` `fa4527d1` `affd99dc` `7b35f159` `caf9971d` `ba1b7536` `59aff1ea` `072ced54` `2af8bdb6` `083a7d3f` `8cd681cb` `62cf13c3` `615f2d95` `abd2da1a` `ce221f7f` `9201353e` `d3443909` `73ffd012` `5f1e217d` `1a699553` `f7f76ab3` `4f30349b` `cd8e3a24` `4d6b283f` `042618c2` `0f45100e` `cc34c63c` `4af35b99` `5804d7ef` `01a63728` `05e752d4` `7f2c66d7` `13d1c649` `b58cfa58` `438f60a2` `b29e31d2` `309b72c2` `347ed971` `5051b9d5` `463a7b86` `1a42d640` `ed4a1b8e` `b1644460` `a5d1b956` `5a029659` `89bb5928` `8b1fafd6` `f252a5ce` `e27500f1` `39b64a7a` `95b8a3c5` `ccd1c951` `5048ff48` `451b1a16` `394f09eb` `d3f049ca` `fa1fbcbd` `c8eadc9c` `7cf0530c` `573e300f` `5162b807` `fd47d85f` `877853ef` `c166e94c` `66fc4ef6` `fbbc52bf` `fbf35b5b` `1c7ed200` `b238591b` `40dc6623` `c531c81a` `a41d4c0a` `bc4ba637` `433f8cf8` `5316e457` `11c71ab2` `f4f49cd2` `d1c6d579` `b270a5bf` `7931b3aa` `17530678` `9b35c6f5` `4ebc2223` `b9bc16c8` `b7436061` `61d12287` `34465111` `967e8a36` `1ef7772b` `00ac55ce` `66919f75` `d5171a26` `4485c0e3` `b1981c04` `dc1fe170` `b3184d74` `c89b551c`

## AGREE CONFIRMED — low-conf answer confirmed by Opus (13)

_Summarised (hashes):_ `20416ca7` `89613f90` `72320ee9` `de27f020` `39994aea` `d82fdee1` `407e1bd6` `fa181098` `41d4db3c` `b4bde9f7` `8b0a2189` `3e52901d` `3bc18d24`
