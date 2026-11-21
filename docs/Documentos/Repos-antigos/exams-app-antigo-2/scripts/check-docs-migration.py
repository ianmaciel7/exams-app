#!/usr/bin/env python3
"""Confere o mapa de migração, hashes e links Markdown dos documentos achatados."""
import hashlib
import pathlib
import re
import sys
from urllib.parse import unquote

ROOT = pathlib.Path(__file__).resolve().parent.parent
MAP = ROOT / "prototype" / "MIGRATION-MAP.md"
ROW = re.compile(r"^\| `([^`]+)` \| `([^`]+)` \| `(?:[0-9a-f]+|—)` \| `([0-9a-f]{16})` \|", re.M)
LINK = re.compile(r"\]\(([^)\s]+)\)")
errors = []
if not MAP.is_file():
    sys.exit("Mapa de migração ausente")
entries = ROW.findall(MAP.read_text(encoding="utf-8"))
if not entries:
    sys.exit("Mapa de migração vazio ou formato inválido")
targets = {}
for source, relative, digest in entries:
    if relative in targets and targets[relative] != digest:
        errors.append(f"destino com hashes conflitantes no mapa: {relative}")
    targets[relative] = digest
    dest = ROOT / relative
    if not dest.is_file():
        errors.append(f"destino ausente: {relative}")
        continue
    actual = hashlib.sha256(dest.read_bytes()).hexdigest()[:16]
    if actual != digest:
        errors.append(f"sha256 divergente: {relative} (mapa: {digest}, atual: {actual})")
    if dest.suffix != ".md":
        continue
    for target in LINK.findall(dest.read_text(encoding="utf-8")):
        if re.match(r"^(?:[a-z][a-z0-9+.-]*:|#|/)", target, re.I):
            continue
        name = unquote(target.split("#", 1)[0].split("?", 1)[0])
        if name and not (dest.parent / name).exists():
            errors.append(f"link quebrado em {relative}: {target}")
print(f"Entradas do mapa: {len(entries)}; erros: {len(errors)}")
for error in errors[:100]:
    print(" -", error)
sys.exit(bool(errors))
