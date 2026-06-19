#!/usr/bin/env bash
# Validate and sanitize retention_days and max_retained inputs.
#
# Usage:
#   validate-retention.sh <days_raw> <max_raw> [days_source] [max_source]
#
# On success, prints two lines to stdout:
#   DAYS=<int>
#   MAX=<int>
#   DAYS_SOURCE=<string>
#   MAX_SOURCE=<string>
#
# Rules:
#   - Trim leading/trailing whitespace.
#   - Empty/whitespace-only -> fallback default (DAYS=30, MAX=10) and source
#     becomes "fallback (default)".
#   - Must match ^[0-9]+$ after trimming, otherwise fail with ::error::.
#   - DAYS range: 1..365 inclusive. MAX range: 1..100 inclusive.
#
# This script is sourced by the GitHub Actions workflow and exercised by
# scripts/ci/validate-retention.test.sh.

set -euo pipefail

DAYS_RAW="${1-}"
MAX_RAW="${2-}"
DAYS_SOURCE="${3-input}"
MAX_SOURCE="${4-input}"

trim() {
  echo "$1" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
}

DAYS=$(trim "$DAYS_RAW")
MAX=$(trim "$MAX_RAW")

if [ -z "$DAYS" ]; then
  DAYS=30
  DAYS_SOURCE="fallback (default)"
elif ! [[ "$DAYS" =~ ^[0-9]+$ ]]; then
  echo "::error::Invalid retention_days from ${DAYS_SOURCE}: '$DAYS_RAW' is not a valid integer. Must be an integer between 1 and 365 (inclusive)." >&2
  exit 1
elif [ "$DAYS" -lt 1 ] || [ "$DAYS" -gt 365 ]; then
  echo "::error::Invalid retention_days from ${DAYS_SOURCE}: $DAYS. Must be between 1 and 365 (inclusive)." >&2
  exit 1
fi

if [ -z "$MAX" ]; then
  MAX=10
  MAX_SOURCE="fallback (default)"
elif ! [[ "$MAX" =~ ^[0-9]+$ ]]; then
  echo "::error::Invalid max_retained from ${MAX_SOURCE}: '$MAX_RAW' is not a valid integer. Must be an integer between 1 and 100 (inclusive)." >&2
  exit 1
elif [ "$MAX" -lt 1 ] || [ "$MAX" -gt 100 ]; then
  echo "::error::Invalid max_retained from ${MAX_SOURCE}: $MAX. Must be between 1 and 100 (inclusive)." >&2
  exit 1
fi

echo "DAYS=$DAYS"
echo "MAX=$MAX"
echo "DAYS_SOURCE=$DAYS_SOURCE"
echo "MAX_SOURCE=$MAX_SOURCE"
