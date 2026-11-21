#!/usr/bin/env python3
"""Record independently verified PDF.js Chromium screenshots in the planning board."""
from pathlib import Path
import json,os,struct
root=Path(__file__).resolve().parents[1]/"prototype"/"board-exam-app"
board_path=root/"board.json"
board=json.loads(board_path.read_text(encoding="utf8"))
els,order=board["elements"],board["order"]
title="52. Leitor PDF reflow e anotações — Issue #77"
if any(e.get("type")=="container" and e.get("text")==title for e in els.values()):
    print("Issue 77 already represented on board");raise SystemExit(0)
manifest=json.loads((root/"issue77_reader_e2e.json").read_text(encoding="utf8"))
assert not manifest.get("errors"),"Uncaught browser errors"
checks=manifest.get("checks",[])
assert len(checks)==2 and {int(c["width"]) for c in checks}=={390,1366},"Two validated viewport results required"
frames=[
 ("original_1366","PDF real gerado no teste: canvas e duas colunas em tela desktop"),
 ("text_highlight_1366","Modo texto reflow: coluna esquerda antes da direita e grifo focado"),
 ("marginalia_1366","Nota marginal, etiqueta, sumário e restauração do modo texto"),
 ("marginalia_390","Mesmo fluxo na viewport de 390px sem compressão do PDF")
]
for slug,_ in frames:
    f=root/"assets"/("issue77_reader_"+slug+".png");raw=f.read_bytes()
    assert len(raw)>10000 and raw[:8]==b"\x89PNG\r\n\x1a\n"
    w,h=struct.unpack(">II",raw[16:24]);assert w>=350 and h>=350
idx=max(int(k[1:]) for k in els if k.startswith("e") and k[1:].isdigit())
def add(e):
    global idx
    idx+=1;key="e"+str(idx);els[key]=e;order.append(key)
right=max(e.get("x",0)+e.get("w",0) for e in els.values())
x0=max(54000,((right+499)//500)*500+500);y0=11200
add({"type":"container","text":title,"color":"white","x":x0,"y":y0,"w":1700,"h":2050})
add({"type":"text","size":"small","x":x0+25,"y":y0+15,"w":1640,"h":275,
"text":"Modo PDF original e texto reflow; fonte/tamanho/entrelinha, j/k, h grifar, n nota marginal, t etiqueta, z desfazer e [ sumário. Testes Playwright desktop 1366 e mobile 390 sobre PDF de duas colunas GERADO por pdf-lib com PDF.js no navegador, com ordem esquerda→direita, persistência e limpeza entre rotas. Defeito de layout corrigido: toolbar fora do flex da página. LIMITES: não é DOU oficial real, falta OCR para escaneados, TOC semântico e projeção das anotações sobre o canvas original. Issue #77 permanece aberta."})
for i,(slug,caption) in enumerate(frames):
    x=x0+25+(i%2)*830;y=y0+325+(i//2)*650
    add({"type":"image","src":"/_blob/issue77_reader_"+slug,"x":x,"y":y,"w":760,"h":430})
    add({"type":"text","size":"small","text":caption,"x":x,"y":y+438,"w":775,"h":75})
add({"type":"link","title":"PR #190 — Reader","href":"https://github.com/ianmaciel7/exams-app/pull/190","x":x0+25,"y":y0+1850,"w":325,"h":56})
run=os.environ.get("GITHUB_RUN_ID")
if run:
    add({"type":"link","title":"Chromium PDF E2E","href":"https://github.com/ianmaciel7/exams-app/actions/runs/"+run,"x":x0+360,"y":y0+1850,"w":325,"h":56})
board_path.write_text(json.dumps(board,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
print("Board section 52 includes actual Chromium screenshots and limitations")
