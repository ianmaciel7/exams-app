#!/usr/bin/env python3
"""Persist only verified Chromium UI evidence for issue #138."""
import json
import struct
from pathlib import Path

root=Path(__file__).resolve().parents[1]/"prototypes"/"board-exam-app"
board_path=root/"board.json"
board=json.loads(board_path.read_text(encoding="utf-8"))
elements,order=board["elements"],board["order"]
title="44. SpaceSwitcher — Issue #138: busca, reordenação e persistência"
if any(item.get("type")=="container" and item.get("text")==title for item in elements.values()):
    raise SystemExit("Evidence already present: skipping duplicates")

report=json.loads((root/"issue138_spaces_e2e.json").read_text(encoding="utf-8"))
if report["pageErrors"] or len(report["cases"])!=4:
    raise SystemExit("Evidence manifest failed validation")
shots=[
 ("before_desktop","ANTES: seletor sem campo de busca e sem alças de reordenação no desktop"),
 ("search_desktop","DEPOIS: pesquisa incremental, nomes de espaços filtrados sem distinção de acentos"),
 ("after_keyboard_desktop","DEPOIS: Alt + seta reordena por identidade sem trocar o espaço ativo"),
 ("after_drag_desktop","DEPOIS: arraste por Pointer Events altera ordem sem perda de contexto"),
 ("after_mobile_390","DEPOIS: seletor responsivo a 390 CSS px com busca e seleção por toque"),
]
for slug,description in shots:
    filename="issue138_"+slug+".png"
    raw=(root/"assets"/filename).read_bytes()
    if len(raw)<=10000 or raw[:8]!=b"\x89PNG\r\n\x1a\n":
        raise SystemExit("Missing, blank, or invalid screenshot: "+filename)
    width,height=struct.unpack(">II",raw[16:24])
    if min(width,height)<350:
        raise SystemExit("Unexpected dimensions in "+filename)

counter=max(int(key[1:]) for key in elements if key.startswith("e") and key[1:].isdigit())
def add(data):
    global counter
    counter+=1
    ident="e"+str(counter)
    elements[ident]=data
    order.append(ident)
right=max(z.get("x",0)+z.get("w",0) for z in elements.values())
x0=max(35000,((right+499)//500)*500)
y0=11000
height=115+((len(shots)+1)//2)*535
add({"type":"container","color":"white","text":title,"x":x0,"y":y0,"w":1650,"h":height})
desc=(
    "Implementação observável: o SpaceSwitcher passa a oferecer busca por nome com normalização "
    "de acentos, estado vazio, seleção/aria-selected, drag handle e reordenação por teclado "
    "Alt+ArrowUp/Down. A ordem é salva por ID em spaceOrder, distinta dos objetos de espaço "
    "persistidos em spaces; nomes e seleção sobrevivem à recarga. Arraste por Pointer Events "
    "tem threshold de 7px, indicação de destino e cancelamento Escape/pointercancel sem mudança. "
    "E2E real Chromium: reprodução anterior, busca, criação de dois espaços, reordenação por "
    "teclado e mouse, recarga, cancelamento e viewport 390px; ver issue138_spaces_e2e.json. "
    "Limite: toque físico, leitores de tela e sincronização entre dispositivos não foram validados."
)
add({"type":"text","size":"small","text":desc,"x":x0+18,"y":y0+8,"w":1590,"h":95})
for i,(slug,caption) in enumerate(shots):
    x=x0+18+810*(i%2)
    y=y0+115+535*(i//2)
    add({"type":"image","src":"/_blob/issue138_"+slug,"x":x,"y":y,"w":755,"h":430})
    add({"type":"text","size":"small","text":caption,"x":x,"y":y+438,"w":760,"h":50})
board_path.write_text(json.dumps(board,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("Issue #138: preserved 5 genuine browser captures and text description")
