#!/usr/bin/env python3
"""Preserve real before/after screenshots for the central workspace command router."""
import json
import struct
from pathlib import Path

root=Path(__file__).resolve().parents[1]/"prototypes"/"board-exam-app"
boardpath=root/"board.json"
board=json.loads(boardpath.read_text(encoding="utf-8"))
els,order=board["elements"],board["order"]
title="46. Atalhos de teclado — Issue #139: registro e roteamento centralizado"
if any(v.get("type")=="container" and v.get("text")==title for v in els.values()):
    print("Command router evidence already registered")
    raise SystemExit(0)

manifest=json.loads((root/"issue139_commands_e2e.json").read_text(encoding="utf-8"))
assert not manifest["pageErrors"] and len(manifest["cases"])==3,"Incomplete browser evidence"
frames=[
    ("before_help","ANTES: janela de ajuda com tabela fixa de seis atalhos"),
    ("after_help","DEPOIS: janela gerada dinamicamente a partir do registro de comandos"),
    ("after_search","DEPOIS: Ctrl+K abre busca; campo editável impede Ctrl+B global"),
    ("after_new_item","DEPOIS: Ctrl+Alt+N abre o menu Novo; digitação não sequestra atalhos"),
]
for slug,_ in frames:
    file=root/"assets"/("issue139_"+slug+".png")
    buf=file.read_bytes()
    if len(buf)<=10000 or buf[:8]!=b"\x89PNG\r\n\x1a\n" or min(struct.unpack(">II",buf[16:24]))<350:
        raise SystemExit("Invalid real Chromium screenshot: "+str(file))

idx=max(int(k[1:]) for k in els if k.startswith("e") and k[1:].isdigit())
def add(item):
    global idx
    idx+=1
    k="e"+str(idx)
    els[k]=item
    order.append(k)
right=max((x.get("x",0)+x.get("w",0)) for x in els.values())
x0=max(43000,((right+499)//500)*500+500)
y0=11000
add({"type":"container","color":"white","text":title,"x":x0,"y":y0,"w":1650,"h":1170})
add({"type":"text","size":"small","x":x0+18,"y":y0+8,"w":1590,"h":82,
     "text":"Roteador declarativo único para comandos globais, categorias, prioridade, "
             "chord normalizado Mod (Ctrl/Command), Alt e Shift e disponibilidade contextual. "
             "E2E Chromium valida busca Ctrl+K, alternância Ctrl+B, novo objeto Ctrl+Alt+N, "
             "proteção de campos e diálogos, janela de ajuda gerada do mesmo catálogo, sem erro JS. "
             "Capturas e medições em issue139_commands_e2e.json. "
             "Permanecem sem cobertura E2E integral os contextos de grafo, simulado, leitor e atalhos "
             "reservados do SO ou IME real; a issue #139 fica aberta até a paridade completa."})
for i,(slug,caption) in enumerate(frames):
    x=x0+18+810*(i%2)
    y=y0+100+535*(i//2)
    add({"type":"image","src":"/_blob/issue139_"+slug,"x":x,"y":y,"w":755,"h":430})
    add({"type":"text","size":"small","text":caption,"x":x,"y":y+438,"w":760,"h":50})
boardpath.write_text(json.dumps(board,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("Added four verified #139 browser screenshots and one structural card")
