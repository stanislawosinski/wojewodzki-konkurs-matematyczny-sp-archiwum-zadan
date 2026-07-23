#!/usr/bin/env python3
"""Build a question set HTML from extracted metadata JSON.

Usage:
  python3 build.py data/one.json                       # one arkusz -> one.html
  python3 build.py data/*.json -o wszystkie-zadania.html   # master: all questions
  python3 build.py --topic "NWW / NWD" data/*.json     # set by topic across files
  # all positional args are input JSONs; -o/--out sets the output path

One self-contained HTML: MathML renders natively, figures via <img>, answers
revealed per-question via native <details> (hidden by default).

Custom print sets: every question shows a stable 8-hex id = sha1(question id)[:8].
Gutter checkboxes collect ids into the "selected" field (survives topic changes);
paste an id list into "Pokaż tylko id" to show exactly those, renumbered 1..N
(muted hash in parens); "Pomiń id" excludes a list (e.g. questions already used).
Checkboxes/UI/source refs are hidden on print. No dependencies, no build step.
"""
import json, sys, html, pathlib, hashlib, re

def load_questions(paths):
    tests = [json.loads(pathlib.Path(p).read_text()) for p in paths]
    qs = []
    for t in tests:
        for q in t["questions"]:
            q["_test"] = t              # keep a back-ref for provenance
            qs.append(q)
    return tests, qs

def render_question(q, hidden=False):
    t = q["_test"]
    src = f'{t["source_file"]}, s.{q["page"]}, zad. {q["number"]}'
    topics = "||".join(q.get("topics", []))
    h = hashlib.sha1(q["id"].encode()).hexdigest()[:8]  # stable short id (derived from unique id)
    # plain-text of prompt + choices for the free-text search (tags stripped, lowercased)
    choices_txt = " ".join(c["html"] for c in q.get("choices", []))
    search_txt = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", q["prompt_html"] + " " + choices_txt))).strip().lower()
    # materialize the initial view: questions past the cap ship pre-hidden so the browser
    # only lays out the first CAP on first paint (no on-load JS reflow — applyFilters isn't called on load)
    hide = ' style="display:none"' if hidden else ''
    parts = [f'<article class="q"{hide} id="{q["id"]}" data-hash="{h}" data-topics="{html.escape(topics)}"'
             f' data-year="{html.escape(t.get("school_year") or "")}" data-woj="{html.escape(t["wojewodztwo"])}"'
             f' data-etap="{html.escape(t["stage"])}" data-points="{q["points"]}" data-type="{q["type"]}"'
             f' data-school="{html.escape(t.get("school_type") or "")}"'
             f' data-search="{html.escape(search_txt)}">']
    parts.append('<label class="selectbox" title="zaznacz do wydruku"><input type="checkbox"></label>')
    parts.append(f'<div class="qhead">'
                 f'<span class="seqnum"></span>'
                 f'<span class="qnum">Zadanie {q["number"]}.</span>'
                 f'<span class="pts">{q["points"]}p</span>'
                 f'<span class="hash" title="identyfikator zadania">({h})</span>'
                 f'<span class="src" title="źródło">{html.escape(src)}</span></div>')
    parts.append(f'<div class="prompt">{q["prompt_html"]}</div>')
    for fig in q.get("figures", []):
        parts.append(f'<img class="fig" src="figures/{fig}" alt="rysunek do zadania {q["number"]}">')
    correct = q.get("answer", {}).get("correct")
    if q.get("choices"):
        parts.append('<ol class="choices">')
        for c in q["choices"]:
            hit = " correct" if c["label"] == correct else ""
            parts.append(f'<li class="choice{hit}" value="{c["label"]}">'
                         f'<span class="lbl">{c["label"]}.</span> {c["html"]}</li>')
        parts.append('</ol>')
    sol = q.get("answer", {}).get("solution_html")
    if correct or sol:  # nothing to reveal if the question has no key
        parts.append('<details class="reveal"><summary title="Pokaż odpowiedź"><span class="eye">👁</span></summary>')
        if correct:
            parts.append(f'<div class="answer">Odpowiedź: <b>{correct}</b></div>')
        if sol:
            parts.append(f'<div class="answer solution">{sol}</div>')
        parts.append('</details>')
    parts.append('</article>')
    return "\n".join(parts)

CSS = """
:root{color-scheme:light}
body{font-family:Georgia,'Times New Roman',serif;max-width:1200px;margin:2rem auto;
  padding:0 1rem;line-height:1.5;background:#fff;color:#000;
  display:flex;gap:2rem;align-items:flex-start}
h1{font-size:1.4rem;margin-top:0} .meta{color:#666;font-size:.9rem;margin-bottom:1.5rem}
/* left column: filters (sticky); right column: questions get the full width */
.sidebar{flex:0 0 250px;position:sticky;top:1rem;align-self:flex-start;
  max-height:calc(100vh - 2rem);overflow:auto;
  display:flex;flex-direction:column;gap:.5rem;
  padding-right:1rem;border-right:1px solid #ccc}
.content{flex:1 1 auto;min-width:0;max-width:820px;padding-left:1.8rem}
button{font:inherit;padding:.4rem .6rem;cursor:pointer}
select{font:inherit;padding:.35rem}
#count{color:#666;font-size:.9rem}
#capnote{color:#666;font-size:.9rem;margin:0 0 1rem;padding:.5rem .7rem;background:#f6f6f6;border-radius:4px}
#capnote a{color:#159;cursor:pointer}
@media(max-width:820px){          /* narrow: stack filters above questions */
  body{display:block}
  .sidebar{flex-basis:auto;position:static;max-height:none;overflow:visible;
    border-right:none;border-bottom:1px solid #ccc;padding:0 0 .6rem;margin-bottom:1rem}
  .content{max-width:none}
}
.q{position:relative;margin:1.6rem 0;padding-bottom:1rem;border-bottom:1px solid #eee}
.qhead{display:flex;gap:.8rem;align-items:baseline;flex-wrap:wrap}
.qnum,.seqnum{font-weight:bold} .pts{color:#a33;font-size:.85rem}
.hash{color:#aaa;font-size:.72rem;font-family:monospace}
.src{color:#999;font-size:.72rem;margin-left:auto;font-family:monospace}
/* selection checkbox in the left gutter */
.selectbox{position:absolute;left:calc(-1.1rem - .5rem - 1.5rem);top:.1rem;
  width:1.3rem;height:1.3rem;display:flex;align-items:center;justify-content:center;cursor:pointer}
.selectbox input{width:1.1rem;height:1.1rem;margin:0;cursor:pointer}
/* custom-set view: renumber the visible questions 1..N via a CSS counter */
.seqnum{display:none}
body.include-mode{counter-reset:seq}
body.include-mode .q{counter-increment:seq}
body.include-mode .qnum{display:none}
body.include-mode .seqnum{display:inline}
body.include-mode .seqnum::before{content:"Zadanie " counter(seq) ". "}
/* filter/selection controls in the sidebar (stacked) */
.sidebar label{display:block;font-size:.85rem;color:#444}
.sidebar select,.sidebar input[type=text]{width:100%;box-sizing:border-box;margin-top:.15rem}
.sidebar input[type=text]{font:inherit;padding:.3rem}
.selrow{display:flex;flex-direction:column;gap:.4rem;margin-top:.3rem}
.selrow button{width:100%}
#selected{font-family:monospace;font-size:.8rem;width:100%;box-sizing:border-box;resize:vertical}
.prompt{margin:.5rem 0} .fig{max-width:100%;height:auto;margin:.4rem 0}
ul,ol.choices{margin:.4rem 0} .choices{list-style:none;padding-left:0}
.choice{margin:.25rem 0;padding:.15rem .4rem;border-radius:4px}
.lbl{font-weight:bold;margin-right:.3rem}
math{font-size:1.05em}
/* per-question reveal: native <details>; toggle sits in the gutter, 1em below the checkbox */
.reveal{margin:0}
.reveal>summary{position:absolute;left:calc(-1.1rem - .5rem - 1.5rem + .052rem);top:2.6rem;box-sizing:border-box;
  width:1.196rem;height:1.196rem;display:flex;align-items:center;justify-content:center;
  font-size:.8rem;border:1px solid #bbb;border-radius:3px;background:#fff;color:#555;
  cursor:pointer;list-style:none;user-select:none}
.reveal>summary::-webkit-details-marker{display:none}
.reveal[open]>summary{border-color:#8c8;background:#eef8ee}
.reveal .eye{position:relative;top:.1em}
.answer{margin-top:.5rem;color:#161}
.choice.correct{background:transparent}
.q:has(.reveal[open]) .choice.correct{background:#d8f5d8;font-weight:600}
@media print{
  .sidebar{display:none}        /* 1. hide UI */
  body{display:block;max-width:none}
  .content{max-width:none;padding-left:0}
  .selectbox{display:none}      /* checkboxes never print */
  .q{break-inside:avoid}        /* 2. keep each question on one page */
  .src{display:none}            /* 3. hide file/page/question provenance */
  .reveal>summary{display:none} /* hide the reveal button (opened answers still print) */
}
"""

# Two-level catalog: category -> ordered leaves. Mirrors SCHEMA.md.
# Questions store leaves; category is derived here for the grouped dropdown.
CATALOG = [
    ("Liczby i podzielność", ["podzielność", "reszta z dzielenia", "NWW / NWD", "liczby rzymskie", "procenty"]),
    ("Wyrażenia: potęgi, pierwiastki, przekształcenia", ["potęgi i pierwiastki", "usuwanie niewymierności z mianownika", "wzory skróconego mnożenia", "wyłączanie jednomianu przed nawias"]),
    ("Równania, nierówności, proporcje", ["równania z jedną zmienną", "układy równań", "nierówności", "proporcjonalność prosta", "proporcjonalność odwrotna", "prędkość / droga / czas"]),
    ("Geometria płaska", ["geometria", "trójkąty", "sześciokąty foremne", "koła / okręgi", "pierścień kołowy", "okrąg wpisany i opisany", "dwusieczna kąta / symetralna odcinka"]),
    ("Geometria przestrzenna", ["bryły"]),
    ("Kombinatoryka i prawdopodobieństwo", ["zliczanie / metody zliczania", "kombinatoryka", "prawdopodobieństwo"]),
    ("Statystyka", ["statystyka opisowa"]),
    ("Metody i rozumowanie", ["dowodzenie / dowody", "szacowanie (zamiast obliczania)", "zagadki logiczne"]),
    ("Inne", ["inne", "przyroda"]),
]

def topic_options(present):
    """Grouped <optgroup> list for the topics actually present in the data."""
    out, seen = [], set()
    for cat, leaves in CATALOG:
        hit = [l for l in leaves if l in present]
        seen.update(hit)
        if hit:
            inner = "".join(f'<option value="{html.escape(l)}">{html.escape(l)}</option>' for l in hit)
            out.append(f'<optgroup label="{html.escape(cat)}">{inner}</optgroup>')
    extra = sorted(present - seen)  # any leaf not in the catalog (shouldn't happen)
    if extra:
        inner = "".join(f'<option value="{html.escape(l)}">{html.escape(l)}</option>' for l in extra)
        out.append(f'<optgroup label="(poza katalogiem)">{inner}</optgroup>')
    return '<option value="">Wszystkie tematy</option>' + "".join(out)

def build(paths, out=None, topic=None):
    tests, qs = load_questions(paths)
    if topic:
        qs = [q for q in qs if topic in q.get("topics", [])]
    arks = len({q["id"].rsplit("_q", 1)[0] for q in qs})  # distinct arkusze
    if len(tests) == 1 and not topic:
        t = tests[0]
        title = f'{t["competition"]} — etap {t["stage"]}, {t["school_year"]}'
        summary = f'<span id="setsummary" data-multi="0">{len(qs)} zadań</span>'
        bits = [html.escape(t["wojewodztwo"]), html.escape(t["date"]) if t.get("date") else None,
                summary, f'max {t["max_points"]} pkt']
        sub = " · ".join(x for x in bits if x)
    else:
        title = f'Zestaw zadań — {topic}' if topic else 'Wszystkie zadania'
        sub = f'<span id="setsummary" data-multi="1">{len(qs)} zadań z {arks} arkuszy</span>'
    CAP = 100  # initial view shows the first CAP matching questions; a link reveals the rest
    body = "\n".join(render_question(q, hidden=(i >= CAP)) for i, q in enumerate(qs))
    capped = len(qs) > CAP
    capnote = (f'<div id="capnote"{"" if capped else " style=\"display:none\""}>'
               f'Wyświetlono pierwsze {CAP} z <span id="capn">{len(qs)}</span> zadań. '
               f'<a href="#" id="showall">Pokaż wszystkie</a></div>')
    opts = topic_options({t for q in qs for t in q.get("topics", [])})
    def _opts(all_label, values, lab=lambda v: str(v)):
        head = f'<option value="">{html.escape(all_label)}</option>'
        return head + "".join(f'<option value="{html.escape(str(v))}">{html.escape(lab(v))}</option>' for v in values)
    TYPE_LABELS = {"closed_single": "Wielokrotny wybór", "true_false": "Prawda/Fałsz", "open": "Otwarte"}
    year_opts = _opts("Wszystkie lata", sorted({q["_test"].get("school_year") for q in qs} - {None}))
    woj_opts = _opts("Wszystkie województwa", sorted({q["_test"]["wojewodztwo"] for q in qs}))
    etap_opts = _opts("Każdy etap", sorted({q["_test"]["stage"] for q in qs}))
    SCHOOL_LABELS = {"podstawowa": "Szkoła podstawowa", "gimnazjum": "Gimnazjum"}
    school_opts = _opts("Każdy typ szkoły",
                        sorted({q["_test"].get("school_type") for q in qs} - {None}),
                        lambda v: SCHOOL_LABELS.get(v, v))
    pts_opts = _opts("Każda liczba pkt", sorted({q["points"] for q in qs}), lambda v: f"{v}p")
    form_opts = _opts("Każda forma", [ty for ty in TYPE_LABELS if ty in {q["type"] for q in qs}],
                      lambda v: TYPE_LABELS[v])
    doc = f"""<!doctype html>
<html lang="pl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)}</title><style>{CSS}</style></head>
<body>
<aside class="sidebar">
<label>Szukaj: <input type="text" id="search" placeholder="słowo w treści…"></label>
<label>Temat: <select id="topic">{opts}</select></label>
<label>Forma: <select id="form">{form_opts}</select></label>
<label>Etap: <select id="etap">{etap_opts}</select></label>
<label>Typ szkoły: <select id="school">{school_opts}</select></label>
<label>Województwo: <select id="woj">{woj_opts}</select></label>
<label>Rok: <select id="year">{year_opts}</select></label>
<label>Punkty: <select id="points">{pts_opts}</select></label>
<label>Pokaż tylko id: <input type="text" id="include" placeholder="hash, hash, …"></label>
<label>Pomiń id: <input type="text" id="exclude" placeholder="hash, hash, …"></label>
<div id="count"></div>
<div class="selrow">
<button type="button" id="useSel">Zaznaczone → „Pokaż tylko id”</button>
<button type="button" id="clearSel">Wyczyść zaznaczenie</button>
<button type="button" id="copySel">Kopiuj</button>
<textarea id="selected" readonly rows="2" placeholder="tu pojawią się id zaznaczonych zadań (przecinkami)"></textarea>
</div>
</aside>
<main class="content">
<h1>{html.escape(title)}</h1><div class="meta">{sub}</div>
{capnote}
<div id="qlist">
{body}
</div>
</main>
<script>
const qs=[...document.querySelectorAll('.q')],
  qlist=document.getElementById('qlist'),original=[...qlist.children],
  byHash=Object.fromEntries(qs.map(q=>[q.dataset.hash,q])),
  search=document.getElementById('search'),
  topic=document.getElementById('topic'),form=document.getElementById('form'),
  etap=document.getElementById('etap'),woj=document.getElementById('woj'),
  school=document.getElementById('school'),
  year=document.getElementById('year'),points=document.getElementById('points'),
  inc=document.getElementById('include'),exc=document.getElementById('exclude'),
  count=document.getElementById('count'),selected=document.getElementById('selected'),
  setsummary=document.getElementById('setsummary'),
  capnote=document.getElementById('capnote'),capn=document.getElementById('capn'),
  showall=document.getElementById('showall');
const attrSelects=[topic,form,etap,school,woj,year,points],multi=setsummary.dataset.multi==='1';
const CAP=100;let showAll=false;  // show first CAP matches; "Pokaż wszystkie" flips showAll
const idList=s=>(s.match(/[0-9a-f]{{8}}/gi)||[]).map(x=>x.toLowerCase());
function applyFilters(){{
  const order=idList(inc.value),incSet=new Set(order),
    excSet=new Set(idList(exc.value)),useInc=incSet.size>0,
    terms=search.value.toLowerCase().split(/\\s+/).filter(Boolean);
  document.body.classList.toggle('include-mode',useInc);
  // reorder to the pasted id order when an include list is active, else restore original order
  if(useInc){{const seen=new Set();
    order.forEach(h=>{{const q=byHash[h];if(q&&!seen.has(h)){{seen.add(h);qlist.appendChild(q);}}}});
    original.forEach(q=>{{if(!seen.has(q.dataset.hash))qlist.appendChild(q);}});
  }}else original.forEach(q=>qlist.appendChild(q));
  let n=0;const arks=new Set();
  qs.forEach(q=>{{const d=q.dataset;
    // "Pokaż tylko id" is an override: show exactly those ids, ignoring the AND filters.
    const match=useInc ? incSet.has(d.hash) : (
      terms.every(t=>d.search.includes(t))
      &&(!topic.value||d.topics.split('||').includes(topic.value))
      &&(!form.value||d.type===form.value)
      &&(!etap.value||d.etap===etap.value)
      &&(!school.value||d.school===school.value)
      &&(!woj.value||d.woj===woj.value)
      &&(!year.value||d.year===year.value)
      &&(!points.value||d.points===points.value)
      &&!excSet.has(d.hash));
    // cap: show only the first CAP matches (n counted pre-increment) unless showAll
    q.style.display=(match&&(showAll||n<CAP))?'':'none';
    if(match){{n++;arks.add(q.id.replace(/_q\\d+$/,''));}}}});
  const overCap=!showAll&&n>CAP;
  capnote.style.display=overCap?'':'none';if(overCap)capn.textContent=n;
  const active=useInc||excSet.size||terms.length||attrSelects.some(s=>s.value);
  count.textContent=active?`${{n}} zadań`:'';
  setsummary.textContent=multi?`${{n}} zadań z ${{arks.size}} arkuszy`:`${{n}} zadań`;
}}
function updateSelected(){{
  selected.value=qs.filter(q=>q.querySelector('.selectbox input').checked)
    .map(q=>q.dataset.hash).join(', ');
}}
const debounce=(fn,ms)=>{{let t;return()=>{{clearTimeout(t);t=setTimeout(fn,ms);}};}};
// any filter change re-applies the cap from the top; "Pokaż wszystkie" lifts it for this view
const refilter=()=>{{showAll=false;applyFilters();}};
attrSelects.forEach(s=>s.onchange=refilter);
search.oninput=debounce(refilter,200);
inc.oninput=exc.oninput=refilter;
showall.onclick=e=>{{e.preventDefault();showAll=true;applyFilters();}};
document.addEventListener('change',e=>{{if(e.target.matches('.selectbox input'))updateSelected();}});
document.getElementById('useSel').onclick=()=>{{inc.value=selected.value;refilter();}};
document.getElementById('clearSel').onclick=()=>{{
  qs.forEach(q=>q.querySelector('.selectbox input').checked=false);updateSelected();}};
document.getElementById('copySel').onclick=()=>{{selected.select();try{{document.execCommand('copy')}}catch(e){{}}}};
</script>
</body></html>"""
    if not out:
        stem = pathlib.Path(paths[0]).stem if len(paths) == 1 else "wszystkie-zadania"
        out = str(pathlib.Path(paths[0]).parent.parent / f"{stem}.html")
    pathlib.Path(out).write_text(doc)
    print(f"wrote {out} ({len(qs)} questions)")

if __name__ == "__main__":
    a, topic, out, paths = sys.argv[1:], None, None, []
    i = 0
    while i < len(a):
        if a[i] == "--topic": topic, i = a[i + 1], i + 2
        elif a[i] in ("-o", "--out"): out, i = a[i + 1], i + 2
        else: paths.append(a[i]); i += 1
    build(paths, out, topic)
