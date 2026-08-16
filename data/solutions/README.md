# Kampania „Rozwiązania AI" — sidecary

Jeden plik na arkusz, tak samo nazwany jak `data/questions/<plik>.json`. Zawartość: tylko zadania,
przy których organizator nie opublikował żadnej drogi dojścia.

```json
{ "<question id>": { "html": "<wywód HTML>", "check": "<odpowiedź w formacie klucza>" } }
```

- Zakres: `answer.correct` niepuste **i** `answer.solution_html` puste **i** brak
  `answer.model.solution_html`. Klucz jest znany i potwierdzony ślepym solve'em z kampanii
  weryfikacji, więc agent pisze samą drogę — nie weryfikuje odpowiedzi.
- `html` idzie do przeglądarki jako zaufany HTML (pole `sol_ai` w shardach): `<p>` + inline MathML,
  1–4 kroki, przecinek dziesiętny, ≤ ~600 znaków. Nigdy przez eliminację odpowiedzi.
- `check` to ta sama odpowiedź w formacie klucza (litera / `PFPF` / krótki tekst) — istnieje
  wyłącznie po to, żeby maszynowo porównać wywód z kluczem. Do shardów nie trafia.
- Brak wpisu = agent nie znalazł uczciwej drogi. Wywód, który dochodzi do klucza przez odgadnięcie
  odpowiedzi, jest gorszy niż luka — taka była twarda reguła promptu.

Generuje `dev/scripts/solution.workflow.mjs` (sonnet, jeden agent na arkusz).

## Walidacja

```sh
node dev/scripts/check-solutions.mjs          # wszystkie sidecary; exit 1 przy ERROR
node dev/scripts/check-solutions.mjs <plik>…  # wybrane
```

Raport ląduje w `_check.tsv`. ERROR = `check` ≠ klucz, nieznane id, zadanie poza zakresem, tag spoza
whitelisty, atrybut `on*`/`style`. WARN = wywód dłuższy niż 500 znaków tekstu (mierzone po
strippingu — MathML rozdyma jednolinijkowy wywód do 2 kB), kropka dziesiętna, rozjazd zapisu przy
zadaniach otwartych (`open-diff` — tam klucz bywa całym zdaniem, więc porównanie jest miękkie).
GAP = zadanie w zakresie bez wpisu.

## Wynik kampanii (2026-08-16)

318 arkuszy, **4847 rozwiązań** — komplet zadań w zakresie, zero luk (closed_single 4040 ·
true_false 541 · open 266), średnio 562 B HTML / 181 znaków tekstu. Zero rozjazdów `check` vs klucz
w całym korpusie.

Pierwszy przebieg (sonnet) zostawił 11 luk; drugi przebieg (opus, `_gaps/`) domknął wszystkie i nie
zgłosił żadnego błędnego klucza. Każda z tych 11 to był błąd odczytu rysunku, nie zadanie nie do
zrobienia — przeoczony znak kąta prostego, łuk 150° postawiony w innym punkcie niż zakładano,
niekwadratowe oczka kratki, kropki okazujące się znacznikami kąta prostego. Werdykty siedzą
w journalu przebiegu, wpisy scalone do sidecarów arkuszy.

## Wznowienie przerwanego przebiegu

Sidecar powstaje w chwili, gdy agent kończy arkusz, więc przebieg wznawia się na poziomie pliku.
Policz brakujące i podaj je jako `args.files`:

```sh
node --input-type=module -e '
import {readdirSync,readFileSync,existsSync} from "node:fs";
const todo=[];
for(const f of readdirSync("data/questions/").filter(f=>f.endsWith(".json"))){
 if(existsSync("data/solutions/"+f))continue;
 const n=JSON.parse(readFileSync("data/questions/"+f,"utf8")).questions.filter(x=>{const a=x.answer||{};
  return a.correct!=null&&a.correct!==""&&!a.solution_html&&!(a.model&&a.model.solution_html)}).length;
 if(n)todo.push(f.slice(0,-5));}
console.log(todo.length);console.log(JSON.stringify(todo));'
```

Pozostałe pola args: `dataDir` = `data/questions`, `figDir` = `browser/figures`,
`outDir` = `data/solutions`, `model` = `sonnet` — wszystkie jako ścieżki bezwzględne. Partie po ~80
arkuszy schodzą w ~70 min.

## Drugi przebieg na lukach

`dev/scripts/solution-gaps.workflow.mjs` (opus, jeden agent na zadanie) bierze zgłoszone luki wraz
z powodem, na którym poległ pierwszy przebieg, i pisze pojedyncze pliki do `_gaps/` — osobno, żeby
nic nie nadpisało sidecarów kampanii. Scalenie do `data/solutions/<arkusz>.json` jest osobnym,
świadomym krokiem. Agent ma trzy wyjścia: wywód, „nadal nie da się" albo „klucz jest błędny"
(`key_suspect` → kandydat do `suspected_key_errors.tsv`).
