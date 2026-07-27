# Open-key adjudication — Haiku triage → Opus blind-solve (2026-07-27)

The 234 open-with-key answers where the heuristic flagged key≠Sonnet were triaged by **Haiku** 
(198 judged equivalent — heuristic false positives). The **36** genuine disagreements were re-solved 
**blind by Opus** (independent third vote); **Haiku** then compared Opus vs key and Opus vs Sonnet. 
**No `answer.correct` was modified.**

## Tally

| bucket | count | meaning |
|---|---:|---|
| **KEY_SUSPECT** | 7 | Opus + Sonnet agree *against* the key (likely key error) |
| three_way | 4 | Opus, key, Sonnet all differ (human) |
| review | 2 | unclear / unresolvable |
| key_ok | 23 | Opus sided with key → Sonnet slipped (key fine) |

## KEY_SUSPECT (7)

### `c583d3c3` · rejonowy_2025_lodzkie_q9
- **key:** `H₁ = 147/16·√3 lub H₂ = 12√3 (przy podanych danych taki ostrosłup w rzeczywistości nie istnieje)` · **sonnet:** `Przypadek 1 (podstawa 3,5; krawędź boczna 4): h = √158/4 ≈ 3,14; Przypadek 2 (podstawa 4; krawędź boczna 3,5): h = √17/2 …` · **opus:** `Graniastosłup: podstawa trójkąt równoboczny bok 7, wys. 4, V=49√3 cm³. Wysokość ostrosłupa (kwadratowego): gdy podstawa  …`(med)
- opus_vs_key **no**, opus_vs_sonnet **yes** — Prism V=49√3 ok. Pyramid heights: Opus/Sonnet √17/2 & √158/4 vs Key 147√3/16 & 12√3

### `fdd6cfc6` · szkolny_2013-2014_slaskie_q15
- **key:** `A. kotlina;  B. wzniesienie o dwóch wierzchołkach` · **sonnet:** `A – wzniesienie o jednym wierzchołku; B – wzniesienie o dwóch wierzchołkach` · **opus:** `A) wzniesienie o jednym wierzchołku; B) wzniesienie o dwóch wierzchołkach`(med)
- opus_vs_key **no**, opus_vs_sonnet **yes** — Part A: Opus/Sonnet 'one peak' vs Key 'valley'; part B matches all

### `e373c440` · szkolny_2022_podkarpackie_q19
- **key:** `19.1: 27; 19.2: 46; 19.3: 69` · **sonnet:** `19.1. 28; 19.2. 48; 19.3. 72` · **opus:** `19.1) 28 ścian; 19.2) 48 wierzchołków; 19.3) 72 krawędzie`(med)
- opus_vs_key **no**, opus_vs_sonnet **yes** — Opus & Sonnet: (28,48,72). Key: (27,46,69). All three values differ per key.

### `ea22b32c` · wojewodzki_2025-2026_slaskie_q17
- **key:** `a) pole = 18¾π (= 75/4 π); b) obwód = 7½π + 20 (= 15/2 π + 20)` · **sonnet:** `a) 25π/2; b) 10+10π` · **opus:** `a) 25π/2 = 12,5π ≈ 39,27; b) 10π + 10 ≈ 41,42`(high)
- opus_vs_key **no**, opus_vs_sonnet **yes** — Opus matches Sonnet (a: 25π/2, b: 10π+10) but differs from key (75π/4 and 15π/2+20).

### `84016c1b` · wojewodzki_2025_kujawsko-pomorskie_q12
- **key:** `5` · **sonnet:** `10/3` · **opus:** `10/3`(med)
- opus_vs_key **no**, opus_vs_sonnet **yes** — Opus 10/3 matches Sonnet. Key states answer is 5 (≠10/3).

### `55dcada7` · wojewodzki_2025_podlaskie_q21
- **key:** `8/9` · **sonnet:** `3/4 pola dużego koła` · **opus:** `3/4`(high)
- opus_vs_key **no**, opus_vs_sonnet **yes** — Opus & Sonnet: 3/4 of large circle. Key: 8/9. Calculation diff depends on figure geometry.

### `31aa1a51` · wojewodzki_2026_lubelskie_q9
- **key:** `1` · **sonnet:** `27 dni` · **opus:** `27 dni`(high)
- opus_vs_key **no**, opus_vs_sonnet **yes** — Opus 27 dni matches Sonnet; key says 1 day

## three_way (4)

### `ef8b9007` · rejonowy_2019_opolskie_q9
- **key:** `21 m` · **sonnet:** `650 cm (6,5 m)` · **opus:** `600 cm (6 m)`(low)
- opus_vs_key **no**, opus_vs_sonnet **no** — Opus 600 cm differs from key 21 m and sonnet 650 cm

### `57e15264` · rejonowy_2020_mazowieckie_q5
- **key:** `39 białych klocków` · **sonnet:** `7 białych klocków` · **opus:** `32 białe klocki (przy założeniu 24 szarych i sześcianu 4×4×4)`(low)
- opus_vs_key **no**, opus_vs_sonnet **no** — Opus 32 blocks differs from key 39 and sonnet 7

### `65625704` · szkolny_2025_mazowieckie_q8
- **key:** `Możliwe zestawy pól: {78, 120, 400}, {138, 60, 400}, {120, 204, 36} oraz {240, 111, 9} cm².` · **sonnet:** `Przypadek 1: kwadrat 9 cm², prostokąty 37×3=111 cm² i 40×6=240 cm². Przypadek 2: kwadrat 36 cm², prostokąty 34×6=204 cm² …` · **opus:** `Prostokąt 23 cm × 26 cm, wycięty kwadrat 20×20 cm. Przypadek I: 3×20 = 60 cm² oraz 6×23 = 138 cm². Przypadek II: 3×26 =  …`(high)
- opus_vs_key **no**, opus_vs_sonnet **no** — Opus provides 2 of 4 required cases. Multi-part problem incomplete. Cases differ from Sonnet.

### `1eb56b2a` · wojewodzki_2022_dolnoslaskie_q4
- **key:** `178,75 cm³` · **sonnet:** `405 cm³` · **opus:** `V = 219,375 cm³`(high)
- opus_vs_key **no**, opus_vs_sonnet **no** — Opus 219.375 cm³ vs Key 178.75 cm³ vs Sonnet 405 cm³. All three differ.

## review (2)

### `eea35a3c` · szkolny_2022_dolnoslaskie_q20
- **key:** `Brakujący kwadrat w każdej siatce należy dorysować w jednym z miejsc oznaczonych krzyżykiem w kluczu.` · **sonnet:** `Lewa siatka: dorysować brakujący kwadrat nad lewym lub nad prawym polem górnej pary (albo pod lewym lub pod prawym polem …` · **opus:** `Lewa siatka: dodać jeden kwadrat przedłużający środkową pionową kolumnę do 4 (np. pod dolnym środkowym kwadratem) — pows …`(med)
- opus_vs_key **unclear**, opus_vs_sonnet **unclear** — Cannot verify positions without diagram; both provide valid cube net logic

### `6d8d923e` · wojewodzki_2024-2025_slaskie_q1
- **key:** `GEOMETRIA EUKLIDESOWA` · **sonnet:** `1. okrąg 2. procent 3. wierzchołek 4. romb 5. wartość bezwzględna 6. trapez 7. przyległe 8. oś liczbowa 9. hektar 10. dz …` · **opus:** `1 OKRĄG, 2 PROCENT, 3 WIERZCHOŁEK, 4 ROMB, 5 WARTOŚĆ BEZWZGLĘDNA, 6 TRAPEZ, 7 KĄTY PRZYLEGŁE, 8 OŚ LICZBOWA, 9 HEKTAR, 1 …`(med)
- opus_vs_key **unclear**, opus_vs_sonnet **no** — Crossword keyword noted as ungraded. Opus suggests GEOMETRIA/ARYTMETYKA, key states GEOMETRIA EUKLIDESOWA.

## key_ok (23)

### `402cc235` · rejonowy_2016-2017_slaskie_q2
- **key:** `A) 100·(2 − 40·(3 + 2)) = −19800; B) 100·(40 : 2)·(3 + 2) = 10000; C) 200·2 : (100·4 : 20 : 5) = 100` · **sonnet:** `A) 100·2−40·(3+2)=0   B) 100·40:2·(3+2)=10000   C) 200·2:(100·4:20:5)=100` · **opus:** `A) 100·(2−40·(3+2)) = −19800; B) 100·40:2·(3+2) = 10000; C) 200·2:(100·4:20:5) = 100`(high)
- opus_vs_key **yes**, opus_vs_sonnet **no** — A) Opus & Key: −19800, Sonnet: 0. B,C) all match. Sonnet's A) parenthesization wrong.

### `bc24cbe0` · rejonowy_2020_kujawsko-pomorskie_q20
- **key:** `16 cm²` · **sonnet:** `8π cm2 (≈25,13 cm2)` · **opus:** `16 cm²`(high)
- opus_vs_key **yes**, opus_vs_sonnet **no** — Opus & Key: 16 cm². Sonnet: 8π≈25.13 cm². Completely different method.

### `08e67421` · rejonowy_2021_podlaskie_q21
- **key:** `96 cm` · **sonnet:** `80 cm` · **opus:** `96 cm`(high)
- opus_vs_key **yes**, opus_vs_sonnet **no** — Opus and Key both 96 cm (windmill perimeter); Sonnet 80 cm (rhombus w/ 4 hypotenuses only)

### `f1ebd535` · rejonowy_2022_podlaskie_q27
- **key:** `27 − 3√3 cm³` · **sonnet:** `21 cm³` · **opus:** `27 − 3√3 cm³ ≈ 21,8 cm³ (przy trójkątach równobocznych o boku 1 cm); jeśli wnęki to trójkąty prostokątne o przyprostokąt …`(low)
- opus_vs_key **yes**, opus_vs_sonnet **no** — Opus & Key: 27−3√3≈21.8 cm³. Sonnet: 21 cm³ (Opus's alternate case, not primary).

### `a8e90284` · rejonowy_2025_lodzkie_q2
- **key:** `A) np. 00:00, 11:11, 01:10, 10:01; B) np. 22:55, 12:51, 02:50, 15:21, 05:20, 20:05, 21:15; C) wszystkie godziny złożone  …` · **sonnet:** `A) 00:00, 11:11; B) 02:50, 05:20, 20:05; C) 13:33, 03:31, 18:38; D) 15:51, 21:12` · **opus:** `A) 00:00, 11:11; B) 02:50, 12:51, 22:55; C) 03:30, 13:31, 11:33; D) 22:22, 05:50`(med)
- opus_vs_key **yes**, opus_vs_sonnet **no** — A–D: Opus examples valid per Key criteria; B part differs (different valid times chosen)

### `2a97e6b1` · szkolny_2012-2013_slaskie_q15
- **key:** `Lewa strzałka – wiatr północno-wschodni; prawa strzałka – wiatr południowo-wschodni.` · **sonnet:** `a) wiatr południowo-zachodni (SW); b) wiatr północno-zachodni (NW)` · **opus:** `1) wiatr północno-wschodni (NE); 2) wiatr południowo-wschodni (SE)`(med)
- opus_vs_key **yes**, opus_vs_sonnet **no** — Opus/Key both NE & SE; Sonnet SW & NW (opposite directions)

### `807570af` · szkolny_2012-2013_slaskie_q17
- **key:** `a) 780 m n.p.m.;  b) 150 m` · **sonnet:** `a) 780 m n.p.m.; b) ok. 180 m (A≈600 m, B=780 m)` · **opus:** `a) 780 m; b) 150 m`(low)
- opus_vs_key **yes**, opus_vs_sonnet **no** — Part a) 780m all match; part b) Opus/Key 150m vs Sonnet ~180m

### `db2c37a6` · szkolny_2017_podkarpackie_q19
- **key:** `Figura IV: 28 patyczków; obwód figury VI: 20` · **sonnet:** `a) 11; b) 20` · **opus:** `IV: 28 patyczków; obwód figury VI: 20`(med)
- opus_vs_key **yes**, opus_vs_sonnet **no** — Opus 28 sticks + perimeter 20 matches key; Sonnet has 11 sticks (differs)

### `ba39972a` · szkolny_2018-2019_pomorskie_q12
- **key:** `1/4 (0,25)` · **sonnet:** `5/4 (1 1/4)` · **opus:** `1/4 (= 0,25)`(high)
- opus_vs_key **yes**, opus_vs_sonnet **no** — Opus 1/4 (0.25) matches key exactly. Sonnet 5/4 (1.25) is incorrect.

### `657321ca` · szkolny_2019_mazowieckie_q4
- **key:** `R = 6` · **sonnet:** `5` · **opus:** `R = 6 (RACHUNEK = 61728395, K = 5, 61728395·9 = 555555555)`(high)
- opus_vs_key **yes**, opus_vs_sonnet **no** — Opus R=6 matches key. Sonnet R=5 is incorrect.

### `1be6588c` · szkolny_2022_podkarpackie_q20
- **key:** `20.1: 78 s; 20.2: 42 godz.; 20.3: 27 min; 20.4: 25°; 20.5: 37,125 cm²` · **sonnet:** `20.1. 78 s; 20.2. 42 h; 20.3. 27 min; 20.4. 50°; 20.5. 37,125 cm²` · **opus:** `20.1) 78 sekund; 20.2) 42 godziny; 20.3) 27 minut; 20.4) α = 25°; 20.5) 37,125 cm²`(high)
- opus_vs_key **yes**, opus_vs_sonnet **no** — All 5 subparts match key (20.1–20.5). Part 20.4: Opus 25° matches key; Sonnet has 50°.

### `61b8f9df` · szkolny_2025_dolnoslaskie_q10
- **key:** `15` · **sonnet:** `9` · **opus:** `x = 15 cm`(high)
- opus_vs_key **yes**, opus_vs_sonnet **no** — Opus x=15 cm matches key. Sonnet 9 cm differs.

### `9db82edf` · szkolny_2025_lubelskie_q16
- **key:** `β = 57°` · **sonnet:** `123` · **opus:** `β = 57°`(high)
- opus_vs_key **yes**, opus_vs_sonnet **no** — Opus β=57° matches key. Sonnet 123° is incorrect.

### `d9310d62` · wojewodzki_2016-2017_malopolskie_q13
- **key:** `a) (n−4)² lub (2k+1−4)²; b) n−3(n+2) lub (2k+1)−3(2k+3)` · **sonnet:** `a) (2k+1)² − 4;  b) (2k+1) − 3(2k+3)` · **opus:** `a) (n−4)² = (2k−3)²; b) n − 3(n+2) = (2k+1) − 3(2k+3) = −4k − 8`(high)
- opus_vs_key **yes**, opus_vs_sonnet **no** — Part a): Opus (n-4)²=(2k-3)² matches key form. Sonnet (2k+1)²-4 algebraically differs.

### `0599c8b1` · wojewodzki_2020-2021_zachodniopomorskie_q16
- **key:** `Nie, kwota nie wystarczy — działka P₂ kosztuje 26250 zł` · **sonnet:** `Nie wystarczy — koszt działki P2 to ok. 30 807 zł, a państwo Nowakowie mają 26 000 zł (brakuje ok. 4807 zł).` · **opus:** `Nie wystarczy. Pole P2 = 750 m², koszt 750·35 = 26 250 zł > 26 000 zł (brakuje 250 zł).`(high)
- opus_vs_key **yes**, opus_vs_sonnet **no** — Same conclusion & cost (26,250 zł). Sonnet claims ~30,807 zł (fundamentally different).

### `98281fce` · wojewodzki_2021_dolnoslaskie_q4
- **key:** `24000 cm²` · **sonnet:** `23400 cm² (2,34 m²)` · **opus:** `24000 cm²`(high)
- opus_vs_key **yes**, opus_vs_sonnet **no** — Opus 24000 cm² matches key. Sonnet 23400 cm² differs by 600 cm².

### `2ae1f34c` · wojewodzki_2022_podkarpackie_q18
- **key:** `Pole figury A = 7 + π, pole figury B = 4 + 2π` · **sonnet:** `Pole A = 6 + 1,5π ≈ 10,71; Pole B = 4 + 2π ≈ 10,28` · **opus:** `A) 7 + π ≈ 10,14 (pola kratki = 1); B) 4 + 2π ≈ 10,28`(high)
- opus_vs_key **yes**, opus_vs_sonnet **no** — Opus matches key on both figures. Sonnet disagrees on figure A (6+1.5π vs 7+π).

### `6aa250b3` · wojewodzki_2023-2024_malopolskie_q13
- **key:** `a) 6;  b) 2²² (= 4194304);  c) I: FAŁSZ, II: PRAWDA, III: PRAWDA;  d) dowód, iloraz n³ − 3n² + 2n` · **sonnet:** `a) 6; b) 2^22; c) I – FAŁSZ, II – FAŁSZ, III – PRAWDA; d) n!/(n−3)! = n(n−1)(n−2) = n³−3n²+2n` · **opus:** `a) 6; b) 2^22; c) I. FAŁSZ, II. PRAWDA, III. PRAWDA; d) n!/(n−3)! = n(n−1)(n−2) = n³−3n²+2n`(high)
- opus_vs_key **yes**, opus_vs_sonnet **no** — All parts match key. Sonnet differs on part c) statement II: Opus PRAWDA vs Sonnet FAŁSZ.

### `b2dea76b` · wojewodzki_2024-2025_malopolskie_q15
- **key:** `a) 4(√3 − 1) cm²;  b) ⅓√2 + ⅔;  c) a = 2(2√3 − 1) cm;  d) b = 2(√3 − 1) cm` · **sonnet:** `a) Pole ABCD = 4√3-4 cm²; b) obwód I : obwód II = √2; c) a ≈ 2+2√3 cm; d) b = 2√2 cm` · **opus:** `a) 4√3−4 cm²; b) (√2+2)/3 = ⅓√2 + ⅔ ≈ 1,14; c) a = 4√3−2 cm ≈ 4,93; d) b = 2√3−2 cm ≈ 1,46`(high)
- opus_vs_key **yes**, opus_vs_sonnet **no** — Opus algebraically equivalent to key on all parts. Sonnet differs significantly on b, c, d.

### `29cfc6ff` · wojewodzki_2025-2026_malopolskie_q13
- **key:** `a) I. 2^b·3^b, II. 2^a·3^a; c) {m=2^8·3², n=2²·3³} oraz {m=2²·3³, n=2^8·3²} (wraz z zamianą m i n)` · **sonnet:** `a) I. NWW = 2^b·3^b; II. NWD = 2^a·3^a. b) Obie strony równania są zawsze równe 12^c (z praw absorpcji NWW(x,NWD(x,y))=x …` · **opus:** `a) I. NWW = 2^b·3^b = 6^b, II. NWD = 2^a·3^a = 6^a; b) obie strony równe 12^c; c) {m,n} = {2²·3², 2⁸·3³} = {36, 6912} or …`(high)
- opus_vs_key **yes**, opus_vs_sonnet **yes** — All parts match both key and Sonnet exactly (or numerically equivalent).

### `95b5102a` · wojewodzki_2025_kujawsko-pomorskie_q9
- **key:** `58°` · **sonnet:** `122°` · **opus:** `β = 58°`(med)
- opus_vs_key **yes**, opus_vs_sonnet **no** — Opus β=58° matches key. Sonnet gives 122° (fundamentally different).

### `fbfed91f` · wojewodzki_2025_podlaskie_q12
- **key:** `P(liczba pierwsza) = 3/10; P(potęga liczby naturalnej) = 3/5 (czyli 6/10)` · **sonnet:** `P(liczba pierwsza) = 3/10; P(potęga liczby naturalnej) = 5/10 (=1/2)` · **opus:** `P(liczba pierwsza) = 3/10; P(potęga liczby naturalnej) = 3/5 (jeśli 1=1² się liczy; inaczej 1/2)`(med)
- opus_vs_key **yes**, opus_vs_sonnet **no** — Primes 3/10 both correct. Powers: Opus & Key say 3/5 (6/10), Sonnet says 1/2 (5/10).

### `3e1d5735` · wojewodzki_2026_lubelskie_q13
- **key:** `rower: 20 km/h, samochód: 80 km/h` · **sonnet:** `Janek: 110/3 km/h ≈ 36,67 km/h; Staś: 440/3 km/h ≈ 146,67 km/h` · **opus:** `Janek (rowerem): 20 km/h; Staś (samochodem): 80 km/h`(med)
- opus_vs_key **yes**, opus_vs_sonnet **no** — Opus 20/80 km/h matches key; Sonnet gives ~36.67/146.67
