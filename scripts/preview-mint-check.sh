#!/usr/bin/env bash
# Preview Mint Gate — codebase scan.
# Refuses to exit 0 if any forbidden placeholder identity is present in source.
#
# Usage: bash scripts/preview-mint-check.sh
#   exits 0 — clean, safe to mint Client Preview account
#   exits 1 — findings present, mint blocked
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCAN_DIRS=("$ROOT/src" "$ROOT/supabase/functions")

# Word-boundary patterns. "Operator" is whole-word so "Operations" doesn't trip.
PATTERNS=(
  '\bJosh Smith\b'
  '\bTest User\b'
  '\bDemo User\b'
  '\bPlaceholder User\b'
  '\bJohn Doe\b'
  '\bJane Doe\b'
  '"Operator"'
  "'Operator'"
)

# Files that legitimately reference the blocklist (this script, the edge fn)
# must be excluded — they document the rules, they don't violate them.
EXCLUDE_GLOBS=(
  '!scripts/preview-mint-check.sh'
  '!supabase/functions/preview-mint-check/index.ts'
  '!src/components/hq/PreviewMintGate.tsx'
)

hits=0
report=""

for pat in "${PATTERNS[@]}"; do
  out=$(rg -n --no-heading \
        -g '!node_modules' -g '!dist' -g '!.lovable' \
        "${EXCLUDE_GLOBS[@]/#/-g}" \
        "$pat" "${SCAN_DIRS[@]}" 2>/dev/null || true)
  if [ -n "$out" ]; then
    hits=$((hits + 1))
    report+=$'\n── '"$pat"$'\n'"$out"$'\n'
  fi
done

if [ "$hits" -gt 0 ]; then
  echo "✕ Preview Mint Gate — BLOCKED ($hits pattern(s) found in code)"
  echo "$report"
  exit 1
fi

echo "✓ Preview Mint Gate — codebase clean. Safe to mint."
exit 0
