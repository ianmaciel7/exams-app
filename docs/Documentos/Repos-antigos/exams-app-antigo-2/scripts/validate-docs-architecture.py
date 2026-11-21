#!/usr/bin/env python3
"""Valida JSON e links Markdown dos documentos achatados de arquitetura, features e planejamento."""
import json
import pathlib
import re
import sys
from urllib.parse import unquote

ROOT = pathlib.Path(__file__).resolve().parent.parent
MAP = ROOT / "prototype" / "MIGRATION-MAP.md"
AREAS = ("docs/architecture/", "docs/features/", "docs/planning/")
ROW = re.compile(r"^\| `([^`]+)` \| `([^`]+)` \|", re.M)
LINK = re.compile(r"\]\(([^)\s]+)\)")
errors = []

if not MAP.is_file():
    sys.exit("Mapa de migração ausente: prototype/MIGRATION-MAP.md")
mapped = ROW.findall(MAP.read_text(encoding="utf-8"))
for area in AREAS:
    pages = [ROOT / target for source, target in mapped if source.startswith(area)]
    if not pages:
        errors.append(f"sem documentos mapeados: {area}")
    for path in pages:
        if not path.is_file():
            errors.append(f"documento ausente: {path.relative_to(ROOT)}")
            continue
        if path.suffix == ".json":
            try:
                json.loads(path.read_text(encoding="utf-8"))
            except json.JSONDecodeError as e:
                errors.append(f"{path.relative_to(ROOT)}: JSON inválido: {e}")
        elif path.suffix == ".md":
            for target in LINK.findall(path.read_text(encoding="utf-8")):
                if re.match(r"^(?:[a-z][a-z0-9+.-]*:|#|/)", target, re.I):
                    continue
                file_part = unquote(target.split("#", 1)[0].split("?", 1)[0])
                if file_part and not (path.parent / file_part).exists():
                    errors.append(f"{path.relative_to(ROOT)}: link local quebrado: {target}")

if errors:
    print("\n".join(errors))
    sys.exit(1)
print("Arquitetura, features e planejamento achatados: JSON e links locais OK")
