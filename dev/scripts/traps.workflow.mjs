export const meta = {
  name: 'traps',
  description: 'Kampania „Haczyki”: oznacza zadania z haczykiem (siła 2–3); Opus klasyfikuje, Opus weryfikuje siłę',
  phases: [
    { title: 'Klasyfikacja', detail: 'Opus, jeden agent na arkusz, tylko siła 2–3' },
    { title: 'Weryfikacja', detail: 'Opus niezależnie ocenia siłę każdej flagi' },
  ],
}

// args: lista nazw plików z data/questions (bez .json). Wynik: [{file, c, verdicts}] —
// sidecar data/traps/<file>.json = werdykty z siłą ≥ 2, typy z werdyktu, note z klasyfikacji.
const BANK = '/Users/stanislawosinski/personal/adam/konkurs-mat'

const TYPES = `
- jednostki — odpowiedź/warianty w innych jednostkach niż dane lub naturalny wynik (km/h vs m/s, cm² vs m², minuty vs godziny).
- o-co-pytaja — pytanie dotyczy innej osoby, miejsca, chwili lub wielkości niż ta, którą naturalnie się liczy (godzina drugiej osoby, odległość od drugiej miejscowości, liczba przeciwna do wyniku, kąt rozwarty zamiast ostrego).
- kierunek-relacji — łatwo odwrócić relację z treści: "razy krótszy", "o ile starszy", kto od kogo, "gdy A będzie miał tyle, ile B ma teraz".
- procent-podstawa — od czego liczy się procent: punkty procentowe vs procenty, "wzrost o" vs "do", część vs procent, procent od nowej vs starej wartości.
- zbior-liczb — warunek na rodzaj liczb zmienia odpowiedź: całkowite (też ujemne, zero), naturalne, różne, cyfry (pierwsza ≠ 0), dodatnie.
- wszystkie-przypadki — kilka rozwiązań/konfiguracji, łatwo podać jedno.
- warunek-istnienia — kandydat na wynik nie spełnia warunku istnienia lub treści (nierówność trójkąta, mianownik ≠ 0, wynik bez sensu w kontekście).
- kalendarz-czas — rok przestępny, długości miesięcy, strefa czasowa, zmiana czasu.
- znak — minus przed nawiasem/kwadratem nawiasu, potęga liczby ujemnej (−2² vs (−2)²).
- pozorna-wlasnosc — coś wygląda na prawdziwe, a nie jest (liczba "wyglądająca na pierwszą", średnia prędkość = średnia prędkości, podwojenie krawędzi podwaja objętość).
- konwencja — błąd w konkretnej konwencji zapisu/liczenia, której dotyczy zadanie: liczba cyfr k·10^n, cyfry okresu po przecinku, dzielenie przez ułamek.
- plot-i-slupki — pomyłka o jeden: odcinki vs punkty, liczenie "włącznie".
- rysunek — rysunek nie w skali / łatwo przeoczyć lub źle odczytać dane z rysunku.
- kwantyfikator — "co najmniej", "dokładnie", "zawsze" vs "może", gwarancja/pewność.
- szczegol-bryly — bryła bez pokrywy, grubość ścianek, wymiary zewnętrzne vs wewnętrzne.
- zaokraglenie — "z dokładnością do", wartość dokładna vs przybliżona (7/3 vs 2,33).
- inne:<krótka-nazwa> — haczyk spoza listy; nie wciskaj na siłę, nazwij nowy.`

const SCALE = `HACZYK to cecha treści lub odpowiedzi, na której uczeń, który ZNA matematykę potrzebną w zadaniu, traci punkt przez czytanie, przeoczony warunek albo znaną pułapkę. Trudność, potrzeba pomysłu, długi rachunek czy możliwość pomyłki rachunkowej to NIE są haczyki.

SIŁA haczyka:
- 3 — łapie ucznia, który zna metodę i liczy UWAŻNIE; pułapka siedzi w treści/warunku/pojęciu, nie w rachunku. Przykłady wzorcowe: "gdy A będzie miał tyle lat, ile B ma TERAZ"; liczba 91 = 7·13 "wygląda na pierwszą"; "różnica 20% i 25% to 5 punktów procentowych, a nie 5%"; najmniejsze liczby pierwsze 2, 3, 5 nie tworzą trójkąta; dane w km/h, a odpowiedzi w m/s; "liczby całkowite" — trzeba też ujemnych par.
- 2 — realna, typowa pułapka tego zadania, ale do uniknięcia zwykłą starannością. Przykłady: liczba cyfr 34·10^20 (k ma dwie cyfry); liczb od 100 do 999 jest 900, nie 899; podstawa trapezu w dm, wysokość w cm.
- 1 — zwykła pomyłka rachunkowa lub nieuwaga, którą da się popełnić w każdym zadaniu: zapomnieć dodać resztę, pomnożyć zamiast podzielić, przesunąć przecinek, pomylić 0,05 z 0,5. To NIE jest haczyk.
Większość zadań nie ma haczyka siły 2 ani 3.`

const CLASSIFY_SCHEMA = {
  type: 'object',
  properties: {
    reviewed: { type: 'integer' },
    traps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          sila: { type: 'integer', enum: [2, 3] },
          types: { type: 'array', items: { type: 'string' } },
          note: { type: 'string', description: 'po polsku, ≤110 znaków, nazywa haczyk, nie zdradza wyniku' },
          wrong_path: { type: 'string' },
          wrong_answer: { type: 'string', description: 'zamknięte: litera; P/F: numer zdania i błędna ocena; otwarte: błędna wartość' },
        },
        required: ['id', 'sila', 'types', 'note', 'wrong_path', 'wrong_answer'],
      },
    },
  },
  required: ['reviewed', 'traps'],
}

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    verdicts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          sila: { type: 'integer', enum: [1, 2, 3], description: 'twoja niezależna ocena; 1 = to nie haczyk' },
          types: { type: 'array', items: { type: 'string' } },
          reason: { type: 'string' },
        },
        required: ['id', 'sila', 'types', 'reason'],
      },
    },
  },
  required: ['verdicts'],
}

const classifyPrompt = (file) => `Przejrzyj WSZYSTKIE zadania z arkusza konkursowego i oznacz te, które mają HACZYK siły 2 lub 3.

Plik: ${BANK}/data/questions/${file}.json (questions[]: id, prompt_html z MathML, choices, answer.correct = klucz, traktuj jako poprawny). Jeśli istnieje ${BANK}/data/solutions/${file}.json — rozwiązania pomocnicze. Zadanie z rysunkiem obejrzyj: ${BANK}/browser/figures/<nazwa> (svg w ${BANK}/browser/figures/svg/).

${SCALE}

Typy (zadanie może mieć kilka):
${TYPES}

Zasady:
- Rozwiąż każde zadanie przed oceną. Bloki prawda/fałsz oceniaj zdanie po zdaniu (numer zdania w wrong_answer).
- Każda flaga musi mieć dowód: wrong_path i wrong_answer (w zamkniętym — litera wariantu, do którego prowadzi błąd).
- Zanim zgłosisz, zapytaj się: czy uważny uczeń znający metodę realnie by tu wpadł? Jeśli to tylko nieuwaga rachunkowa — siła 1, nie zgłaszaj.
- note: po polsku, ≤110 znaków, nazywa haczyk, nie podaje wyniku.
- Zwróć tylko siłę 2 i 3. reviewed = liczba wszystkich zadań w arkuszu.`

const verifyPrompt = (file, claims) => `Jesteś surowym recenzentem. Niezależnie oceń SIŁĘ każdego zgłoszonego haczyka (1–3).

Arkusz: ${BANK}/data/questions/${file}.json (klucz: answer.correct; rysunki w ${BANK}/browser/figures/, svg w ${BANK}/browser/figures/svg/).

${SCALE}

Zgłoszenia:
${JSON.stringify(claims, null, 1)}

Dla każdego zgłoszenia przeczytaj zadanie i sam zdecyduj o sile, porównując z przykładami wzorcowymi. Pytanie kluczowe: czy pułapka siedzi w treści/warunku/pojęciu (3), jest typową pułapką tego zadania do uniknięcia starannością (2), czy to zwykła pomyłka rachunkowa możliwa wszędzie (1)? Gdy masz wątpliwość między dwiema siłami, wybierz niższą. Popraw typy, jeśli trzeba. Zwróć dokładnie jeden werdykt na każde zgłoszone id (bez przyrostków w id).`

const results = await pipeline(
  args,
  (file) => agent(classifyPrompt(file), { label: `klasyfikacja:${file}`, phase: 'Klasyfikacja', schema: CLASSIFY_SCHEMA }),
  async (c, file) => {
    const claims = (c && c.traps || []).map(t => ({ id: t.id, types: t.types, note: t.note, wrong_path: t.wrong_path, wrong_answer: t.wrong_answer }))
    if (!claims.length) { log(`${file}: brak flag`); return { file, c, verdicts: [] } }
    const v = await agent(verifyPrompt(file, claims), { label: `weryfikacja:${file}`, phase: 'Weryfikacja', schema: VERIFY_SCHEMA })
    const vv = (v && v.verdicts) || []
    log(`${file}: ${c.reviewed} zadań, zgłoszono ${claims.length}, po weryfikacji siła 3: ${vv.filter(x => x.sila === 3).length}, siła 2: ${vv.filter(x => x.sila === 2).length}`)
    return { file, c, verdicts: vv }
  },
)

return results.filter(Boolean)
