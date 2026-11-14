#!/usr/bin/env python3
"""Register verified contextual-question before/after Chromium screenshots for Issue #136."""
import json
import struct
from pathlib import Path

root = Path(__file__).resolve().parents[1] / "prototypes" / "board-exam-app"
board_file = root / "board.json"
board = json.loads(board_file.read_text(encoding="utf-8"))
elements, order = board["elements"], board["order"]
title = "43. Questões contextuais — Issue #136: alternativas alinhadas e CSS compartilhado"
if any(e.get("type") == "container" and e.get("text") == title for e in elements.values()):
    raise SystemExit(0)

report = json.loads((root / "issue136_e2e.json").read_text(encoding="utf-8"))
assert not report["errors"] and len(report["cases"]) == 4, "evidence incomplete"
frames = [
    ("before_context_1366", "ANTES: alternativas inline no concurso, sem estilização da lista de questões"),
    ("after_context_1366", "DEPOIS: alternativas em linhas/click targets, concurso no desktop"),
    ("after_context_390", "DEPOIS: alternativas em linhas e texto quebrando, concurso em 390px"),
    ("after_global_1366", "DEPOIS: banco global preserva o mesmo componente de questões"),
]
for name, _ in frames:
    filename = "issue136_" + name + ".png"
    raw = (root / "assets" / filename).read_bytes()
    if len(raw) < 10000 or raw[:8] != b"\x89PNG\r\n\x1a\n" or min(struct.unpack(">II", raw[16:24])) < 350:
        raise SystemExit("Missing or invalid real browser capture: " + filename)

idx = max(int(k[1:]) for k in elements if k.startswith("e") and k[1:].isdigit())
def add(e):
    global idx
    idx += 1
    k = "e" + str(idx)
    elements[k] = e
    order.append(k)
right = max(x.get("x", 0) + x.get("w", 0) for x in elements.values())
x0 = max(32000, ((right + 499) // 500) * 500)
y0 = 11000
add({"type": "container", "color": "white", "text": title,
     "x": x0, "y": y0, "w": 1650, "h": 100 + ((len(frames) + 1) // 2) * 535})
add({"type": "text", "size": "small", "x": x0+18, "y": y0+8, "w": 1590, "h": 82,
     "text": "Diagnóstico comprovado pelo DOM: .qf-list renderizava s-question sem .study-shell, "
             "então label.s-option perdia display:flex e hitboxes. CSS compartilhado via "
             ":is(.study-shell,.practice-list), sem duplicar implementação do componente. "
             "E2E Chromium verifica baseline antes, card contextual desktop/mobile e banco global, "
             "separação Questão / Disciplina, seleção por label. Capturas reais desta PR; "
             "a screenshot original do usuário permanece fora do repositório. "
             "Não demonstra validação em todos os browsers, zoom 200% ou com painel Gráfico aberto."})
for i, (name, caption) in enumerate(frames):
    x = x0+18+810*(i%2)
    y = y0+100+535*(i//2)
    add({"type": "image", "src": "/_blob/issue136_"+name, "x": x, "y": y, "w": 755, "h": 430})
    add({"type": "text", "size": "small", "text": caption, "x": x, "y": y+438, "w": 760, "h": 50})
board_file.write_text(json.dumps(board, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
print("Issue #136 evidence registered.")
