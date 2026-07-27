# Open-answer key verification — Sonnet vs stored key (2026-07-27)

The 2093 open questions that have a key were never auto-checked in tier-1 (open answers stored `agrees:null`). Here Sonnet's blind answer is compared to `answer.correct` with the tier-2 numeric/text heuristic. **No data modified.**

## Summary

| bucket | count |
|---|---:|
| match (key corroborated) | 1859 |
| **differ (review)** | **234** |
| — of which Sonnet was high-confidence | 192 |

> Heuristic caveat: open text is noisy — the differ list contains false positives (phrasing/format) alongside genuine key errors and Sonnet slips. High-confidence differs are the strongest key-error candidates.

## Differ — high-confidence first (234)

### `ef863094` · rejonowy_2010-2011_slaskie_q21 · conf high
- **key:** `witamina A – kurza ślepota, witamina B₂ – zajady, witamina C – częste przeziębienia, witamina D – krzywica` · **model:** `witamina A – kurza ślepota; witamina B2 – zajady; witamina C – częste przeziębienia; witamina D – krzywica`
- **Q:** Niedobory witamin wywołują choroby i przykre dolegliwości. Wybierz z ramki odpowiednią chorobę lub dolegliwość, którą wywołuje brak witaminy i wpisz ją obok nazwy tej witaminy. astma, częste przeziębienia, krzywica, kurza ślepota, zajady witamina A ................................... witamina B₂ ....................... …

### `38ce3f10` · rejonowy_2011-2012_slaskie_q22 · conf high
- **key:** `Wyżyna Lubelska; Góry Świętokrzyskie; Nizina Śląska; Wyżyna Krakowsko-Częstochowska` · **model:** `1. Wyżyna Lubelska; 2. Góry Świętokrzyskie; 3. Nizina Śląska; 4. Wyżyna Krakowsko-Częstochowska`
- **Q:** Spośród wymienionych krain geograficznych: Tatry, Góry Świętokrzyskie, Wyżyna Lubelska, Wyżyna Krakowsko-Częstochowska, Nizina Śląska, wybierz te, których opis zamieszczono w tabeli. Wpisz nazwę krainy przy odpowiednim opisie. Opis Kraina Jest to kraina rolnicza, słynąca z chmielników, czarnoziemów i wąwozów lessowych. …

### `0031eb40` · rejonowy_2011-2012_slaskie_q23 · conf high
- **key:** `leszczyna (dopuszczalne: orzech laskowy), klon, kasztanowiec, dąb` · **model:** `1. leszczyna; 2. klon; 3. kasztanowiec; 4. dąb`
- **Q:** Podpisz pod rysunkiem nazwę drzewa, z którego pochodzi liść lub liść i owoc.

### `d9cf58aa` · rejonowy_2012-2013_slaskie_q1 · conf high
- **key:** `Wpisywane liczby: 0, 6, −3, −2, 5, 3. Poziomo: 13 + 0 · 2 = 13; 6 + 6 : (−3) = 4; −2 + 5 − (−2) = 5. Pionowo: 13 − 6 − (−2) = 9; 0 · 6 + 5 = 5; 2 − (−3) + (−2)  …` · **model:** `wiersz1,kol3=0; wiersz3,kol1=6; wiersz3,kol5=−3; wiersz5,kol5=−2; wiersz7,kol3=5; wiersz7,kol5=3`
- **Q:** W puste, białe pola „liczbowej krzyżówki” wstaw liczby tak, aby wszystkie działania były poprawne.

### `1bf0c2d3` · rejonowy_2012-2013_slaskie_q19 · conf high
- **key:** `A – 4 (Białowieski PN); B – 3 (Słowiński PN); C – 1 (Kampinoski PN); D – 5 (Woliński PN). Niewykorzystany: 2 (Biebrzański PN).` · **model:** `A-4, B-3, C-1, D-5`
- **Q:** Do opisów parków narodowych (A–D) przyporządkuj ich nazwy wybrane spośród wypisanych poniżej (1–5): 1. Kampinoski Park Narodowy, 2. Biebrzański Park Narodowy, 3. Słowiński Park Narodowy, 4. Białowieski Park Narodowy, 5. Woliński Park Narodowy. W kratkę wstaw cyfrę odpowiadającą nazwie opisanego parku. A) Najstarszy w P …

### `3d487abd` · rejonowy_2013-2014_malopolskie_q16 · conf high
- **key:** `Wersja druga` · **model:** `Druga wersja (obniżka ceny o 20%) jest korzystniejsza`
- **Q:** W kartonie było dotychczas 1000 ml soku PYSZNY i kosztował on 2,40 zł. Producent przygotował dwie wersje promocji tego soku: Pierwsza wersja: za tę samą cenę otrzymasz o 20% więcej soku. Druga wersja: za tę samą ilość soku zapłacisz o 20% mniej. Która z tych promocji jest bardziej opłacalna dla klienta? Przedstaw tok s …

### `ba5a1dcf` · rejonowy_2014_podlaskie_gim_q21 · conf high
- **key:** `3½` · **model:** `3,5`
- **Q:** Oblicz wartość wyrażenia a 4 + b 4 , wiedząc, że a + b = 1 oraz a 2 + b 2 = 2 . Zapisz obliczenia i podaj odpowiedź.

### `24cef6e3` · rejonowy_2014_podlaskie_sp_q23 · conf high
- **key:** `pudełko pierwsze (I)` · **model:** `Pudełko 12 cm x 15 cm x 25 cm zmieści się do torby, drugie (14 cm x 15 cm x 18 cm) się nie zmieści.`
- **Q:** Miłosz ma dwa prostopadłościenne pudełka: jedno o krawędziach 12 cm, 15 cm i 25 cm, a drugie o krawędziach 14 cm, 15 cm i 18 cm. Ma także papierowe torby w kształcie prostokąta o wymiarach 28 cm na 45 cm, otwierające się wzdłuż krótszego boku. Które z pudełek może włożyć do takiej torby i dlaczego? Zapisz obliczenia, p …

### `2289d5dd` · rejonowy_2015_podkarpackie_q18 · conf high
- **key:** `1972 (cyfra dziesiątek 7, cyfra jedności 2)` · **model:** `72 (rok 1972)`
- **Q:** Pierwszy złoty medal dla Polski za najdłuższy skok narciarski zdobył Wojciech Fortuna w 19XX roku. Znajdź dwie ostatnie cyfry roku, wiedząc, że cyfra dziesiątek jest 3,5 razy większa od cyfry jedności, a suma obu cyfr wynosi 9. Zapisz obliczenia lub uzasadnienie.

### `be2c1685` · rejonowy_2017-2018_malopolskie_q16 · conf high
- **key:** `15 5/13%` · **model:** `≈15,38% (dokładnie 200/13%)`
- **Q:** W trapezie równoramiennym przekątna dzieli kąt ostry na połowy. Dłuższa podstawa trapezu ma długość 11 cm, jego obwód wynosi 26 cm, a pole 32 cm². Jakim procentem obwodu tego trapezu jest długość jego wysokości? Zapisz obliczenia.

### `ee405e87` · rejonowy_2018-2019_pomorskie_q1 · conf high
- **key:** `Cyfrą jedności różnicy jest 0, więc liczba jest podzielna przez 10.` · **model:** `Obie liczby mają cyfrę jedności 9, więc ich różnica dzieli się przez 10.`
- **Q:** Uzasadnij, że liczba 2019 2019 − 123 122 jest podzielna przez 10.

### `b25cb0d0` · rejonowy_2018-2019_pomorskie_q6 · conf high
- **key:** `Teza prawdziwa: suma pól trójkątów równobocznych na przyprostokątnych równa się polu trójkąta równobocznego na przeciwprostokątnej.` · **model:** `Wykazano: pole trójkąta równobocznego o boku s wynosi (√3/4)s²; z tw. Pitagorasa a²+b²=c², więc (√3/4)a²+(√3/4)b²=(√3/4)c².`
- **Q:** Udowodnij, że suma pól trójkątów równobocznych zbudowanych na przyprostokątnych trójkąta prostokątnego jest równa polu trójkąta równobocznego zbudowanego na przeciwprostokątnej tego trójkąta.

### `0d8abf6c` · rejonowy_2018_opolskie_q11 · conf high
- **key:** `Nie — wynik jest zawsze liczbą parzystą` · **model:** `Nie, wynik nie może być liczbą nieparzystą.`
- **Q:** Na pięciu kartkach napisano liczby 1, 2, 3, 4, 5. Następnie kartki odwrócono i pomieszano. Na odwrocie kartek też zapisano liczby 1, 2, 3, 4, 5. Liczby zapisane na obu stronach jednej kartki dodano i tak otrzymane sumy pomnożono. Czy wynik tych działań może być liczbą nieparzystą? Odpowiedź uzasadnij.

### `a84eaef6` · rejonowy_2019-2020_pomorskie_q4 · conf high
- **key:** `Dowód: dwa kąty wewnętrzne trójkąta są równe (γ = α), więc trójkąt jest równoramienny.` · **model:** `Trójkąt jest równoramienny — dowód: jeśli kąt przyległy do kąta α wynosi 180°−α = 2β, to α = 180°−2β, a wtedy trzeci kąt γ = 180°−α−β = β. Skoro β = γ, trójkąt  …`
- **Q:** Wykaż, że jeżeli kąt przyległy do jednego z kątów wewnętrznych trójkąta jest dwa razy większy od drugiego kąta wewnętrznego tego trójkąta, to trójkąt jest równoramienny.

### `417b863b` · rejonowy_2019-2020_wielkopolskie_q30 · conf high
- **key:** `P△APR = P△ADR + P△PCR (oba równe 3⁄8·ab)` · **model:** `Dowód geometryczny (patrz rozwiązanie) — teza wynika z porównania pól przez odjęcie od pola prostokąta pól trójkątów ADR, PCR i ABP.`
- **Q:** W prostokącie ABCD (rysunek) punkt P jest środkiem boku BC , a punkt R jest środkiem boku CD . Wykaż, że P Δ APR = P Δ ADR + P Δ PCR , gdzie P Δ APR oznacza pole trójkąta APR , P Δ ADR oznacza pole trójkąta ADR , a P Δ PCR oznacza pole trójkąta PCR .

### `8f49f0f5` · rejonowy_2019_mazowieckie_q5 · conf high
- **key:** `a < b < c` · **model:** `a < b < c, ponieważ b = 8^10 = 2^30 = 4^15, a a = 3^15 < 4^15 (bo 3<4), oraz b = 2^30 < 2^32 = c (bo 30<32)`
- **Q:** Uzasadnij, że jeśli a = 3 15 , b = 8 10 , c = 2 32 , to a < b < c .

### `03d574d7` · rejonowy_2019_mazowieckie_q6 · conf high
- **key:** `Bartek ma troje rodzeństwa (rodzina liczy 6 osób)` · **model:** `Troje rodzeństwa (3)`
- **Q:** Bartek ma 4 lata i kilkoro rodzeństwa. Średnia wieku jego rodziny (rodzice i dzieci) wynosi 19 lat, a średnia wieku rodziny liczona bez wieku Bartka jest równa 22 lata. Ile rodzeństwa ma Bartek? Odpowiedź uzasadnij.

### `f52c7a31` · rejonowy_2019_mazowieckie_q8 · conf high
- **key:** `O godzinie 17.04 (po 4 minutach)` · **model:** `17:04`
- **Q:** Weronika i młodsza od niej Karolina rozpoczęły bieg o godzinie 17.00. Weronika goni Karolinę, a odległość między nimi na starcie wynosiła 180 m. Weronika w ciągu 5 sekund robi 25 kroków, a Karolina w ciągu 8 sekund 36 kroków. Krok Weroniki ma 0,6 m, a Karoliny 0,5 m. O której godzinie Weronika dogoni Karolinę? Odpowied …

### `aa7d2920` · rejonowy_2020-2021_pomorskie_q2 · conf high
- **key:** `Obwód = 6(√2 + √6 + 2) cm ≈ 34,8 cm; z drutu o długości 3,4 dm (34 cm) nie można zbudować modelu tego trójkąta.` · **model:** `Obwód = 12 + 6(√2+√6) cm ≈ 35,18 cm; drutu (3,4 dm = 34 cm) NIE wystarczy`
- **Q:** W trójkącie ABC przedstawionym na rysunku bok AC ma długość 12 cm . Oblicz obwód tego trójkąta oraz oszacuj, czy możliwe jest wykonanie modelu tego trójkąta z drutu o długości 3,4 dm .

### `35b87919` · rejonowy_2020-2021_wielkopolskie_q23 · conf high
- **key:** `7⅓%` · **model:** `22/3% ≈ 7,33%`
- **Q:** Zmieszano 10-procentowy roztwór soli z 2-procentowym roztworem soli i otrzymano 30 kg roztworu soli. Oblicz stężenie otrzymanego roztworu, wiedząc, że gdyby roztworu 10-procentowego było o 20% więcej, a roztworu 2-procentowego o 20% mniej, to końcowy roztwór miałby stężenie 8%.

### `6c862afa` · rejonowy_2020_opolskie_q11 · conf high
- **key:** `(22½ + √3/2) cm²` · **model:** `(45+√3)/2 cm² ≈ 23,37 cm²`
- **Q:** Pole powierzchni drewnianej kostki sześciennej było równe 24 cm². Ścięto jeden narożnik tego sześcianu płaszczyzną przechodzącą przez środki trzech krawędzi wychodzących z jednego wierzchołka. Oblicz pole powierzchni tak otrzymanej bryły.

### `b23fd2ab` · rejonowy_2021-2022_slaskie_q14 · conf high
- **key:** `P = 4(3 + 2√2) dm² = 12 + 8√2 dm²` · **model:** `12+8√2 dm² ≈ 23,31 dm²`
- **Q:** Oblicz pole kwadratu, w którym przekątna jest o 2 dm dłuższa od boku.

### `45950c5e` · rejonowy_2021-2022_slaskie_q16 · conf high
- **key:** `I przypadek (2×2×8 cm): 72 cm²; II przypadek (4×4×2 cm): 64 cm²` · **model:** `72 cm² (ułożenie 1×1×4) lub 64 cm² (ułożenie 2×2×1)`
- **Q:** Wykonano cztery jednakowe modele sześcianu. Siatka każdego z nich ma obwód 28 cm. Następnie sklejono te sześciany tak, że utworzyły prostopadłościan. Oblicz pole powierzchni tego prostopadłościanu. Rozważ dwa przypadki.

### `80196964` · rejonowy_2021-2022_wielkopolskie_q23 · conf high
- **key:** `x = 4, y = −1,5` · **model:** `x = 4, y = -3/2`
- **Q:** Rozwiąż układ równań { x − 2 y 3 − 4 − 2 x 6 = 3 2 + x 3 − 2 y = 5 . Zapisz wszystkie obliczenia.

### `380b3916` · rejonowy_2021_dolnoslaskie_q14 · conf high
- **key:** `Pierwszy: √10, √8, √18; Drugi: √5, √13, √18; Trzeci: √8, √5, √13` · **model:** `Pierwszy: 2√2, √10, 3√2; Drugi: √5, √13, 3√2; Trzeci: √5, 2√2, √13`
- **Q:** Z dziewięciu kwadratów o boku długości 1 zbudowano kwadrat ABCD , a w nim umieszczono łamaną ACGEFA złożoną z pięciu odcinków (patrz rysunek). Z każdych trzech odcinków, będących bokami tej łamanej, można zbudować trójkąt. Z tak powstałych trójkątów, tylko trzy są prostokątne i różnoboczne. Podaj długości boków każdego …

### `62d5631d` · rejonowy_2021_lubelskie_q11 · conf high
- **key:** `0,8` · **model:** `4/5`
- **Q:** W trapezie ABCD podstawa AB jest 4 razy dłuższa od podstawy CD . Jaką częścią pola powierzchni trapezu ABCD jest pole powierzchni trójkąta ABD ?

### `0a4aacaf` · rejonowy_2021_lubelskie_q17 · conf high
- **key:** `3 9/17 cm` · **model:** `60/17 cm ≈ 3,53 cm`
- **Q:** W trójkącie prostokątnym najdłuższy bok jest o 4,5 cm dłuższy od najkrótszego boku. Średni bok ma długość 7,5 cm. Oblicz długość najkrótszej wysokości tego trójkąta.

### `d2e2266f` · rejonowy_2021_mazowieckie_q9 · conf high
- **key:** `Tak, wystarczy (potrzeba 14 + 24√2 < 50 cm taśmy).` · **model:** `Tak, wystarczy — potrzeba ok. 47,94 cm (14+24√2 cm) taśmy.`
- **Q:** Witrażowe okno jest wykonane m.in. z elementu w kształcie trapezu równoramiennego składającego się z czterech trójkątów prostokątnych, połączonych ołowianą taśmą tak, jak na rysunku. Brzeg elementu również wykończony jest tą taśmą. Stosunek długości przyprostokątnych w trójkątach przystających wynosi 3 4 . Oblicz, czy  …

### `08e67421` · rejonowy_2021_podlaskie_q21 · conf high
- **key:** `96 cm` · **model:** `80 cm`
- **Q:** Z czterech przystających trójkątów prostokątnych o przyprostokątnych długości 12 cm i 16 cm ułożono figurę taką jak na rysunku. Oblicz obwód tej figury.

### `669ca78c` · rejonowy_2022-2023_malopolskie_q16 · conf high
- **key:** `a) 75°; b) √(2+√3); c) 90°; d) 1 + √3/2` · **model:** `a) 75°; b) HC = √(2+√3) = (√6+√2)/2; c) 90°; d) pole obu figur = (2+√3)/2 (= 1+√3/2 ≈ 1,87)`
- **Q:** Na bokach kwadratu ABCD , którego bok ma długość 1, zbudowano trójkąty równoboczne AEB , BFC , CGD oraz DHA otrzymując w ten sposób ośmiokąt AEBFCGDH (patrz rysunek). a) (2p) Oblicz miarę kąta HCB . b) (3p) Oblicz długość odcinka HC . c) (2p) Oblicz kąt przecięcia odcinków HB i EC . d) (2p) Wykaż, że pole czworokąta EB …

### `971200e8` · rejonowy_2022-2023_malopolskie_q17 · conf high
- **key:** `a) 81 9/11 % (= 900/11 %); b) I FAŁSZ, II FAŁSZ, III PRAWDA; c) 2/3` · **model:** `a) 900/11% ≈ 81,82%; b) I. FAŁSZ, II. FAŁSZ, III. PRAWDA; c) 2/3`
- **Q:** Za siedmioma lasami, za siedmioma rzekami na Górze Przeznaczenia stary Czarodziej w trzech naczyniach ma roztopione metale trzech różnych mocy: w pierwszym naczyniu 100 g metalu mocy władzy, w drugim 100 g metalu mocy miłości, a w trzecim 100 g metalu mocy mądrości. Czarodziej z pierwszego naczynia przelewa do drugiego …

### `4a86f402` · rejonowy_2022-2023_slaskie_q17 · conf high
- **key:** `Pary długości pozostałych boków: (5, 11), (6, 10), (7, 9), (8, 8).` · **model:** `(5,11), (6,10), (7,9), (8,8)`
- **Q:** Jeden z boków trójkąta ma długość 8 cm. Suma długości dwóch pozostałych boków równa się 16 cm. Znajdź wszystkie pary liczb naturalnych, które mogą być długościami pozostałych dwóch boków tego trójkąta. Odpowiedź uzasadnij.

### `b4688df5` · rejonowy_2022-2023_wielkopolskie_q19 · conf high
- **key:** `(5√2 + 5√6) cm` · **model:** `(√6+√2)/2 dm ≈ 1,93 dm (≈19,3 cm)`
- **Q:** Dwa kąty w pewnym trójkącie wynoszą odpowiednio 45° i 30°. Oblicz długość najdłuższego boku tego trójkąta, jeżeli najkrótszy bok tego trójkąta wynosi 1 dm. Zapisz wszystkie obliczenia.

### `b2341eae` · rejonowy_2022_mazowieckie_q8 · conf high
- **key:** `Trójkąt EFD jest prostokątny w obu przypadkach (kąt prosty przy wierzchołku F)` · **model:** `Trójkąt EFD jest prostokątny (kąt prosty przy F) w obu przypadkach podziału AB przez F`
- **Q:** Boki prostokąta ABCD mają długości: | AB | = 12 , | BC | = 8 . Punkt E dzieli bok BC na połowy, a punkt F dzieli bok AB w stosunku 1 : 2. Wykaż, że trójkąt EFD jest prostokątny. Rozpatrz wszystkie możliwości.

### `c2dd5240` · rejonowy_2023-2024_slaskie_q20 · conf high
- **key:** `Teza udowodniona: odcinek AS zawiera się w dwusiecznej kąta DAB, a odcinek BS w dwusiecznej kąta ABC.` · **model:** `Dowód: DS=SC=AD=BC=a (bo AB=2BC=2a=DC, S – środek DC), więc trójkąty ADS i BCS są równoramienne, skąd ∠DAS=∠DSA=∠SAB oraz ∠CBS=∠CSB=∠SBA (kąty naprzemianległe p …`
- **Q:** Dany jest równoległobok ABCD taki, że bok AB jest dwa razy dłuższy od boku BC . Wykaż, że jeżeli S jest środkiem boku DC , to odcinek AS zawiera się w dwusiecznej kąta DAB , a odcinek BS zawiera się w dwusiecznej kąta ABC .

### `ea12dfd7` · rejonowy_2023_dolnoslaskie_q12 · conf high
- **key:** `0,8x⁵ − 0,6x²: 2,4; 21x² − 28x⁵: −84` · **model:** `0,8x^5−0,6x^2 = 2,4; 21x^2−28x^5 = −84`
- **Q:** Wyrażenie 4 x 5 − 3 x 2 przyjmuje dla pewnej liczby x wartość równą 12. Wyznacz wartość, jaką przyjmuje dla tej samej liczby x wyrażenie 0,8 x 5 − 0,6 x 2 , wartość: …… 21 x 2 − 28 x 5 , wartość: ……

### `fcc1d462` · rejonowy_2023_lodzkie_q12 · conf high
- **key:** `Każdą z liczb 0–13 można zapisać w postaci 1·a + 3·b + 9·c, gdzie a, b, c ∈ {−1, 0, 1}.` · **model:** `System trójkowy zrównoważony (cyfry −1,0,1 przy 1,3,9): 0=0·1+0·3+0·9; 1=1·1+0·3+0·9; 2=(−1)·1+1·3+0·9; 3=0·1+1·3+0·9; 4=1·1+1·3+0·9; 5=(−1)·1+(−1)·3+1·9; 6=0·1 …`
- **Q:** Wykaż, że każdą liczbę naturalną mniejszą niż 14 można przedstawić jako sumę liczb 1, 3 i 9 pomnożonych przez −1, 0 i 1, wzorując się na przykładzie 4 = 1 · 1 + 3 · 1 + 9 · 0 . Pamiętaj, że 0 jest też liczbą naturalną.

### `40aee2f7` · rejonowy_2023_podlaskie_q14 · conf high
- **key:** `Nie jest prostokątny` · **model:** `Nie, trójkąt nie jest prostokątny`
- **Q:** Sprawdź, czy trójkąt o bokach 2 cm, 10 cm, 4 cm jest prostokątny. Przedstaw swoje rozwiązanie i zapisz odpowiedź.

### `14a1dbff` · rejonowy_2024_lodzkie_q11 · conf high
- **key:** `a) np. x=9, y=16: √(9+16)=5, a √9+√16=7, więc √(x+y)≠√x+√y; b) np. x=0, y=1` · **model:** `a) np. √(9+16)=√25=5, ale √9+√16=3+4=7≠5, więc √(x+y)≠√x+√y w ogólności. b) np. x=0, y=4: √(0+4)=2=√0+√4.`
- **Q:** a) Udowodnij, wskazując odpowiedni przykład, że pierwiastek sumy to nie jest suma pierwiastków. b) Podaj przykład liczb x i y , dla których zachodzi równość x + y = x + y .

### `37d2d122` · rejonowy_2024_lubelskie_q14 · conf high
- **key:** `√52 cm` · **model:** `2√13 do każdego z pozostałych dwóch wierzchołków`
- **Q:** Wewnątrz kwadratu ABCD o boku długości 12 zaznaczono punkt P , którego odległość od dwóch sąsiednich wierzchołków tego kwadratu wynosi 10. Oblicz odległość punktu P od każdego z dwóch pozostałych wierzchołków kwadratu ABCD .

### `f68b9710` · rejonowy_2024_lubelskie_q15 · conf high
- **key:** `sześcian` · **model:** `Sześcian ma większe pole powierzchni (192 cm² > 32+80√3 ≈ 170,56 cm²)`
- **Q:** Dane są dwie bryły - prostopadłościan i sześcian. Podstawą prostopadłościanu, którego wysokość ma długość 5 3 cm, jest kwadrat o boku długości 4 cm. Długość krawędzi sześcianu jest równa długości przekątnej podstawy prostopadłościanu. Która z tych brył ma większe pole powierzchni całkowitej? Zapisz obliczenia.

### `dde741ff` · rejonowy_2024_mazowieckie_q5 · conf high
- **key:** `Otrzymana liczba jest zawsze większa od wyjściowej` · **model:** `Zawsze większa od wyjściowej: (a+3)/(b+3) > a/b`
- **Q:** Niech a i b będą liczbami całkowitymi spełniającymi nierówność 0 < a < b . Zarówno licznik, jak i mianownik ułamka a b zwiększono o 3. Rozstrzygnij, czy tak otrzymana liczba jest zawsze równa, większa czy mniejsza od wyjściowej. Odpowiedź uzasadnij.

### `b7640e78` · rejonowy_2024_mazowieckie_q8 · conf high
- **key:** `5200 bułek żytnich i 25400 bułek pszennych` · **model:** `żytnie: 5200 szt.; pszenne: 25 400 szt.`
- **Q:** W listopadzie w pewnej osiedlowej piekarni zamówiono bułki pszenne i żytnie na obchody święta szkoły. W związku z tym miesięczna produkcja bułek pszennych w porównaniu do poprzedniego miesiąca wzrosła o 400 sztuk, a bułek żytnich o 4%. To spowodowało wzrost łącznej produkcji tych bułek o 600 sztuk. W październiku stosu …

### `c6a2e9d8` · rejonowy_2024_podlaskie_q10 · conf high
- **key:** `pięciokąt (foremny)` · **model:** `Pięciokąt foremny (n = 5)`
- **Q:** Który wielokąt foremny ma tyle samo przekątnych co boków?

### `20af44c7` · rejonowy_2024_podlaskie_q17 · conf high
- **key:** `Nie jest prostokątny` · **model:** `Nie, trójkąt nie jest prostokątny`
- **Q:** Czy trójkąt o bokach 2 cm, 10 cm, 4 cm jest prostokątny? Zapisz sprawdzenie i odpowiedź.

### `d3431f5d` · rejonowy_2025_lodzkie_q1 · conf high
- **key:** `A) 28 + 113/8·π (odpowiedź E); B) obwód L = (7,5 + √113/2)·π` · **model:** `A) E (28 + 113/8·π); B) (15+√113)/2·π ≈ 40,26`
- **Q:** Wiemy, że przedstawiony na poniższym rysunku trójkąt ABC jest prostokątny, punkty M , J , K są, odpowiednio, środkami odcinków AB , BC i AC , długość odcinka AB jest równa 7, a odcinka BC jest równa 8, wszystkie łuki na rysunku są półokręgami. A) Oblicz pole zacieniowanej figury. Wskaż właściwą odpowiedź spośród podany …

### `4c81e9a9` · rejonowy_2025_lodzkie_q10 · conf high
- **key:** `pierwszy czworokąt: A (kwadrat); drugi czworokąt: E (trapez, który nie jest równoległobokiem)` · **model:** `A) Kwadrat; B) Trapez, który nie jest równoległobokiem`
- **Q:** Uzupełnij luki w tekście, wybierając spośród odpowiedzi podanych poniżej. Punkty ( 1 , 0 ) , ( 0 , − 1 ) , ( − 1 , 0 ) , ( 0 , 1 ) są wierzchołkami czworokąta. Jest to ……… . Punkty ( 15 , 100 ) , ( 100 , − 15 ) , ( 15 , − 100 ) , ( 100 , 15 ) są wierzchołkami czworokąta. Jest to ……… . A) Kwadrat B) Romb, który nie jest …

### `60e40aca` · rejonowy_2025_lodzkie_q11 · conf high
- **key:** `A) c; B) d, f; C) a; D) cd, bf; E) 3/2` · **model:** `A) c (3); B) d, f (-3, -15); C) a (9); D) (b,f)=(15,-15), (c,d)=(3,-3); E) 1,5`
- **Q:** Rozważmy liczby: a = 3 + 3 · 3 − 3 , b = ( 3 + 3 ) · 3 − 3 , c = 3 + 3 · ( 3 − 3 ) , d = 3 − 3 · 3 + 3 , e = ( 3 − 3 ) · ( 3 + 3 ) , f = 3 − 3 · ( 3 + 3 ) . Spośród nich: A) liczby pierwsze to: B) liczby ujemne to: C) liczby, które mają dokładnie 3 dzielniki dodatnie, to: D) pary liczb przeciwnych to: E) Średnia arytme …

### `77676437` · rejonowy_2025_podlaskie_q11 · conf high
- **key:** `w lutym roku przestępnego (lub w lutym)` · **model:** `Luty (w roku przestępnym)`
- **Q:** — Ojej, nie dość, że trzynasty, to w dodatku piątek — powiedziała Agnieszka, patrząc na kalendarz. — Nie martw się, w przyszłym miesiącu trzynasty wypada w sobotę — pocieszała Ula. W którym miesiącu rozmawiały dziewczynki?

### `c2f3aa4e` · rejonowy_2025_podlaskie_q14 · conf high
- **key:** `−11x − 3y + 7` · **model:** `7 − 11x − 3y`
- **Q:** Zapisz wyrażenie 7 − ( 3 x − 2 y ) + ( − 5 y − 8 x ) w najprostszej postaci.

### `a20b3b9f` · rejonowy_2025_podlaskie_q15 · conf high
- **key:** `Tak, maszt jest ustawiony pionowo` · **model:** `Tak, maszt jest pionowy, ponieważ 5² + 12² = 13² (25+144=169), więc na mocy twierdzenia odwrotnego do twierdzenia Pitagorasa kąt między masztem a ziemią jest pr …`
- **Q:** Maszt o wysokości 5 m jest przymocowany napiętą liną do ziemi. Długość liny od najwyższego punktu na maszcie do ziemi jest równa 13 m. Odległość podstawy masztu do punktu zaczepienia liny na ziemi jest równa 12 m. (Podstawa masztu i punkt zaczepienia liny na ziemi wyznaczają dokładnie poziom). Czy maszt jest ustawiony  …

### `74a7da6d` · rejonowy_2025_podlaskie_q19 · conf high
- **key:** `NWD(1024, 1536) = 512, NWW(42, 45) = 630; większe jest NWW(42, 45)` · **model:** `NWD(1024,1536) = 512; NWW(42,45) = 630; NWW jest większe (630 > 512)`
- **Q:** Wyznacz NWD ( 1024 , 1536 ) i NWW ( 42 , 45 ) . Określ, co jest większe: NWD ( 1024 , 1536 ) czy NWW ( 42 , 45 ) ?

### `dffab425` · rejonowy_2026_lodzkie_q11 · conf high
- **key:** `Pole czworokąta KLCM stanowi połowę pola trójkąta ABC.` · **model:** `Pole KLCM = 1/2 · Pole ABC (teza prawdziwa – dowód poniżej)`
- **Q:** Dany jest trójkąt ostrokątny ABC taki, że BC > AC . Poprowadzono symetralną boku AB , która przecięła bok AB w punkcie K i bok BC w punkcie L tak, że | CL | : | BL | = 1 3 . Następnie przez punkt K poprowadzono prostą, która przecięła bok AC w punkcie M tak, że | AM | : | CM | = 1 3 . Wykaż, że pole czworokąta KLCM sta …

### `9fe8fc22` · rejonowy_2026_lubelskie_q15 · conf high
- **key:** `kąt BEC = 15°, |BE| = √(32 + 16√3) cm` · **model:** `kąt BEC = 15°; BE = 2√2+2√6 cm (≈7,73 cm)`
- **Q:** Na boku kwadratu ABCD o długości 4 cm zbudowano trójkąt równoboczny CDE tak, że częścią wspólną kwadratu i trójkąta jest tylko odcinek CD . Oblicz miarę kąta BEC oraz długość odcinka BE . Zapisz wszystkie obliczenia.

### `c192485a` · szkolny_2010-2011_slaskie_q23 · conf high
- **key:** `Nie wystarczy — potrzeba 23,43 litra, a w baku jest 21,6 litra` · **model:** `Nie, nie wystarczy — na 330 km potrzeba 23,43 l, brakuje 1,83 l (starczy tylko na ok. 304,2 km).`
- **Q:** W baku samochodu jest 21,6 litra paliwa. Samochód zużywa średnio 7,1 litra paliwa na każde 100 km drogi. Oblicz, czy ten zapas paliwa wystarczy na przejechanie 330 km. Zapisz wszystkie obliczenia.

### `e57852b9` · szkolny_2011-2012_slaskie_q18 · conf high
- **key:** `wiatr – C, człowiek – D, rzeka – A, morze – E` · **model:** `wiatr – C (wydmy); człowiek – D (pola uprawne); rzeka – A (meandry); morze – E (klify)`
- **Q:** W twoim otoczeniu występują różne elementy krajobrazu. W poniższej tabeli wybrane elementy krajobrazu oznaczone są literami: A — meandry B — stożki piargowe C — wydmy D — pola uprawne E — klify Dobierz do „rzeźbiarza krajobrazu” utworzony przez niego element krajobrazu i wpisz do tabelki odpowiednią literę: wiatr, czło …

### `8979b25b` · szkolny_2012-2013_malopolskie_q20 · conf high
- **key:** `a) Asia, b) Basia` · **model:** `a) drużyna Asi (Asia zajęła pierwsze miejsce); b) skłamała Basia`
- **Q:** Cztery dziewczynki: Asia, Basia, Jasia i Kasia kibicowały każda innej drużynie. Na pytanie o wyniki zawodów, dziewczynki dały następujące odpowiedzi: Asia: „Moja drużyna nie była ostatnia”. Basia: „Moja drużyna zajęła pierwsze miejsce”. Jasia: „Niestety, moja drużyna zajęła ostatnie, czwarte miejsce”. Kasia: „Moja druż …

### `bd12d646` · szkolny_2012-2013_slaskie_q18 · conf high
- **key:** `a) wiatromierz; b) deszczomierz; c) barometr` · **model:** `a) wiatromierz (anemometr); b) deszczomierz (pluwiometr); c) barometr`
- **Q:** Napisz, przy pomocy jakiego przyrządu można zmierzyć lub zaobserwować: a) kierunek i siłę wiatru – ……………… b) ilość opadów – ……………… c) ciśnienie atmosferyczne – ………………

### `b62fa898` · szkolny_2012-2013_slaskie_q19 · conf high
- **key:** `a) runo – borowiki, borówki, zawilce; b) podszyt – leszczyny, głóg, jarzębina; c) korony drzew – buki, dęby` · **model:** `a) runo: zawilce, borowiki, borówki; b) podszyt: leszczyny, głóg, jarzębina; c) korony drzew: buki, dęby`
- **Q:** Do podanej warstwy lasu dobierz wszystkie charakterystyczne dla niej rośliny spośród wypisanych poniżej: a) runo – ……………… b) podszyt – ……………… c) korony drzew – ……………… leszczyny, buki, dęby, zawilce, borowiki, borówki, głóg, jarzębina

### `b9c0d95e` · szkolny_2013-2014_slaskie_q1 · conf high
- **key:** `W puste pola wpisujemy: 4, 3, 5, 8, 3. Wiersze: 4·2+4=12, 10+6:3=12, 5+8−3=10.` · **model:** `Wiersz 1: 4 · 2 + 4 = 12; Wiersz 3: 10 + 6 : 3 = 12; Wiersz 5: 5 + 8 − 3 = 10`
- **Q:** W puste białe pola „liczbowej krzyżówki” wstaw liczby tak, aby wszystkie działania były poprawne.

### `fdd6cfc6` · szkolny_2013-2014_slaskie_q15 · conf high
- **key:** `A. kotlina; B. wzniesienie o dwóch wierzchołkach` · **model:** `A – wzniesienie o jednym wierzchołku; B – wzniesienie o dwóch wierzchołkach`
- **Q:** Do rysunków przyporządkuj nazwy przedstawionych na nich form terenu spośród wymienionych: kotlina, wzniesienie o dwóch wierzchołkach, wzniesienie o jednym wierzchołku.

### `dd8a4974` · szkolny_2013-2014_slaskie_q18 · conf high
- **key:** `Opady atmosferyczne – deszczomierz, milimetr (mm); Ciśnienie atmosferyczne – barometr, hektopaskal (hPa); Kierunek i prędkość wiatru – wiatromierz, kilometr na  …` · **model:** `Opady atmosferyczne – deszczomierz – milimetr (mm); Ciśnienie atmosferyczne – barometr – hektopaskal (hPa); Kierunek i prędkość wiatru – wiatromierz – kilometr  …`
- **Q:** Do składnika pogody dopasuj przyrząd służący do jego pomiaru oraz jednostkę pomiaru spośród wymienionych: termometr, deszczomierz, barometr, wiatromierz, milimetr (mm), stopień Celsjusza (°C), hektopaskal (hPa), kilometr na godzinę (km/h). Składnik pogody Przyrząd Jednostka pomiaru Opady atmosferyczne Ciśnienie atmosfe …

### `05013309` · szkolny_2016-2017_malopolskie_q17 · conf high
- **key:** `a) 7. rok, b) 31750 zł` · **model:** `a) siódmy rok (7. rok); b) 31 750 zł`
- **Q:** Góral z okolic Nowego Targu zajmuje się hodowlą owiec oraz produkowaniem i sprzedażą twardych wędzonych serów zwanych oscypkami. W czwartym roku od rozpoczęcia hodowli, ze sprzedaży oscypków uzyskał 2000 zł. Po kilku latach gospodarz zorientował się, że w każdym kolejnym roku od rozpoczęcia hodowli kwota uzyskiwana ze  …

### `db83806d` · szkolny_2017-2018_slaskie_q2 · conf high
- **key:** `A) (3333 − 1111) : 11 − 1; B) 3333 − (1111 : 11 − 1); C) (3333 − 1111) : (11 − 1)` · **model:** `A) ((3333−1111):11)−1 = 201; B) 3333−((1111:11)−1) = 3233; C) (3333−1111):(11−1) = 222,2`
- **Q:** W poniższych wyrażeniach arytmetycznych wstaw nawiasy tak, aby wynik był: A) możliwie najmniejszy: 3333 − 1111 : 11 − 1 B) możliwie największy: 3333 − 1111 : 11 − 1 C) równy 222,2: 3333 − 1111 : 11 − 1

### `36bfdcc1` · szkolny_2017-2018_warminsko-mazurskie_q12 · conf high
- **key:** `Jaś otrzyma większe kieszonkowe według swojej propozycji, o 10 zł 40 gr.` · **model:** `Drugim sposobem, o 10,40 zł więcej`
- **Q:** Jaś ma 15 zł kieszonkowego tygodniowo. Zaproponował rodzicom inny sposób wypłacania kieszonkowego: w poniedziałek dostaje 20 groszy, a każdego następnego dnia dwa razy więcej niż poprzedniego i tak do niedzieli. Którym sposobem Jaś otrzyma większe kieszonkowe i o ile?

### `df90c169` · szkolny_2018-2019_malopolskie_q19 · conf high
- **key:** `np. 2/7 = 1/21 + 1/14 + 1/6 oraz 2/7 = 1/56 + 1/8 + 1/7` · **model:** `2/7 = 1/4 + 1/42 + 1/84 oraz 2/7 = 1/4 + 1/35 + 1/140`
- **Q:** Ułamek 2 3 można przedstawić w postaci sumy trzech ułamków o różnych mianownikach i licznikach równych 1, np. 2 3 = 1 12 + 1 4 + 1 3 . Przedstaw na dwa różne sposoby ułamek 2 7 w postaci sumy trzech ułamków o różnych mianownikach, których liczniki są równe 1.

### `ba39972a` · szkolny_2018-2019_pomorskie_q12 · conf high
- **key:** `1/4 (0,25)` · **model:** `5/4 (1 1/4)`
- **Q:** Oblicz: 1 16 − ( 1 4 ) 2 · ( 0,5 ) ( − 1 2 ) 3 + ( − 0,75 ) 2 · ( 1,7 − 3,2 ) · 31 + 1 9 16

### `c2171f1a` · szkolny_2018-2019_warminsko-mazurskie_q13 · conf high
- **key:** `Trójkąty ABE i FDA są przystające (bok–kąt–bok), skąd AE = AF.` · **model:** `AE = AF (dowód powyżej)`
- **Q:** Na bokach BC i CD prostokąta ABCD zbudowano na zewnątrz prostokąta dwa trójkąty równoboczne BCE i CDF . Udowodnij, że AE = AF .

### `656c18cf` · szkolny_2018-2019_warminsko-mazurskie_q14 · conf high
- **key:** `16√5 m² ≈ 35,8 m²` · **model:** `16√5 m² ≈ 35,78 m²`
- **Q:** Romb zbudowany jest z 2 trójkątów równoramiennych o bokach 6 m, 60 dm, 800 cm. Oblicz pole tego rombu. Wynik podaj w metrach kwadratowych.

### `3327344e` · szkolny_2018_podkarpackie_q20 · conf high
- **key:** `2,017·10¹⁰³` · **model:** `2017 · 10^100`
- **Q:** Zapisz w notacji wykładniczej: 3 · 10 103 − 9 · 100 51 − 80 · 2 100 · 25 50 − 3 · 4 50 · 5 100

### `e797b9f2` · szkolny_2018_podlaskie_q20 · conf high
- **key:** `Długość tunelu: 1,4 km; czas przejazdu przez tunel: 1,75 min` · **model:** `Maszynista jechał przez tunel 1 min 45 s; długość tunelu 1400 m`
- **Q:** Pociąg długości 600 metrów jechał z prędkością 48 km/h i miał przed sobą tunel. Od momentu wejścia czoła lokomotywy do tunelu do chwili, w której ostatni wagon opuścił tunel, upłynęło 2,5 minuty. Ile czasu maszynista jechał przez tunel? Jaka była długość tunelu?

### `0c592e5d` · szkolny_2019-2020_slaskie_q18 · conf high
- **key:** `Nie istnieje taka liczba naturalna x.` · **model:** `Nie, taka liczba nie istnieje.`
- **Q:** Czy istnieje taka liczba naturalna x , że wartość wyrażenia ( 1 3 − 1 5 − 1 x ) · ( 1 3 · 5 − 1 5 · 7 − 1 7 · 9 ) jest równa zero? Odpowiedź uzasadnij.

### `9b5a6735` · szkolny_2019-2020_zachodniopomorskie_q19 · conf high
- **key:** `2 2/3` · **model:** `8/3`
- **Q:** Liczba x jest rozwiązaniem poniższego równania. Oblicz sumę liczby przeciwnej i liczby odwrotnej do x . x + 4 2 − − 2 x − 5 6 = 0,5 x + 2,5 3

### `657321ca` · szkolny_2019_mazowieckie_q4 · conf high
- **key:** `R = 6` · **model:** `5`
- **Q:** Takim samym literom odpowiadają takie same cyfry, a różnym literom – różne cyfry. Rozszyfruj mnożenie. Napisz, jakiej cyfrze odpowiada litera R. RACHUNEK · 9 = KKKKKKKKK

### `673e9241` · szkolny_2019_podkarpackie_q17 · conf high
- **key:** `17.1: C = (−1, 6); 17.2: D = (−6, 3); 17.3: √68 = 2√17; 17.4: 34` · **model:** `17.1) C=(-1,6); 17.2) D=(-6,3); 17.3) 2√17; 17.4) 34`
- **Q:** Punkty A = ( − 3 , − 2 ) i B = ( 2 , 1 ) są wierzchołkami kwadratu ABCD . Punkt S = ( − 2 , 2 ) jest środkiem przekątnej AC . Uzupełnij luki. 17.1. Punkt C ma współrzędne …………… . 17.2. Punkt D ma współrzędne …………… . 17.3. Przekątna tego kwadratu ma długość …………….. . 17.4. Pole tego kwadratu jest równe …………… .

### `a0cbc3cd` · szkolny_2020-2021_zachodniopomorskie_q20 · conf high
- **key:** `−5 5/6` · **model:** `-35/6`
- **Q:** Oblicz różnicę liczby x i liczby odwrotnej do x , gdzie x jest rozwiązaniem równania − x − 3 2 − x − 2 − 3 = 2 x + 5 6 .

### `899fb18c` · szkolny_2020_podkarpackie_q15 · conf high
- **key:** `15.1: 120°; 15.2: 3 cm; 15.3: 15 cm; 15.4: 6,75√3 cm²` · **model:** `15.1) 120°; 15.2) 3 cm; 15.3) 15 cm; 15.4) 27√3/4 cm² (≈11,69 cm²)`
- **Q:** Sześciokąt foremny o boku długości 6 cm został podzielony na osiem przystających trapezów równoramiennych w sposób pokazany na rysunku. Uzupełnij luki tak, by zdania dotyczące każdego z ośmiu przystających trapezów były prawdziwe. 15.1. Kąt rozwarty trapezu ma miarę ……… . 15.2. Ramię trapezu ma długość ……… cm. 15.3. Ob …

### `e7e60761` · szkolny_2021-2022_swietokrzyskie_q10 · conf high
- **key:** `Liczba a zmniejszona o swoją siódmą część jest większa (2/3 > 0,66).` · **model:** `Większa jest liczba a zmniejszona o swoją siódmą część: 2/3 (≈ 0,67) > 20% z b = 0,46`
- **Q:** Co jest większe: liczba a zmniejszona o swoją siódmą część, czy 20% liczby b ? a = 1 3 − 0,8 : 1 5 − 3,6 : 3 5 + 10 4 9 b = − 2,7 · ( − 1 9 ) + 1,4 : ( − 7 5 ) + ( 2 1 4 ) 2 · ( 1 1 3 ) 2 Zapisz odpowiednie obliczenia i odpowiedź.

### `f61dfcc7` · szkolny_2021-2022_swietokrzyskie_q14 · conf high
- **key:** `11 1/13 cm` · **model:** `144/13 cm ≈ 11,08 cm`
- **Q:** Trójkąt równoramienny ma obwód równy 144 cm i pole 960 cm². Ramię tego trójkąta jest o 30% dłuższe od podstawy. Oblicz wartość bezwzględną różnicy wysokości tego trójkąta o różnych długościach. Zapisz odpowiednie obliczenia i odpowiedź.

### `37366705` · szkolny_2021-2022_zachodniopomorskie_q19 · conf high
- **key:** `≈ 35,8 m²` · **model:** `35,8 m²`
- **Q:** Romb zbudowany jest z dwóch trójkątów równoramiennych o bokach 6 m, 60 dm, 800 cm. Oblicz pole tego rombu. Wynik podaj w metrach kwadratowych w zaokrągleniu do części dziesiątych.

### `c5c4c659` · szkolny_2021_mazowieckie_q5 · conf high
- **key:** `Obaj chłopcy jechali z taką samą prędkością.` · **model:** `Prędkości Kuby i Bartka są równe (v_K = v_B).`
- **Q:** Kuba i Bartek jeżdżą do szkoły rowerami. Droga Kuby do szkoły jest półtora raza dłuższa niż droga Bartka. Pewnego razu Bartek przebył tę drogę w czasie stanowiącym 2 3 czasu jazdy Kuby. Porównaj prędkości chłopców.

### `a52c132b` · szkolny_2021_mazowieckie_q6 · conf high
- **key:** `około 14,3%` · **model:** `≈14,3%`
- **Q:** W trójkącie równoramiennym wysokość poprowadzona na ramię trójkąta jest trzy razy krótsza od wysokości poprowadzonej na jego podstawę. Oblicz, ile procent obwodu trójkąta stanowi długość jego podstawy. Odpowiedź podaj z dokładnością do 0,1%.

### `7a50dc72` · szkolny_2021_podkarpackie_q22 · conf high
- **key:** `xy (dopuszczalne także: x·y, yx, y·x)` · **model:** `x·y`
- **Q:** Uzupełnij lukę tak, aby zdanie było prawdziwe. Narysowana gwiazda jest zbudowana z kwadratu i czterech przystających trójkątów równoramiennych. Pole tej gwiazdy jest równe: ……………………

### `2fa7d5e2` · szkolny_2022-2023_wielkopolskie_q21 · conf high
- **key:** `Suma = (2n+1)+(2n+3)+(2n+5)+(2n+7) = 8n+16 = 8(n+2), więc jest podzielna przez 8.` · **model:** `Cztery kolejne liczby nieparzyste to n, n+2, n+4, n+6 (n=2k+1); ich suma = 4n+12 = 8k+16 = 8(k+2), podzielna przez 8.`
- **Q:** Uzasadnij, że suma czterech kolejnych liczb naturalnych nieparzystych jest podzielna przez 8. Zapisz obliczenia.

### `3c787344` · szkolny_2022_mazowieckie_q7 · conf high
- **key:** `Pole trapezu jest równe h², czyli polu kwadratu o boku h.` · **model:** `Pole = h² (równe polu kwadratu o boku h)`
- **Q:** Uzasadnij, że pole trapezu równoramiennego o wysokości h , w którym przekątne są prostopadłe, jest równe polu kwadratu, którego bok ma długość równą wysokości tego trapezu.

### `62d3af7c` · szkolny_2023-2024_pomorskie_q7 · conf high
- **key:** `Ostatnią cyfrą liczby jest 5 (2023²⁰²⁴ kończy się na 1, a 2024²⁰²³ na 4), więc liczba dzieli się przez 5.` · **model:** `2023^2024 + 2024^2023 ≡ 0 (mod 5), więc liczba jest podzielna przez 5`
- **Q:** Wykaż, że liczba 2023 2024 + 2024 2023 jest podzielna przez 5.

### `786dbb24` · szkolny_2023_dolnoslaskie_q16 · conf high
- **key:** `śród, czwartków` · **model:** `środ, czwartków`
- **Q:** W lipcu pewnego roku było 5 niedziel. W puste pola wpisz właściwe nazwy dni tygodnia. W tym lipcu nie mogło być pięciu ............, ani pięciu ............ .

### `7308535b` · szkolny_2023_lubelskie_q13 · conf high
- **key:** `a) 12 cm, b) 4 8 13 cm` · **model:** `a) 12 cm; b) 60/13 cm (≈4,62 cm)`
- **Q:** Dany jest trójkąt prostokątny ABC , w którym | AB | = 5 cm, | AC | = 12 cm, | BC | = 13 cm. Uzupełnij zdania, wpisując długości odcinków z prawidłową jednostką. a) Najdłuższa wysokość tego trójkąta ma długość ……………..... b) Najkrótsza wysokość tego trójkąta ma długość ………………...

### `7569856c` · szkolny_2023_lubelskie_q14 · conf high
- **key:** `5 5 11 cm` · **model:** `60/11`
- **Q:** Boki równoległoboku mają długości 11 cm i 6 cm, a jego dłuższa wysokość 10 cm. Jaka jest długość drugiej wysokości tego równoległoboku? W miejscu przeznaczonym na odpowiedź wpisz tylko liczbę. Odpowiedź: …….… cm

### `282ff86c` · szkolny_2023_lubelskie_q15 · conf high
- **key:** `a) − 7 1 7 , b) 0, c) 6` · **model:** `a) -50/7 (-7 1/7); b) 0; c) 6`
- **Q:** Poniższe zdania dotyczą działań na liczbach. Uzupełnij luki tak, aby otrzymane zdania były prawdziwe. a) Suma liczby −7 i jej odwrotności wynosi …………………………... b) Suma liczby 5 i liczby do niej przeciwnej wynosi ……………… c) Różnica liczby −2 i jej sześcianu wynosi …………………………...

### `53f17124` · szkolny_2023_mazowieckie_q10 · conf high
- **key:** `Wygra Bartek` · **model:** `Wygrywa Bartek (o 8 m)`
- **Q:** Dwaj bracia, starszy Bartek i młodszy Kuba, trenują bieg na 200 m. W pierwszej próbie wyścigu wygrał Bartek, wyprzedzając Kubę o 40 m (w momencie, gdy Bartek przekraczał metę). W drugiej próbie, aby wyrównać szanse, Bartek rozpoczyna bieg 40 m przed linią startu. Każdy z nich biegnie z taką samą prędkością, jak w pierw …

### `65798d02` · szkolny_2023_mazowieckie_q6 · conf high
- **key:** `Nie, to niemożliwe (suma byłaby liczbą parzystą, a 147 jest nieparzyste)` · **model:** `Nie, to niemożliwe`
- **Q:** Zuzia rzuciła 45 razy sześcienną kostką do gry i sumowała liczby wyrzuconych oczek. Czy jest możliwe, żeby suma ta wyniosła 147, jeśli liczb parzystych wypadło dwa razy mniej niż nieparzystych? Odpowiedź uzasadnij.

### `0d297029` · szkolny_2023_mazowieckie_q9 · conf high
- **key:** `17 stycznia, 15 marca, 13 maja, 31 maja, 11 lipca, 29 lipca, 9 września, 27 września, 7 listopada, 25 listopada` · **model:** `17.01, 15.03, 13.05, 31.05, 11.07, 29.07, 09.09, 27.09, 07.11, 25.11 (2024)`
- **Q:** Uzasadnij, że jest dokładnie dziesięć dat w roku 2024, które mają tę własność, że numer dnia i numer miesiąca są liczbami nieparzystymi, a ich suma jest liczbą podzielną przez 9. Zapisz te daty.

### `a012c096` · szkolny_2023_podlaskie_q11 · conf high
- **key:** `a) LX; b) np. 0,81; c) 100; d) 30 km; e) 130°; f) 10 dm; g) kwadrat` · **model:** `a) LX; b) np. 0,85; c) 100 razy; d) 30 km; e) 130°; f) 10 dm; g) kwadrat`
- **Q:** Udziel odpowiedzi: Która liczba jest większa: XL czy LX? Podaj jeden przykład ułamka większego od 0,8, ale mniejszego od 0,9. Ile razy liczba 10 3 jest większa od liczby 10? Sokół może osiągnąć prędkość 120 km h . Gdyby mógł lecieć stale z taką prędkością, to jaką odległość pokonałby w ciągu kwadransa? Jeden z kątów pr …

### `54f66e66` · szkolny_2023_podlaskie_q22 · conf high
- **key:** `Od środka: zielone, następnie żółte, a na wierzchu różowe.` · **model:** `Kolejność od najmniejszego: zielone (sześcian a=3 cm, V=27 cm³), żółte (4×5×6 cm, V=120 cm³), różowe (sześcian a=7 cm, V=343 cm³)`
- **Q:** Wojtek przygotowując prezent dla Asi, włożył go do małego pudełka. To pudełko włożył do większego, a to do jeszcze większego, przy czym każde następne pudełko całkowicie mieściło się w poprzednim. Ustal w jakiej kolejności brał pudełka, jeśli wiadomo, że: pudełko żółte jest prostopadłościanem o wymiarach 4 cm × 5 cm ×  …

### `af3cdc0c` · szkolny_2023_podlaskie_q9 · conf high
- **key:** `Ulica Rusa i ulica Lecha są równoległe.` · **model:** `Ulica Rusa jest równoległa do ulicy Lecha`
- **Q:** W pewnym mieście są ulice: Lecha, Czech, Rusa i Popiela. Ulica Rusa jest równoległa do ulicy Czecha. Ulica Czecha jest prostopadła do ulicy Popiela, a ulica Popiela jest prostopadła do ulicy Lecha. Jakie jest wzajemne położenie ulicy Rusa i ulicy Lecha?

### `98d9b1b0` · szkolny_2024-2025_pomorskie_q1 · conf high
- **key:** `10 par (X, Y): (2,0), (5,0), (8,0), (1,4), (4,4), (7,4), (0,8), (3,8), (6,8), (9,8)` · **model:** `(X,Y) ∈ {(2,0),(5,0),(8,0),(1,4),(4,4),(7,4),(0,8),(3,8),(6,8),(9,8)} — liczby: 2220, 2520, 2820, 2124, 2424, 2724, 2028, 2328, 2628, 2928`
- **Q:** Wyznacz cyfry X i Y tak, aby liczba czterocyfrowa 2 X 2 Y była podzielna przez 12. Podaj wszystkie rozwiązania tego zadania. Odpowiedź uzasadnij.

### `1bb3fb69` · szkolny_2024_dolnoslaskie_q15 · conf high
- **key:** `T₁: rozwartokątny, T₂: rozwartokątny, T₃: ostrokątny` · **model:** `T1: rozwartokątny; T2: rozwartokątny; T3: ostrokątny`
- **Q:** Dane są trójkąty T 1 , T 2 , T 3 o następujących miarach kątów: T 1 : 5°, α , β , T 2 : 10°, β , γ , T 3 : 25°, α , γ . Miary kątów α , β , γ spełniają równość α + β + γ = 250 ° . Określ rodzaj każdego z tych trójkątów ze względu na kąty za pomocą określeń: ostrokątny, prostokątny, rozwartokątny (określenia te mogą się …

### `cd41a1ea` · szkolny_2024_lodzkie_q15 · conf high
- **key:** `3 700 000 (około 3,7 mln)` · **model:** `≈ 3 700 000 emerytek`
- **Q:** Przyjmijmy, że w Polsce mamy 6 mln emerytów. Średnia emerytura to 3300 zł. Średnia emerytura mężczyzn wynosi 4100 zł, a średnia emerytura kobiet - 2800 zł. Oblicz, ile jest w Polsce emerytek. Wynik zaokrąglij do setek tysięcy. Zapisz obliczenia.

### `61b8f9df` · szkolny_2025_dolnoslaskie_q10 · conf high
- **key:** `15` · **model:** `9`
- **Q:** Z figur takich, jak na rysunku nr 1, o wysokości x centymetrów, zbudowano figurę taką, jak na rysunku nr 2, o wysokości y = 39 cm i figurę taką, jak na rysunku nr 3, o wysokości z = 21 cm. Wysokość x figury na rysunku 1. jest równa __________ centymetrów.

### `50fefef5` · szkolny_2025_lodzkie_q5 · conf high
- **key:** `A) x²=17−12√2, y²=17−2√70, z²=17−12√2, w²=17−2√70; B) B (dwa)` · **model:** `A) x² = 17 − 12√2; y² = 17 − 2√70; z² = 17 − 12√2; w² = 17 − 2√70. B) B`
- **Q:** Rozważmy liczby: x = 3 − 2 2 , y = 7 − 10 , z = 2 2 − 3 i w = 10 − 7 . A) Zapisz w wykropkowanych miejscach poniższe liczby x 2 , y 2 , z 2 i w 2 (w postaci a b + c , gdzie a , b , c są liczbami całkowitymi, np. 3 5 − 4 ): x 2 = ………………………. y 2 = ………………………. z 2 = ………………………. w 2 = ………………………. B) Poniżej przedstawiono czte …

### `caa28d97` · szkolny_2025_lodzkie_q8 · conf high
- **key:** `5 psów (x = 3 węże, y = 8 ptaków, z = 5 psów)` · **model:** `x+y+z=16; 2y+4z=36; x+z=y. Liczba psów: 5`
- **Q:** W pewnym sklepie są węże, psy i ptaki. Zwierzęta te mają razem 16 głów i 36 nóg. Wiemy, że psów i węży było razem tyle samo ile ptaków. Niech x oznacza liczbę węży, y – liczbę ptaków, a z liczbę psów. Zapisz trzy równania, które wynikają z treści zadania. Ile jest psów w tym sklepie? Odpowiedź uzasadnij.

### `737aa605` · szkolny_2025_lodzkie_q9 · conf high
- **key:** `3 prostopadłościany; objętości 672/13 m³, 84 m³, 96 m³; najmniejsza objętość: 1 m × 12 m × 56/13 m` · **model:** `3 prostopadłościany: 1×12×56/13 m (V=672/13≈51,7 m³); 2×6×7 m (V=84 m³); 3×4×8 m (V=96 m³). Najmniejsza objętość: wymiary 1 m × 12 m × 56/13 m (≈51,7 m³).`
- **Q:** Ile różnych (o różnych wymiarach) prostopadłościanów jednocześnie spełnia warunki: podstawa ma pole 12 m², pole powierzchni całkowitej wynosi 136 m², długość każdej krawędzi podstawy (wyrażona w metrach) jest liczbą całkowitą? Oblicz objętość każdego z nich. Podaj wymiary prostopadłościanu spełniającego powyższe warunk …

### `9db82edf` · szkolny_2025_lubelskie_q16 · conf high
- **key:** `β = 57°` · **model:** `123`
- **Q:** Uzupełnij zdanie, wpisując tylko liczbę. Miara kąta β zaznaczonego na rysunku (powyżej) wynosi …………………… stopni.

### `5436803b` · szkolny_2025_podkarpackie_q3 · conf high
- **key:** `7½` · **model:** `7,5`
- **Q:** Zenon zaznaczył na osi liczbowej punkty A , B i C (w tej kolejności od lewej do prawej). Środek odcinka AB to punkt odpowiadający liczbie − 13 . Środek odcinka BC odpowiada liczbie 61 . Środek odcinka AC odpowiada liczbie 40 1 2 . Jaka liczba odpowiada punktowi B ?

### `5f24486e` · szkolny_2025_podkarpackie_q6 · conf high
- **key:** `2⅔ cm², 6 cm², 13½ cm²` · **model:** `8/3 cm², 6 cm² lub 27/2 cm² (2⅔ cm², 6 cm² lub 13,5 cm²)`
- **Q:** Kwadrat rozcięto dwoma prostopadłymi prostymi liniami na cztery prostokąty. Trzy z nich mają pola 4 cm², 6 cm² i 9 cm². Wyznacz wszystkie możliwe wartości pola czwartego prostokąta.

### `911f2e0f` · szkolny_2026_dolnoslaskie_q13 · conf high
- **key:** `32 (procent); 2½ (razy)` · **model:** `32% oraz 2,5 razy`
- **Q:** W kwadracie ABCD umieszczone są dwa prostokąty: AEFG i AHIJ o wymiarach | AE | = | AJ | = 1 cm i | AG | = | AH | = 3 cm oraz kwadrat FIKL – w sposób przedstawiony na rysunku poniżej. Pole kwadratu FIKL stanowi __________ procent pola kwadratu ABCD . Obwód kwadratu ABCD jest __________ razy większy od obwodu prostokąta  …

### `c68810b7` · szkolny_2026_lubelskie_q14 · conf high
- **key:** `a) 5·10⁷ monet; b) 106500 kg` · **model:** `a) 5·10^7 monet; b) 106 500 kg`
- **Q:** Syn pewnego miliardera narzekał, że ojciec na wymarzoną podróż dookoła świata chce dać mu zbyt mało pieniędzy. Ojciec, który nie był pozbawiony humoru, postanowił zrobić synowi „niespodziankę” i przekazał mu milion złotych w monetach dwugroszowych. a) Ile sztuk monet otrzymał syn? Liczbę monet podaj w notacji wykładnic …

### `313b4aa0` · wojewodzki_2010-2011_slaskie_q22 · conf high
- **key:** `a) na południowy zachód (S–W); b) na półkuli północnej i wschodniej (N i E)` · **model:** `a) południowy zachód; b) półkula północna i wschodnia`
- **Q:** Na podstawie mapy zamieszczonej obok, uzupełnij poniższe zdania, wpisując właściwe kierunki geograficzne: a) Jadąc z Olsztyna do Wrocławia przemieszczasz się na ..................... b) Polska położona jest w całości na półkulach: ..................... i ..................... (Źródło rys: mat. dydaktyczne dla naucz. ge …

### `cd4b5811` · wojewodzki_2012-2013_slaskie_q1 · conf high
- **key:** `Wpisywane liczby (6 pól): 16 i 18 (górny wiersz), −2 i 4 (wiersz „… + … : 2 = 0”) oraz −2 i 4 (wiersz „2 + … − (−4) = …”). Poziomo: 10 + 0,5 · 16 = 18; −2 + 4 : …` · **model:** `Wiersz1: 10+0,5·16=18; Wiersz2: −2+4:2=0; Wiersz3: 2+(−2)−(−4)=4; Kolumna1: 10−(−2)−2=10; Kolumna2: 0,5·4+(−2)=0; Kolumna3: 16−2+(−4)=10`
- **Q:** W puste białe pola „liczbowej krzyżówki” wstaw liczby tak, aby wszystkie działania były poprawne.

### `5ea65a9a` · wojewodzki_2012-2013_slaskie_q16 · conf high
- **key:** `Opis pierwszy (duże odległości, szybki ruch cząsteczek): gazy (stan gazowy). Opis drugi (cząsteczki ciasno ułożone, tylko drgania): ciała stałe (stan stały).` · **model:** `1) stan gazowy; 2) stan stały`
- **Q:** W tabeli zamieszczono opisy właściwości substancji w różnych stanach skupienia. Uzupełnij kolumnę tabeli, wpisując odpowiednią nazwę stanu skupienia substancji. Odległości między cząsteczkami są duże. Cząsteczki przemieszczają się bardzo szybko we wszystkich kierunkach. Cząsteczki ułożone są ciasno, nie przemieszczają  …

### `cd4843ce` · wojewodzki_2013-2014_slaskie_q14 · conf high
- **key:** `A. tundra; B. wilgotne lasy równikowe; C. roślinność śródziemnomorska` · **model:** `A – tundra; B – wilgotne lasy równikowe; C – roślinność śródziemnomorska`
- **Q:** Do krótkich opisów klimatów dobierz nazwę strefy roślinnej spośród wymienionych: wilgotne lasy równikowe, tundra, sawanna, roślinność śródziemnomorska. A. Lato krótkie, chłodne – średnie miesięczne temperatury zaledwie kilka stopni powyżej 0 °C, panuje dzień polarny; zima długa, bardzo mroźna, niewielkie, często kilkud …

### `94f8e7f6` · wojewodzki_2014_podkarpackie_q23 · conf high
- **key:** `≈ 546,9 l` · **model:** `546,9 l`
- **Q:** Akwarium ma kształt prostopadłościanu bez górnej podstawy i jest wykonane z szyb o grubości 1,5 cm. Mierzone na zewnątrz ma: 180 cm długości, 63 cm szerokości i 53 cm wysokości. Ile maksymalnie litrów wody można wlać do tego akwarium? Wynik podaj z dokładnością do 0,1. Zapisz obliczenia.

### `d9310d62` · wojewodzki_2016-2017_malopolskie_q13 · conf high
- **key:** `a) (n−4)² lub (2k+1−4)²; b) n−3(n+2) lub (2k+1)−3(2k+3)` · **model:** `a) (2k+1)² − 4; b) (2k+1) − 3(2k+3)`
- **Q:** Każdą liczbę naturalną nieparzystą n możemy zapisać w postaci n = 2 k + 1 , gdzie k jest pewną liczbą naturalną. Zapisz, używając symboli matematycznych, następujące wyrażenia: a) kwadrat dowolnej liczby naturalnej nieparzystej n pomniejszonej o 4, b) różnicę liczby naturalnej nieparzystej n i potrojonej kolejnej liczb …

### `d971d842` · wojewodzki_2017-2018_malopolskie_q17 · conf high
- **key:** `Pole trójkąta BCP jest równe połowie pola trapezu ABCD (dowód)` · **model:** `Teza prawdziwa: pole trójkąta BCP = 1/2 pola trapezu ABCD`
- **Q:** W trapezie ABCD połączono środek P ramienia AD z końcami drugiego ramienia BC. Udowodnij, że pole powstałego trójkąta BCP jest równe połowie pola trapezu ABCD. Zapisz poniżej pełną treść swojego rozumowania .

### `5528f3c2` · wojewodzki_2017-2018_warminsko-mazurskie_q16 · conf high
- **key:** `Objętość zwiększy się o ab (o iloczyn ab).` · **model:** `ab (iloczyn a razy b)`
- **Q:** Dany jest prostopadłościan o krawędziach długości a , b , c . O ile zwiększy się jego objętość, jeśli długość krawędzi c zwiększymy o 1?

### `0e0d8047` · wojewodzki_2017-2018_zachodniopomorskie_q15 · conf high
- **key:** `164 bombki; możliwości (małe po 8, duże po 10): 3 małe i 14 dużych, 8 małych i 10 dużych, 13 małych i 6 dużych, 18 małych i 2 duże` · **model:** `164 bombki; (duże,małe) = (2,18), (6,13), (10,8), (14,3)`
- **Q:** Do zapakowania jest ponad 150 bombek, ale mniej niż 200. Do dyspozycji masz dwa rodzaje opakowań. Gdy włożysz do pudełek po 10 sztuk, to zostaną cztery bombki, a gdy zapakujesz po 8 sztuk, też zostaną cztery. Ile bombek było do zapakowania? Ile wziąć pudełek dużych i ile małych, aby je całkowicie zapełnić i aby wszystk …

### `b0e6ba1b` · wojewodzki_2017-2018_zachodniopomorskie_q16 · conf high
- **key:** `Nie wystarczy (dla 5 koni potrzeba 600 kg); porcja: 550 : (5 · 30) ≈ 3,67 kg (3⅔ kg) na konia dziennie` · **model:** `Nie wystarczy (potrzeba 600 kg, brakuje 50 kg); nowa porcja: 11/3 ≈ 3,67 kg melasy na konia dziennie`
- **Q:** Porcje karmy dla trzech koni były wydzielone w taki sposób, że w ciągu 30 dni zjadały one 360 kg melasy. Na kolejny miesiąc zakupiono 550 kg melasy, ale do stajni przybyły dwa nowe konie. Czy zakupiony zapas karmy wystarczy dla wszystkich koni, jeśli nie chcemy zmniejszać porcji? Jaka powinna być porcja karmy, aby cały …

### `6e8e928d` · wojewodzki_2017-2018_zachodniopomorskie_q18 · conf high
- **key:** `Kolejne: 1 − 4/5 · 5/6 = 2/6 oraz 1 − 5/6 · 6/7 = 2/7; piętnaste = 2/17, dwudzieste = 2/22` · **model:** `1 − 4/5·5/6 = 1/3; 1 − 5/6·6/7 = 2/7; 15. wyrażenie = 2/17; 20. wyrażenie = 1/11`
- **Q:** Dane są wyrażenia: 1 − 1 2 · 2 3 , 1 − 2 3 · 3 4 , 1 − 3 4 · 4 5 . Dopisz dwa kolejne takie wyrażenia i oblicz ich wartość. Dostrzegając prawidłowość w tworzeniu takich wyrażeń podaj wartość piętnastego i dwudziestego takiego wyrażenia.

### `5fd714e9` · wojewodzki_2018-2019_malopolskie_q16 · conf high
- **key:** `Miara kąta PAR jest równa mierze kąta BKP (dowód).` · **model:** `∠PAR = ∠BKP (teza prawdziwa)`
- **Q:** W prostokącie ABCD punkt P jest środkiem boku BC , punkt R – środkiem boku CD , a punkt K – punktem przecięcia odcinków DP i BR . Udowodnij, że miara kąta PAR jest równa mierze kąta BKP .

### `24c1317c` · wojewodzki_2018-2019_warminsko-mazurskie_q17 · conf high
- **key:** `Suma pięciu kolejnych liczb nieparzystych ma postać 10n+25 = 5(2n+5), więc jest podzielna przez 5.` · **model:** `n+(n+2)+(n+4)+(n+6)+(n+8) = 5n+20 = 5(n+4) – suma jest wielokrotnością 5`
- **Q:** Uzasadnij, że suma pięciu kolejnych liczb nieparzystych jest podzielna przez 5. Zapisz swoje uzasadnienie.

### `61650bf4` · wojewodzki_2018-2019_zachodniopomorskie_q18 · conf high
- **key:** `Trójkąt ABC jest prostokątny (kąt prosty przy wierzchołku C)` · **model:** `Trójkąt ABC jest prostokątny (kąt ACB = 90°), bo E jako środek AB spełniający EA=EB=EC jest środkiem okręgu opisanego na trójkącie ABC, a AB — jako że EA=EB — j …`
- **Q:** W trójkącie ABC punkt E jest środkiem boku AB oraz zachodzą równości: | AE | = | CE | oraz | CE | = | BE | . Uzasadnij, że trójkąt ABC jest prostokątny.

### `3b61290c` · wojewodzki_2019-2020_malopolskie_q15 · conf high
- **key:** `3,5√41 cm` · **model:** `7√41/2 cm ≈ 22,41 cm`
- **Q:** Podstawą ostrosłupa jest kwadrat, a jedna z krawędzi ostrosłupa jest jego wysokością. Bok kwadratu i wysokość tego ostrosłupa pozostają w stosunku 8 : 6. Oblicz długość najdłuższej krawędzi tego ostrosłupa, wiedząc, że pole powierzchni bocznej tego ostrosłupa wynosi 392 cm². Zapisz obliczenia.

### `478dd036` · wojewodzki_2019-2020_slaskie_q16 · conf high
- **key:** `Tak, te trójkąty mogą być przystające.` · **model:** `Tak, trójkąty są przystające`
- **Q:** Jeden z boków trójkąta prostokątnego równoramiennego ma długość ( 3 + 2 ) cm. Czy ten trójkąt może być przystający do trójkąta prostokątnego równoramiennego, którego jeden bok ma długość ( 2 + 6 ) cm? Odpowiedź uzasadnij.

### `455f9df6` · wojewodzki_2019-2020_swietokrzyskie_q12 · conf high
- **key:** `V = 126√3 cm³, P = 756 + 2√3 cm² = 2(√3 + 378) cm²` · **model:** `V = 126√3 cm³ ≈ 218,24 cm³; Pole powierzchni = (756+2√3) cm² ≈ 759,46 cm²`
- **Q:** Czarek wykonał z kartonu 7 modeli graniastosłupów o podstawie trójkąta równobocznego. Krawędź podstawy każdego modelu graniastosłupa była równa 2 cm. Gdy te modele były ułożone od najmniejszego do największego, to wysokości każdych dwóch sąsiednich modeli różniły się o 4 cm. Suma wysokości trzech najmniejszych modeli b …

### `3deb05a4` · wojewodzki_2019-2020_warminsko-mazurskie_q20 · conf high
- **key:** `Suma długości wszystkich wysokości wynosi 11√5 cm.` · **model:** `110√5 mm (≈ 245,96 mm ≈ 24,6 cm)`
- **Q:** Dany jest trójkąt równoramienny, którego każde z ramion ma długość 90 mm, a obwód trójkąta 0,3 m. Oblicz sumę długości wszystkich wysokości tego trójkąta.

### `3240dc8d` · wojewodzki_2019_lubuskie_q27 · conf high
- **key:** `AK = BL (trójkąty ABK i ABL są przystające na podstawie cechy kąt-bok-kąt)` · **model:** `AK = BL (trójkąty ABK i BAL są przystające, cecha kbk)`
- **Q:** Trójkąt ABC przedstawiony na rysunku obok jest równoramienny (AC = BC). Z wierzchołków A i B zostały poprowadzone dwusieczne kątów, które przecinają ramiona trójkąta w punktach K i L. Uzasadnij, że długości odcinków AK i BL są takie same.

### `b186f3c2` · wojewodzki_2020-2021_slaskie_q16 · conf high
- **key:** `Trójkąt jest prostokątny — kąt, z którego poprowadzono środkową, jest prosty.` · **model:** `Tak — trójkąt jest prostokątny (dowód poniżej).`
- **Q:** Środkowa trójkąta to odcinek łączący wierzchołek trójkąta ze środkiem przeciwległego boku. Uzasadnij, że jeśli w trójkącie długość pewnej środkowej jest równa połowie długości boku, do którego została poprowadzona, to ten trójkąt jest prostokątny.

### `0ee2c9d0` · wojewodzki_2020_dolnoslaskie_q2 · conf high
- **key:** `(1, 4), (1, 9), (2, 8), (4, 9)` · **model:** `(k,m) ∈ {(1,4), (1,9), (2,8), (4,9)}`
- **Q:** Liczby naturalne k i m spełniają warunek 0 < k < m < 10 . Podaj wszystkie pary ( k , m ) , dla których wartość wyrażenia m + k m − k jest liczbą naturalną. Zapisz wszystkie obliczenia.

### `3e3a5088` · wojewodzki_2020_dolnoslaskie_q4 · conf high
- **key:** `Oba związki zachodzą` · **model:** `Tożsamości są prawdziwe: L1 = 4 = (t−2)²/2 oraz L2 = 2√2+√(4−2√2) = t−2+√(6−t), gdzie t=2+2√2 (dowód w rozwiązaniu).`
- **Q:** Dane są dwa prostokąty o wymiarach 1 i 2 . W każdym z nich umieszczono trójkąt równoramienny tak, jak na rysunkach. Oznaczmy: t – obwód danego prostokąta, L 1 – obwód trójkąta na rysunku 1, L 2 – obwód trójkąta na rysunku 2. Wykaż, że zachodzą związki: a) L 1 = ( t − 2 ) 2 2 ; b) L 2 = t − 2 + 6 − t . Zapisz wszystkie  …

### `02beb1c9` · wojewodzki_2020_dolnoslaskie_q6 · conf high
- **key:** `Graniastosłup jest sześcianem (h = a)` · **model:** `h = a (wysokość graniastosłupa równa krawędzi podstawy), więc bryła jest sześcianem.`
- **Q:** Na rysunku przedstawiono graniastosłup prawidłowy czworokątny ABCDEFGH . Punkt Z jest środkiem krawędzi bocznej AE , a punkty X i Y są środkami odpowiednio krawędzi AB i EH . Kąt XZY ma miarę 120 ° . Uzasadnij, że ten graniastosłup jest sześcianem. Zapisz wszystkie obliczenia.

### `08d2e1bc` · wojewodzki_2020_mazowieckie_q10 · conf high
- **key:** `Pole trapezu jest równe h² (teza udowodniona)` · **model:** `Pole trapezu jest równe h² (dowód)`
- **Q:** Uzasadnij, że pole trapezu równoramiennego o wysokości h , którego przekątne są prostopadłe, jest równe h 2 .

### `71d835b6` · wojewodzki_2020_opolskie_q10 · conf high
- **key:** `66⅔ cm²` · **model:** `200/3 cm² (66 2/3 cm² ≈ 66,67 cm²)`
- **Q:** Wysokość poprowadzona z wierzchołka kąta prostego trójkąta prostokątnego ma długość 8 cm, a jedna z przyprostokątnych tego trójkąta ma długość 10 cm. Oblicz pole tego trójkąta.

### `c3e37294` · wojewodzki_2020_opolskie_q8 · conf high
- **key:** `Równość jest prawdziwa (dowód)` · **model:** `0 = 0 (równość prawdziwa)`
- **Q:** Uzasadnij, że prawdziwa jest równość 3 − 48 ( 3 − 2 ) ( 3 + 5 ) ( 2 + 3 ) ( 5 − 3 ) = 0 .

### `abed092d` · wojewodzki_2020_podlaskie_q21 · conf high
- **key:** `Suma pól ćwierćkół na przyprostokątnych jest równa polu ćwierćkoła na przeciwprostokątnej, ponieważ z twierdzenia Pitagorasa a² + b² = c².` · **model:** `Wynika wprost z tw. Pitagorasa: a²+b²=c², więc ¼πa²+¼πb²=¼πc².`
- **Q:** Udowodnij, że suma pól ćwierćkół zbudowanych na przyprostokątnych trójkąta prostokątnego jest równa polu ćwierćkoła zbudowanego na jego przeciwprostokątnej.

### `4f683ed6` · wojewodzki_2020_podlaskie_q25 · conf high
- **key:** `A = (−2, −3), B = (−2, 3); pole = 18, obwód = 6 + 6√5` · **model:** `A=(-2,-3), B=(-2,3); Pole ABC = 18; Obwód ABC = 6+6√5 ≈ 19,42`
- **Q:** W prostokątnym układzie współrzędnych zaznaczono trzy punkty: A = ( − b + 5 , 2 a − 1 ) , B = ( − 2 a − 4 , − a + 2 ) i C = ( 4 , 0 ) . Wiedząc, że punkty A i B są symetryczne względem osi x , wyznacz ich współrzędne oraz oblicz pole i obwód trójkąta ABC .

### `e396518f` · wojewodzki_2021-2022_pomorskie_q4 · conf high
- **key:** `Tak, liczba 2^2005 ma ponad 600 cyfr` · **model:** `Tak, ma ponad 600 cyfr (dokładnie 604 cyfry)`
- **Q:** Sprawdź, czy liczba 2 2005 ma ponad 600 cyfr. Odpowiedź uzasadnij.

### `c84efd87` · wojewodzki_2021-2022_slaskie_q14 · conf high
- **key:** `Obwód trójkąta ABC wynosi 4(3 + √2 + √3) cm, a jego pole 8(√3 + 1) cm².` · **model:** `Obwód = (12 + 4√2 + 4√3) cm; Pole = (8 + 8√3) cm²`
- **Q:** Dany jest trójkąt ABC , w którym kąt CAB jest równy 30°, a kąt ABC jest równy 45°. Oblicz obwód i pole trójkąta ABC , jeżeli wysokość prostopadła do boku AB ma długość 4 cm.

### `0b21a1f7` · wojewodzki_2021-2022_warminsko-mazurskie_q20 · conf high
- **key:** `Objętość graniastosłupa jest równa (3+√3)·100 cm³ (czyli 300+100√3 cm³).` · **model:** `100(3+√3) cm³ ≈ 473,2 cm³`
- **Q:** Dany jest graniastosłup prosty o wysokości 0,5 m. Oblicz jego objętość wiedząc, że podstawą graniastosłupa jest trapez o krótszej podstawie długości 2 cm i ramionach długości 2 2 cm i 4 cm tworzących z dłuższą podstawą kąty o miarach 45° i 30°. Wykonaj rysunek pomocniczy zgodny z warunkami zadania.

### `4067bb45` · wojewodzki_2021_dolnoslaskie_q2 · conf high
- **key:** `Każda ściana boczna jest kwadratem (krawędź boczna b = a)` · **model:** `h = a, więc każda ściana boczna (prostokąt a×h) jest kwadratem.`
- **Q:** Średnia arytmetyczna długości wszystkich krawędzi pewnego graniastosłupa prawidłowego n -kątnego ( n ≥ 3 ) jest równa długości krawędzi podstawy tej bryły. Uzasadnij, że wszystkie jej ściany boczne są kwadratami.

### `98281fce` · wojewodzki_2021_dolnoslaskie_q4 · conf high
- **key:** `24000 cm²` · **model:** `23400 cm² (2,34 m²)`
- **Q:** Trzy prostopadłościenne belki ‒ każda o wymiarach 10 cm × 10 cm × 200 cm sklejono tak, jak na rysunku. Oblicz pole powierzchni otrzymanej bryły.

### `715e1902` · wojewodzki_2021_dolnoslaskie_q5 · conf high
- **key:** `Iloczyn jest ujemny (nierówność zachodzi)` · **model:** `Iloczyn jest ujemny: pierwszy czynnik 0 (bo 2z>x+y), więc ich iloczyn < 0.`
- **Q:** Dla liczb x , y , z takich, że 0 < x < y < z określamy wyrażenia: p = x + y 2 , q = x + z 2 , r = y + z 2 . Uzasadnij, że ( p + q 2 − r ) ( q + r 2 − p ) < 0 .

### `0d5d0a2b` · wojewodzki_2021_lubuskie_q28 · conf high
- **key:** `Suma pól trapezów I i II jest równa sumie pól trapezów III i IV.` · **model:** `Suma pól trapezów I i II oraz III i IV wynosi po (A²−a²)/2, gdzie A i a to boki dużego i małego kwadratu`
- **Q:** Wewnątrz kwadratu leży mniejszy kwadrat. Boki obu kwadratów są odpowiednio równoległe. Wierzchołki tych kwadratów zostały połączone w taki sposób, jak pokazuje rysunek. Uzasadnij, że suma pól trapezów I i II jest równa sumie pól trapezów III i IV.

### `0b78b4d7` · wojewodzki_2021_mazowieckie_q10 · conf high
- **key:** `Prosta dzieli otrzymaną figurę na dwie części o równych polach (teza udowodniona)` · **model:** `Prosta przez środki symetrii obu figur dzieli równoległobok i romb na połowy pól, więc dzieli też figurę z otworem na dwie części o równych polach (po S/2 − r/2 …`
- **Q:** Z równoległoboku wycięto romb tak, jak na rysunku. Narysuj prostą przechodzącą przez środki symetrii równoległoboku i rombu, a następnie uzasadnij, że ta prosta dzieli otrzymaną figurę na dwie figury o równych polach.

### `efeca3f1` · wojewodzki_2021_opolskie_q6 · conf high
- **key:** `Teza jest prawdziwa (dowód)` · **model:** `Dowód: dla n=3k+1 lub n=3k+2, n² = 3(3k²+2k)+1 lub 3(3k²+4k+1)+1, więc reszta z dzielenia n² przez 3 zawsze wynosi 1.`
- **Q:** Wykaż, że jeżeli liczba naturalna nie jest podzielna przez 3, to jej kwadrat daje przy dzieleniu przez 3 resztę 1.

### `23aaa2f9` · wojewodzki_2021_opolskie_q7 · conf high
- **key:** `około 90,5%` · **model:** `19/21 ≈ 90,48% (dokładnie 90 10/21 %)`
- **Q:** Świeże pomidory zawierają około 95% wody. Po wstępnym suszeniu połowa wody wyparowała z pomidorów. Oblicz, jaki procent podsuszonych pomidorów teraz stanowi woda.

### `a924048e` · wojewodzki_2021_podkarpackie_q12 · conf high
- **key:** `Liczba jest równa 8 + 8⁴ + … + 8²⁹⁸, więc jest liczbą naturalną` · **model:** `Tak — 300 wyrazów dzieli się na 100 grup po 3, każda podzielna przez 73, więc iloraz jest liczbą naturalną.`
- **Q:** Wykaż, że liczba 8 + 8 2 + 8 3 + … + 8 300 73 jest liczbą naturalną. Zapisz obliczenia.

### `71a2dbb2` · wojewodzki_2021_podlaskie_q24 · conf high
- **key:** `najkrótsza wysokość = 3 9/17 cm` · **model:** `60/17 cm ≈ 3,53 cm`
- **Q:** W trójkącie prostokątnym najdłuższy bok jest o 4,5 cm dłuższy od najkrótszego boku. Średni bok ma długość 7,5 cm. Oblicz długość najkrótszej wysokości tego trójkąta.

### `258c19eb` · wojewodzki_2022_lubelskie_q12 · conf high
- **key:** `a) 22 25 , b) 20%, c) 2` · **model:** `a) 22/25 (88%); b) 20%; c) 2`
- **Q:** W klasie 8a przeprowadzono ankietę, w której zapytano uczniów o liczbę posiadanego przez nich rodzeństwa. Wyniki przedstawione są w poniższej tabeli. Liczba uczniów klasy 8a 9 11 2 2 1 Liczba posiadanego rodzeństwa 0 1 2 3 4 Uzupełnij luki w poniższych zdaniach – wpisz w puste miejsca odpowiednie liczby. a) Prawdopodob …

### `c7cc8b34` · wojewodzki_2022_lubelskie_q13 · conf high
- **key:** `a) (7; 5), b) 60, c) 2 10 + 130` · **model:** `a) C = (7, 5); b) 60 j.²; c) (2√10+√130) j. ≈ 17,73 j.`
- **Q:** Punkty A = ( − 2 ; − 2 ) i B = ( 4 ; − 4 ) są wierzchołkami prostokąta ABCD , którego przekątne AC i BD przecinają się w punkcie S = ( 2 1 2 ; 1 1 2 ) . Uzupełnij luki w poniższych zdaniach – wpisz w puste miejsca odpowiednie liczby. a) Wierzchołek C prostokąta ABCD ma współrzędne …… . b) Pole prostokąta ABCD wynosi …… …

### `6aa3ff8e` · wojewodzki_2022_lubelskie_q14 · conf high
- **key:** `a) 12 + 4 2 , b) 37 , c) 16,5` · **model:** `a) (12+4√2) cm ≈ 17,66 cm; b) √37 cm ≈ 6,08 cm; c) 16,5 cm²`
- **Q:** Kąt ostry równoległoboku ABCD ma miarę 45°, a długości boków tego równoległoboku wynoszą: | AB | = 10 cm i | AD | = 4 2 cm. Symetralna boku AB przecina bok AB w punkcie E , a bok CD w punkcie F . Punkt G położony jest na boku BC tak, że | BG | : | GC | = 1 : 3 . Prosta prostopadła do boku BC i przechodząca przez punkt  …

### `15a6a569` · wojewodzki_2022_lubelskie_q17 · conf high
- **key:** `3 5 cm` · **model:** `3√5 cm ≈ 6,71 cm`
- **Q:** W trójkącie prostokątnym ABC krótsza przyprostokątna AC ma długość 6 5 cm. Punkt E jest środkiem przeciwprostokątnej AB i | CE | = 15 cm. Wysokość CD tego trójkąta ma długość 12 cm. Oblicz długość wysokości trójkąta BCE poprowadzonej z wierzchołka E na bok BC .

### `3040a4b1` · wojewodzki_2022_lubelskie_q18 · conf high
- **key:** `a) 18 5 cm³, b) ( 108 + 9 3 + 27 7 ) cm²` · **model:** `a) 18√5 cm³ ≈ 40,25 cm³; b) (108 + 9√3 + 27√7) cm² ≈ 195,02 cm²`
- **Q:** Podstawy graniastosłupa prawidłowego i ostrosłupa prawidłowego są przystającymi trójkątami. Wszystkie krawędzie graniastosłupa są równej długości, a jego objętość wynosi 54 3 cm³. Długość krawędzi bocznej ostrosłupa jest równa długości przekątnej ściany bocznej graniastosłupa. a) Oblicz objętość tego ostrosłupa. b) Gra …

### `73d3db08` · wojewodzki_2022_lubelskie_q9 · conf high
- **key:** `68 4 7 km/h` · **model:** `480/7 km/h (68 4/7 km/h ≈ 68,57 km/h)`
- **Q:** Pan Maciej przejechał samochodem z miejscowości A do miejscowości B. Pierwszą połowę drogi pokonał ze średnią prędkością 80 km/h, a drugą połowę – ze średnią prędkością 60 km/h. Ile wynosiła średnia prędkość, z jaką pan Maciej przejechał całą drogę z miejscowości A do miejscowości B?

### `e1a49a05` · wojewodzki_2022_mazowieckie_q10 · conf high
- **key:** `Nie, łączna powierzchnia czerwonych klocków jest równa powierzchni zielonego klocka` · **model:** `Nie, są równe — obie powierzchnie wynoszą (3+√3)a², gdzie a to krawędź sześcianu.`
- **Q:** Filip z drewnianego klocka sześciennego odciął wszystkie „rogi” i w ten sposób otrzymał nowe klocki. Na rysunku pokazano sposób odcięcia jednego „rogu”, a zaznaczone punkty A , B , C są środkami krawędzi sześcianu. Klocki w kształcie „rogów” Filip pomalował na czerwono, a pozostały klocek na zielono. Czy łączna powierz …

### `0edc3295` · wojewodzki_2022_opolskie_q10 · conf high
- **key:** `Teza jest prawdziwa (dowód)` · **model:** `Dla n≡1 (mod 3): n²+2≡3≡0; dla n≡2 (mod 3): n²+2≡6≡0 (mod 3) — w obu przypadkach 3 | (n²+2).`
- **Q:** Udowodnij, że jeżeli liczba naturalna n nie jest podzielna przez 3, to liczba n 2 + 2 jest podzielna przez 3.

### `29c26540` · wojewodzki_2022_podkarpackie_q15 · conf high
- **key:** `Pole trójkąta = 30, najkrótsza wysokość = 60/13 (4 8/13)` · **model:** `Pole = 30 cm²; najkrótsza wysokość = 60/13 cm ≈ 4,62 cm`
- **Q:** Dany jest trójkąt prostokątny, w którym długości boków są równe: 12 , x + 1 , x − 7 (rysunek). Oblicz pole tego trójkąta oraz długość najkrótszej wysokości. Zapisz obliczenia i odpowiedź.

### `4151a4bb` · wojewodzki_2022_podkarpackie_q17 · conf high
- **key:** `Punkty (1, 12), (12, 1), (3, 4), (4, 3); wielokąt to trapez o polu 36` · **model:** `Punkty: (1,12), (3,4), (4,3), (12,1); pole wielokąta = 36`
- **Q:** W prostokątnym układzie współrzędnych zaznacz wszystkie punkty, których współrzędne x i y są liczbami naturalnymi spełniającymi równocześnie dwa warunki: NWW ( x , y ) = 12 oraz NWD ( x , y ) = 1 . Połącz te punkty w taki sposób, aby otrzymać wielokąt i oblicz jego pole. Zapisz obliczenia i odpowiedź.

### `b957cc7e` · wojewodzki_2022_podkarpackie_q19 · conf high
- **key:** `682⅔√2 cm³ (czyli 2048√2/3 cm³)` · **model:** `V = 2048√2/3 cm³ ≈ 965,44 cm³`
- **Q:** Do zbudowania ostrosłupa prawidłowego użyto tylko dwóch rodzajów figur: trójkątów równobocznych oraz kwadratu. Pole jednego trójkąta równobocznego jest równe 64 3 cm². Oblicz objętość tego ostrosłupa. Zapisz obliczenia i odpowiedź.

### `6aa250b3` · wojewodzki_2023-2024_malopolskie_q13 · conf high
- **key:** `a) 6; b) 2²² (= 4194304); c) I: FAŁSZ, II: PRAWDA, III: PRAWDA; d) dowód, iloraz n³ − 3n² + 2n` · **model:** `a) 6; b) 2^22; c) I – FAŁSZ, II – FAŁSZ, III – PRAWDA; d) n!/(n−3)! = n(n−1)(n−2) = n³−3n²+2n`
- **Q:** Iloczyn wszystkich dodatnich liczb naturalnych nie większych niż n można zapisać jako n ! , co czytamy jako „ n silnia", gdzie n jest liczbą naturalną. 1 · 2 · 3 · … · ( n − 2 ) · ( n − 1 ) · n = n ! Przykładowo: 4 ! = 1 · 2 · 3 · 4 = 24 . Osobno określa się, że 0 ! jest równe 1. a) (2p) Podaj, ile zer występuje na koń …

### `aedb4398` · wojewodzki_2023-2024_pomorskie_q3 · conf high
- **key:** `W stopie I (zawartość złota: I – 91⅞%, II – 70%, III – 70%)` · **model:** `Stop I miał największą zawartość procentową złota (91,875%)`
- **Q:** W pewnym zakładzie stopiono trzy różne stopy złota: stop I, stop II oraz stop III i otrzymano 700 gramów stopu, w którym czyste złoto stanowi 75% jego masy. Stosunek mas użytych stopów jest równy odpowiednio 8 : 12 : 15 . Stosunek mas czystego złota zawartego w tych stopach jest równy odpowiednio 7 : 8 : 10 . Oblicz, w …

### `9ceb04c8` · wojewodzki_2023_dolnoslaskie_q3 · conf high
- **key:** `Trójkąty BCE i BCF są przystające (cecha bok-bok-bok).` · **model:** `BC – bok wspólny, BE = CF, CE = BF, więc △BCE ≅ △BCF (cecha bok-bok-bok)`
- **Q:** W trapezie prostokątnym ABCD , przedstawionym na rysunku, punkt E jest środkiem boku AD , a punkt F jest spodkiem wysokości CF . Na rysunku podano także miary niektórych kątów. Wykaż, że trójkąty BCE i BCF są przystające.

### `3325b900` · wojewodzki_2023_lubelskie_q16 · conf high
- **key:** `( 108 + 36 3 ) cm²` · **model:** `(108+36√3) cm² ≈ 170,35 cm²`
- **Q:** W sześcianie o krawędzi długości 6 cm połączono odcinkami środki jego krawędzi. Następnie powstałe w ten sposób naroża odcięto. Oblicz pole powierzchni całkowitej bryły otrzymanej po odcięciu naroży.

### `888ef3e9` · wojewodzki_2023_lubuskie_q27 · conf high
- **key:** `Śliwa (drzewo o numerze 3).` · **model:** `śliwa`
- **Q:** Pewien bogacz „dziwak” pozostawił swoim dzieciom taki oto testament: W moim ogrodzie rosną kolejno posadzone drzewa: 1 – czereśnia, 2 – grusza, 3 – śliwa, 4 – jabłoń. Pod jednym z nich zakopałem skarb. Żeby go znaleźć, musicie zrywać po jednym liściu z drzewa w następującej kolejności: 12343212343…. Pod drzewem, z któr …

### `9f2f610e` · wojewodzki_2023_opolskie_q7 · conf high
- **key:** `Nie zmieszczą się` · **model:** `Nie, nie zmieszczą się (potrzebna średnica ok. 24,14 cm > 24 cm).`
- **Q:** Czy w garnku o średnicy 24 cm zmieszczą się 4 słoiki o promieniu 5 cm każdy? Odpowiedź uzasadnij.

### `9e1aa815` · wojewodzki_2023_opolskie_q8 · conf high
- **key:** `Teza jest prawdziwa (dowód)` · **model:** `Dowód: dla n=4k lub n=4k+2 liczba n lub n² jest podzielna przez 4; dla n nieparzystego n²−1=(n−1)(n+1) — iloczyn dwóch kolejnych liczb parzystych, więc podzieln …`
- **Q:** Udowodnij, że dla każdej liczby naturalnej n co najmniej jedna z liczb n , n 2 , n 2 − 1 jest podzielna przez 4.

### `d7a9d9db` · wojewodzki_2023_podkarpackie_q9 · conf high
- **key:** `Punkty K i L leżą na okręgu o średnicy BD, a kąty KBD i KLD są kątami wpisanymi opartymi na tym samym łuku KD, więc są równe` · **model:** `Teza prawdziwa: |∡KBD| = |∡KLD| (dowód przez punkty współokręgowe).`
- **Q:** Punkt D leży we wnętrzu kąta ostrego ABC . Punkty K i L leżą odpowiednio na półprostych BA i BC , a kąty BKD i BLD są proste. Udowodnij, że | ∡ KBD | = | ∡ KLD | .

### `467d233a` · wojewodzki_2023_podlaskie_q13 · conf high
- **key:** `a) (½x − 6y)² = ¼x² − 6xy + 36y²; b) 0, 1 lub 3; c) trzy próby; d) nie; e) 21 uczniów; f) a−1, a, a+1; g) (√5 + 5² + x)/3; h) 20 (lub −20)` · **model:** `a) (1/2·x − 6y)² = 1/4x² − 6xy + 36y² (brakujące: 1/2 x; 6xy; 36y²); b) 0, 1 lub 3; c) 3 próby; d) Nie (najmniejsza suma 6 różnych liczb to 0+1+2+3+4+5=15>13);  …`
- **Q:** Udziel odpowiedzi: a) Uzupełnij: ( …… − 6 y ) 2 = 1 4 x 2 − …… + …… b) Ile osi symetrii może mieć trójkąt? c) Wyobraź sobie, że masz trzy klucze do trzech zamków. Ile prób co najwyżej musisz wykonać, by dowiedzieć się, który klucz pasuje do którego zamka? d) Czy można do sześciu pudełek włożyć 13 przedmiotów tak, aby w …

### `0b6e61ad` · wojewodzki_2024-2025_malopolskie_q14 · conf high
- **key:** `a) 4; b) dowód (pole = 4(n−1)); c) n nieparzyste większe od 2; d) 12n − 16; e) n = 7` · **model:** `a) 4 osie symetrii; b) Pole R_n=n²-(n-2)²=4(n-1) - podzielne przez 4; c) n nieparzyste, n>2 (n=3,5,7,...); d) liczba sześcianów = 12n-16; e) n=7`
- **Q:** Przystające kwadraty o wymiarach 1 × 1 łączymy dokładnie dwoma bokami każdego z nich tak, aby zarówno zewnętrzny jak i wewnętrzny brzeg otrzymanej figury były kwadratami. Otrzymaną figurę nazywamy ramą R n , gdzie n oznacza długość boku zewnętrznego kwadratu i n jest liczbą naturalną większą od 2. Poniżej na rysunku pr …

### `1fb5bf8d` · wojewodzki_2024-2025_slaskie_q16 · conf high
- **key:** `6/5 godziny (72 minuty)` · **model:** `1 godzina 12 minut (1,2 h)`
- **Q:** Basen napełniany jest przez dwa niezależne krany. Pierwszy z nich napełnia pusty basen wodą w ciągu 2 godzin, a drugi napełnia pusty basen w ciągu 3 godzin. Oblicz, ile czasu potrzeba na napełnienie pustego basenu, jeśli odkręcimy obydwa krany jednocześnie. Zapisz obliczenia.

### `cf7bc105` · wojewodzki_2024-2025_warminsko-mazurskie_q19 · conf high
- **key:** `Równość jest prawdziwa.` · **model:** `Tak, równość jest prawdziwa: √(13+4√3) = 2√3+1`
- **Q:** Na podstawie definicji pierwiastka arytmetycznego sprawdź, czy prawdziwa jest równość: 13 + 4 3 = 2 3 + 1 ? Zapisz obliczenia.

### `1317761c` · wojewodzki_2024_podlaskie_q17 · conf high
- **key:** `Poprawny sześciokąt o środku symetrii, którego nie wszystkie boki są jednakowej długości, z wierzchołkami w punktach kratowych.` · **model:** `Sześciokąt o wierzchołkach np. (2,0), (1,1), (−1,1), (−2,0), (−1,−1), (1,−1) na siatce kwadratowej`
- **Q:** Narysuj sześciokąt, który ma środek symetrii oraz nie wszystkie jego boki są jednakowej długości. Wierzchołki umieść w punktach kratowych.

### `51a9a6a3` · wojewodzki_2024_podlaskie_q19 · conf high
- **key:** `Trójkąty ABC i CDA są przystające (np. na podstawie własności równoległoboku lub cechy bkb / kbk / bbb).` · **model:** `Trójkąty ABC i CDA są przystające (cecha bkb/kbk, wynikająca z własności równoległoboku ABCD)`
- **Q:** Na rysunku proste k i m są równoległe oraz α = β . Wykaż, że trójkąty ABC i CDA są przystające. Podaj, z której cechy przystawania lub własności figury korzystasz w rozwiązaniu.

### `392a8ceb` · wojewodzki_2024_podlaskie_q24 · conf high
- **key:** `Nie, pan Antoni nie dotrzyma (nie dotrzymał) obietnicy.` · **model:** `Nie, pan Antoni nie dotrzyma obietnicy`
- **Q:** Z pnia jabłoni, która rośnie w sadzie pana Antoniego, wyrastają 3 konary. Z każdego konara wyrastają 4 gałęzie, a z każdej gałęzi wyrasta 5 gałązek. Na każdej gałązce rosło 6 lub 7 jabłek, niestety zawsze wśród nich jedno lub dwa były robaczywe. Pan Antoni postanowił zerwać jabłka z jabłoni, ale obiecał pani Zosi, że z …

### `29cfc6ff` · wojewodzki_2025-2026_malopolskie_q13 · conf high
- **key:** `a) I. 2^b·3^b, II. 2^a·3^a; c) {m=2^8·3², n=2²·3³} oraz {m=2²·3³, n=2^8·3²} (wraz z zamianą m i n)` · **model:** `a) I. NWW = 2^b·3^b; II. NWD = 2^a·3^a. b) Obie strony równania są zawsze równe 12^c (z praw absorpcji NWW(x,NWD(x,y))=x oraz NWD(x,NWW(x,y))=x; przy danym waru …`
- **Q:** a) (2p) Dane są dwie liczby pierwsze a oraz b takie, że a < b . Zapisz wyrażenia równe podanym poniżej: I. NWW ( 2 a · 3 b , 2 b · 3 a ) = … II. NWD ( 2 a · 3 b , 2 b · 3 a ) = … b) (4p) Wykaż, że dla liczb naturalnych c oraz d takich, że 1 2 d < c < 3 4 d prawdziwe jest równanie NWW ( 12 c , NWD ( 12 c , 18 d ) ) = NW …

### `c8e19eb0` · wojewodzki_2025-2026_malopolskie_q14 · conf high
- **key:** `a) 2,25√3 + 9 + π; b) (2a + 3a√2 + a√6)/2 + 2π; c) dowód` · **model:** `a) 9 + 9√3/4 + π; b) obwód F = a(2+3√2+√6)/2 + 2π; c) dowód: łuki sumują się do pełnego okręgu o promieniu 1 (suma kątów zewnętrznych trójkąta = 360°), a proste …`
- **Q:** Figurę F otrzymano w następujący sposób: na każdym boku trójkąta ABC zbudowano prostokąt o długości równej bokowi trójkąta i szerokości równej 1. Następnie z każdego wierzchołka trójkąta ABC zakreślono łuki, będące częścią okręgu, łączące wierzchołki prostokątów. a) (3p) Niech trójkąt ABC będzie trójkątem równobocznym  …

### `ea22b32c` · wojewodzki_2025-2026_slaskie_q17 · conf high
- **key:** `a) pole = 18¾π (= 75/4 π); b) obwód = 7½π + 20 (= 15/2 π + 20)` · **model:** `a) 25π/2; b) 10+10π`
- **Q:** W półkolu o środku A i promieniu 10 umieszczono okrąg w ten sposób, że odcinki AB i CD to jego prostopadłe średnice. Punkt B jest punktem wspólnym okręgu i półokręgu. (Zobacz rysunek.) a) Oblicz pole zamalowanej figury. b) Oblicz obwód zamalowanej figury. Zapisz obliczenia.

### `6fc678c1` · wojewodzki_2025_lodzkie_q4 · conf high
- **key:** `A) NIE; B) TAK; C) NIE` · **model:** `A) Nie (np. 2·6=12 nie dzieli się przez 8); B) Tak, zawsze dzieli się przez 8; C) Nie (np. 5·7=35 nie dzieli się przez 3)`
- **Q:** A) Czy iloczyn dwóch dowolnych różnych liczb parzystych jest liczbą podzielną przez 8? Odpowiedź uzasadnij. B) Czy iloczyn dwóch kolejnych liczb parzystych jest liczbą podzielną przez 8? Odpowiedź uzasadnij. C) Czy iloczyn dwóch kolejnych liczb nieparzystych jest liczbą podzielną przez 3? Odpowiedź uzasadnij.

### `e29a80e2` · wojewodzki_2025_lodzkie_q5 · conf high
- **key:** `155000000 (155 milionów)` · **model:** `155 000 000 osób`
- **Q:** Kamala Harris zdobyła w wyborach prezydenckich w 2024 roku 75019257 głosów, co — z dokładnością jednego miejsca po przecinku — stanowiło 48,4% oddanych głosów. Donald Trump zdobył 77303573 głosów, co — z dokładnością jednego miejsca po przecinku — stanowiło 49,9% oddanych głosów. Ile osób głosowało w tych wyborach? Wyn …

### `913cdd5d` · wojewodzki_2025_lodzkie_q7 · conf high
- **key:** `a) np. x_C = −7+√2 lub 3+√2, x_D = −10+√2 lub √2, y_D = 3+√3; b) x_C, x_D dowolne tak, by |AD|=|BC|≠5, oraz y_D = 3+√3` · **model:** `a) x_C = 3+√2, x_D = √2, y_D = 3+√3; b) np. x_C = 1, x_D = -2, y_D = 3+√3`
- **Q:** W kartezjańskim układzie współrzędnych dane są punkty A ( − 5 + 2 , 3 + 3 ) oraz B ( − 2 + 2 , − 1 + 3 ) . Podaj przykłady liczb x C , x D i y D , dla których punkty C ( x C , − 1 + 3 ) i D ( x D , y D ) tworzą z punktami A i B : a) romb ABCD ; b) równoległobok ABCD , który nie jest rombem.

### `047b79e2` · wojewodzki_2025_mazowieckie_q3 · conf high
- **key:** `Więcej użyła niebieskiej wstążki (prezent dla taty)` · **model:** `Więcej wstążki zużyła na prezent dla taty (niebieskiej), bo a+b>2c.`
- **Q:** Asia zapakowała prezenty dla rodziców do dwóch jednakowych prostopadłościennych pudełek o wymiarach a × b × c , przy czym a + b > 2 c . Następnie paczkę dla mamy obwiązała różową wstążką, prezent dla taty niebieską wstążką tak, jak na rysunku. Której wstążki użyła więcej? Odpowiedź uzasadnij.

### `112d16d9` · wojewodzki_2025_mazowieckie_q5 · conf high
- **key:** `Pola trójkątów AOD i BOC są równe (czworokąt ABCD jest trapezem)` · **model:** `Pola trójkątów AOD i BOC są równe, bo AB∥DC (stąd trójkąty ABD i ABC mają równe pola, więc po odjęciu wspólnego pola AOB pozostają równe pola AOD i BOC).`
- **Q:** W czworokącie wypukłym ABCD długości boków AD i DC są równe. Przekątne przecinają się w punkcie O , a przekątna AC dzieli kąt BAD na połowy. Uzasadnij, że pola trójkątów AOD i BOC są równe.

### `39c6a7ea` · wojewodzki_2025_mazowieckie_q7 · conf high
- **key:** `W drugim miesiącu` · **model:** `W drugim miesiącu (zarobek: 0,20·p·x, wobec 0,15·p·x w I i 0,12·p·x w III, gdzie p — cena rynkowa, x — liczba kg sprzedanych w I miesiącu)`
- **Q:** Pan Henryk prowadzi sklep warzywniczy. W hurtowni kupował ziemniaki przez trzy kolejne miesiące w cenie o 20% poniżej ceny rynkowej za kilogram. W pierwszym miesiącu pan Henryk sprzedał ziemniaki o 5% taniej od ceny rynkowej. W drugim miesiącu sprzedał je o 10% poniżej ceny rynkowej, ale liczba sprzedanych kilogramów b …

### `7e5835fa` · wojewodzki_2025_mazowieckie_q9 · conf high
- **key:** `Suma krawędzi jest mniejsza niż 6 m tylko w jednym przypadku (gdy ∡CBS = 30°); w drugim przypadku (∡CBS = 60°) jest większa niż 6 m` · **model:** `Nie zawsze. Gdy kąt 30° jest przy podstawie: suma krawędzi = 12+12√2+10√6 dm ≈ 53,47 dm ≈ 5,35 m 6 m.`
- **Q:** Ostrosłup spełnia następujące warunki: Podstawą ostrosłupa jest trójkąt prostokątny równoramienny o przeciwprostokątnej równej 12 dm. Dwie przystające ściany boczne są trójkątami prostokątnymi, w których jeden z kątów ostrych ma miarę 30°. Wspólna krawędź przystających ścian bocznych jest prostopadła do płaszczyzny pod …

### `5c26442f` · wojewodzki_2025_opolskie_q9 · conf high
- **key:** `Nie, nie zmieści się` · **model:** `Nie zmieści się (przekątna prostopadłościanu 10√2 cm > 8√3 cm = średnica kuli)`
- **Q:** Czy prostopadłościan o wymiarach 6 cm, 8 cm, 10 cm zmieści się w kuli o promieniu długości 4 3 cm? Odpowiedź uzasadnij.

### `9e87d0ec` · wojewodzki_2025_podlaskie_q20 · conf high
- **key:** `Tak — wysokość namiotu wynosi 1,75 m, a 152 cm = 1,52 m < 1,75 m.` · **model:** `Tak — wysokość namiotu wynosi 1,75 m (175 cm) > 152 cm`
- **Q:** W namiocie w kształcie ostrosłupa prawidłowego czworokątnego o krawędzi podstawy długości 3,6 m mieści się 7,56 m³ powietrza. Czy Adela, która ma 152 cm wzrostu, może stanąć wyprostowana w tym namiocie?

### `55dcada7` · wojewodzki_2025_podlaskie_q21 · conf high
- **key:** `8/9` · **model:** `3/4 pola dużego koła`
- **Q:** Rysunek przedstawia pierścień kołowy. Jaką część pola dużego koła stanowi pole pierścienia kołowego?

### `cf300143` · wojewodzki_2026_dolnoslaskie_q3 · conf high
- **key:** `x = √2+1, y = √2−1; wtedy x²−y² = 4√2 oraz x/y = 3+2√2, a ponieważ 4√2 = √8+2√2 < √9+2√2 = 3+2√2, zachodzi x²−y² < x/y.` · **model:** `x=√2+1, y=√2−1; x²−y²=4√2≈5,657 < x/y=3+2√2≈5,828, więc nierówność zachodzi`
- **Q:** Liczby rzeczywiste x , y spełniają jednocześnie dwa następujące warunki: x + y = 2 2 i x − y = 2 . Wykaż, że te liczby x i y spełniają także nierówność x 2 − y 2 < x y .

### `f783b98c` · wojewodzki_2026_kujawsko-pomorskie_q22 · conf high
- **key:** `Pola są równe (F₁ = F₂)` · **model:** `Figury F1 i F2 mają równe pola.`
- **Q:** Trójkąt ABC jest prostokątny i równoramienny, łuki AC i AB są półokręgami, zaś BC jest ćwiartką okręgu o środku A . Która z figur F 1 czy F 2 ma większe pole (patrz rysunek)?

### `66b34762` · wojewodzki_2026_lubuskie_q16 · conf high
- **key:** `20 5/6 % (≈ 21%)` · **model:** `5/24 (≈20,83%)`
- **Q:** Do wodnego roztworu pewnej soli o stężeniu 20% dolano wody, wskutek czego masa roztworu wzrosła o 20%. Z tak otrzymanego roztworu odparowano część wody i jego masa zmalała o 20%. Jakie stężenie ma obecnie ten roztwór?

### `486eb261` · wojewodzki_2026_opolskie_q6 · conf high
- **key:** `≈75,4%` · **model:** `ok. 75,4% (dokładnie 43/57)`
- **Q:** Jabłka zawierają przeciętnie 86% wody. Po wstępnym suszeniu odparowała połowa wody. Jaki procent stanowi woda w tak podsuszonych jabłkach?

### `c899dafa` · wojewodzki_2026_opolskie_q9 · conf high
- **key:** `8(π−1) cm²` · **model:** `8π − 8 cm² ≈ 17,13 cm²`
- **Q:** Dwa koła zachodzą na siebie. Punkt S jest środkiem większego koła, a jego promień ma długość 4 cm. Odcinek AB jest średnicą mniejszego koła. Oblicz pole części wspólnej tych dwóch kół.

### `8cbe6d91` · rejonowy_2012-2013_malopolskie_q20 · conf med
- **key:** `trójkąt, trapez i romb` · **model:** `Trójkąt, trapez prostokątny i romb (po 24 cm² każdy) — równoległobok ma inne pole (20 cm²)`
- **Q:** Na rysunku podano wymiary trójkąta prostokątnego, równoległoboku, trapezu prostokątnego i rombu. Równe pola mają:

### `cc7ef181` · rejonowy_2013-2014_slaskie_q14 · conf med
- **key:** `A. Niemcami; B. Bratysława; C. Litwa` · **model:** `A) Niemcy; B) Bratysława; C) Litwa`
- **Q:** Uzupełnij zdania. A. Odra i Nysa Łużycka płyną wzdłuż granicy Polski z … B. Stolicą państwa, którego granica z Polską biegnie między innymi grzbietami górskimi Tatr, jest … C. Sąsiadem Polski od północnego wschodu jest …

### `402cc235` · rejonowy_2016-2017_slaskie_q2 · conf med
- **key:** `A) 100·(2 − 40·(3 + 2)) = −19800; B) 100·(40 : 2)·(3 + 2) = 10000; C) 200·2 : (100·4 : 20 : 5) = 100` · **model:** `A) 100·2−40·(3+2)=0 B) 100·40:2·(3+2)=10000 C) 200·2:(100·4:20:5)=100`
- **Q:** W poniższych wyrażeniach arytmetycznych wstaw nawiasy tak, aby wynik był: A) możliwie najmniejszy: 100 · 2 − 40 · 3 + 2 B) możliwie największy: 100 · 40 : 2 · 3 + 2 C) równy 100: 200 · 2 : 100 · 4 : 20 : 5

### `bc24cbe0` · rejonowy_2020_kujawsko-pomorskie_q20 · conf med
- **key:** `16 cm²` · **model:** `8π cm2 (≈25,13 cm2)`
- **Q:** Obwód figury przedstawionej na rysunku składa się z czterech jednakowych półokręgów o promieniu 2 cm. Oblicz pole zacieniowanej figury.

### `f1ebd535` · rejonowy_2022_podlaskie_q27 · conf med
- **key:** `27 − 3√3 cm³` · **model:** `21 cm³`
- **Q:** Z sześciennej kostki o krawędzi 3 cm wycięto cztery jednakowe graniastosłupy (patrz rysunek). Wyznacz objętość otrzymanej bryły. Zapisz obliczenia i odpowiedź.

### `01c750a6` · rejonowy_2023_dolnoslaskie_q15 · conf med
- **key:** `375√3(3 − √3) cm³` · **model:** `V = 1125(√3−1) cm³ ≈ 823,6 cm³`
- **Q:** Z kwadratowej kartki o boku długości 30 cm wycięto siatkę graniastosłupa prawidłowego sześciokątnego w sposób przedstawiony na rysunku. Oblicz objętość tego graniastosłupa.

### `a8e90284` · rejonowy_2025_lodzkie_q2 · conf med
- **key:** `A) np. 00:00, 11:11, 01:10, 10:01; B) np. 22:55, 12:51, 02:50, 15:21, 05:20, 20:05, 21:15; C) wszystkie godziny złożone z cyfr 1, 3, 0, 8 (z wyłączeniem godzin  …` · **model:** `A) 00:00, 11:11; B) 02:50, 05:20, 20:05; C) 13:33, 03:31, 18:38; D) 15:51, 21:12`
- **Q:** Na zegarze elektronicznym wyświetlane są zawsze cztery cyfry (tzn. na przykład 8:15 to 08:15) wyglądające jak poniżej. Zegar pokazuje godziny od 00:00 do 23:59. W tym zadaniu traktujemy wyświetlaną godzinę jak figurę. A) Podaj dwa przykłady godziny, która ma zarówno pionową jak i poziomą oś symetrii. B) Podaj trzy przy …

### `c466f57c` · rejonowy_2025_opolskie_q9 · conf med
- **key:** `Tak — przekątna drzwi √4,81 m (≈ 2,19 m) jest dłuższa od krótszego boku tafli (2,1 m)` · **model:** `Tak, można wnieść (2,1 m < przekątna drzwi ≈ 2,19 m).`
- **Q:** Czy prostokątną taflę szkła o wymiarach 2,5 m na 2,1 m można wnieść do łazienki przez drzwi o wymiarach 2 m na 0,9 m? Odpowiedź uzasadnij (nie bierzemy pod uwagę grubości szkła).

### `2a97e6b1` · szkolny_2012-2013_slaskie_q15 · conf med
- **key:** `Lewa strzałka – wiatr północno-wschodni; prawa strzałka – wiatr południowo-wschodni.` · **model:** `a) wiatr południowo-zachodni (SW); b) wiatr północno-zachodni (NW)`
- **Q:** Określ kierunki wiatrów:

### `3730844e` · szkolny_2012-2013_slaskie_q20 · conf med
- **key:** `a) zima i jesień; b) wiosna i jesień; c) zima; d) lato; e) wiosna; f) lato` · **model:** `a) jesień i zima; b) wiosna i jesień; c) zima; d) lato; e) wiosna; f) lato`
- **Q:** Podaj, której pory lub pór roku występujących w Polsce dotyczą poniższe informacje: a) Noce są dłuższe niż dni – ……………… b) Dzień i noc trwają po 12 godzin – ……………… c) Słońce wschodzi na południowym wschodzie – ……………… d) Rozpoczyna się 22 czerwca – ……………… e) Kwitną podbiały, forsycje – ……………… f) Słońce góruje najwyżej w …

### `a692a208` · szkolny_2020-2021_zachodniopomorskie_q19 · conf med
- **key:** `5,814 · 10³ lat świetlnych` · **model:** `≈ 5,814 × 10³ lat świetlnych (5814 lat świetlnych)`
- **Q:** Gwiazda znajduje się w odległości 5,5 · 10 16 km od Ziemi. W ciągu roku światło przebywa drogę 94,6 · 10 11 km. W odległości ilu lat świetlnych od Ziemi znajduje się ta gwiazda? Wynik zaokrąglij do pełnych lat świetlnych a następnie podaj w notacji wykładniczej.

### `1be6588c` · szkolny_2022_podkarpackie_q20 · conf med
- **key:** `20.1: 78 s; 20.2: 42 godz.; 20.3: 27 min; 20.4: 25°; 20.5: 37,125 cm²` · **model:** `20.1. 78 s; 20.2. 42 h; 20.3. 27 min; 20.4. 50°; 20.5. 37,125 cm²`
- **Q:** Uzupełnij luki tak, aby zdania były prawdziwe. 20.1. 1,3 minuty to … sekund. 20.2. 1 4 tygodnia to … godzin. 20.3. Przez 3 5 lekcji matematyki uczniowie rozwiązywali zadania tekstowe. Ile to minut? … 20.4. Dany jest trójkąt równoramienny. Miara kąta α wynosi: … 20.5. Pole zacieniowanej części prostokąta jest równe: …

### `56605018` · szkolny_2023_lubelskie_q17 · conf med
- **key:** `n + 4 · 0,20 n + ( n − 2 ) · 0,10 + 3 · 2 + 2 · 0,01 = 21,02 [zł]` · **model:** `n + 4n·0,20 + (n−2)·0,10 + 3·2 + 2·0,01 = 21,02`
- **Q:** W skarbonce jest n monet jednozłotowych i cztery razy więcej dwudziestogroszówek. Natomiast dziesięciogroszówek jest o dwie mniej niż monet jednozłotowych. Są tam jeszcze trzy dwuzłotówki i dwie monety jednogroszowe. W skarbonce jest razem 21,02 zł. Zapisz równanie opisujące treść zadania.

### `65625704` · szkolny_2025_mazowieckie_q8 · conf med
- **key:** `Możliwe zestawy pól: {78, 120, 400}, {138, 60, 400}, {120, 204, 36} oraz {240, 111, 9} cm².` · **model:** `Przypadek 1: kwadrat 9 cm², prostokąty 37×3=111 cm² i 40×6=240 cm². Przypadek 2: kwadrat 36 cm², prostokąty 34×6=204 cm² i 40×3=120 cm²`
- **Q:** Z prostokątnej kartki o obwodzie 98 cm Gabrysia odcięła kwadrat. Pozostałą część kartki w kształcie litery L rozcięła na dwa prostokąty, które nie są kwadratami: jeden o szerokości 3 cm, drugi o szerokości 6 cm. Oblicz pole każdej z otrzymanych figur. Rozpatrz wszystkie przypadki.

### `2db9054a` · wojewodzki_2018-2019_warminsko-mazurskie_q19 · conf med
- **key:** `3√41 m (około 19,2 m)` · **model:** `3√41 m ≈ 19,2 m`
- **Q:** Wojtek i Tomek stali dokładnie naprzeciw siebie po dwóch stronach rzeki o szerokości 12 m. Wojtek chciał popłynąć wprost do Tomka, ale prąd rzeki zniósł go 15 m dalej. Ile metrów przepłynął Wojtek? Zapisz swoje obliczenia.

### `0599c8b1` · wojewodzki_2020-2021_zachodniopomorskie_q16 · conf med
- **key:** `Nie, kwota nie wystarczy — działka P₂ kosztuje 26250 zł` · **model:** `Nie wystarczy — koszt działki P2 to ok. 30 807 zł, a państwo Nowakowie mają 26 000 zł (brakuje ok. 4807 zł).`
- **Q:** Państwo Nowakowie przeznaczyli 26000 zł na zakup działki. Do jednej z ofert dołączono rysunek dwóch przylegających do siebie działek w skali 1:1000. Jeden metr kwadratowy gruntu w tej ofercie kosztuje 35 zł. Oblicz, czy przeznaczona przez państwa Nowaków kwota wystarczy na zakup działki P 2 . Dane: | AE | = 5 cm, | EC  …

### `1c95b02a` · wojewodzki_2020_mazowieckie_q6 · conf medium
- **key:** `Dwie różne siatki graniastosłupa prawidłowego trójkątnego mające tylko jedną oś symetrii (rysunek)` · **model:** `Dwie różne siatki graniastosłupa prawidłowego trójkątnego, mające tylko jedną oś symetrii (rysunek: dwa trójkąty równoboczne oraz dwa dodatkowe prostokąty boczn …`
- **Q:** Na rysunku przedstawiono prostokąt i jego osie symetrii. Uzupełnij rysunek tak, aby powstała siatka graniastosłupa prawidłowego trójkątnego, która ma tylko jedną oś symetrii. Przedstaw dwa różne rozwiązania.

### `1eb56b2a` · wojewodzki_2022_dolnoslaskie_q4 · conf med
- **key:** `178,75 cm³` · **model:** `405 cm³`
- **Q:** Na rysunku obok przedstawiono siatkę prostopadłościanu i podano niektóre jej wymiary. Oblicz objętość tego prostopadłościanu. Odpowiedź uzasadnij, zapisując odpowiednie obliczenia.

### `2ae1f34c` · wojewodzki_2022_podkarpackie_q18 · conf med
- **key:** `Pole figury A = 7 + π, pole figury B = 4 + 2π` · **model:** `Pole A = 6 + 1,5π ≈ 10,71; Pole B = 4 + 2π ≈ 10,28`
- **Q:** Dane są dwie figury: A i B (rysunek). Przyjmując, że bok jednej kratki ma 1, oblicz ich pola. Zapisz obliczenia i odpowiedź.

### `53312d88` · wojewodzki_2024-2025_slaskie_q15 · conf med
- **key:** `Podstawa AB jest dwa razy dłuższa od podstawy DC.` · **model:** `Dłuższa podstawa = 2 × krótsza podstawa (co należało wykazać)`
- **Q:** W trapezie równoramiennym przekątna jest prostopadła do ramienia i dzieli kąt ostry tego trapezu na dwa kąty o równej mierze. Uzasadnij, że jedna podstawa tego trapezu jest dwa razy dłuższa od drugiej podstawy. Zapisz obliczenia.

### `6ad5ff3b` · wojewodzki_2024_lubelskie_q13 · conf med
- **key:** `a) 9 cm; b) 18 cm; c) 243√3/4 cm²` · **model:** `a) 9 cm; b) 18 cm; c) 60,75√3 cm² (≈105,2 cm²)`
- **Q:** Trójkąty przedstawione na poniższym rysunku są trójkątami równobocznymi. Promień okręgu ma długość 3 3 cm. Uzupełnij zdania, wpisując w puste miejsca tylko liczby (nie musisz zapisywać wykonanych obliczeń). a) Bok mniejszego trójkąta ma długość ……… cm. b) Długość boku większego z trójkątów wynosi ……… cm. c) Pole zamalo …

### `8c96dc3c` · wojewodzki_2024_mazowieckie_q6 · conf med
- **key:** `Symetralne dzielą dłuższą przekątną rombu na trzy równe odcinki` · **model:** `Udowodniono: symetralne dzielą dłuższą przekątną rombu na trzy równe odcinki.`
- **Q:** Uzasadnij, że jeśli w rombie symetralne dwóch sąsiednich boków przecinają się w wierzchołku kąta rozwartego, to dzielą dłuższą przekątną rombu na trzy równe odcinki.

### `bea4b82b` · wojewodzki_2024_podkarpackie_q7 · conf med
- **key:** `Oba pola są równe sześciokrotności pola trójkąta ABS, więc są sobie równe.` · **model:** `Pola trójkąta CDS i pięciokąta ABCSD są równe — obie wynoszą 3·|AS|·|BS|·sinφ, gdzie φ = kąt ASB (dowód poniżej).`
- **Q:** Odcinki AC i BD przecinają się w punkcie S i spełnione są równości | CS | = 3 · | AS | oraz | DS | = 2 · | BS | . Udowodnij, że pola trójkąta CDS i pięciokąta ABCSD są równe.

### `84016c1b` · wojewodzki_2025_kujawsko-pomorskie_q12 · conf med
- **key:** `5` · **model:** `10/3`
- **Q:** Oblicz wartość wyrażenia. 256 − 1 25 : 1 5 · 49 64 · 1 1 7 2 7 : 2 6 + 1 9 16 · 64 3 · 5 2 · ( 1 5 ) 3

### `95b5102a` · wojewodzki_2025_kujawsko-pomorskie_q9 · conf med
- **key:** `58°` · **model:** `122°`
- **Q:** Na rysunku obok podano miary niektórych kątów. Wyznacz miarę kąta β . Uzasadnij odpowiedź.

### `fbfed91f` · wojewodzki_2025_podlaskie_q12 · conf med
- **key:** `P(liczba pierwsza) = 3/10; P(potęga liczby naturalnej) = 3/5 (czyli 6/10)` · **model:** `P(liczba pierwsza) = 3/10; P(potęga liczby naturalnej) = 5/10 (=1/2)`
- **Q:** Spośród liczb: 1, 3, 8, 17, 27, 49, 64, 72, 81, 83 losujemy jedną. Dokończ zdania, wpisując prawdopodobieństwo opisanych zdarzeń. Prawdopodobieństwo wylosowania liczby pierwszej jest równe ____ . Prawdopodobieństwo wylosowania liczby będącej potęgą liczby naturalnej jest równe ____ .

### `56ce0a34` · wojewodzki_2025_podlaskie_q22 · conf med
- **key:** `Kolejno w sektorach: ACFDBE (lub ADBFCE, lub ACEBFD).` · **model:** `Kolejno dookoła pierścienia: A, C, E, B, F, D (i z powrotem do A)`
- **Q:** Pan Jan ma łąkę, na środku której znajduje się mały staw. Na terenie wokół stawu zorganizował pole namiotowe, dzieląc je na 6 sektorów (zob. rysunek). Pewnej soboty nad staw przyjechało sześciu wędkarzy, którzy chcieli zamieszkać na polu namiotowym, każdy w innym sektorze, ale zgłosili dziwne wymagania: pan A nie chce  …

### `3e1d5735` · wojewodzki_2026_lubelskie_q13 · conf med
- **key:** `rower: 20 km/h, samochód: 80 km/h` · **model:** `Janek: 110/3 km/h ≈ 36,67 km/h; Staś: 440/3 km/h ≈ 146,67 km/h`
- **Q:** Z Lublina do Puław wyruszył rowerem Janek, poruszając się ze stałą prędkością. Po 30 minutach, w tym samym kierunku, wyruszył samochodem jego brat Staś. Po 10 minutach jazdy Staś dogonił Janka i kontynuował jazdę z niezmienioną prędkością. Po dotarciu do Puław natychmiast zawrócił. Po upływie godziny od chwili wyjazdu  …

### `31aa1a51` · wojewodzki_2026_lubelskie_q9 · conf med
- **key:** `1` · **model:** `27 dni`
- **Q:** Janek kupił mydło w kształcie dużej kuli. W ciągu 26 dni mydło zużyło się tak, że została z niego kula o promieniu trzy razy mniejszym niż początkowo. Na ile dni, przy takim samym dziennym zużyciu, wystarczy Jankowi tego mydła? Wpisz tylko odpowiedź.

### `4aaf2745` · wojewodzki_2026_mazowieckie_q8 · conf med
- **key:** `9(π + 2)` · **model:** `18 + 9π (≈ 46,27)`
- **Q:** W kole o środku O narysowano figurę składającą się z dwóch półkoli jak na rysunku. Obwód dużego koła jest równy 18 π . Pole większego zacieniowanego półkola wynosi 18 π . Oblicz obwód zacieniowanej figury.

### `ef8b9007` · rejonowy_2019_opolskie_q9 · conf low
- **key:** `21 m` · **model:** `650 cm (6,5 m)`
- **Q:** Do ułożenia chodnika wykorzystano prostokątne płyty kamienne o wymiarach 35 cm × 60 cm. Płyty układano kolejno tak, jak na rysunku, na zewnątrz szerszą stroną do brzegu, a po środku węższą. W ten sposób ułożono segment, który miał kształt pełnego prostokąta. Chodnik zakończono układać, gdy ułożono 5 takich segmentów. J …

### `57e15264` · rejonowy_2020_mazowieckie_q5 · conf low
- **key:** `39 białych klocków` · **model:** `7 białych klocków`
- **Q:** Bartek ma białe i szare klocki sześcienne. Białych klocków ma trzy razy więcej niż szarych. Ze wszystkich szarych klocków skleił bryłę przedstawioną na rysunku, składającą się z dwóch jednakowych elementów w kształcie litery E i łącznika w kształcie litery S. Oblicz, ile białych klocków zostałoby Bartkowi po uzupełnien …

### `c583d3c3` · rejonowy_2025_lodzkie_q9 · conf low
- **key:** `H₁ = 147/16·√3 lub H₂ = 12√3 (przy podanych danych taki ostrosłup w rzeczywistości nie istnieje)` · **model:** `Przypadek 1 (podstawa 3,5; krawędź boczna 4): h = √158/4 ≈ 3,14; Przypadek 2 (podstawa 4; krawędź boczna 3,5): h = √17/2 ≈ 2,06`
- **Q:** W pewnym graniastosłupie prawidłowym sześć krawędzi ma długość 7, a trzy krawędzie mają długość 4. Graniastosłup nie ma więcej krawędzi. Ostrosłup prawidłowy o tej samej objętości ma cztery krawędzie długości 3,5 i cztery krawędzie długości 4. Oblicz wysokość ostrosłupa. Rozważ wszystkie przypadki.

### `807570af` · szkolny_2012-2013_slaskie_q17 · conf low
- **key:** `a) 780 m n.p.m.; b) 150 m` · **model:** `a) 780 m n.p.m.; b) ok. 180 m (A≈600 m, B=780 m)`
- **Q:** Korzystając z mapy poziomicowej uzupełnij zdania. a) Wysokość bezwzględna szczytu jest równa …………………… . b) Wysokość względna między punktami A i B jest równa ………… .

### `b3229c02` · szkolny_2013-2014_slaskie_q16 · conf low
- **key:** `A. południowo-wschodnim; B. północno-wschodniej (dopuszczalne: północnej)` · **model:** `A. w kierunku południowo-wschodnim; B. od strony północno-wschodniej`
- **Q:** Uzupełnij zdanie korzystając z rysunku poniżej. A. Rzeka płynie w kierunku … B. Łagodne zbocze doliny rzecznej znajduje się od strony …

### `db2c37a6` · szkolny_2017_podkarpackie_q19 · conf low
- **key:** `Figura IV: 28 patyczków; obwód figury VI: 20` · **model:** `a) 11; b) 20`
- **Q:** Ania budowała z patyczków o równej długości kolejne wielokąty, dokładając taką samą ilość patyczków. Uzupełnij zdania, wpisując w wykropkowane miejsca odpowiednie liczby. Figura o numerze IV zostanie zbudowana z …… patyczków. Obwód figury I jest równy 10, obwód figury II jest równy 12, obwód figury o numerze VI jest ró …

### `eea35a3c` · szkolny_2022_dolnoslaskie_q20 · conf low
- **key:** `Brakujący kwadrat w każdej siatce należy dorysować w jednym z miejsc oznaczonych krzyżykiem w kluczu.` · **model:** `Lewa siatka: dorysować brakujący kwadrat nad lewym lub nad prawym polem górnej pary (albo pod lewym lub pod prawym polem dolnej pary) — np. nad lewym górnym pol …`
- **Q:** Na rysunkach przedstawiono niepełne siatki sześcianu – w każdej z nich brakuje jednej ściany. Uzupełnij rysunki tak, aby otrzymać dwie pełne siatki sześcianu.

### `e373c440` · szkolny_2022_podkarpackie_q19 · conf low
- **key:** `19.1: 27; 19.2: 46; 19.3: 69` · **model:** `19.1. 28; 19.2. 48; 19.3. 72`
- **Q:** Uzupełnij luki tak, aby zdania były prawdziwe. Dane są dwie bryły A i B. 19.1. Suma wszystkich ścian brył A i B jest równa: … 19.2. Suma wszystkich wierzchołków tych brył wynosi: … 19.3. Suma wszystkich krawędzi brył A i B jest równa: …

### `17e2944d` · wojewodzki_2023-2024_warminsko-mazurskie_q18 · conf low
- **key:** `Średnia wieku tych trzech osób to 30⅔ lub 22⅔.` · **model:** `30 2/3 roku (92/3 ≈ 30,67)`
- **Q:** Wiek Kasi jest równy wartości wyrażenia: 7 2 − | 5 − 5 2 | + ( − 2 ) 3 − 5 0 . Wiek Eli różni się od wieku Kasi o 4 lata, zaś Piotr jest dwukrotnie starszy od Eli. Oblicz średnią arytmetyczną wieku tych trzech osób.

### `a21eaa1f` · wojewodzki_2023_mazowieckie_q8 · conf low
- **key:** `Dwie różne siatki czworościanu — pięciokąt należy podzielić dorysowanymi odcinkami na cztery trójkąty tworzące siatkę (dwa różne podziały dają dwa różne czworoś …` · **model:** `Rys.1: z jednego wierzchołka pięciokąta poprowadzić obie przekątne (dzielą kąt 108° na trzy kąty 36°, dzieląc pięciokąt na 3 trójkąty), a do boku przeciwległego …`
- **Q:** Na rysunkach 1. i 2. są przystające pięciokąty foremne. Uzupełnij te rysunki tak, aby otrzymać dwie siatki różnych czworościanów.

### `b2dea76b` · wojewodzki_2024-2025_malopolskie_q15 · conf low
- **key:** `a) 4(√3 − 1) cm²; b) ⅓√2 + ⅔; c) a = 2(2√3 − 1) cm; d) b = 2(√3 − 1) cm` · **model:** `a) Pole ABCD = 4√3-4 cm²; b) obwód I : obwód II = √2; c) a ≈ 2+2√3 cm; d) b = 2√2 cm`
- **Q:** W trójkącie równobocznym ACD o boku długości 4 cm zaznaczono punkt B tak, że trójkąt ACB jest prostokątny i równoramienny (rysunek obok). a) (2p) Oblicz pole czworokąta ABCD . Zapisz obliczenia. Filip wyciął z papieru 12 czworokątów przystających do czworokąta ABCD i ułożył z nich dwa dwunastokąty: dwunastokąt I oraz d …

### `6d8d923e` · wojewodzki_2024-2025_slaskie_q1 · conf low
- **key:** `GEOMETRIA EUKLIDESOWA` · **model:** `1. okrąg 2. procent 3. wierzchołek 4. romb 5. wartość bezwzględna 6. trapez 7. przyległe 8. oś liczbowa 9. hektar 10. dzielna 11. ostrosłup 12. trójkąt 13. syme …`
- **Q:** Rozwiąż krzyżówkę, wpisując litery w odpowiednie pola. Hasło to nazwa dziedziny matematyki, z którą stykasz się podczas lekcji tego przedmiotu w szkole. Hasło nie jest oceniane. Zbiór wszystkich punktów płaszczyzny równoodległych od określonego punktu tej płaszczyzny. 10 razy więcej niż promil. Punkt wspólny kilku kraw …
