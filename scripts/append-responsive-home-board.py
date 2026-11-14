#!/usr/bin/env python3
"""Persist only real Chromium evidence of Issue #132's Home CTA correction."""
import json
import struct
from pathlib import Path

root = Path(__file__).resolve().parents[1] / "prototypes" / "board-exam-app"
boardfile = root / "board.json"
data = json.loads(boardfile.read_text(encoding="utf-8"))
els, order = data["elements"], data["order"]
title = "40. Responsividade Home — Issue #132: eliminar undefined e validar CTA em 12 larguras"

if any(x.get("type") == "container" and x.get("text") == title for x in els.values()):
    print("Home responsiveness evidence is already in the planning board")
    raise SystemExit(0)

manifest = json.loads((root / "issue132_home_e2e.json").read_text(encoding="utf-8"))
if manifest["pageErrors"]:
    raise SystemExit("Uncaught browser errors were found: cannot publish evidence")
frames = [
    ("before_390", "ANTES: a Home exibia o texto literal 'undefined' no lugar do SVG do simulado, em 390px"),
    ("after_320", "DEPOIS: 320px, ícone SVG restaurado; CTA refluindo no grid"),
    ("after_390", "DEPOIS: 390px, ícone SVG sem sobreposição de texto"),
    ("after_768", "DEPOIS: 768px, ações primárias preservadas"),
    ("after_1280", "DEPOIS: 1280px, alinhamento do CTA no desktop"),
]
reported = {x.get("screenshot") for x in manifest["cases"] if x.get("screenshot")}
for slug, _ in frames:
    fname = "issue132_" + slug + ".png"
    image = root / "assets" / fname
    raw = image.read_bytes()
    if fname not in reported or len(raw) <= 10000 or raw[:8] != b"\x89PNG\r\n\x1a\n":
        raise SystemExit("Image missing or invalid: " + fname)
    w, h = struct.unpack(">II", raw[16:24])
    if w < 320 or h < 300:
        raise SystemExit("Unexpected dimensions for " + fname)

idx = max(int(k[1:]) for k in els if k.startswith("e") and k[1:].isdigit())
def add(x):
    global idx
    idx += 1
    key = "e" + str(idx)
    els[key] = x
    order.append(key)

right = max(x.get("x", 0) + x.get("w", 0) for x in els.values())
x0 = max(26000, ((right + 499) // 500) * 500)
y0 = 11000
add({"type": "container", "color": "white", "text": title, "x": x0, "y": y0,
     "w": 1650, "h": 100 + ((len(frames) + 1) // 2) * 535})
add({"type": "text", "size": "small", "x": x0 + 18, "y": y0 + 8, "w": 1580, "h": 82,
     "text": "Causa comprovada por inspeção do código: UIICON.timer era referenciado, mas não declarado, "
             "criando 'undefined' no slot de ícone. Correção: SVG inline e grid com reflow em 320px. "
             "E2E Chromium verifica 12 larguras, ícone, rótulos, bounds e navegação ao simulado. "
             "Evidência real da branch do PR, não de dispositivo Android físico. "
             "Cobertura PARCIAL de #132: não equivale a auditoria completa dos painéis, PDF e grafo."})
for i, (name, caption) in enumerate(frames):
    col, row = i % 2, i // 2
    x, y = x0 + 18 + col * 810, y0 + 100 + row * 535
    add({"type": "image", "src": "/_blob/issue132_" + name,
         "x": x, "y": y, "w": 755, "h": 430})
    add({"type": "text", "size": "small", "text": caption,
         "x": x, "y": y + 438, "w": 760, "h": 50})

boardfile.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print("Registered " + str(len(frames)) + " genuine before/after Home CTA screenshots")
