#!/usr/bin/env python3
"""Gera feature-links.json: liga cada feature (IDs de docs/features/features-index.json)
às evidências (docs/evidence/catalog.json), diagramas, ADRs, issues/PRs e grupos do Board Mestre.
Vínculos inferidos (mapeamento curado de grupo e de funcionalidade) saem com fonte 'inferido'."""
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, ".."))
OUT = os.path.join(HERE, "feature-links.json")
REPO = "https://github.com/ianmaciel7/exams-app/blob/dev/"
IMG = (".png", ".jpg", ".jpeg", ".webp", ".gif")

MAP = {}
for line in open(os.path.join(HERE, "MIGRATION-MAP.md"), encoding="utf8"):
    found = re.match(r"^\| \x60([^\x60]+)\x60 \| \x60([^\x60]+)\x60 \|", line)
    if found:
        MAP[found.group(1)] = found.group(2)

def mapped(page):
    if page not in MAP:
        raise FileNotFoundError("caminho sem entrada no mapa de migração: " + page)
    return MAP[page]

def load(p): return json.load(open(os.path.join(ROOT, p), encoding="utf8"))
idx = load("prototype/features-index.json")
cat = load("prototype/catalog.json")
mest = load("prototype/board-mestre.json")
errors = []

# Mapeamento explícito: valor de 'funcionalidade' do catálogo -> id de feature (curado, fonte 'inferido').
FUNC_TO_FEATURE = {
    "Questões e filtros": "questoes", "Simulados": "simulados", "PDF Reader": "pdf-reader",
    "Revisão espaçada": "revisao", "Grafo e relacionamentos": "grafo",
    "Tipos de objeto e propriedades": "tipos-propriedades", "Sincronização com Claude": "claude-storage",
    "Workspace e navegação": "workspace", "Abas e painéis": "workspace",
}
# Grupos do Board Mestre (nome do cartão) relacionados a cada feature: curado, fonte 'inferido'.
GROUP_NAMES = {
    "questoes": ["Banco de questões e simulados", "Filtros avançados", "Cadernos e queries de questões", "Questões contextuais", "Navegação por teclado, grade e relatório"],
    "simulados": ["Banco de questões e simulados"],
    "pdf-reader": ["PDF Reader: reflow e anotações", "PDF.js: texto, canvas, DPR e zoom"],
    "revisao": ["Revisão diária", "Recuperação de erros"],
    "grafo": ["Explorar, grafo e navegação contextual", "Isolamento do grafo por espaço"],
    "workspace": ["Workspace de três painéis", "Painel direito e motor de grafo", "Atalhos e roteador de comandos"],
    "tipos-propriedades": ["Espaço → Objeto → Tipo", "Modelo de objetos e relações", "Painel de propriedades"],
    "claude-storage": ["Claude Storage — homologação", "Claude Storage Bridge — PoC"],
}
# Diagramas do índice: são globais (não há vínculo feature->diagrama no índice); exibidos como contexto.
DIAGRAM_BLOCK = {"c4-l1": ("prototype/c4.md", 0), "c4-l2": ("prototype/c4.md", 1), "er-dominio": ("prototype/dominio.md", 0)}

def mermaid_blocks(rel):
    text = open(os.path.join(ROOT, rel), encoding="utf8").read()
    return re.findall(r"```mermaid\n(.*?)```", text, re.S)
blocks_cache = {}
def diagram_source(did):
    rel, i = DIAGRAM_BLOCK[did]
    blocks_cache.setdefault(rel, mermaid_blocks(rel))
    if i >= len(blocks_cache[rel]): errors.append("diagrama sem bloco mermaid: " + did); return ""
    return blocks_cache[rel][i].strip()

group_index = {}
for area in mest["areas"]:
    for card in area["cards"]:
        group_index[card["name"]] = {"id": area["id"] + "/" + card["blocks"][0], "name": card["name"], "board": area["id"] + " " + area["name"], "blocks": card["blocks"]}

def synthesis(rel):
    lines = [l for l in open(os.path.join(ROOT, rel), encoding="utf8").read().splitlines() if l.startswith("- ")]
    return lines[:4]

def img_src(caminho):
    return os.path.relpath(os.path.join(ROOT, caminho), HERE).replace(os.sep, "/")

adr_ids = {a["id"]: a for a in idx["adrs"]}
features = []
for f in idx["features"]:
    fid = f["id"]
    adrs = sorted({m for m in re.findall(r"(?:adr/)?(\d{4})-", open(os.path.join(ROOT, mapped(f["page"])), encoding="utf8").read()) if m in adr_ids})
    ev_items = [e for e in cat["evidencias"] if FUNC_TO_FEATURE.get(e["funcionalidade"]) == fid]
    evid = []
    for e in ev_items:
        is_img = e["caminho"].lower().endswith(IMG)
        evid.append({"id": e["id"], "tipo": e["tipo"], "data": e["data"], "estado": e["estado_momento"],
                     "issue": e["vinculos"].get("issue"), "caminho": e["caminho"], "repo_url": REPO + e["caminho"],
                     "src": img_src(e["caminho"]) if is_img else None, "par": e.get("par_antes_depois")})
    tests = [e for e in evid if e["tipo"] == "teste executado"]
    groups = []
    for name in GROUP_NAMES.get(fid, []):
        if name in group_index: groups.append(dict(group_index[name], fonte="inferido"))
        else: errors.append(fid + ": grupo inexistente: " + name)
    issues = sorted(set(f["issues"]) | {e["issue"] for e in evid if e["issue"]})
    features.append({
        "id": fid, "title": f["title"], "status": f["status"], "doc": {"path": mapped(f["page"]), "url": REPO + mapped(f["page"]), "fonte": "índice"},
        "sintese": synthesis(mapped(f["page"])),
        "adrs": [{"id": a, "title": adr_ids[a]["title"], "status": adr_ids[a]["status"], "fonte": "documento da feature (ID)"} for a in adrs],
        "diagramas": [{"id": d, "fonte": "global (sem vínculo por feature no índice)"} for d in DIAGRAM_BLOCK],
        "issues": [{"numero": n, "url": "https://github.com/ianmaciel7/exams-app/issues/%d" % n, "fonte": "índice ou catálogo (ID)"} for n in issues],
        "prs": [{"numero": n, "url": "https://github.com/ianmaciel7/exams-app/pull/%d" % n, "fonte": "índice (ID)"} for n in f["prs"]],
        "testes": tests, "evidencias": evid, "grupos": groups,
        "release": {"estado": "não verificado", "observacao": "Nenhuma release, tag ou milestone registrada (planning/estado-atual.md). Sem datas inferidas.", "fonte": "docs/planning/estado-atual.md"},
    })

# Checagens: todo caminho e ID referenciado precisa existir.
for ft in features:
    for k in ("path",): pass
    if not os.path.isfile(os.path.join(ROOT, ft["doc"]["path"])): errors.append(ft["id"] + ": doc ausente")
    for e in ft["evidencias"]:
        if not os.path.isfile(os.path.join(ROOT, e["caminho"])): errors.append(ft["id"] + ": evidência ausente " + e["caminho"])

out = {"schema_version": 1, "diagramas": [{"id": d["id"], "title": d["title"], "page": mapped(d["page"]), "mermaid": diagram_source(d["id"])} for d in idx["diagrams"]], "source": ["prototype/features-index.json", "prototype/catalog.json", "prototype/board-mestre.json"],
       "unclassified": cat["resumo"], "features": features,
       "sem_feature": sum(1 for e in cat["evidencias"] if e["funcionalidade"] not in FUNC_TO_FEATURE)}
if errors:
    print("\n".join(errors)); print("FALHOU: " + str(len(errors))); sys.exit(1)
text = json.dumps(out, ensure_ascii=False, indent=1) + "\n"
if "--check" in sys.argv:
    if open(OUT, encoding="utf8").read() != text: print("feature-links.json desatualizado; rode build_feature_links.py"); sys.exit(1)
    print("OK: feature-links.json atualizado."); sys.exit(0)
open(OUT, "w", encoding="utf8").write(text)
print("OK: %d features, %d evidências vinculadas, %d sem feature." % (len(features), sum(len(f["evidencias"]) for f in features), out["sem_feature"]))
