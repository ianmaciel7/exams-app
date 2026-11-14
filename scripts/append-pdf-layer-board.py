#!/usr/bin/env python3
"""Append verified PDF.js canvas/text-layer diagnostics and screenshots to the planning board."""
import json
import struct
from pathlib import Path

root=Path(__file__).resolve().parents[1]/"prototypes"/"board-exam-app"
board_path=root/"board.json"
data=json.loads(board_path.read_text(encoding="utf8"))
els=data["elements"]
order=data["order"]
title="34. PDF.js — diagnóstico de texto, canvas, DPR e zoom (#111 #112)"
if any(v.get("type")=="container" and v.get("text")==title for v in els.values()):
    print("PDF board section already exists; skipping duplicate.")
    raise SystemExit(0)

diagnostics=json.loads((root/"pdf112_diagnostic.json").read_text(encoding="utf8"))
checks=[x for x in diagnostics["scenarios"] if "canvasBacking" in x]
if not checks or diagnostics["errors"]:
    raise SystemExit("Invalid diagnostic report or unexpected browser errors")
images=[
  ("before_dpr2_zoom1","ANTES: página e camada de texto, DPR 2 / 100%"),
  ("after_dpr2_zoom1","DEPOIS: página e camada de texto, DPR 2 / 100%"),
  ("before_dpr2_zoom2","ANTES: página e camada de texto, DPR 2 / 200%"),
  ("after_dpr2_zoom2","DEPOIS: página e camada de texto, DPR 2 / 200%"),
]
for label,_ in images:
    pic=root/"assets"/f"pdf112_{label}.png"
    raw=pic.read_bytes()
    if len(raw)<10000 or raw[:8]!=b"\x89PNG\r\n\x1a\n" or min(struct.unpack(">II",raw[16:24]))<400:
        raise SystemExit(f"Invalid PNG evidence: {pic}")

next_id=max(int(k[1:]) for k in els if k.startswith("e") and k[1:].isdigit())
def add(x):
    global next_id
    next_id+=1
    key=f"e{next_id}"
    els[key]=x
    order.append(key)

# Do not overlap the prior Readwise / low-chrome / Issue #100 sections.
max_x=max(v.get("x",0)+v.get("w",0) for v in els.values())
x0=max(18000,((max_x+499)//500)*500)
y0=11000
add({"type":"container","color":"white","text":title,"x":x0,"y":y0,"w":1650,"h":1500})
add({"type":"text","size":"small","text":(
    "Evidência nativa do Exam App: Playwright Chromium, PDF da segunda retificação "
    "edital-2a-retificacao.pdf. Capturas reais no mesmo documento e DPR 2 "
    "(100%/200%), antes e depois do PR. Canvas fornece pixels; textLayer fornece "
    "seleção/cópia. Este teste não prova paridade com Readwise nem visualizador nativo, "
    "e não substitui Firefox/Edge. Métricas por cenário em pdf112_diagnostic.json."
),"x":x0+20,"y":y0+12,"w":1550,"h":90})
for row in range(2):
  for col in range(2):
    label,caption=images[row*2+col]
    x=x0+20+810*col
    y=y0+110+row*610
    add({"type":"image","src":"/_blob/pdf112_"+label,"x":x,"y":y,"w":760,"h":490})
    add({"type":"text","size":"small","text":caption+" | "+f"assets/pdf112_{label}.png","x":x,"y":y+502,"w":760,"h":40})
metrics="\n".join(
  f"{v['version']} DPR={v['dpr']} zoom={v['zoom']} página={v['page']} "
  f"canvas={v['canvasBacking']['w']}×{v['canvasBacking']['h']} "
  f"CSS={v['css']['w']:.1f}×{v['css']['h']:.1f} "
  f"ratio={v['ratio']:.2f} textSpans={v['textSpanCount']} status={v['status']}"
  for v in checks
)
add({"type":"shape","text":"**Medições reais de canvas/textLayer**\n"+metrics,
     "x":x0+20,"y":y0+1350,"w":1550,"h":120})
board_path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
print(f"Added {len(images)} verified screenshots and {len(checks)} measured states at x={x0}.")
