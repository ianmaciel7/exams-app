#!/usr/bin/env python3
"""
Agent Sync CLI - Universal Skills & MCP Synchronizer
Syncs skills, plugins, and MCP server configurations across OpenAI Codex,
Anthropic Claude Code, and Google Antigravity.

Designed to be 100% self-contained in a single file with zero external dependencies.
Contains NO hardcoded secrets, personal tokens, or private environment data.
Safe for sharing on GitHub Gist or public repositories.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

# Sensitive key patterns that must be sanitized/redacted
SENSITIVE_PATTERNS = re.compile(
    r"(?i)(token|key|secret|password|auth|bearer|credential|cert)"
)


class Color:
    CYAN = "\033[96m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    BOLD = "\033[1m"
    DIM = "\033[2m"
    RESET = "\033[0m"

    @classmethod
    def wrap(cls, text: str, color: str) -> str:
        if sys.stdout.isatty():
            return f"{color}{text}{cls.RESET}"
        return text


def get_home_dir() -> Path:
    return Path.home()


def get_agent_paths(home: Optional[Path] = None) -> Dict[str, Dict[str, Path]]:
    if home is None:
        home = get_home_dir()

    return {
        "codex": {
            "root": home / ".codex",
            "config": home / ".codex" / "config.toml",
            "skills": home / ".codex" / "skills",
            "cache": home / ".codex" / "plugins" / "cache",
        },
        "claude": {
            "root": home / ".claude",
            "config": home / ".claude.json",
            "skills": home / ".claude" / "skills",
            "settings": home / ".claude" / "settings.json",
        },
        "antigravity": {
            "root": home / ".gemini",
            "plugins": home / ".gemini" / "config" / "plugins",
            "global_skills": home / ".agents" / "skills",
        },
    }


def sanitize_env_vars(env_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Sanitizes environment variables to prevent leaking secret keys."""
    sanitized = {}
    for k, v in env_dict.items():
        if SENSITIVE_PATTERNS.search(k):
            # Replace raw value with placeholder variable reference
            sanitized[k] = f"${{{k}}}"
        else:
            sanitized[k] = v
    return sanitized


def parse_codex_toml_mcp(config_path: Path) -> Dict[str, Dict[str, Any]]:
    """Simple, zero-dependency parser for [mcp_servers.*] blocks in Codex TOML."""
    if not config_path.exists():
        return {}

    servers: Dict[str, Dict[str, Any]] = {}
    current_server: Optional[str] = None
    in_subtable: Optional[str] = None

    try:
        content = config_path.read_text(encoding="utf-8")
    except Exception:
        return {}

    for line in content.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue

        # Match [mcp_servers.<name>]
        section_match = re.match(r"^\[mcp_servers\.([^\]]+)\]$", line)
        if section_match:
            full_name = section_match.group(1)
            parts = full_name.split(".")
            current_server = parts[0]
            in_subtable = parts[1] if len(parts) > 1 else None

            if current_server not in servers:
                servers[current_server] = {"env": {}}
            continue

        if not current_server:
            continue

        # Check if line moves to another non-mcp table
        if line.startswith("[") and not line.startswith("[mcp_servers."):
            current_server = None
            in_subtable = None
            continue

        # Match key = value pairs
        kv_match = re.match(r"^([a-zA-Z0-9_\-]+)\s*=\s*(.*)$", line)
        if kv_match:
            key, raw_val = kv_match.group(1), kv_match.group(2).strip()

            # String literal parsing
            if (raw_val.startswith('"') and raw_val.endswith('"')) or (
                raw_val.startswith("'") and raw_val.endswith("'")
            ):
                val: Any = raw_val[1:-1]
            # Array literal parsing
            elif raw_val.startswith("[") and raw_val.endswith("]"):
                inner = raw_val[1:-1].strip()
                val = [
                    item.strip().strip('"').strip("'")
                    for item in inner.split(",")
                    if item.strip()
                ]
            elif raw_val.lower() == "true":
                val = True
            elif raw_val.lower() == "false":
                val = False
            else:
                val = raw_val

            target = servers[current_server]
            if in_subtable == "env":
                target.setdefault("env", {})[key] = val
            else:
                target[key] = val

    # Cleanup and format servers
    formatted: Dict[str, Dict[str, Any]] = {}
    for name, data in servers.items():
        if "command" not in data and "url" not in data:
            continue
        entry: Dict[str, Any] = {}
        if "command" in data:
            entry["command"] = data["command"]
            entry["args"] = data.get("args", [])
            if data.get("env"):
                entry["env"] = sanitize_env_vars(data["env"])
        elif "url" in data:
            entry["url"] = data["url"]
        formatted[name] = entry

    return formatted


def discover_codex_skills(paths: Dict[str, Path]) -> Dict[str, Path]:
    """Finds all available skills in ~/.codex/skills and ~/.codex/plugins/cache."""
    skills: Dict[str, Path] = {}

    # 1. Direct skills folder
    skills_dir = paths["skills"]
    if skills_dir.exists():
        for item in skills_dir.iterdir():
            if item.is_dir() and (item / "SKILL.md").exists():
                skills[item.name] = item

    # 2. Plugins cache
    cache_dir = paths["cache"]
    if cache_dir.exists():
        for root, _, files in os.walk(cache_dir):
            if "SKILL.md" in files:
                skill_dir = Path(root)
                name = skill_dir.name
                if name not in skills and not name.startswith("."):
                    skills[name] = skill_dir

    return skills


def discover_claude_skills(paths: Dict[str, Path]) -> Dict[str, Path]:
    skills: Dict[str, Path] = {}
    skills_dir = paths["skills"]
    if skills_dir.exists():
        for item in skills_dir.iterdir():
            if item.is_dir() and (item / "SKILL.md").exists():
                skills[item.name] = item
    return skills


def discover_antigravity_skills(paths: Dict[str, Path]) -> Dict[str, Path]:
    skills: Dict[str, Path] = {}

    # From plugins
    plugins_dir = paths["plugins"]
    if plugins_dir.exists():
        for plugin in plugins_dir.iterdir():
            if not plugin.is_dir():
                continue
            p_skills = plugin / "skills"
            if p_skills.exists():
                for item in p_skills.iterdir():
                    if item.is_dir() and (item / "SKILL.md").exists():
                        skills[f"{plugin.name}:{item.name}"] = item

    # From ~/.agents/skills
    global_dir = paths["global_skills"]
    if global_dir.exists():
        for item in global_dir.iterdir():
            if item.is_dir() and (item / "SKILL.md").exists():
                skills[f"global:{item.name}"] = item

    return skills


def read_claude_mcp(config_path: Path) -> Dict[str, Dict[str, Any]]:
    if not config_path.exists():
        return {}
    try:
        data = json.loads(config_path.read_text(encoding="utf-8"))
        raw_servers = data.get("mcpServers", {})
        cleaned = {}
        for name, conf in raw_servers.items():
            entry: Dict[str, Any] = {}
            if "command" in conf:
                entry["command"] = conf["command"]
                entry["args"] = conf.get("args", [])
                if conf.get("env"):
                    entry["env"] = sanitize_env_vars(conf["env"])
            elif "url" in conf:
                entry["url"] = conf["url"]
            cleaned[name] = entry
        return cleaned
    except Exception:
        return {}


def write_claude_mcp(
    config_path: Path, servers: Dict[str, Dict[str, Any]], dry_run: bool = False
) -> int:
    data: Dict[str, Any] = {}
    if config_path.exists():
        try:
            data = json.loads(config_path.read_text(encoding="utf-8"))
        except Exception:
            data = {}

    data.setdefault("mcpServers", {})
    added_count = 0

    for name, conf in servers.items():
        if name not in data["mcpServers"]:
            target_conf: Dict[str, Any] = {}
            if "url" in conf:
                target_conf["type"] = "http"
                target_conf["url"] = conf["url"]
            elif "command" in conf:
                target_conf["type"] = "stdio"
                target_conf["command"] = conf["command"]
                target_conf["args"] = conf.get("args", [])
                target_conf["env"] = conf.get("env", {})

            data["mcpServers"][name] = target_conf
            added_count += 1

    if not dry_run and added_count > 0:
        config_path.parent.mkdir(parents=True, exist_ok=True)
        config_path.write_text(json.dumps(data, indent=2), encoding="utf-8")

    return added_count


def copy_skill(src_dir: Path, dst_dir: Path, dry_run: bool = False) -> None:
    if dry_run:
        return
    if dst_dir.exists():
        shutil.rmtree(dst_dir)
    shutil.copytree(src_dir, dst_dir)


def cmd_scan(args: argparse.Namespace) -> None:
    paths = get_agent_paths()
    print(Color.wrap("\n=== AGENT ECOSYSTEM SCAN ===", Color.BOLD + Color.CYAN))

    # Codex
    codex_skills = discover_codex_skills(paths["codex"])
    codex_mcp = parse_codex_toml_mcp(paths["codex"]["config"])
    print(
        f"\n{Color.wrap('OpenAI Codex:', Color.BOLD)} "
        f"{len(codex_skills)} skills | {len(codex_mcp)} MCP servers"
    )
    for name in sorted(codex_skills.keys()):
        print(f"  - Skill: {Color.wrap(name, Color.GREEN)}")
    for name in sorted(codex_mcp.keys()):
        print(f"  - MCP:   {Color.wrap(name, Color.YELLOW)}")

    # Claude Code
    claude_skills = discover_claude_skills(paths["claude"])
    claude_mcp = read_claude_mcp(paths["claude"]["config"])
    print(
        f"\n{Color.wrap('Anthropic Claude Code:', Color.BOLD)} "
        f"{len(claude_skills)} skills | {len(claude_mcp)} MCP servers"
    )
    for name in sorted(claude_skills.keys()):
        print(f"  - Skill: {Color.wrap(name, Color.GREEN)}")
    for name in sorted(claude_mcp.keys()):
        print(f"  - MCP:   {Color.wrap(name, Color.YELLOW)}")

    # Antigravity
    ag_skills = discover_antigravity_skills(paths["antigravity"])
    print(
        f"\n{Color.wrap('Google Antigravity:', Color.BOLD)} {len(ag_skills)} skills installed"
    )
    for name in sorted(ag_skills.keys()):
        print(f"  - Skill: {Color.wrap(name, Color.GREEN)}")


def cmd_sync(args: argparse.Namespace) -> None:
    paths = get_agent_paths()
    dry_run = args.dry_run
    prefix = "[DRY-RUN] " if dry_run else ""

    print(
        Color.wrap(
            f"\n=== {prefix}SYNCING SKILLS & MCPs FROM CODEX ===",
            Color.BOLD + Color.CYAN,
        )
    )

    # 1. Discover sources from Codex
    codex_skills = discover_codex_skills(paths["codex"])
    codex_mcp = parse_codex_toml_mcp(paths["codex"]["config"])

    print(
        f"Found {len(codex_skills)} skills and {len(codex_mcp)} MCP servers in Codex."
    )

    # 2. Sync to Antigravity
    ag_plugin_name = args.plugin_name
    ag_plugin_dir = paths["antigravity"]["plugins"] / ag_plugin_name
    ag_skills_dir = ag_plugin_dir / "skills"

    print(
        f"\n{Color.wrap('Target Antigravity:', Color.BOLD)} {ag_plugin_dir.as_posix()}"
    )

    if not dry_run:
        ag_skills_dir.mkdir(parents=True, exist_ok=True)

        plugin_json = {
            "name": ag_plugin_name,
            "displayName": "Migrated Agent Settings",
            "version": "1.0.0",
            "description": "Unified skills and MCP servers synchronized across coding agents.",
        }
        (ag_plugin_dir / "plugin.json").write_text(
            json.dumps(plugin_json, indent=2), encoding="utf-8"
        )

        mcp_config = {"mcpServers": codex_mcp}
        (ag_plugin_dir / "mcp_config.json").write_text(
            json.dumps(mcp_config, indent=2), encoding="utf-8"
        )

    for name, src in codex_skills.items():
        dst = ag_skills_dir / name
        copy_skill(src, dst, dry_run=dry_run)
        print(f"  + Synced to Antigravity: {Color.wrap(name, Color.GREEN)}")

    # 3. Sync to Claude Code
    claude_skills_dir = paths["claude"]["skills"]
    print(
        f"\n{Color.wrap('Target Claude Code:', Color.BOLD)} {claude_skills_dir.as_posix()}"
    )

    if not dry_run:
        claude_skills_dir.mkdir(parents=True, exist_ok=True)

    for name, src in codex_skills.items():
        dst = claude_skills_dir / name
        copy_skill(src, dst, dry_run=dry_run)
        print(f"  + Synced to Claude Code:  {Color.wrap(name, Color.GREEN)}")

    # Sync MCPs to Claude Code
    added_mcp = write_claude_mcp(
        paths["claude"]["config"], codex_mcp, dry_run=dry_run
    )
    print(
        f"  + Registered {added_mcp} new MCP servers in {paths['claude']['config'].name}"
    )

    print(
        Color.wrap(
            f"\n=== {prefix}SYNC COMPLETED SUCCESSFULLY ===",
            Color.BOLD + Color.GREEN,
        )
    )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Universal Agent Sync CLI - Synchronize skills, plugins, and MCPs across Codex, Claude Code, and Antigravity."
    )
    subparsers = parser.add_subparsers(dest="command", help="Command to run")

    # Scan command
    subparsers.add_parser(
        "scan", help="Scan and list installed skills and MCP servers across all agents"
    )

    # Sync command
    sync_parser = subparsers.add_parser(
        "sync", help="Synchronize skills and MCP servers from Codex to Claude & Antigravity"
    )
    sync_parser.add_argument(
        "--plugin-name",
        default="codex-migrated",
        help="Antigravity plugin directory name (default: codex-migrated)",
    )
    sync_parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview changes without copying or writing any files",
    )

    args = parser.parse_args()

    if args.command == "scan":
        cmd_scan(args)
    elif args.command == "sync":
        cmd_sync(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
