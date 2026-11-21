#!/usr/bin/env python3
"""Valida o dossiê ExamTopics: todo achado precisa estar no Board 06 e ser rastreável.

Executar a partir de qualquer diretório: python3 prototype/validate_examtopics_evidence.py.
Não faz rede nem declara testes do produto realizados.
"""
import hashlib
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
read = lambda name: open(os.path.join(HERE, name), encoding="utf-8").read()
manifest = json.loads(read("examtopics-auditoria-evidencias-2026-11-17.json"))
board = json.loads(read("board.json"))
master = json.loads(read("board-mestre.json"))
catalog = json.loads(read("catalog.json"))
dossier = read("evidencias-examtopics-2026-11-17.md")
markdown_board = read("BOARD.md")
errors = []

def check(ok, msg):
    if not ok:
        errors.append(msg)

checks = manifest.get("observations", [])
sources = {s["id"]: s for s in manifest.get("sources", [])}
pics = manifest.get("existing_visual_assets", [])
check(len(checks) >= 57, "inventário reduzido: menos de 57 registros")
check(len(sources) >= 16, "fontes reduzidas: menos de 16")
check(len(pics) == 5, "não há exatamente cinco capturas históricas")
ids = [o["id"] for o in checks]
check(len(set(ids)) == len(ids), "IDs ET-E duplicados")
check(ids == ["ET-E" + str(i).zfill(2) for i in range(1, len(ids) + 1)], "IDs ET-E não sequenciais")
container = board["elements"].get("e17000")
check(bool(container and container.get("type") == "container"), "falta container e17000")
area = next((a for a in master.get("areas", []) if a.get("id") == "06"), {})
check(any("e17000" in card.get("blocks", []) for card in area.get("cards", [])),
      "e17000 não está no Board 06")
check(any(d.get("path") == "prototype/evidencias-examtopics-2026-11-17.md"
          for d in area.get("documents", [])), "dossiê não está listado no Board 06")

elements = board["elements"]
texts = "\n".join(
    x.get("text", "") for x in elements.values()
    if x.get("type") == "text"
    and container and container["x"] <= x.get("x", -1) <= container["x"] + container["w"]
    and container["y"] <= x.get("y", -1) <= container["y"] + container["h"]
)
for row in checks:
    ident = row["id"]
    check(ident in dossier, f"{ident} ausente no dossiê")
    check(ident in texts, f"{ident} ausente dos blocos visíveis de evidência")
    check(row.get("status"), f"{ident} sem estado de verificação")
    check(row.get("exam_app", {}).get("state"), f"{ident} sem estado da dev")
    check(row.get("exam_app", {}).get("decision"), f"{ident} sem decisão")
    check(row.get("source_ids"), f"{ident} sem fonte")
    for sid in row.get("source_ids", []):
        check(sid == "DEV-01" or sid in sources, f"{ident}: fonte desconhecida: {sid}")
for sid, source in sources.items():
    check(source.get("url", "").startswith("https://"), f"{sid}: URL sem HTTPS")
    check(sid in dossier, f"{sid} ausente do dossiê")

cat = {e["caminho"]: e for e in catalog["evidencias"]}
for photo in pics:
    p = photo["path"]
    f = os.path.join(os.path.dirname(HERE), p)
    check(os.path.isfile(f), f"arquivo da captura ausente: {p}")
    check(p in cat, f"captura ausente do catalog.json: {p}")
    check(os.path.basename(p) in dossier, f"captura sem miniatura no dossiê: {p}")
    check(p in cat and "prototype/evidencias-examtopics-2026-11-17.md" in cat[p]["referenciado_em"],
          f"captura sem vínculo no catálogo: {p}")
    check(any(v.get("type") == "image" and v.get("src") == "assets/" + os.path.basename(p)
              for v in elements.values()), f"captura ausente do canvas: {p}")
    if os.path.isfile(f) and p in cat:
        with open(f, "rb") as handle:
            check(hashlib.sha256(handle.read()).hexdigest() == cat[p]["sha256"],
                  f"hash divergente da captura: {p}")

# Evidências precisam aparecer realmente no canvas: fundo antes dos itens, sem cortes.
ordered = board.get("order", [])
check("e17000" in ordered, "container ausente de order")
if "e17000" in ordered and "e17001" in ordered:
    check(ordered.index("e17000") < ordered.index("e17001"),
          "container de evidências desenhado sobre os achados (ordem de camadas)")

if container:
    left, top, right, bottom = (container["x"], container["y"],
                                container["x"] + container["w"],
                                container["y"] + container["h"])
    for identifier in [f"e{i}" for i in range(17001, 17026)]:
        item = elements.get(identifier)
        check(item is not None, f"bloco de evidências ausente: {identifier}")
        if item is None:
            continue
        check(item.get("wrap") or item.get("type") != "text",
              f"texto sem quebra de linha no canvas: {identifier}")
        check(left <= item["x"] and top <= item["y"]
              and item["x"] + item.get("w", 320) <= right
              and item["y"] + item.get("h", 56) <= bottom,
              f"bloco fora do contêiner: {identifier}")

source_text = elements.get("e17024", {}).get("text", "")
for sid in sources:
    check(sid in source_text, f"fonte {sid} não está visível no canvas")
    check(sources[sid]["url"] in source_text, f"URL {sid} não está clicável no canvas")
for record in checks:
    item_text = texts
    check(record["exam_app"]["state"] in item_text,
          f"{record['id']}: status da dev não aparece no canvas")
check(all(row["id"] in dossier for row in checks),
      "dossiê deixou de cobrir os registros do manifesto")

check("<!-- container e17000 @ (14920,0) -->" in markdown_board,
      "board Markdown não inclui e17000")
for ident in ids:
    check(ident in markdown_board, f"{ident} ausente no BOARD.md")
if errors:
    print("\n".join(errors))
    print(f"FALHOU: {len(errors)} erro(s)")
    sys.exit(1)
print(f"OK: {len(checks)} achados, {len(sources)} fontes, {len(pics)} imagens históricas visíveis e rastreadas no Board 06")
