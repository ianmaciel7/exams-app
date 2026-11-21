#!/usr/bin/env python3
"""Reposiciona o board.json em colunas por área do board-mestre.json (determinístico).

Cada container de topo é uma unidade: move junto todos os nós cujo retângulo cai dentro dele.
Colunas seguem a ordem das áreas; dentro da coluna, a ordem dos cards. Largura de coluna fixa,
espaçamento uniforme, sem sobreposição. Nós sem container entram em "Sem grupo (revisar)".
Gera section-layout-map.json com id, grupo, posição antiga e nova e hash do conteúdo sem coordenadas.
Uso: python3 -I layout_columns.py  (dentro de prototype/board-exam-app__*)
"""
import json, hashlib, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
P = lambda f: os.path.join(HERE, f)
D = json.load(open(P("board.json"), encoding="utf8")); E = D["elements"]; O = D["order"]
M = json.load(open(P("board-mestre.json"), encoding="utf8"))
PAD, TITLE, GX, GY, X0, Y0 = 30, 40, 160, 240, 0, 0

def bx(v): return v["x"], v["y"], v["x"] + v.get("w", 0), v["y"] + v.get("h", 0)
def inside(a, b):
    a1, a2, a3, a4 = bx(a); b1, b2, b3, b4 = bx(b)
    return a1 >= b1 and a2 >= b2 and a3 <= b3 and a4 <= b4
def h(v):
    d = {k: x for k, x in v.items() if k not in ("x", "y")}
    return hashlib.sha256(json.dumps(d, ensure_ascii=False, sort_keys=True).encode()).hexdigest()[:16]

conts = {k: v for k, v in E.items() if v["type"] == "container"}
nodes = {k: v for k, v in E.items() if v["type"] not in ("arrow",) and "x" in v}
top = [c for c in conts if not any(o != c and inside(conts[c], conts[o]) for o in conts)]

# nó sem qualquer container de topo
loose = [k for k, v in nodes.items() if k not in top and not any(inside(v, conts[c]) for c in top)]
# área e ordem de cada unidade
order_key = {}
for ai, a in enumerate(M["areas"]):
    ci = 0
    for card in a["cards"]:
        for b in card.get("blocks", []):
            order_key.setdefault(b, (ai, ci)); ci += 1
unassigned = sorted([c for c in top if c not in order_key], key=lambda c: (conts[c]["y"], conts[c]["x"]))
units = sorted([c for c in top if c in order_key], key=lambda c: order_key[c])
area_of = {c: order_key[c][0] for c in units}
n_areas = len(M["areas"])
# "Sem grupo (revisar)": nós soltos são empilhados numa coluna própria ao final (ver abaixo)
LG = "e9900"
units += unassigned
for c in unassigned: area_of[c] = n_areas + 1

# largura comum da coluna
W = max(conts[c]["w"] for c in units)
cols = {}
for c in units: cols.setdefault(area_of[c], []).append(c)
before = {k: (v["x"], v["y"]) for k, v in nodes.items()}
rows_by_unit = {}
# posiciona unidades: coluna por área, empilhadas
colx = 0
newpos = {}
# membros calculados ANTES de qualquer movimento, para não capturar nós já deslocados
members_of = {c: [k for k in nodes if k != c and inside(nodes[k], conts[c])] for c in units}
for ai in sorted(cols):
    y = Y0
    for c in cols[ai]:
        cv = conts[c]; dx = (X0 + colx) - cv["x"]; dy = y - cv["y"]
        members = members_of[c]
        for k in [c] + members:
            E[k]["x"] += dx; E[k]["y"] += dy
            newpos[k] = (E[k]["x"], E[k]["y"])
        cv["w"] = W  # largura comum
        rows_by_unit[c] = members
        y += cv["h"] + GY
    colx += W + GX

# nós soltos: coluna final, empilhados; depois o container LG envolve exatamente eles
if loose:
    y = Y0; loose_sorted = sorted(loose, key=lambda k: (before[k][1], before[k][0]))
    for k in loose_sorted:
        v = nodes[k]; dx = (X0 + colx + PAD) - v["x"]; dy = (y + TITLE + PAD) - v["y"]
        v["x"] += dx; v["y"] += dy; newpos[k] = (v["x"], v["y"]); y += v.get("h", 0) + GY
    xs = [nodes[k]["x"] for k in loose]; ys = [nodes[k]["y"] for k in loose]
    x2 = [nodes[k]["x"] + nodes[k].get("w", 0) for k in loose]; y2 = [nodes[k]["y"] + nodes[k].get("h", 0) for k in loose]
    E[LG] = {"type": "container", "x": min(xs) - PAD, "y": min(ys) - PAD - TITLE,
             "w": max(x2) - min(xs) + 2 * PAD, "h": max(y2) - min(ys) + 2 * PAD + TITLE,
             "color": "white", "text": "Sem grupo (revisar)"}
    conts[LG] = E[LG]; rows_by_unit[LG] = list(loose_sorted)
    units.append(LG)
# sem sobreposição entre unidades
boxes = {c: bx(conts[c]) for c in units}
ov = [(a, b) for i, a in enumerate(units) for b in units[i+1:]
      if not (boxes[a][2] <= boxes[b][0] or boxes[b][2] <= boxes[a][0] or boxes[a][3] <= boxes[b][1] or boxes[b][3] <= boxes[a][1])]
if ov:
    print("SOBREPOSIÇÃO:", ov[:5]); sys.exit(2)

rows = []
for c in units:
    for k in [c] + rows_by_unit.get(c, []):
        rows.append({"id": k, "unit": c, "old_xy": before.get(k, [None, None]), "new_xy": [E[k]["x"], E[k]["y"]],
                     "sha256": h(E[k])})
covered = {r["id"] for r in rows}
missing = sorted(k for k in nodes if k not in covered)
json.dump(D, open(P("board.json"), "w", encoding="utf8"), ensure_ascii=False, indent=2); open(P("board.json"), "a").write("\n")
json.dump({"rule": "colunas por área do board-mestre; largura fixa; espaçamento uniforme", "W": W, "GX": GX, "GY": GY,
           "elements": rows, "missing": missing, "coverage_pct": round(100 * len(covered) / max(1, len(nodes)), 2)},
          open(P("section-layout-map.json"), "w", encoding="utf8"), ensure_ascii=False, indent=2)
print(f"unidades={len(units)} nós={len(nodes)} cobertos={len(covered)} faltam={len(missing)} cobertura={round(100*len(covered)/len(nodes),2)}%")
