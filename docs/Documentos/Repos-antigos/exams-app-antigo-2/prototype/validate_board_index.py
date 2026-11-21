#!/usr/bin/env python3
"""Valida taxonomia, documentos e cobertura dos containers do canvas."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, ".."))
M = json.load(open(os.path.join(HERE, "board-mestre.json"), encoding="utf8"))
E = json.load(open(os.path.join(HERE, "board.json"), encoding="utf8"))["elements"]
errors, seen = [], []
allowed = {"modelo","referencia","decisao","arquitetura de interação","diretriz","especificacao","pesquisa","auditoria","blueprint","teste","fluxo","diagnostico","componente","arquitetura","infraestrutura","experimento","homologacao","benchmark","evidencia","auditoria-evidencia","historico","versao"}
if M.get("schema_version") != 2: errors.append("schema_version deve ser 2")
if len(M.get("areas", [])) != 7: errors.append("o índice deve conter exatamente 7 boards")
for area in M.get("areas", []):
    prefix = area.get("id", "?") + " — " + area.get("name", "?")
    board_path = os.path.join(ROOT, area.get("board", ""))
    if not os.path.isfile(board_path): errors.append(prefix + ": diagrama ausente")
    elif "flowchart" not in open(board_path, encoding="utf8").read(): errors.append(prefix + ": diagrama ausente")
    if not area.get("documents"): errors.append(prefix + ": sem documentos")
    for doc in area.get("documents", []):
        if not os.path.isfile(os.path.join(ROOT, doc.get("path", ""))): errors.append(prefix + ": documento ausente: " + doc.get("path", ""))
    if not area.get("cards"): errors.append(prefix + ": sem cards")
    for card in area.get("cards", []):
        if "status" in card: errors.append(prefix + " / " + card.get("name", "?") + ": não misture status com kind")
        if card.get("kind") not in allowed: errors.append(prefix + " / " + card.get("name", "?") + ": kind inválido")
        if not card.get("blocks"): errors.append(prefix + " / " + card.get("name", "?") + ": sem bloco")
        for bid in card.get("blocks", []):
            seen.append(bid)
            if bid not in E: errors.append(prefix + ": bloco inexistente: " + bid)
            elif E[bid].get("type") != "container": errors.append(prefix + ": ID não é container: " + bid)
        for doc in card.get("documents", []):
            if not os.path.isfile(os.path.join(ROOT, doc.get("path", ""))): errors.append(prefix + ": documento ausente: " + doc.get("path", ""))
dups = sorted({bid for bid in seen if seen.count(bid) > 1})
if dups: errors.append("containers em mais de um board: " + ", ".join(dups))
containers = {bid for bid, item in E.items() if item.get("type") == "container"}
missing, unknown = sorted(containers - set(seen)), sorted(set(seen) - containers)
if missing: errors.append("containers sem board: " + ", ".join(missing))
if unknown: errors.append("IDs que não são containers: " + ", ".join(unknown))
if errors:
    print("\n".join(errors)); print("FALHOU: " + str(len(errors))); sys.exit(1)
count = sum(len(area["documents"]) for area in M["areas"])
print("OK: " + str(len(M["areas"])) + " boards, " + str(len(seen)) + "/" + str(len(containers)) + " containers, " + str(count) + " vínculos de documentos.")
