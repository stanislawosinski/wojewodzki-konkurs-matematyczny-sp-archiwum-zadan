# Kampania "Trudność" — sidecary

Względna trudność zadań z porównań parami (ocena porównawcza): sędziowie (Opus) dostają
piątki zadań i układają je od najtrudniejszego do najłatwiejszego; z rankingów powstaje
jedna skala (model Bradleya–Terry'ego). Jeden plik na arkusz, tak samo nazwany jak
`data/questions/<plik>.json`, wpisy tylko dla ocenionych zadań:

```json
{ "<question id>": { "logit": 1.23, "pct": 0.71, "pct_etap": 0.68, "n": 48 } }
```

| pole | znaczenie | w shardzie |
|------|-----------|------------|
| `logit` | pozycja na skali; **0 = średnia panelu odniesienia** (niżej) | `trud` |
| `pct` | jaka część ocenionych zadań jest łatwiejsza (0..1) | `trud_pct` |
| `pct_etap` | to samo w obrębie etapu (szkolny / rejonowy / wojewódzki) | `trud_pct_etap` |
| `n` | w ilu porównaniach parami zadanie brało udział | `trud_n` |

Brak wpisu = **nieocenione**, nie „łatwe”.

## Jak czytać skalę

Liczą się różnice. Różnica `d` między zadaniami A i B znaczy, że sędzia uzna A za
trudniejsze z prawdopodobieństwem 1/(1+e^−d): 0,5 → 62%, 1 → 73%, 2 → 88%, 3 → 95%.
Logit to porządek trudności, nie punkty ani szansa ucznia na rozwiązanie.

Kryterium sędziów: które zadanie silny, dobrze przygotowany uczeń kl. 7–8 (zna materiał
wszystkich trzech etapów, cały arkusz 20 zadań w 90 minut, bez kalkulatora) najczęściej
rozwiąże niepełnie — brak pomysłu, pułapkowy rachunek, haczyk, wymóg uzasadnienia.
Liczba punktów zadania nie jest kryterium.

## Punkt zero: panel odniesienia

`panel.json` — 150 zadań wylosowanych warstwowo (etap × typ zadania × kubełek `est_min`,
wewnątrz warstw rozrzut województw i lat) tak, by odzwierciedlały skład całego banku;
wszystkie 16 województw, lata 2009/10–2026/27. Zero skali = średnia logitów panelu, więc
wartości **nie dryfują**, gdy dochodzą nowe oceny, a po ocenieniu całego banku zero leży
blisko „przeciętnego zadania w banku”. Odchylenie składu panelu od banku przesuwa zero
o ok. 0,04 logitu (zaokrąglenia przy 36 warstwach). Zadania panelu służą też jako
kotwice w kolejnych przebiegach.

`pct` i `pct_etap` liczone są względem **ocenionej puli**. Dla etapu rejonowego to cały etap;
dla szkolnego i wojewódzkiego — Wielkopolska i zadania panelu, więc tam percentyle nie są
jeszcze reprezentatywne dla całego banku.

## Znane skrzywienia

- Uczeń odniesienia zna materiał wszystkich etapów, więc zadania wykraczające poza zakres
  swojego etapu (np. układ równań w arkuszu szkolnym) wychodzą za łatwe dla ucznia, który
  tego jeszcze nie przerabiał.
- Sędziowie mogli nie oglądać rysunków (oceniali z treści, ścieżki do plików były podane).
- Sonnet i Haiku jako sędziowie (pilot 2026-11-21, te same 196 zadań): zgodność z panelem
  Opusa r = 0,81–0,84 i 0,76–0,78 przy r = 0,91 między dwoma panelami Opusa — za słabo, by
  dzielić skalę; ich rankingi są zachowane, ale skrypt ich nie używa.

## Pliki i odtwarzanie

- `rankings/*.json` — surowe oceny: lista sędziów `{grupa, model, sedzia, zestawy, rankingi}`;
  `rankings/kody.json` — anonimowy kod zadania (sędziowie nie znali arkusza) → id pytania;
  `rankings/aliasy.json` — przedruk (`dup`) → id ocenionego oryginału, którego wynik dostaje.
- `python3 dev/scripts/difficulty-fit.py` — dopasowuje skalę ze wszystkich rankingów Opusa,
  przesuwa zero na średnią panelu i nadpisuje sidecary. Deterministyczny: te same rankingi
  dają te same sidecary.

## Jak ocenić kolejne zadania

Trzy skrypty w `dev/scripts/`, katalog roboczy `dev/work/difficulty/<nazwa>/` (nie wchodzi do
repo). Shardy muszą być zbudowane (`cd browser && node build.mjs`), bo przygotowanie czyta je.

1. **Przygotowanie** — `difficulty-prepare.py` wybiera nieocenione zadania z kluczem (albo
   potwierdzoną odpowiedzią modelu), pomija anulowane, przedruki kieruje do `aliasy.json`,
   nadaje kody (dopisuje do `kody.json`) i układa piątki: 4 nowe zadania + 1 kotwica z już
   ocenionych, rozłożona po całej skali; nigdy dwa zadania z jednego arkusza w piątce; każde
   nowe zadanie w ~8 piątkach; 50 piątek na sędziego. Wypisuje liczbę sędziów i szacunek kosztu.

   ```sh
   python3 dev/scripts/difficulty-prepare.py --name szkolne-kraj --stage szkolny --exclude-woj wielkopolskie
   python3 dev/scripts/difficulty-prepare.py --name test --stage wojewodzki --limit 40 --sets 10 --dry-run
   ```

   Filtry: `--stage` (wielokrotnie), `--woj` / `--exclude-woj`, `--from-year`, `--limit`.
   `--dry-run` nie rusza `kody.json` / `aliasy.json` (tylko do podejrzenia plików).

2. **Ocena** — `difficulty.workflow.mjs`, argumenty `{dir, judges}` z wyniku kroku 1. Jeden
   agent na sędziego; każdy sam zapisuje `wynik-s<N>.json`. Przerwany przebieg wznawia się,
   uruchamiając tylko brakujących: `{dir, judges, only: [3, 17]}`. Model domyślnie
   dziedziczony — musi to być **Opus** (pilot: tańsze modele nie dzielą skali). Treści
   polecenia nie zmieniać: inne kryterium to nowa wersja skali, nie kolejny przebieg.

3. **Zebranie** — `difficulty-collect.py --dir dev/work/difficulty/<nazwa>` sprawdza, czy każdy
   sędzia uporządkował każdą swoją piątkę dokładnie tymi pięcioma kodami, wypisuje brakujących
   (do ponownego uruchomienia), zapisuje `rankings/<data>-<nazwa>.json` i podaje kontrolę jakości:

   | miara | próg | co znaczy przekroczenie |
   |-------|------|-------------------------|
   | rzetelność nowych zadań (połówki sędziów, Spearman–Brown) | ≥ 0,9 | sędziowie zgodni; dotąd 0,95–0,98 |
   | stabilność zadań już na skali (r przed/po) | ≥ 0,99 | nowe oceny nie przestawiają starych |
   | przesunięcie średnie zadań już na skali | ≤ 0,1 | zero trzyma się panelu |

   Rankingi losowe dają rzetelność ~0 — wynik poniżej progu = przebieg do wyrzucenia
   (usunąć plik z `rankings/`), nie do „poprawiania”.

4. **Skala** — `python3 dev/scripts/difficulty-fit.py && (cd browser && node build.mjs)`, potem
   dopisać przebieg do tabeli niżej.

**Koszt** (Opus, 2026-11-21): ~110 tys. tokenów na sędziego (50 piątek), czyli ~4,5 tys. na
zadanie przy 8 wystąpieniach; 16 sędziów naraz, ~2,5 min na sędziego — 99 sędziów (2463
zadania) zajęło 13 minut i 11,1 mln tokenów. Do oceny zostały szkolne i wojewódzkie spoza
Wielkopolski (~4400 zadań, ~20 mln tokenów).

## Przebiegi (wersja skali 1)

| data | co | sędziów | zadań |
|------|----|---------|-------|
| 2026-11-21 | wielkopolskie 2023/24–2026/27 (wszystkie etapy) | 8 | 196 |
| 2026-11-21 | wielkopolskie 2019/20–2022/23, z kotwicami z przebiegu 1 | 12 | 299 |
| 2026-11-21 | panel odniesienia (cały kraj), z kotwicami wielkopolskimi | 12 | 139 (+11 już ocenionych) |
| 2026-11-21 | pilot Sonnet / Haiku (nie wchodzi do skali) | 4 + 4 | 196 |
| 2026-11-21 | rejonowe z całego kraju (bez wielkopolskich), 4 nowe + 1 kotwica w piątce | 99 | 2463 (+34 przedruki) |

Razem 3131 zadań (w tym 34 przedruki z wynikiem przeniesionym z oryginału, `rankings/aliasy.json`),
65 660 porównań parami. Rzetelność (połówki sędziów, Spearman–Brown): 0,96 / 0,95 / 0,98 / 0,95
dla czterech przebiegów; powtórzone piątki u dwóch sędziów — Spearman 0,79. Dołożenie rejonowych
z kraju nie ruszyło wcześniejszych 634 zadań (r = 0,993, przesunięcie średnio 0,04 logitu).

Pokrycie: wszystkie rejonowe z kluczem lub potwierdzoną odpowiedzią, wszystkie wielkopolskie,
panel. Szkolne i wojewódzkie spoza Wielkopolski — tylko zadania panelu.
Zgodność z oficjalnymi wynikami (jedyny dostępny rok, 2024/25): rejonowy i wojewódzki
2024/25 — najłatwiejsze w swoich etapach i według skali, i według odsetka zakwalifikowanych.
