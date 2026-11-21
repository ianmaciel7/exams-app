#!/usr/bin/env python3
"""Append verified Chromium recovery evidence to the canonical Exam App board."""
import json
import os
import struct
from pathlib import Path

root=Path(__file__).resolve().parents[1]/"prototype"/"board-exam-app"
boardpath=root/"board.json"
board=json.loads(boardpath.read_text(encoding="utf-8"))
els,order=board["elements"],board["order"]
title="50. Recuperação estrita e Raio-X do Edital — Issue #76"
if any(v.get("type")=="container" and v.get("text")==title for v in els.values()):
    print("Issue #76 evidence already registered")
    raise SystemExit(0)

manifest=json.loads((root/"issue76_recovery_e2e.json").read_text(encoding="utf-8"))
required=[
    "first incorrect attempt recorded after actual submit",
    "notebook groups unresolved mistake by week/topic and opening solution does not heal",
    "retry reset keeps unresolved question in error filter",
    "only a new correct confirmed practice answer recovers wrong item",
    "verticalized topic priorities and theory study checkboxes persist",
]
assert not manifest.get("pageErrors"),"Browser page errors must be empty"
assert all(check in manifest.get("checks",[]) for check in required),"Incomplete recovery E2E evidence"

frames=[
    ("wrong_confirmed","ANTES: primeira resposta incorreta confirmada"),
    ("notebook_pending","DEPOIS: erro pendente agrupado por semana e disciplina"),
    ("recovered","DEPOIS: recuperação após nova resposta correta"),
    ("raiox_vertical","DEPOIS: assuntos, prioridades e marcação persistente"),
]
for slug,_ in frames:
    file=root/"assets"/("issue76_"+slug+".png")
    buf=file.read_bytes()
    if len(buf)<=10000 or buf[:8]!=b"\x89PNG\r\n\x1a\n" or min(struct.unpack(">II",buf[16:24]))<350:
        raise SystemExit("Invalid real Chromium screenshot: "+str(file))

idx=max(int(k[1:]) for k in els if k.startswith("e") and k[1:].isdigit())
def add(item):
    global idx
    idx+=1
    key="e"+str(idx)
    els[key]=item
    order.append(key)

right=max((item.get("x",0)+item.get("w",0)) for item in els.values())
x0=max(50000,((right+499)//500)*500+500)
y0=11000
add({"type":"container","color":"white","text":title,"x":x0,"y":y0,"w":1650,"h":2100})
add({"type":"text","size":"small","x":x0+18,"y":y0+12,"w":1590,"h":300,
     "text":"A recuperação só ocorre após uma nova resposta correta; abrir gabarito não altera o histórico. "
             "A coorte semanal mostra “Errou X · Recuperou Y”; a rota Caderno de Erros lista apenas pendentes. "
             "O Raio-X usa incidência de questões, pontos catalogados, cobertura e acerto da última tentativa confirmada. "
             "A cobertura deste protótipo é limitada aos assuntos presentes no catálogo; o Anexo II completo e a associação "
             "automática de PDFs não estão implementados. As capturas abaixo vieram do E2E Chromium executado nesta PR."})
for i,(slug,caption) in enumerate(frames):
    x=x0+18+810*(i%2)
    y=y0+330+650*(i//2)
    add({"type":"image","src":"/_blob/issue76_"+slug,"x":x,"y":y,"w":755,"h":425})
    add({"type":"text","size":"small","text":caption,"x":x,"y":y+430,"w":760,"h":55})
server=os.environ.get("GITHUB_SERVER_URL","https://github.com")
repo=os.environ.get("GITHUB_REPOSITORY","ianmaciel7/exams-app")
run=os.environ.get("GITHUB_RUN_ID","")
add({"type":"link","title":"PR #187 — issue #76","href":server+"/"+repo+"/pull/187","x":x0+18,"y":y0+1850,"w":300,"h":56})
if run:
    add({"type":"link","title":"E2E Chromium — run "+run,"href":server+"/"+repo+"/actions/runs/"+run,"x":x0+360,"y":y0+1850,"w":340,"h":56})
boardpath.write_text(json.dumps(board,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("Added four verified issue #76 browser screenshots and recovery/Raiox decisions")
