#!/usr/bin/env python3
"""Add real Chromium screenshots for Issue #75 to the Board Exam App (idempotent)."""
import json
import struct
from pathlib import Path

root=Path(__file__).resolve().parents[1]/"prototypes"/"board-exam-app"
board_file=root/"board.json"
data=json.loads(board_file.read_text(encoding="utf8"))
e=data["elements"];order=data["order"]
title="35. Cadernos e Queries de Questões — Issue #75: jornadas E2E"
if any(v.get("type")=="container" and v.get("text")==title for v in e.values()):
    print("Evidence already present; no duplicates.")
    raise SystemExit(0)
manifest=json.loads((root/"issue75_e2e.json").read_text(encoding="utf8"))
if manifest["errors"]:raise SystemExit("E2E manifest has browser errors")
frames=[
 ("before_no_notebooks","ANTES — Banco de questões sem ação de Cadernos"),
 ("after_filter","DEPOIS — Questão manual filtrada, pronta para Gerar Caderno"),
 ("after_book_created","DEPOIS — Novo Caderno criado com meta de 80%"),
 ("after_book_answer","DEPOIS — Resposta correta dentro do caderno; progresso 1/1"),
 ("after_retake_errors","DEPOIS — Refazer somente questões erradas sem apagar histórico geral"),
 ("after_question_member","DEPOIS — Inclusão avulsa da Questão 1 via painel Cadernos"),
 ("after_saved_query","DEPOIS — Filtro salvo aparece nas Queries do Tipo Questão"),
 ("after_continue_pending","DEPOIS — Retomada na primeira questão pendente do caderno"),
 ("after_mobile","DEPOIS — Gerenciador de Cadernos em mobile 390px"),
]
for name,_ in frames:
    f=root/"assets"/f"issue75_{name}.png"
    raw=f.read_bytes()
    if len(raw)<10000 or raw[:8]!=b"\x89PNG\r\n\x1a\n" or min(struct.unpack(">II",raw[16:24]))<350:
        raise SystemExit(f"Missing/invalid screenshot: {name}")
next_id=max(int(k[1:]) for k in e if k.startswith('e') and k[1:].isdigit())
def add(v):
    global next_id
    next_id+=1
    k=f"e{next_id}";e[k]=v;order.append(k);return k
x0=max(20000,((max(x.get('x',0)+x.get('w',0) for x in e.values())+499)//500)*500)
y0=11000
rows=(len(frames)+1)//2
add({"type":"container","color":"white","text":title,"x":x0,"y":y0,"w":1660,"h":110+rows*540})
add({"type":"text","size":"small","text":(
  "Origem: testes Playwright Chromium em tests/notebooks-saved-filters.e2e.mjs. "
  "Caminhos testados: filtro -> gerar caderno, meta 80%, progresso independente das "
  "respostas globais, zerar, refazer erros, associar questão individual, Queries do "
  "Tipo Questão, filtros persistidos, retorno à primeira pendente e mobile 390px. "
  "Não representa teste moderado com usuários nem compara com QConcursos Live."
),"x":x0+20,"y":y0+8,"w":1580,"h":88})
for i,(name,caption) in enumerate(frames):
    col=i%2;row=i//2;x=x0+20+810*col;y=y0+104+540*row
    add({"type":"image","src":"/_blob/issue75_"+name,"x":x,"y":y,"w":755,"h":430})
    add({"type":"text","size":"small","text":caption,"x":x,"y":y+440,"w":760,"h":55})
board_file.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
print(f"Recorded {len(frames)} screenshots under board section 35 at x={x0}.")
