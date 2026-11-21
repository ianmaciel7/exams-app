#!/usr/bin/env python3
"""Validate #278 phase 2B paths, Git blobs and the Claude publication hold."""
import json
from pathlib import Path
import re
import subprocess
import sys
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
PROTOTYPE = ROOT / "prototype"
BOARDS = ("01-produto", "02-design", "03-estudos", "04-arquitetura", "05-pesquisas", "06-evidencias", "07-releases-historico")

def main():
    errors = []
    data = json.loads((PROTOTYPE/"boards/data/phase2-navigation-map.json").read_text(encoding="utf-8"))
    entries = data["mappings"]
    original_paths = [x["path"] for x in entries]
    destination_paths = [x["future_path"].casefold() for x in entries]
    current_paths = [x.get("current_path", x["path"]) for x in entries]
    if len(entries) != data["count"] or len(set(original_paths)) != len(entries):
        errors.append("Manifest count or baseline source uniqueness failed")
    if len(set(destination_paths)) != len(entries):
        errors.append("Case-insensitive future destination collision")
    if len({p.casefold() for p in current_paths}) != len(entries):
        errors.append("Case-insensitive current destination collision")
    moved = [x for x in entries if x.get("current_path", x["path"]) != x["path"]]
    summary = data.get("migration_summary", {})
    if summary.get("moved_exact_git_blob") != len(moved) or summary.get("remaining_legacy_canonical") != len(entries)-len(moved):
        errors.append("Moved/remaining manifest totals differ")
    empty_sha = "e69de29bb2d1d6434b8b29ae775ad8c2e48c5391"
    for entry in entries:
        source = entry["path"]
        current = entry.get("current_path", source)
        if not source.startswith("prototype/") or source.count("/") != 1:
            errors.append("Unexpected baseline source: "+source)
        if current != source:
            if (entry.get("state") != "moved-exact-git-blob" or
                not re.fullmatch(r"prototype/boards/06-evidencias/relatorios/\.e\d+\.json,by-others",current) or
                current != entry["future_path"] or entry["bytes"] != 0 or
                entry["git_blob_sha"] != empty_sha):
                errors.append("Unreviewed physical migration: "+source)
        elif entry.get("state") != "legacy-path-canonical":
            errors.append("Incorrect legacy state: "+source)
    raw = subprocess.check_output(["git", "ls-files", "-s", "-z", "--", "prototype"], cwd=ROOT)
    tracked = {}
    for item in raw.split(b"\0"):
        if not item: continue
        metadata, name = item.split(b"\t", 1)
        path = name.decode("utf-8", "surrogateescape").replace("\\", "/")
        if path.startswith("prototype/") and (
            path.count("/") == 1 or
            re.fullmatch(r"prototype/boards/06-evidencias/relatorios/\.e\d+\.json,by-others",path)
        ):
            tracked[path] = metadata.decode("ascii").split()[1]
    expected = {x.get("current_path", x["path"]): x["git_blob_sha"] for x in entries}
    for missing in sorted(set(tracked)-set(expected)):
        errors.append("Unmapped canonical file: "+missing)
    for missing in sorted(set(expected)-set(tracked)):
        errors.append("Canonical file missing: "+missing)
    for name in set(expected)&set(tracked):
        if expected[name] != tracked[name]:
            errors.append("Changed Git blob: "+name)
    roots = [PROTOTYPE/"boards/README.md", PROTOTYPE/"boards/data/README.md",
             PROTOTYPE/"archive/README.md", PROTOTYPE/"tools/README.md",
             PROTOTYPE/"app/README.md"]
    roots += [PROTOTYPE/"boards"/b/"README.md" for b in BOARDS]
    for file in roots:
        if not file.is_file():
            errors.append("Index missing: "+str(file)); continue
        for href in re.findall(r"\[[^\]]*\]\(([^)]+)\)", file.read_text(encoding="utf-8")):
            if re.match(r"^(?:https?:|mailto:|#)", href): continue
            target=unquote(href.split("#",1)[0].split("?",1)[0])
            if target and not (file.parent/target).exists():
                errors.append("Broken link: "+str(file)+" -> "+href)
    master=json.loads((PROTOTYPE/"board-mestre.json").read_text(encoding="utf-8"))
    canvas=json.loads((PROTOTYPE/"board.json").read_text(encoding="utf-8"))
    if len(master.get("areas",[]))!=7: errors.append("Board count changed")
    if "e17000" not in canvas.get("elements",{}): errors.append("e17000 missing")
    landing=PROTOTYPE/"boards/index.html"
    if not landing.is_file() or "../mestre.html" not in landing.read_text(encoding="utf-8"):
        errors.append("Master board redirect missing")
    hold=json.loads((ROOT/".github/prototype-migration.json").read_text(encoding="utf-8"))
    if hold.get("state")!="migration-hold" or hold.get("artifact_publication")!="disabled":
        errors.append("Artifact publication hold not enforced")
    if errors:
        print("\n".join(errors),file=sys.stderr); return 1
    print(f"OK: {len(entries)} preserved Git blobs ({len(moved)} physically moved), 7 boards, links, e17000, Claude publication hold.")
    return 0

if __name__=="__main__":
    sys.exit(main())
