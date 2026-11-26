#!/usr/bin/env bash
# ==============================================================================
# One-Line Installer for Ubuntu / Linux / macOS (Bash)
# Installs agent-sync to ~/.local/bin and adds it to User PATH.
# Usage:
#   curl -fsSL https://<url>/install.sh | bash
# ==============================================================================

set -euo pipefail

INSTALL_DIR="$HOME/.local/bin"
mkdir -p "$INSTALL_DIR"

TARGET_BIN="$INSTALL_DIR/agent-sync"

echo -e "\033[0;36mInstalling agent-sync to $INSTALL_DIR...\033[0m"

# If local file exists, copy; otherwise download
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd || echo "")"
if [ -n "$DIR" ] && [ -f "$DIR/agent-sync.sh" ]; then
    cp "$DIR/agent-sync.sh" "$TARGET_BIN"
else
    # Gist / Raw URL download placeholder
    SOURCE_URL="https://gist.githubusercontent.com/raw/agent-sync.sh"
    curl -fsSL "$SOURCE_URL" -o "$TARGET_BIN"
fi

chmod +x "$TARGET_BIN"

# ------------------------------------------------------------------------------
# Add to PATH permanently in ~/.bashrc / ~/.profile
# ------------------------------------------------------------------------------
added_to_path=false
case ":$PATH:" in
    *":$INSTALL_DIR:"*)
        echo -e "\033[1;33m$INSTALL_DIR is already in your PATH.\033[0m"
        ;;
    *)
        PROFILE_FILES=("$HOME/.bashrc" "$HOME/.profile")
        for pfile in "${PROFILE_FILES[@]}"; do
            if [ -f "$pfile" ]; then
                if ! grep -q 'export PATH="$HOME/.local/bin:$PATH"' "$pfile"; then
                    echo '' >> "$pfile"
                    echo '# Added by agent-sync installer' >> "$pfile"
                    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$pfile"
                    added_to_path=true
                fi
            fi
        done
        if [ "$added_to_path" = true ]; then
            echo -e "\033[0;32mAdded $INSTALL_DIR to PATH in ~/.bashrc and ~/.profile.\033[0m"
        fi
        export PATH="$INSTALL_DIR:$PATH"
        ;;
esac

echo -e "\033[0;32m\nInstallation complete! You can now run 'agent-sync scan' or 'agent-sync sync' anywhere.\033[0m"
