# Kampania "Czas" — sidecary

Szacowany czas skupionej pracy nad zadaniem — do planowania sesji treningowych. Jeden
plik na arkusz, tak samo nazwany jak `data/questions/<plik>.json`. Każde zadanie arkusza
ma wpis (także anulowane):

```json
{ "<question id>": { "min": 1 | 2 | 5 | 10 | 20 } }
```

`min` to kubełek, nie pomiar — reprezentatywne minuty dla dobrze przygotowanego
uczestnika, który z grubsza wie, jak zadanie ugryźć (czytanie + pomysł + rachunek +
zapis rozwiązania przy otwartych):

| `min` | znaczenie |
|-------|-----------|
| 1 | spojrzeć i policzyć: jeden krok, wzór wprost, odczyt z rysunku |
| 2 | zamknięte z realnym rachunkiem lub kilkoma przypadkami; krótkie P/F |
| 5 | typowe otwarte: ułożyć równanie, rozwiązać, zapisać; żmudne zamknięte |
| 10 | trudne otwarte: pomysł + wieloetapowy rachunek + zapis; dowody |
| 20 | bloki wieloczęściowe, krzyżówki, długie dowody — wszystko powyżej (dolna granica) |

## Kalibracja (pilot 2026-08-17)

- Suma estymat pełnego arkusza ≈ **połowa drukowanego czasu** (na ślepo: 33–49 min przy
  arkuszach 90-minutowych, 72 przy 120): arkusz daje zapas na sprawdzanie i przepisywanie.
  Planując sesję, licz sumę `min` jako czysty czas pracy; tempo egzaminacyjne ≈ 2×.
- Sonnet vs Opus na tym samym arkuszu: Spearman 0,88 przy poziomie przesuniętym o ~30% —
  ranking jest stabilny, absolutne minuty nie. Stąd kubełki i Sonnet jako model kampanii.
- Rozpiętość surowych estymat w korpusie: ~0,6–17 min (zamknięte 1 pkt → otwarte 5+ pkt).
- Absolutne etykiety minut kalibruje się empirycznie: zmierzyć ucznia na ~20 zadaniach
  z różnych kubełków i w razie czego przeskalować w głowie — kubełków nie przenazywamy.

Generuje `dev/scripts/time.workflow.mjs` (Sonnet, jeden agent na arkusz).

## Przebieg 2026-08-17 (komplet)

433/433 arkuszy, 7632 zadań, 5 partii (~20 min każda), 1 restart po błędzie API.
Rozkład: 1 min → 1381, 2 → 3839, 5 → 1805, 10 → 547, 20 → 60; sumy per arkusz
30–82 min (mediana 56). Średnio: szkolny 3,0 min/zadanie, rejonowy 3,1, wojewódzki 3,6.

## Miejsce w aplikacji

`build.mjs` scala sidecary do pola `est_min` w shardach. W przeglądarce: chip „≈N min"
przy zadaniu, facet „Czas", sumy czasu w podsumowaniu widoku i zaznaczenia oraz
przełączniki ekran/druk w ⚙.

## Wznowienie przerwanego przebiegu

Sidecar powstaje w chwili, gdy agent kończy arkusz, więc przebieg wznawia się na poziomie
pliku. Policz brakujące i podaj je jako `args.files`:

```sh
python3 -c "
import os,glob,json
todo = {os.path.basename(f)[:-5] for f in glob.glob('data/questions/*.json')} \
     - {os.path.basename(f)[:-5] for f in glob.glob('data/time/*.json')}
print(len(todo)); print(json.dumps(sorted(todo)[:90]))"
```

Pozostałe pola args: `dataDir` = `data/questions`, `solDir` = `data/solutions`,
`figDir` = `browser/figures`, `outDir` = `data/time`, `model` = `sonnet` — ścieżki
bezwzględne.
