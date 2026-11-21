#!/usr/bin/env python3
"""Integrity checks for board.json. Usage: python validate_board.py (run inside prototype/)."""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, "board.json"), encoding="utf8"))
E, ORDER = D["elements"], D["order"]
errors = []

if len(set(ORDER)) != len(ORDER):
    errors.append("order contém IDs duplicados")
for i in set(ORDER) - set(E):
    errors.append(f"order aponta para ID inexistente: {i}")
for i in set(E) - set(ORDER):
    errors.append(f"elemento fora de order: {i}")
for k, v in E.items():
    if v.get("_id", k) != k:
        errors.append(f"_id divergente em {k}")
    for a in ("from", "to"):
        if a in v and v[a] not in E:
            errors.append(f"seta {k} aponta para {v[a]} inexistente")
    for m in re.findall(r"assets/([A-Za-z0-9_.\-]+\.(?:png|jpe?g|gif|webp|svg))", json.dumps(v)):
        if not any(os.path.exists(os.path.join(HERE, p)) for p in (m, "board-exam-app__assets__" + m)):
            errors.append(f"asset ausente em {k}: {m}")

if errors:
    print("\n".join(errors))
    print(f"FALHOU: {len(errors)} problema(s)")
    sys.exit(1)
print(f"OK: {len(E)} elementos, {len(ORDER)} em order, sem problemas de integridade")
