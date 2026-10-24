# Kampania „Haczyki” — sidecary

Jeden plik na arkusz, tak samo nazwany jak `data/questions/<plik>.json`. Zawartość: tylko
zadania z haczykiem siły 2 albo 3.

```json
{ "<question id>": { "sila": 2 | 3, "types": ["<typ>", …], "note": "<polska notatka>" } }
```

**Haczyk** to cecha treści lub odpowiedzi, na której uczeń, który zna matematykę potrzebną
w zadaniu, traci punkt przez czytanie, przeoczony warunek albo znaną pułapkę. Trudność,
potrzeba pomysłu, długi rachunek czy możliwość pomyłki rachunkowej to nie są haczyki.

- `sila: 3` — łapie ucznia, który zna metodę i liczy uważnie; pułapka siedzi w treści,
  warunku albo pojęciu (np. „gdy A będzie miał tyle lat, ile B ma teraz”, 91 = 7·13 „wygląda
  na pierwszą”, punkty procentowe, 2, 3, 5 nie tworzą trójkąta, dane w km/h a odpowiedzi w m/s).
- `sila: 2` — typowa pułapka tego zadania, do uniknięcia zwykłą starannością (liczb od 100
  do 999 jest 900, liczba cyfr 34·10²⁰, podstawa w dm a wysokość w cm).
- Siła 1 (zwykła pomyłka rachunkowa) nie jest zapisywana. Brak wpisu = brak haczyka.
- `note` — plain text, ≤110 znaków, nazywa haczyk, nigdy nie podaje wyniku.

Typy (zamknięty słownik; zadanie może mieć kilka; `inne:<nazwa>` dla przypadków spoza listy):
`jednostki`, `o-co-pytaja`, `kierunek-relacji`, `procent-podstawa`, `zbior-liczb`,
`wszystkie-przypadki`, `warunek-istnienia`, `kalendarz-czas`, `znak`, `pozorna-wlasnosc`,
`konwencja`, `plot-i-slupki`, `rysunek`, `kwantyfikator`, `szczegol-bryly`, `zaokraglenie`.
Pełne opisy typów i przykłady kotwiczące są w promptach `dev/scripts/traps.workflow.mjs`.

Generuje `dev/scripts/traps.workflow.mjs`: Opus klasyfikuje arkusz (z dowodem — błędna droga
i wariant, do którego prowadzi), drugi Opus niezależnie ocenia siłę każdej flagi, przy
wątpliwości niżej; zapisywana jest siła z weryfikacji.

## Stan (2026-10-24)

- Pokryte: wszystkie 126 arkuszy szkolnych (2210 zadań): 119 × siła 3, 651 × siła 2.
  Rejonowe i wojewódzkie — jeszcze nie.
- Walidacja na pilocie (11 arkuszy): 8 z 8 znanych haczyków z dziennika ucznia oznaczonych,
  kontrola negatywna (błąd umiejętności) bez flagi.
- Znana luka: w `szkolny_2018-2019_slaskie` trzy zgłoszenia w blokach P/F (q10, q11, q14)
  nie dostały werdyktu — klasyfikator dopisał do id numer zdania; do uzupełnienia ręcznie.
