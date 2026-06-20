#!/usr/bin/env bash
# Preview Mint Gate — codebase scan.
#
# Runs in CI on every PR. Refuses to exit 0 if any forbidden placeholder
# identity, real-looking PII, or real-client email is committed to source.
#
# Lightweight by design: ripgrep + bash, no Node, no Python. Should complete
# in under 2 seconds on a typical PR.
#
# Usage: bash scripts/preview-mint-check.sh
#   exits 0 — clean, safe to mint Client Preview account / merge PR
#   exits 1 — findings present, mint blocked / merge blocked
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# SCAN_DIRS may be overridden via PE_SCAN_ROOTS (space-separated absolute
# paths). Used by the test harness to point the gate at fixture trees.
if [ -n "${PE_SCAN_ROOTS:-}" ]; then
  # shellcheck disable=SC2206
  SCAN_DIRS=( ${PE_SCAN_ROOTS} )
else
  SCAN_DIRS=("$ROOT/src" "$ROOT/supabase")
fi


# Files that legitimately reference the blocklist (this script, the gate
# function, the gate UI, this doc) must be excluded — they document the rules,
# they don't violate them.
EXCLUDES=(
  -g '!node_modules' -g '!dist' -g '!build' -g '!.lovable'
  -g '!scripts/preview-mint-check.sh'
  -g '!scripts/preview-mint-check.test.sh'
  -g '!supabase/functions/preview-mint-check/index.ts'
  -g '!supabase/functions/preview-mint-check/scan.ts'
  -g '!supabase/functions/preview-mint-check/index.test.ts'
  -g '!src/components/hq/PreviewMintGate.tsx'
  -g '!docs/PREVIEW_MODE.md'
  -g '!.github/workflows/preview-mint-check.yml'
  # Cleanup migrations may reference blocklisted names inside DELETE clauses —
  # they are removing the data, not introducing it.
  -g '!supabase/migrations/*_remove_test_inquiries.sql'
)



hits=0
report=""

scan() {
  local label="$1"; local pattern="$2"; shift 2
  local extra=( "$@" )
  local out
  out=$(rg -n --no-heading "${EXCLUDES[@]}" "${extra[@]}" -- "$pattern" "${SCAN_DIRS[@]}" 2>/dev/null || true)
  if [ -n "$out" ]; then
    hits=$((hits + 1))
    report+=$'\n── '"$label"$'\n'"$out"$'\n'
  fi
}

# ─── A · Placeholder / generic identities ─────────────────────
# Word-boundary so "Operations" doesn't trip "Operator".
for pat in \
  '\bJosh Smith\b' \
  '\bTest User\b' \
  '\bTest Client\b' \
  '\bDemo User\b' \
  '\bPlaceholder User\b' \
  '\bJohn Doe\b' \
  '\bJane Doe\b' \
  '\bLorem Ipsum\b' \
  '"Operator"' \
  "'Operator'"
do
  scan "Placeholder identity: $pat" "$pat"
done

# ─── B · Real-looking emails in migrations / seed SQL ─────────
# Any email literal in supabase/migrations/ must use an allowed demo domain
# (example.com / example.org) or the Peninsula Equine operational domain.
# Anything else is treated as a real client address.
real_email=$(rg -n --no-heading \
  -g '**/migrations/**' \
  -e "'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'" \
  "${SCAN_DIRS[@]}" 2>/dev/null \
  | grep -Ev '@(example\.com|example\.org|peninsulaequine\.(com\.au|org|systems)|notify\.peninsulaequine\.org)' \
  || true)
if [ -n "$real_email" ]; then
  hits=$((hits + 1))
  report+=$'\n── Real-looking email in migration/seed\n'"$real_email"$'\n'
fi

# ─── C · Australian mobile numbers in seed SQL ────────────────
# Matches 04xx xxx xxx and +614xxxxxxxx anywhere in supabase/migrations/.
# Curated demo phones must use the obviously-fake 0400 000 000 pattern.
phone_hit=$(rg -n --no-heading \
  -g '**/migrations/**' \
  -e '\b04[0-9]{2}[ -]?[0-9]{3}[ -]?[0-9]{3}\b' \
  -e '\+614[0-9]{8}\b' \
  "${SCAN_DIRS[@]}" 2>/dev/null \
  | grep -Ev '0400[ -]?000[ -]?000|\+614000000000' \
  || true)
if [ -n "$phone_hit" ]; then
  hits=$((hits + 1))
  report+=$'\n── Real-looking phone in migration/seed (use 0400 000 000)\n'"$phone_hit"$'\n'
fi

# ─── D · Street address patterns in seed SQL ──────────────────
# A digit followed by a street-type word is almost always a real address.
addr_hit=$(rg -n --no-heading \
  -g '**/migrations/**' \
  -e '\b[0-9]{1,4}[A-Za-z]?\s+[A-Z][a-z]+\s+(Street|Road|Avenue|Lane|Drive|Court|Crescent|Highway|Boulevard|Parade|Place|Terrace)\b' \
  "${SCAN_DIRS[@]}" 2>/dev/null || true)
if [ -n "$addr_hit" ]; then
  hits=$((hits + 1))
  report+=$'\n── Street address in migration/seed\n'"$addr_hit"$'\n'
fi

# ─── Report ───────────────────────────────────────────────────
if [ "$hits" -gt 0 ]; then
  echo "✕ Preview Mint Gate — BLOCKED ($hits category $( [ "$hits" -eq 1 ] && echo finding || echo findings ))"
  echo "$report"
  echo
  echo "See docs/PREVIEW_MODE.md for the full standard."
  exit 1
fi

echo "✓ Preview Mint Gate — codebase clean. Safe to mint / merge."
exit 0
