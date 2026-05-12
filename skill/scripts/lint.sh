#!/usr/bin/env bash
# @elven-observability/decks-skill — lint
#
# Binary 10/10 check for Elven deck HTML files. Exit 0 only when every file
# passes every rule. Each failure prints the rule ID + reason.
#
# Usage:
#   decks-skill lint <file.html> [<file.html>...]
#   ./skill/scripts/lint.sh <file.html> [<file.html>...]

set -u

PASS_COUNT=0
FAIL_COUNT=0

red()    { printf "\033[31m%s\033[0m" "$1"; }
green()  { printf "\033[32m%s\033[0m" "$1"; }
yellow() { printf "\033[33m%s\033[0m" "$1"; }

if [ $# -eq 0 ]; then
  cat >&2 <<'USAGE'
Usage: decks-skill lint <file.html> [<file.html>...]

Lints Elven deck HTML files against 10 binary rules.
Exit 0: all files pass 10/10. Exit 1: at least one failure.
USAGE
  exit 2
fi

lint_one() {
  local file="$1"
  local failures=0
  local -a errors=()

  if [ ! -f "$file" ]; then
    echo "$(red "FAIL") $file: file not found"
    return 1
  fi

  # L1: DOCTYPE + lang="pt-BR"
  if ! grep -qiE '<!DOCTYPE html>' "$file"; then
    errors+=("L1: missing <!DOCTYPE html>")
    ((failures++)) || true
  elif ! grep -qiE '<html[^>]*lang="pt-BR"' "$file"; then
    errors+=("L1: missing lang=\"pt-BR\" on <html>")
    ((failures++)) || true
  fi

  # L2: <title> present and non-empty
  if ! grep -qiE '<title>[^<]+</title>' "$file"; then
    errors+=("L2: missing or empty <title>")
    ((failures++)) || true
  fi

  # L3: theme imported (link href elven-deck.css OR :root with --teal:#00bfa5)
  if ! grep -qE 'elven-deck\.css' "$file" \
     && ! grep -qE -- '--teal:[[:space:]]*#00bfa5' "$file"; then
    errors+=("L3: missing elven-deck.css link or inline brand tokens (--teal:#00bfa5)")
    ((failures++)) || true
  fi

  # L4: at least one .slide element present
  if ! grep -qE 'class="slide([ "]|[[:space:]]+[a-z\-]+)' "$file"; then
    errors+=("L4: no .slide elements found")
    ((failures++)) || true
  fi

  # L5: canvas size declared (--w: 1280px AND --h: 720px in CSS OR width:1280px height:720px)
  local has_w has_h
  has_w=$(grep -cE -- '--w:[[:space:]]*1280px|width:[[:space:]]*1280px' "$file" || true)
  has_h=$(grep -cE -- '--h:[[:space:]]*720px|height:[[:space:]]*720px' "$file" || true)
  # If the file links the theme css, those declarations live there; accept the link as proof.
  if [ "$has_w" -eq 0 ] || [ "$has_h" -eq 0 ]; then
    if ! grep -qE 'elven-deck\.css' "$file"; then
      errors+=("L5: canvas 1280×720 not declared (need --w/--h or width/height, or elven-deck.css link)")
      ((failures++)) || true
    fi
  fi

  # L6: every .slide has a canonical .layout-* class
  local layouts="cover|section-opener|executive-summary|thesis-evidence|kpi-row|chart-and-cards|chart-full|code-and-callout|bullets-3|timeline|architecture|closing"
  local slide_count layout_count
  slide_count=$(grep -cE 'class="slide([ "]|[[:space:]]+[a-z\-]+)' "$file" || true)
  layout_count=$(grep -cE "class=\"slide[^\"]*layout-($layouts)" "$file" || true)
  if [ "$slide_count" -gt 0 ] && [ "$layout_count" -lt "$slide_count" ]; then
    errors+=("L6: $((slide_count - layout_count)) of $slide_count slide(s) missing a canonical .layout-* class")
    ((failures++)) || true
  fi

  # L7: first slide is .layout-cover
  local first_slide
  first_slide=$(grep -nE 'class="slide([ "]|[[:space:]]+[a-z\-]+)' "$file" | head -n 1)
  if [ -n "$first_slide" ] && ! echo "$first_slide" | grep -qE 'layout-cover'; then
    errors+=("L7: first slide is not .layout-cover")
    ((failures++)) || true
  fi

  # L8: last slide is .layout-closing
  local last_slide
  last_slide=$(grep -nE 'class="slide([ "]|[[:space:]]+[a-z\-]+)' "$file" | tail -n 1)
  if [ -n "$last_slide" ] && ! echo "$last_slide" | grep -qE 'layout-closing'; then
    errors+=("L8: last slide is not .layout-closing")
    ((failures++)) || true
  fi

  # L9: CSS counter-increment for slide (in file OR via elven-deck.css link)
  if ! grep -qE 'counter-increment:[[:space:]]*slide' "$file" \
     && ! grep -qE 'elven-deck\.css' "$file"; then
    errors+=("L9: CSS counter-increment for slide numbering not present")
    ((failures++)) || true
  fi

  # L10: no emoji in visible body text (skip <pre>/<code> blocks)
  if command -v python3 >/dev/null 2>&1; then
    if ! python3 - "$file" <<'PYEOF'
import re, sys
content = open(sys.argv[1], encoding='utf-8').read()
# strip <style>, <pre>, <code>, <!-- comments -->
content = re.sub(r'<style[\s\S]*?</style>', '', content)
content = re.sub(r'<pre[\s\S]*?</pre>', '', content)
content = re.sub(r'<code[\s\S]*?</code>', '', content)
content = re.sub(r'<!--[\s\S]*?-->', '', content)
emoji = re.compile(
    r'[\U0001F300-\U0001FAFF'      # Symbols & Pictographs
    r'\U0001F600-\U0001F64F'       # Emoticons
    r'\U0001F680-\U0001F6FF'       # Transport & Map
    r'\U00002600-\U000026FF'       # Misc symbols
    r'\U00002700-\U000027BF'       # Dingbats
    r'\U0001F900-\U0001F9FF'       # Supplemental
    r']'
)
sys.exit(1 if emoji.search(content) else 0)
PYEOF
    then
      errors+=("L10: emoji detected in visible body text (use .pill-chip instead)")
      ((failures++)) || true
    fi
  fi

  local passed=$((10 - failures))
  if [ "$failures" -eq 0 ]; then
    echo "$(green "PASS") $file ($passed/10)"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    echo "$(red "FAIL") $file ($passed/10):"
    for e in "${errors[@]}"; do
      echo "  - $e"
    done
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
}

for f in "$@"; do
  lint_one "$f"
done

echo ""
if [ "$FAIL_COUNT" -eq 0 ]; then
  echo "Summary: $(green "$PASS_COUNT pass") / $(yellow "0 fail")"
  exit 0
else
  echo "Summary: $(green "$PASS_COUNT pass") / $(red "$FAIL_COUNT fail")"
  exit 1
fi
