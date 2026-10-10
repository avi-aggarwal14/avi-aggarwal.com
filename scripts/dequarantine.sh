#!/bin/sh
# Files written through the Claude Code harness on this Mac get a com.apple.quarantine
# attribute, and Gatekeeper then refuses to load quarantined native addons / browsers.
# Run after every install: strips the flag from native binaries only.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
find "$ROOT/node_modules" \( -name "*.node" -o -name "*.dylib" -o -name "*.wasm" \) -print0 2>/dev/null | xargs -0 xattr -d com.apple.quarantine 2>/dev/null || true
for d in "$HOME/Library/Caches/ms-playwright"/*; do
  [ -d "$d" ] && xattr -rd com.apple.quarantine "$d" 2>/dev/null || true
done
echo "dequarantine: done"
