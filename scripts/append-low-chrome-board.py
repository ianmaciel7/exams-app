#!/usr/bin/env python3
"""Append screenshot evidence for Issue #97 to the source-of-truth board.json."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1] / "prototypes" / "board-exam-app"
board_path = root / "board.json"
data = json.loads(board_path.read_text(encoding="utf-8"))
elements = data["elements"]
order = data["order"]
if any("31. Low-Chrome" in str(v.get("text", "")) for v in elements.values() if v.get("type") == "container"):
    board_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    raise SystemExit(0)  # Idempotent recapture: reuse image references and refresh formatting

id_number = max(int(k[1:]) for k in elements if k.startswith("e") and k[1:].isdigit())

def add(element):
    global id_number
    id_number += 1
    key = f"e{id_number}"
    elements[key] = element
    order.append(key)

y0 = 11000
row_height = 495
row = 0
add({
    "type": "container",
    "text": "31. Low-Chrome — Issue #97: evidências antes/depois por tema, largura e estado dos painéis",
    "color": "white", "x": 8500, "y": y0, "w": 1590, "h": 2 * 3 * 4 * row_height + 130,
})
for width in (1366, 1024, 768):
    for theme in ("light", "dark"):
        for side, right in ((True, True), (True, False), (False, True), (False, False)):
            suffix = f"{theme}_{width}_{'sideopen' if side else 'sideclosed'}_{'rightopen' if right else 'rightclosed'}"
            y = y0 + 55 + row * row_height
            for version, x in (("before", 8520), ("after", 9315)):
                stem = f"lowchrome_97_{version}_{suffix}"
                if not (root / "assets" / (stem + ".png")).exists():
                    raise SystemExit("Missing screenshot: " + stem)
                add({"type": "image", "src": "/_blob/" + stem,
                     "x": x, "y": y, "w": 745, "h": 416})
                add({"type": "text", "size": "small",
                     "text": f"#97 {version.upper()} | {theme} | {width}px | sidebar {'aberta' if side else 'fechada'} | contexto {'aberto' if right else 'fechado'}",
                     "x": x, "y": y + 422, "w": 740, "h": 32})
            row += 1
data["order"] = order
board_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Added {row * 2} screenshot elements and captions for Issue #97")
