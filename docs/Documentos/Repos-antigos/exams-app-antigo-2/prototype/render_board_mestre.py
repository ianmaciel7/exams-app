#!/usr/bin/env python3
"""Gera board-mestre.md a partir do índice temático e valida seus vínculos."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, ".."))
M = json.load(open(os.path.join(HERE, "board-mestre.json"), encoding="utf8"))
errors = []
def repo_rel(path):
    full = os.path.join(ROOT, path)
    if not os.path.isfile(full):
        errors.append("arquivo referenciado não existe: " + path)
    return os.path.relpath(full, HERE).replace(os.sep, "/")
lines = ["# " + M["title"], "", "> " + M["note"], "", "## Visão geral", "", "| Board | Escopo | Blocos | Documentos | Diagrama |", "| --- | --- | ---: | ---: | --- |"]
for area in M["areas"]:
    lines.append("| " + area["id"] + " — " + area["name"] + " | " + area["summary"] + " | " + str(len(area["cards"])) + " | " + str(len(area["documents"])) + " | [Abrir](" + repo_rel(area["board"]) + ") |")
for area in M["areas"]:
    lines += ["", "## " + area["id"] + " — " + area["name"], "", area["summary"], "", "[Abrir diagrama do board](" + repo_rel(area["board"]) + ")", "", "### Documentos", ""]
    for item in area["documents"]:
        lines.append("- [" + item["title"] + "](" + repo_rel(item["path"]) + ") — " + item["role"])
    lines += ["", "### Blocos do canvas original", "", "| Bloco | Tipo de conteúdo | ID |", "| --- | --- | --- |"]
    for item in area["cards"]:
        blocks = ", ".join("[" + bid + "](board-exam-app__index.html#" + bid + ")" for bid in item["blocks"])
        lines.append("| " + item["name"] + " | " + item["kind"] + " | " + blocks + " |")
        for doc in item.get("documents", []):
            repo_rel(doc["path"])
if errors:
    print("\n".join(errors)); print("FALHOU: " + str(len(errors))); sys.exit(1)
with open(os.path.join(HERE, "board-mestre.md"), "w", encoding="utf8") as f:
    f.write("\n".join(lines) + "\n")
print("OK: board-mestre.md gerado com " + str(len(M["areas"])) + " boards temáticos.")
