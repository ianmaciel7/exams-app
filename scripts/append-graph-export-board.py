#!/usr/bin/env python3
"""Save real browser capture and PNG export evidence for Issue #68."""
import json
import struct
from pathlib import Path

root = Path(__file__).resolve().parents[1] / "prototypes" / "board-exam-app"
boardfile = root / "board.json"
board = json.loads(boardfile.read_text(encoding="utf-8"))
els, order = board["elements"], board["order"]
title = "42. Grafo — Issue #68: exportar imagem PNG com botão e teclado"

if any(v.get("type") == "container" and v.get("text") == title for v in els.values()):
    print("Graph PNG export evidence already registered")
    raise SystemExit(0)

manifest = json.loads((root / "issue68_export_e2e.json").read_text(encoding="utf-8"))
if manifest["errors"] or len(manifest["cases"]) != 2:
    raise SystemExit("Missing browser evidence or runtime JS errors")
frames = [
    ("graph_toolbar_390", "Botão de exportação na barra do grafo, viewport 390px"),
    ("export_graph_390", "PNG real gerado no canvas mobile, pixel ratio 2"),
    ("graph_toolbar_1366", "Botão de exportação na barra do grafo, viewport 1366px"),
    ("export_graph_1366", "PNG real gerado no canvas desktop, pixel ratio 2"),
]
for name, _ in frames:
    filename = "issue68_" + name + ".png"
    raw = (root / "assets" / filename).read_bytes()
    if len(raw) <= 10000 or raw[:8] != b"\x89PNG\r\n\x1a\n":
        raise SystemExit("Invalid PNG file: " + filename)
    w, h = struct.unpack(">II", raw[16:24])
    if min(w, h) < 350:
        raise SystemExit("Unexpected PNG size: " + filename)

last = max(int(k[1:]) for k in els if k.startswith("e") and k[1:].isdigit())
def add(item):
    global last
    last += 1
    key = "e" + str(last)
    els[key] = item
    order.append(key)
right = max(v.get("x", 0) + v.get("w", 0) for v in els.values())
x0 = max(30000, ((right + 499) // 500) * 500)
y0 = 11000
add({"type": "container", "color": "white", "text": title,
     "x": x0, "y": y0, "w": 1650, "h": 100 + ((len(frames) + 1) // 2) * 535})
notes = (
    "Funcionalidade realmente testada: botão exportar PNG na toolbar do grafo global, acionado "
    "por teclado Enter. O arquivo local é gerado por canvas.toDataURL sem rede, nome "
    "exam-app-grafo.png. Teste Chromium valida cabeçalho PNG, arquivo nao vazio e dimensoes "
    "de pixels iguais ao backing canvas (DPR 2). Evidencia parcial da issue #68: filtros "
    "avancados, profundidade 1..5, popovers e timeline ainda nao foram implementados aqui. "
    "Manifesto: issue68_export_e2e.json."
)
add({"type": "text", "size": "small", "text": notes,
     "x": x0 + 18, "y": y0 + 8, "w": 1590, "h": 82})
for i, (name, caption) in enumerate(frames):
    x, y = x0 + 18 + 810 * (i % 2), y0 + 100 + 535 * (i // 2)
    add({"type": "image", "src": "/_blob/issue68_" + name, "x": x, "y": y, "w": 755, "h": 430})
    add({"type": "text", "size": "small", "text": caption,
         "x": x, "y": y + 438, "w": 760, "h": 50})
boardfile.write_text(json.dumps(board, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print("Graph export evidence persisted to board")
