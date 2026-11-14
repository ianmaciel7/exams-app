#!/usr/bin/env python3
"""Restore the Issue #136 planning-board container overwritten by PR #142.

PR #142 reused e1371..e1374 and left e1375..e1380 as orphaned question
screenshots. Preserve every existing element and only reposition those six.
"""
import json
import struct
from pathlib import Path

root=Path(__file__).resolve().parents[1]/"prototypes"/"board-exam-app"
path=root/"board.json"
board=json.loads(path.read_text(encoding="utf-8"))
elements,order=board["elements"],board["order"]
title="44. Questões contextuais — Issue #136: alternativas alinhadas e CSS compartilhado"
if any(e.get("type")=="container" and e.get("text")==title for e in elements.values()):
    print("Issue #136 container already restored")
    raise SystemExit(0)

poc=elements.get("e1371")
if not poc or not str(poc.get("text","")).startswith("43. Prova de Conceito"):
    raise SystemExit("POC section 43 changed; refusing an unsafe board rewrite")
if any(k not in elements or k not in order for k in ("e1375","e1376","e1377","e1378","e1379","e1380")):
    raise SystemExit("Original Issue #136 screenshot entries missing; refusing mutation")
for fname in (
    "issue136_before_context_1366.png",
    "issue136_after_context_1366.png",
    "issue136_after_context_390.png",
    "issue136_after_global_1366.png",
):
    raw=(root/"assets"/fname).read_bytes()
    if len(raw)<10000 or raw[:8]!=b"\x89PNG\r\n\x1a\n" or min(struct.unpack(">II",raw[16:24]))<350:
        raise SystemExit("Invalid evidence PNG: "+fname)
manifest=json.loads((root/"issue136_e2e.json").read_text(encoding="utf-8"))
if len(manifest.get("cases",[]))!=4 or manifest.get("errors"):
    raise SystemExit("Historical E2E evidence is incomplete")

right=max((e.get("x",0)+e.get("w",0)) for e in elements.values())
new_x=((right+499)//500)*500+500
source_x=36000

# Keep six surviving historical screenshots and labels at their original
# relative geometry, but move them away from the newer Claude POC section.
for ident in ("e1375","e1376","e1377","e1378","e1379","e1380"):
    elements[ident]["x"]+=new_x-source_x

index=max(int(k[1:]) for k in elements if k.startswith("e") and k[1:].isdigit())
def add(item):
    global index
    index+=1
    ident="e"+str(index)
    elements[ident]=item
    order.append(ident)

add({"type":"container","color":"white","text":title,
     "x":new_x,"y":11000,"w":1650,"h":1170})
add({"type":"text","size":"small","x":new_x+18,"y":11008,"w":1590,"h":82,
     "text":"Restaurado após conflito de IDs introduzido pela PR #142. "
            "Causa original validada por DOM: alternativas em páginas contextuais "
            "perdiam display:flex fora de .study-shell. As quatro capturas reais "
            "da PR #141 e o relatório issue136_e2e.json documentam o antes/depois "
            "em desktop, 390px e banco global. Implementação: CSS compartilhado "
            "com :is(.study-shell,.practice-list). Não equivale à conclusão de "
            "todos os critérios da issue #136; permanecem zoom, painel lateral, "
            "navegação por teclado e demais rotas."})
add({"type":"image","src":"/_blob/issue136_before_context_1366",
     "x":new_x+18,"y":11100,"w":755,"h":430})
add({"type":"text","size":"small",
     "text":"ANTES: alternativas inline no concurso, sem estilização da lista de questões",
     "x":new_x+18,"y":11538,"w":760,"h":50})

# Ensure the restored cards are all contained geometrically, not orphaned.
container=elements["e"+str(index-3)]
for ident in ("e1375","e1376","e1377","e1378","e1379","e1380"):
    el=elements[ident]
    cx=el["x"]+el["w"]/2
    cy=el["y"]+el["h"]/2
    if not(container["x"]<cx<container["x"]+container["w"] and
           container["y"]<cy<container["y"]+container["h"]):
        raise SystemExit("Restored card falls outside container: "+ident)
path.write_text(json.dumps(board,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("Issue #136 restored; 6 surviving cards reparented; first before screenshot restored")
