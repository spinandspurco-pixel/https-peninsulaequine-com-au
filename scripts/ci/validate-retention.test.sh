#!/usr/bin/env bash
# Unit tests for scripts/ci/validate-retention.sh.
#
# Covers retention_days and max_retained repo-variable fallbacks for:
#   - valid integers (boundaries and interior)
#   - empty strings
#   - whitespace-only strings (spaces, tabs, newlines)
#   - non-numeric values (letters, symbols, decimals, mixed)
#   - out-of-range integers (below min, above max)
#   - leading/trailing whitespace around an otherwise valid integer
#
# Run:  bash scripts/ci/validate-retention.test.sh

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VALIDATE="$SCRIPT_DIR/validate-retention.sh"

PASS=0
FAIL=0
FAILED_NAMES=()

# run <name> <expect_exit:0|1> <expect_stdout_substring|""> <expect_stderr_substring|""> -- <args...>
run_case() {
  local name="$1" expect_exit="$2" expect_stdout="$3" expect_stderr="$4"
  shift 4
  [ "${1:-}" = "--" ] && shift

  local out err rc
  out=$(bash "$VALIDATE" "$@" 2>/tmp/validate-retention.err)
  rc=$?
  err=$(cat /tmp/validate-retention.err)

  local ok=1
  if [ "$rc" -ne "$expect_exit" ]; then
    ok=0
    echo "  exit: got=$rc want=$expect_exit"
  fi
  if [ -n "$expect_stdout" ] && ! grep -qF -- "$expect_stdout" <<<"$out"; then
    ok=0
    echo "  stdout missing: $expect_stdout"
    echo "  --- stdout ---"; echo "$out"
  fi
  if [ -n "$expect_stderr" ] && ! grep -qF -- "$expect_stderr" <<<"$err"; then
    ok=0
    echo "  stderr missing: $expect_stderr"
    echo "  --- stderr ---"; echo "$err"
  fi

  if [ "$ok" -eq 1 ]; then
    PASS=$((PASS+1))
    echo "ok  - $name"
  else
    FAIL=$((FAIL+1))
    FAILED_NAMES+=("$name")
    echo "FAIL- $name"
  fi
}

DSRC="ASSET_SCAN_RETENTION_DAYS repository variable"
MSRC="ASSET_SCAN_MAX_RETAINED repository variable"

# ---------- valid values ----------
run_case "valid: both interior values" 0 "DAYS=30" "" -- "30" "10" "$DSRC" "$MSRC"
run_case "valid: days min boundary (1)" 0 "DAYS=1" "" -- "1" "10" "$DSRC" "$MSRC"
run_case "valid: days max boundary (365)" 0 "DAYS=365" "" -- "365" "10" "$DSRC" "$MSRC"
run_case "valid: max min boundary (1)" 0 "MAX=1" "" -- "30" "1" "$DSRC" "$MSRC"
run_case "valid: max max boundary (100)" 0 "MAX=100" "" -- "30" "100" "$DSRC" "$MSRC"

# ---------- empty -> fallback ----------
run_case "empty days -> default 30 + fallback source" 0 "DAYS=30" "" -- "" "10" "$DSRC" "$MSRC"
run_case "empty max -> default 10 + fallback source" 0 "MAX=10" "" -- "30" "" "$DSRC" "$MSRC"
run_case "both empty -> both defaults" 0 "DAYS=30" "" -- "" "" "$DSRC" "$MSRC"
run_case "both empty -> max default" 0 "MAX=10" "" -- "" "" "$DSRC" "$MSRC"
run_case "empty days -> source becomes fallback" 0 "DAYS_SOURCE=fallback (default)" "" -- "" "10" "$DSRC" "$MSRC"

# ---------- whitespace-only -> fallback ----------
run_case "whitespace days (spaces) -> default" 0 "DAYS=30" "" -- "   " "10" "$DSRC" "$MSRC"
run_case "whitespace days (tabs)   -> default" 0 "DAYS=30" "" -- $'\t\t' "10" "$DSRC" "$MSRC"
run_case "whitespace days (newln)  -> default" 0 "DAYS=30" "" -- $'\n' "10" "$DSRC" "$MSRC"
run_case "whitespace max -> default" 0 "MAX=10" "" -- "30" "  " "$DSRC" "$MSRC"

# ---------- trimmed valid ----------
run_case "days with surrounding spaces is trimmed" 0 "DAYS=45" "" -- "  45  " "10" "$DSRC" "$MSRC"
run_case "max with surrounding tabs is trimmed" 0 "MAX=20" "" -- "30" $'\t20\t' "$DSRC" "$MSRC"

# ---------- non-numeric ----------
run_case "non-numeric days (letters)" 1 "" "::error::Invalid retention_days from $DSRC: 'abc'" -- "abc" "10" "$DSRC" "$MSRC"
run_case "non-numeric days (decimal)" 1 "" "::error::Invalid retention_days from $DSRC: '30.5'" -- "30.5" "10" "$DSRC" "$MSRC"
run_case "non-numeric days (negative)" 1 "" "::error::Invalid retention_days from $DSRC: '-5'" -- "-5" "10" "$DSRC" "$MSRC"
run_case "non-numeric days (mixed)" 1 "" "::error::Invalid retention_days from $DSRC: '30d'" -- "30d" "10" "$DSRC" "$MSRC"
run_case "non-numeric days (symbol)" 1 "" "::error::Invalid retention_days from $DSRC: '30;rm'" -- "30;rm" "10" "$DSRC" "$MSRC"
run_case "non-numeric days (internal space)" 1 "" "is not a valid integer" -- "3 0" "10" "$DSRC" "$MSRC"

run_case "non-numeric max (letters)"  1 "" "::error::Invalid max_retained from $MSRC: 'ten'" -- "30" "ten" "$DSRC" "$MSRC"
run_case "non-numeric max (decimal)"  1 "" "::error::Invalid max_retained from $MSRC: '10.0'" -- "30" "10.0" "$DSRC" "$MSRC"
run_case "non-numeric max (negative)" 1 "" "::error::Invalid max_retained from $MSRC: '-1'" -- "30" "-1" "$DSRC" "$MSRC"

# ---------- out of range ----------
run_case "days = 0 (below min)"   1 "" "Must be between 1 and 365" -- "0" "10" "$DSRC" "$MSRC"
run_case "days = 366 (above max)" 1 "" "Must be between 1 and 365" -- "366" "10" "$DSRC" "$MSRC"
run_case "days = 9999"            1 "" "Must be between 1 and 365" -- "9999" "10" "$DSRC" "$MSRC"
run_case "max = 0 (below min)"    1 "" "Must be between 1 and 100" -- "30" "0" "$DSRC" "$MSRC"
run_case "max = 101 (above max)"  1 "" "Must be between 1 and 100" -- "30" "101" "$DSRC" "$MSRC"
run_case "max = 500"              1 "" "Must be between 1 and 100" -- "30" "500" "$DSRC" "$MSRC"

# ---------- summary ----------
TOTAL=$((PASS+FAIL))
echo ""
echo "----------------------------------------"
echo "Tests: $TOTAL  Passed: $PASS  Failed: $FAIL"
if [ "$FAIL" -gt 0 ]; then
  printf '  - %s\n' "${FAILED_NAMES[@]}"
  exit 1
fi
exit 0
