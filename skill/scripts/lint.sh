#!/usr/bin/env bash
# Compatibility entrypoint. Prefer the package CLI for dependency resolution.
set -eu
PACKAGE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
if [ -f "$PACKAGE_ROOT/bin/decks-skill.js" ]; then
  exec node "$PACKAGE_ROOT/bin/decks-skill.js" lint "$@"
fi
if command -v decks-skill >/dev/null 2>&1; then
  exec decks-skill lint "$@"
fi
printf '%s\n' 'Use npx @elven-observability/decks-skill@latest lint <arquivo>' >&2
exit 2
