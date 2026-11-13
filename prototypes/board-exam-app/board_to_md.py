#!/usr/bin/env python3
"""Convert board.json (Claude Whiteboard export) into BOARD.md, readable by any AI agent.

Usage: python board_to_md.py   (run inside prototypes/board-exam-app/)
Inline data: images are extracted to assets/inline-<id>.<ext>; /_blob/<id> maps to assets/<id>.png.
"""
import base64, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, "board.json"), encoding="utf8"))
E, ORDER = D["elements"], D["order"]


def size_of(e):
    t = e["type"]
    if t == "table":
        return sum(c["w"] for c in e["cols"].values()), 40 * (len(e["rows"]) + 1)
    if t == "link":
        return 320, 56
    return e.get("w", 0), e.get("h", 0)


def center(e):
    w, h = size_of(e)
    return e["x"] + w / 2, e["y"] + h / 2


def img_path(e):
    s = e["src"]
    if s.startswith("/_blob/"):
        return "assets/" + s[7:] + ".png"
    m = re.match(r"data:image/(\w+);base64,(.*)", s, re.S)
    if m:
        ext = {"jpeg": "jpg"}.get(m.group(1), m.group(1))
        p = f"assets/inline-{e['_id']}.{ext}"
        with open(os.path.join(HERE, p), "wb") as f:
            f.write(base64.b64decode(m.group(2)))
        return p
    return None  # svg data URIs etc.


for k, v in E.items():
    v["_id"] = k

containers = sorted((e for e in E.values() if e["type"] == "container"), key=lambda e: (e["y"], e["x"]))


def inside(c, e):
    cx, cy = center(e)
    return c["x"] <= cx <= c["x"] + c["w"] and c["y"] <= cy <= c["y"] + c["h"]


owner = {}
for e in E.values():
    if e["type"] in ("container", "arrow"):
        continue
    best = None
    for c in containers:
        if inside(c, e) and (best is None or c["w"] * c["h"] < best["w"] * best["h"]):
            best = c
    owner[e["_id"]] = best["_id"] if best else None


def label(e):
    t = e.get("text") or e.get("title") or ""
    return re.sub(r"\s+", " ", t).strip()


def render(e):
    t = e["type"]
    if t == "text":
        s = e.get("text", "").strip()
        sz = e.get("size")
        if sz == "title":
            return "# " + s
        if sz in ("large", "huge"):
            return "### " + s
        return s
    if t == "shape":
        s = e.get("text", "").strip()
        return "\n".join("> " + ln for ln in s.splitlines()) if s else ""
    if t == "image":
        p = img_path(e)
        link = f" ([abrir]({e['href']}))" if e.get("href") else ""
        return (f"![imagem {e['_id']}]({p}){link}" if p else f"*(imagem vetorial {e['_id']})*{link}")
    if t == "link":
        return f"[{e.get('title') or e['href']}]({e['href']})"
    if t == "table":
        cols = sorted(e["cols"].items(), key=lambda kv: kv[1]["at"])
        rows = sorted(e["rows"].items(), key=lambda kv: kv[1]["at"])
        cell = lambda v: (v or "").replace("|", "\\|").replace("\n", " ")
        out = []
        for i, (_, r) in enumerate(rows):
            out.append("| " + " | ".join(cell(r.get(ck)) for ck, _ in cols) + " |")
            if i == 0:
                out.append("|" + " --- |" * len(cols))
        return "\n".join(out)
    if t == "html":
        return "*(embed HTML interativo omitido; ver board.json)*"
    return ""


def block(elements):
    # reading order: top to bottom, then left to right (rows within 40px grouped)
    es = sorted(elements, key=lambda e: (round(e["y"] / 40), e["x"]))
    return "\n\n".join(r for r in (render(e) for e in es) if r)


out = [f"# {D['title']}", "",
       "> Gerado de `board.json` por `board_to_md.py`. Fonte da verdade: `board.json`. "
       "Ordem de leitura: de cima para baixo, da esquerda para a direita. "
       "Cada seção corresponde a uma seção (container) do quadro.", ""]

top = [e for e in E.values() if e["type"] not in ("container", "arrow") and owner[e["_id"]] is None]
if top:
    out += [block(top), ""]

for c in containers:
    members = [E[i] for i, o in owner.items() if o == c["_id"]]
    out += [f"## {label(c) or c['_id']}", f"<!-- container {c['_id']} @ ({c['x']},{c['y']}) -->", "", block(members), ""]

arrows = [e for e in E.values() if e["type"] == "arrow" and e["from"] in E and e["to"] in E]
if arrows:
    out += ["## Relações (setas)", ""]
    for a in sorted(arrows, key=lambda a: (E[a["from"]]["y"], E[a["from"]]["x"])):
        lab = (a.get("label") or "").strip()
        out.append(f"- {label(E[a['from']])[:70] or a['from']} → {label(E[a['to']])[:70] or a['to']}" + (f" ({lab})" if lab else ""))
    out.append("")

open(os.path.join(HERE, "BOARD.md"), "w", encoding="utf8").write("\n".join(out))
print("BOARD.md:", len("\n".join(out)), "chars;", len(containers), "sections;", len(arrows), "arrows")
