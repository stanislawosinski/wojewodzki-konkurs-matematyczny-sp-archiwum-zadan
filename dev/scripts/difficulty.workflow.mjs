export const meta = {
  name: 'difficulty-judge',
  description: 'Rank sets of five questions by difficulty for the "Trudność" scale (judge only; each judge writes wynik-s<N>.json into the run dir)',
  phases: [{ title: 'Judge', detail: 'one agent per judge file → wynik-s<N>.json' }],
}

// args: { dir, judges, only?:[N], model? }  (tolerate a JSON-string args)
// dir — the run dir written by difficulty-prepare.py (zadania-s<N>.json, zestawy-s<N>.txt).
// Resumable at judge granularity: every agent writes its own wynik-s<N>.json; rerun a killed or
// failed run with `only` = the judge numbers difficulty-collect.py reports as missing/invalid.
// Keep the judge prompt below unchanged — every judgement on the scale used this exact criterion;
// a different prompt (or model: the 2026-11-21 pilot found Sonnet/Haiku too far from Opus) needs
// a new scale version, see data/difficulty/README.md.
const A = typeof args === 'string' ? JSON.parse(args) : (args || {})
const { dir, judges, only, model } = A
if (!dir || !Number.isInteger(judges)) throw new Error('args: { dir, judges, only?, model? }')
const ids = Array.isArray(only) && only.length ? only : Array.from({ length: judges }, (_, i) => i + 1)

const prompt = (j) => `Jesteś sędzią w ocenie porównawczej trudności zadań konkursowych z matematyki (szkoła podstawowa, Polska).

Plik ${dir}/zadania-s${j}.json zawiera zadania (pola: kod, typ, pkt, tresc, odpowiedzi, klucz, rozwiazanie, rysunki). Zadania pochodzą z różnych arkuszy; kody są losowe i nic nie mówią o arkuszu, etapie ani roku — nie próbuj tego zgadywać.
Plik ${dir}/zestawy-s${j}.txt zawiera ponumerowane zestawy po 5 kodów.

Najpierw przeczytaj oba pliki w całości (Read, w częściach jeśli trzeba). Przy zadaniach, które mają rysunki i których treść bez rysunku jest niejasna, obejrzyj plik rysunku (ścieżki w polu "rysunki"; SVG możesz przeczytać jako tekst i odczytać współrzędne, PNG obejrzyj). Pole "klucz" i "rozwiazanie" to odpowiedź i wzorcowe rozwiązanie — użyj ich, żeby znać trik, ale oceń zadanie sam; gdzie rozwiązania brak, rozwiąż je.

Uczeń odniesienia: silny, dobrze przygotowany uczeń klasy 7–8 startujący w wielkopolskim konkursie kuratoryjnym — zna materiał (potęgi, pierwiastki, wzory skróconego mnożenia, równania i układy równań, Pitagoras, trójkąty 30-60-90 i 45-45-90, bryły, procenty, zliczanie, prawdopodobieństwo), pisze cały arkusz 20 zadań w 90 minut, bez kalkulatora.

Kryterium: które zadanie ten uczeń NAJCZĘŚCIEJ nie rozwiąże w pełni poprawnie (nie zdobędzie kompletu punktów za to zadanie) — przez brak pomysłu, długi lub pułapkowy rachunek, haczyk w treści, nieuważne czytanie, wiele zdań do oceny w prawda/fałsz albo wymóg pełnego uzasadnienia. Nie oceniaj elegancji ani długości tekstu samej w sobie; liczba punktów zadania nie jest kryterium (zadanie za 3 pkt może być łatwe). Liczy się szansa porażki.

Uporządkuj każdy zestaw od NAJTRUDNIEJSZEGO do najłatwiejszego. Każdy zestaw oceniaj osobno, ale trzymaj jedną, spójną miarę przez wszystkie zestawy.

Na koniec zapisz (Write) plik ${dir}/wynik-s${j}.json — jeden obiekt JSON:
{"rankingi": [{"zestaw": 1, "kolejnosc": ["<kod najtrudniejszego>", "…", "…", "…", "<kod najłatwiejszego>"], "pewnosc": 2}, …]}
z wpisem dla KAŻDEGO zestawu z pliku; "zestaw" to numer z pliku, w "kolejnosc" dokładnie te same 5 kodów co w zestawie, "pewnosc": 1 = zgaduję, 2 = raczej, 3 = pewny. Odpowiedz jednym słowem: gotowe.`

phase('Judge')
await parallel(ids.map((j) => () =>
  agent(prompt(j), { label: `judge ${j}`, phase: 'Judge', ...(model ? { model } : {}) })))
log(`Judges run: ${ids.length}. Next: python3 dev/scripts/difficulty-collect.py --dir ${dir}`)
return { judges: ids }
