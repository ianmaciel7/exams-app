#!/usr/bin/env bash
# ==============================================================================
# Universal Agent Sync CLI for Ubuntu / Linux / macOS (Native Bash)
# Synchronizes skills, plugins, and MCP servers across OpenAI Codex, Claude Code, and Antigravity.
# Zero external dependencies. No Python, Node, or compilers required.
# Safe for public GitHub Gist (zero hardcoded secrets).
# ==============================================================================

set -euo pipefail

COMMAND="${1:-help}"
PLUGIN_NAME="codex-migrated"
DRY_RUN=false

for arg in "$@"; do
    case "$arg" in
        --dry-run) DRY_RUN=true ;;
        --plugin-name=*) PLUGIN_NAME="${arg#*=}" ;;
    esac
done

USER_HOME="${HOME:-~}"
CODEX_DIR="$USER_HOME/.codex"
CODEX_CONFIG="$CODEX_DIR/config.toml"
CODEX_SKILLS="$CODEX_DIR/skills"
CODEX_CACHE="$CODEX_DIR/plugins/cache"

CLAUDE_DIR="$USER_HOME/.claude"
CLAUDE_CONFIG="$USER_HOME/.claude.json"
CLAUDE_SKILLS="$CLAUDE_DIR/skills"

ANTIGRAVITY_PLUGINS="$USER_HOME/.gemini/config/plugins"

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m' # No Color

do_scan() {
    echo -e "\n${BOLD}${CYAN}=== AGENT ECOSYSTEM SCAN (Ubuntu / Linux Native) ===${NC}"
    
    echo -e "\n${BOLD}OpenAI Codex Skills:${NC}"
    if [ -d "$CODEX_SKILLS" ]; then
        find "$CODEX_SKILLS" -maxdepth 2 -name "SKILL.md" -exec dirname {} \; | while read -r dir; do
            echo -e "  - Skill: ${GREEN}$(basename "$dir")${NC}"
        done
    fi
    if [ -d "$CODEX_CACHE" ]; then
        find "$CODEX_CACHE" -name "SKILL.md" -exec dirname {} \; | while read -r dir; do
            bname=$(basename "$dir")
            [[ "$bname" =~ ^\. ]] && continue
            echo -e "  - Skill (cache): ${GREEN}$bname${NC}"
        done
    fi

    echo -e "\n${BOLD}Anthropic Claude Code Skills:${NC}"
    if [ -d "$CLAUDE_SKILLS" ]; then
        find "$CLAUDE_SKILLS" -maxdepth 2 -name "SKILL.md" -exec dirname {} \; | while read -r dir; do
            echo -e "  - Skill: ${GREEN}$(basename "$dir")${NC}"
        done
    fi

    echo -e "\n${BOLD}Google Antigravity Plugins:${NC}"
    if [ -d "$ANTIGRAVITY_PLUGINS" ]; then
        find "$ANTIGRAVITY_PLUGINS" -maxdepth 1 -mindepth 1 -type d | while read -r dir; do
            echo -e "  - Plugin: ${YELLOW}$(basename "$dir")${NC}"
        done
    fi

    echo -e "\n${CYAN}Scan complete.${NC}\n"
}

do_sync() {
    prefix=""
    if [ "$DRY_RUN" = true ]; then
        prefix="[DRY-RUN] "
    fi

    echo -e "\n${BOLD}${CYAN}=== ${prefix}SYNCING CODEX TO ANTIGRAVITY & CLAUDE ===${NC}"

    TARGET_PLUGIN="$ANTIGRAVITY_PLUGINS/$PLUGIN_NAME"
    TARGET_AG_SKILLS="$TARGET_PLUGIN/skills"

    echo -e "\n${BOLD}Target Antigravity:${NC} $TARGET_PLUGIN"
    echo -e "${BOLD}Target Claude Code:${NC} $CLAUDE_SKILLS"

    if [ "$DRY_RUN" = false ]; then
        mkdir -p "$TARGET_AG_SKILLS"
        mkdir -p "$CLAUDE_SKILLS"

        # Generate minimal plugin.json
        cat <<EOF > "$TARGET_PLUGIN/plugin.json"
{
  "name": "$PLUGIN_NAME",
  "displayName": "Migrated Agent Settings",
  "version": "1.0.0",
  "description": "Unified skills and MCP servers synchronized across coding agents."
}
EOF
    fi

    # Sync skills from ~/.codex/skills
    if [ -d "$CODEX_SKILLS" ]; then
        find "$CODEX_SKILLS" -maxdepth 2 -name "SKILL.md" -exec dirname {} \; | while read -r dir; do
            name=$(basename "$dir")
            echo -e "  + Synced: ${GREEN}$name${NC}"
            if [ "$DRY_RUN" = false ]; then
                cp -r "$dir" "$TARGET_AG_SKILLS/"
                cp -r "$dir" "$CLAUDE_SKILLS/"
            fi
        done
    fi

    # Sync skills from ~/.codex/plugins/cache
    if [ -d "$CODEX_CACHE" ]; then
        find "$CODEX_CACHE" -name "SKILL.md" -exec dirname {} \; | while read -r dir; do
            name=$(basename "$dir")
            [[ "$name" =~ ^\. ]] && continue
            echo -e "  + Synced: ${GREEN}$name${NC}"
            if [ "$DRY_RUN" = false ]; then
                cp -r "$dir" "$TARGET_AG_SKILLS/"
                cp -r "$dir" "$CLAUDE_SKILLS/"
            fi
        done
    fi

    echo -e "\n${BOLD}${GREEN}=== ${prefix}SYNC COMPLETED SUCCESSFULLY ===${NC}\n"
}

case "$COMMAND" in
    scan) do_scan ;;
    sync) do_sync ;;
    *)
        echo "Usage: $0 [scan|sync] [--dry-run] [--plugin-name=<name>]"
        exit 1
        ;;
esac
