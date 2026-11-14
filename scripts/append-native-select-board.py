#!/usr/bin/env python3
"""Register only genuine Playwright Issue #120 images and diagnostics in the board."""
from pathlib import Path
import json
import struct

root = Path(__file__).resolve().parents[1] / "prototypes" / "board-exam-app"
board_file = root / "board.json"
board = json.loads(board_file.read_text(encoding="utf-8"))
els, order = board["elements"], board["order"]
title = "37. Seletores nativos — Issue #120: temas e testes Windows Chromium"

if any(e.get("type") == "container" and e.get("text") == title for e in els.values()):
    print("Issue #120 E2E section already registered; no duplicate.")
    raise SystemExit(0)

report = json.loads((root / "issue120_e2e.json").read_text(encoding="utf-8"))
if report["errors"]:
    raise SystemExit("Cannot publish evidence with uncaught browser errors")
expected = [
    ("after_auto_dark", "Sistema escuro: tema automatico segue color-scheme escuro"),
    ("after_explicit_light", "Tema claro escolhido na UI, mesmo com sistema escuro"),
    ("after_explicit_dark", "Tema escuro escolhido na UI"),
    ("after_auto_restored", "Retorno ao tema automatico, sem reload"),
    ("after_toggle_light", "Alternancia pelo botao do rodape, sem reload"),
    ("after_mobile", "Viewport estreita de 390px com select nativo"),
    ("after_auto_light", "Sistema claro: tema automatico segue color-scheme claro"),
    ("after_dark_on_light_os", "Tema escuro escolhido, mesmo com sistema claro"),
    ("after_auto_light_restored", "Retorno ao automatico com sistema claro"),
]
reported = {x.get("screenshot") for x in report["scenarios"]}
for name, _ in expected:
    filename = f"issue120_{name}.png"
    image = root / "assets" / filename
    raw = image.read_bytes()
    if filename not in reported or len(raw) < 10000 or raw[:8] != b"\x89PNG\r\n\x1a\n":
        raise SystemExit(f"Missing, invalid or unreported screenshot: {filename}")
    width, height = struct.unpack(">II", raw[16:24])
    if width < 350 or height < 350:
        raise SystemExit(f"Invalid screenshot dimensions: {filename}: {width}x{height}")

index = max(int(k[1:]) for k in els if k.startswith("e") and k[1:].isdigit())
def add(item):
    global index
    index += 1
    eid = f"e{index}"
    els[eid] = item
    order.append(eid)

max_right = max(item.get("x", 0) + item.get("w", 0) for item in els.values())
x0 = max(24000, ((max_right + 499) // 500) * 500)
y0 = 11000
add({"type": "container", "color": "white", "text": title,
     "x": x0, "y": y0, "w": 1650, "h": 100 + ((len(expected) + 1) // 2) * 535})
add({"type": "text", "size": "small", "x": x0 + 18, "y": y0 + 8, "w": 1580, "h": 82,
     "text": "Capturas reais de Chromium headless executado no runner Windows. O teste valida "
             "color-scheme computado em html e select, escolha na interface, modo automatico, "
             "quatro opcoes (1/5/10/20), foco via teclado e viewport de 390px. "
             "LIMITACAO: o popup nativo do sistema pode nao aparecer em screenshots Playwright. "
             "Nao comprova contraste visual do popup no Windows; verificar manualmente antes de fechar #120."})
for i, (name, caption) in enumerate(expected):
    x = x0 + 18 + 810 * (i % 2)
    y = y0 + 100 + 535 * (i // 2)
    add({"type": "image", "src": "/_blob/issue120_" + name, "x": x, "y": y, "w": 755, "h": 430})
    add({"type": "text", "size": "small", "text": caption,
         "x": x, "y": y + 438, "w": 760, "h": 50})

board_file.write_text(json.dumps(board, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("Added " + str(len(expected)) + " verified Issue #120 screenshots to board.")
