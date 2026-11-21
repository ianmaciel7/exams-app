#!/usr/bin/env python3
"""Register genuine Chromium daily-review screenshots in the canonical planning board."""
import json
import os
import struct
from pathlib import Path

root=Path(__file__).resolve().parents[1]/"prototype"/"board-exam-app"
board_path=root/"board.json"
board=json.loads(board_path.read_text(encoding="utf-8"))
els,order=board["elements"],board["order"]
title="51. Revisão diária — cartões vinculados e provas Chromium — Issue #82"
if any(e.get("type")=="container" and e.get("text")==title for e in els.values()):
    print("Issue 82 board evidence already versioned")
    raise SystemExit(0)

manifest=json.loads((root/"issue82_daily_review_e2e.json").read_text(encoding="utf-8"))
assert not manifest.get("errors"),"Uncaught browser errors"
checks=manifest.get("checks",[])
assert len(checks)==4, "Expected two Chromium viewports and two validated journeys each"
assert {int(c["width"]) for c in checks}=={390,1366}
assert {c["case"].split()[0] for c in checks}=={"QA","real"}

frames=[
 ("qa_revealed_1366","Pergunta e resposta: revelação explícita, sem vazamento no áudio"),
 ("cloze_1366","Cloze: lacuna gerada por clique e revisão com TTS"),
 ("question_import_1366","Grifo real da questão vira cartão vinculado sem duplicação"),
 ("question_import_390","Importação responsiva em viewport móvel de 390px"),
]
for slug,_ in frames:
    f=root/"assets"/("issue82_"+slug+".png")
    b=f.read_bytes()
    assert len(b)>10000 and b[:8]==b"\x89PNG\r\n\x1a\n", "Invalid browser image "+str(f)
    w,h=struct.unpack(">II",b[16:24])
    assert w>=350 and h>=350, "Insufficient screenshot resolution"

idx=max(int(k[1:]) for k in els if k.startswith("e") and k[1:].isdigit())
def add(item):
    global idx
    idx+=1
    key="e"+str(idx)
    els[key]=item
    order.append(key)

right=max((e.get("x",0)+e.get("w",0)) for e in els.values())
x0=max(52000,((right+499)//500)*500+500)
y0=11000
add({"type":"container","text":title,"color":"white","x":x0,"y":y0,"w":1690,"h":2080})
add({"type":"text","size":"small","x":x0+24,"y":y0+15,"w":1610,"h":290,
     "text":"A rota #/revisao mantém cartões Q&A e Cloze, revela respostas sob demanda, oferece TTS sem vazar a resposta antes da revelação, agenda 2/10/45 dias e domínio, configura meta e recência e preserva estado entre recargas por espaço. Grifos e comentários de questões são importados diretamente com origem rastreável e deduplicação. Capturas reais Playwright Chromium, em 390px e 1366px, validadas na PR #192. Pendências: importação dos grifos de PDF, calibração pedagógica do SRS e acessibilidade física assistiva."})
for i,(slug,caption) in enumerate(frames):
    x=x0+25+820*(i%2)
    y=y0+335+650*(i//2)
    add({"type":"image","src":"/_blob/issue82_"+slug,"x":x,"y":y,"w":760,"h":425})
    add({"type":"text","size":"small","text":caption,"x":x,"y":y+435,"w":770,"h":80})
add({"type":"link","title":"PR #192 — Daily Review","href":"https://github.com/ianmaciel7/exams-app/pull/192","x":x0+25,"y":y0+1855,"w":320,"h":55})
run=os.environ.get("GITHUB_RUN_ID")
if run:
    add({"type":"link","title":"Chromium E2E — run "+run,"href":"https://github.com/ianmaciel7/exams-app/actions/runs/"+run,"x":x0+365,"y":y0+1855,"w":380,"h":55})
board_path.write_text(json.dumps(board,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("Issue 82 added: four verified Chromium images and acceptance/limits")
