#!/usr/bin/env python3
"""Fail closed while #278 changes paths. No credentials or network are needed."""
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
POLICY = ROOT / '.github' / 'prototype-migration.json'

def main():
    try:
        policy = json.loads(POLICY.read_text(encoding='utf-8'))
    except (OSError, ValueError):
        print('Claude sync blocked: migration policy missing or invalid.', file=sys.stderr)
        return 1
    # Re-enabling publication requires a reviewed replacement of this gate and
    # verification of target, paths, capabilities and rollback, not an env var.
    print('Claude sync blocked during issue #278: no publication or branch mirroring. '
          f"Policy: {policy.get('issue', 'unknown')}", file=sys.stderr)
    return 1

if __name__ == '__main__':
    sys.exit(main())
