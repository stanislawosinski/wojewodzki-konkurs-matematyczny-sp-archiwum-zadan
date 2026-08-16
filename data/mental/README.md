# Kampania "W pamięci" — sidecary

Jeden plik na arkusz, tak samo nazwany jak `data/questions/<plik>.json`. Zawartość: tylko
zadania oflagowane jako możliwe do rozwiązania w pamięci.

```json
{ "<question id>": { "level": "wprost" | "pomysl", "hint": "<polska podpowiedź>" } }
```

- `wprost` — liczysz od ręki, bez triku (może być kilka drobnych kroków).
- `pomysl` — naiwna droga to robota na kartce, jedno spostrzeżenie zwija ją do sekund.
- Brak wpisu = nie w pamięci. Nie ma poziomu "może".
- `hint` jest pokazywany uczniowi w UI: plain text (idzie przez `esc()`), ≤110 znaków,
  nazywa **ruch**, nigdy wynik ruchu ani wartość o krok od wyniku.

Generuje `dev/scripts/mental.workflow.mjs` (Opus, jeden agent na arkusz).

## Znana luka w partii 1 (pierwsze 90 arkuszy rejonowych)

Prompt miał wtedy sprzeczność: twarda reguła pomijała wszystko z tagiem `zadania
wieloczęściowe`, a rozstrzygnięcie niżej mówiło, że prawda/fałsz to jedno zadanie. Agenci
rozstrzygali różnie. Doprecyzowane 2026-08-15 (P/F nigdy nie jest blokiem), ale partii 1
świadomie nie przerabiamy — te trzy zadania trzeba ocenić ręcznie przed scaleniem:

- `rejonowy_2017-2018_pomorskie_q7` — ocenione ręcznie 2026-08-16: `pomysl`
- `rejonowy_2019-2020_pomorskie_q7` — ocenione ręcznie 2026-08-16: bez flagi (zliczanie
  liczb trzycyfrowych podzielnych przez 7 lub 11 to rachunek na kartkę)
- `rejonowy_2021_lubuskie_q31` — ocenione ręcznie 2026-08-16: `pomysl`

## Wznowienie przerwanego przebiegu

Sidecar powstaje w chwili, gdy agent kończy arkusz, więc przebieg wznawia się na poziomie
pliku — bez stanu w pamięci sesji. Policz brakujące i podaj je jako `args.files`:

```sh
python3 -c "
import os,glob,json
todo = {os.path.basename(f)[:-5] for f in glob.glob('data/questions/*.json')} \
     - {os.path.basename(f)[:-5] for f in glob.glob('data/mental/*.json')}
print(len(todo)); print(json.dumps(sorted(todo)[:90]))"
```

Puszczaj partiami po ~90 (14 agentów równolegle, ~45 min na partię). Pozostałe pola args:
`dataDir` = `data/questions`, `figDir` = `browser/figures`, `outDir` = `data/mental`,
`model` = `opus` — wszystkie jako ścieżki bezwzględne.
