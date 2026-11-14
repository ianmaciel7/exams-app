#!/usr/bin/env python3
"""Register genuine browser motion measurements and images for Issue #128."""
import json
import struct
from pathlib import Path

root = Path(__file__).resolve().parents[1] / "prototypes" / "board-exam-app"
board_file = root / "board.json"
board = json.loads(board_file.read_text(encoding="utf-8"))
els, order = board["elements"], board["order"]
title = "41. Grafo — Issue #128: movimento reduzido e preferência dinâmica no Chromium"

if any(e.get("type") == "container" and e.get("text") == title for e in els.values()):
    print("Issue #128 graph evidence already on board")
    raise SystemExit(0)

manifest = json.loads((root / "issue128_motion_e2e.json").read_text(encoding="utf-8"))
assert not manifest["pageErrors"], "JavaScript errors in browser"
assert len(manifest["cases"]) == 2, "Expected mobile and desktop graphs"
shots = [
    ("reduced_390", "390px, movimento reduzido desde a montagem: canvas desenhado sem loop"),
    ("restored_390", "390px, preferência alterada dinamicamente e restaurada"),
    ("reduced_1366", "1366px, grafo com redução de movimento e controles interativos"),
    ("restored_1366", "1366px, controles de zoom/filtro e retorno à preferência reduzida"),
]
for name, _ in shots:
    filename = "issue128_" + name + ".png"
    raw = (root / "assets" / filename).read_bytes()
    if len(raw) <= 10000 or raw[:8] != b"\x89PNG\r\n\x1a\n":
        raise SystemExit("Invalid screenshot " + filename)
    w, h = struct.unpack(">II", raw[16:24])
    if min(w, h) < 350:
        raise SystemExit("Unexpected dimensions " + filename)
index = max(int(k[1:]) for k in els if k.startswith("e") and k[1:].isdigit())
def add(e):
    global index
    index += 1
    ident = "e" + str(index)
    els[ident] = e
    order.append(ident)
x1 = max(e.get("x", 0) + e.get("w", 0) for e in els.values())
x0 = max(28000, ((x1 + 499) // 500) * 500)
y0 = 11000
add({"type": "container", "text": title, "color": "white",
     "x": x0, "y": y0, "w": 1650, "h": 100 + ((len(shots) + 1) // 2) * 535})
summary = [
    "E2E Chromium sobre o grafo global: preferencia de movimento reduzido ao abrir,",
    "ausencia de loop no repouso, zoom por teclado, filtros, mudança dinamica da preferencia",
    "e retorno ao reduzido. Medicoes: issue128_motion_e2e.json.",
    "LIMITES: somente emulacao Chromium CI; nao prova WCAG, bateria, CPU ou leitor de tela.",
]
for row in manifest["cases"]:
    summary.append(
        str(row["width"]) + "px: " +
        str(row["reduced"]["nodeCount"]) + " nos, " +
        str(row["reduced"]["edgeCount"]) + " relacoes, canvas em " +
        str(row["navigateToCanvasMs"]) + "ms (medicao unica, nao SLA)"
    )
add({"type": "text", "size": "small", "x": x0 + 18, "y": y0 + 8,
     "w": 1590, "h": 82, "text": " ".join(summary)})
for i, (name, caption) in enumerate(shots):
    col, row = i % 2, i // 2
    x, y = x0 + 18 + col * 810, y0 + 100 + row * 535
    add({"type": "image", "src": "/_blob/issue128_" + name,
         "x": x, "y": y, "w": 755, "h": 430})
    add({"type": "text", "size": "small", "text": caption,
         "x": x, "y": y + 438, "w": 760, "h": 50})
board_file.write_text(json.dumps(board, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print("Registered Issue #128 Chromium screenshots and graph measurements")
