#!/usr/bin/env python3
"""Append real Playwright evidence of advanced question filter flows to planning board."""
from pathlib import Path
import json
import struct

root=Path(__file__).resolve().parents[1]/"prototypes"/"board-exam-app"
boardfile=root/"board.json"
data=json.loads(boardfile.read_text(encoding="utf-8"))
els=data["elements"];order=data["order"]
title="36. Filtros avançados — Issue #70: cascata, exclusões, URL, Queries e mobile"
if any(x.get("type")=="container" and x.get("text")==title for x in els.values()):
    print("Advanced filter board evidence already registered.")
    raise SystemExit(0)
m=json.loads((root/"issue70_e2e.json").read_text(encoding="utf8"))
if m["errors"]:raise SystemExit("Browser errors found in diagnostic manifest")
frames=[
 ("before_simple","ANTES: banco de questões sem construtor de filtros avançados"),
 ("after_open_panel","DEPOIS: painel com facetas estruturais e regras de inclusão/exclusão"),
 ("after_cascade","DEPOIS: Disciplina ativa Assunto, seleção aplicada e URL navegável"),
 ("after_exclusion","DEPOIS: exclusão de questões já incluídas em caderno"),
 ("after_reload_flags","DEPOIS: critérios persistidos após recarregar a página"),
 ("after_saved","DEPOIS: conjunto de filtros salvo como Query de Questão"),
 ("after_simulado_filtrado","DEPOIS: simulado criado com a seleção filtrada"),
 ("after_clear_defaults","DEPOIS: limpar filtros restaura exclusão padrão de anuladas"),
 ("after_mobile","DEPOIS: filtros avançados adaptados a 390px"),
]
assert len(m["events"])>=len(frames)
for key,_ in frames:
    fn=root/"assets"/f"issue70_{key}.png"
    raw=fn.read_bytes()
    if len(raw)<10000 or raw[:8]!=b"\x89PNG\r\n\x1a\n" or min(struct.unpack(">II",raw[16:24]))<350:
        raise SystemExit(f"Missing or invalid image {fn}")
idx=max(int(k[1:]) for k in els if k.startswith("e") and k[1:].isdigit())
def add(x):
    global idx
    idx+=1
    key=f"e{idx}";els[key]=x;order.append(key)
maxx=max(x.get("x",0)+x.get("w",0) for x in els.values())
x0=max(22000,((maxx+499)//500)*500)
y0=11000
add({"type":"container","color":"white","text":title,"x":x0,"y":y0,"w":1650,"h":100+((len(frames)+1)//2)*535})
add({"type":"text","size":"small","text":(
 "Evidência real: Chromium 1366×900 e mobile 390×800; Playwright "
 "tests/advanced-question-filters.e2e.mjs, branch de PR. "
 "Seletores Disciplina→Assunto, exclusões de cadernos e anuladas, "
 "estado codificado na URL, recarga, Queries e simulado filtrado. "
 "A base oficial de 70 questões não possui classificação de Assunto; "
 "o teste usa questões manuais etiquetadas, sem inventar metadados da FGV. "
 "Sem inferência de conformidade WCAG ou testes com participantes."
),"x":x0+18,"y":y0+8,"w":1580,"h":82})
for i,(name,desc) in enumerate(frames):
    col,row=i%2,i//2
    x,y=x0+18+810*col,y0+100+535*row
    add({"type":"image","src":"/_blob/issue70_"+name,"x":x,"y":y,"w":755,"h":430})
    add({"type":"text","size":"small","text":desc,"x":x,"y":y+438,"w":760,"h":50})
boardfile.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
print(f"Added {len(frames)} real filter screenshots at x={x0}.")
