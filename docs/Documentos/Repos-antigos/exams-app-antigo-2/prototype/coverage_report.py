#!/usr/bin/env python3
"""Cobertura por container do board.json: quais elementos caem dentro de cada container.

Uso: python3 -I coverage_report.py   (dentro de prototype/board-exam-app__*)
Escreve board-coverage.json. Sai com erro se algum elemento não-seta ficar sem container
quando não for ele mesmo um container.
"""
import json, os, hashlib, sys

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, "board.json"), encoding="utf8"))
E = D["elements"]

def box(v):
    # text blocks may omit w/h; treat missing size as a point at (x, y)
    w, hgt = v.get("w", 0), v.get("h", 0)
    return v["x"], v["y"], v["x"] + w, v["y"] + hgt

def inside(a, b):
    ax1, ay1, ax2, ay2 = box(a)
    bx1, by1, bx2, by2 = box(b)
    return ax1 >= bx1 and ay1 >= by1 and ax2 <= bx2 and ay2 <= by2

def h(v):
    d = {k: x for k, x in v.items() if k not in ("x", "y")}
    return hashlib.sha256(json.dumps(d, ensure_ascii=False, sort_keys=True).encode()).hexdigest()[:16]

containers = {k: v for k, v in E.items() if v.get("type") == "container"}
nodes = {k: v for k, v in E.items() if v.get("type") not in ("container", "arrow") and "x" in v}
no_size = sorted(k for k, v in nodes.items() if "w" not in v or "h" not in v)
rows, uncovered = [], []
for k, v in nodes.items():
    owners = [c for c, cv in containers.items() if inside(v, cv)]
    # dono mais específico: menor área
    owners.sort(key=lambda c: containers[c]["w"] * containers[c]["h"])
    if not owners:
        uncovered.append(k)
    rows.append({"id": k, "type": v["type"], "container": owners[0] if owners else None,
                 "all_containers": owners, "sha256": h(v)})
report = {
    "containers": len(containers),
    "nodes": len(nodes),
    "covered": len(nodes) - len(uncovered),
    "uncovered": uncovered,
    "nodes_without_size": no_size,
    "coverage_pct": round(100 * (len(nodes) - len(uncovered)) / max(1, len(nodes)), 2),
    "elements": rows,
}
json.dump(report, open(os.path.join(HERE, "board-coverage.json"), "w", encoding="utf8"), ensure_ascii=False, indent=2)
print(f"containers={report['containers']} nodes={report['nodes']} covered={report['covered']} coverage={report['coverage_pct']}%")
sys.exit(1 if uncovered else 0)
