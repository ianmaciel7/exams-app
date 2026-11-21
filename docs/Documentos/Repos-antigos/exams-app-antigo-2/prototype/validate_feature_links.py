#!/usr/bin/env python3
"""Valida feature-links.json: IDs de feature existem no índice, grupos existem no board-mestre e o arquivo está atualizado."""
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, ".."))
errors = []
idx = json.load(open(os.path.join(ROOT, "prototype/features-index.json"), encoding="utf8"))
mest = json.load(open(os.path.join(HERE, "board-mestre.json"), encoding="utf8"))
FL = json.load(open(os.path.join(HERE, "feature-links.json"), encoding="utf8"))
fids = {f["id"] for f in idx["features"]}
blocks = {c["blocks"][0] for a in mest["areas"] for c in a["cards"]}
if {f["id"] for f in FL["features"]} != fids: errors.append("features de feature-links.json diferem do features-index.json")
for f in FL["features"]:
    for g in f["grupos"]:
        if g["blocks"][0] not in blocks: errors.append(f["id"] + ": grupo sem bloco no board-mestre: " + g["name"])
        if g.get("fonte") != "inferido": errors.append(f["id"] + ": grupo deve ser marcado inferido")
    for a in f["adrs"]:
        if not os.path.isfile(os.path.join(HERE, next(x["page"].split("/")[-1] for x in idx["adrs"] if x["id"] == a["id"]))): errors.append(f["id"] + ": ADR ausente " + a["id"])
    for e in f["evidencias"]:
        if not os.path.isfile(os.path.join(ROOT, e["caminho"])): errors.append(f["id"] + ": evidência ausente " + e["caminho"])
        if e["src"] and not os.path.isfile(os.path.normpath(os.path.join(HERE, e["src"]))): errors.append(f["id"] + ": miniatura ausente " + e["src"])
r = subprocess.run([sys.executable, os.path.join(HERE, "build_feature_links.py"), "--check"], capture_output=True, text=True)
if r.returncode: errors.append(r.stdout.strip())
if errors:
    print("\n".join(errors)); print("FALHOU: " + str(len(errors))); sys.exit(1)
print("OK: " + str(len(FL["features"])) + " features vinculadas por ID; miniaturas e grupos verificados.")
