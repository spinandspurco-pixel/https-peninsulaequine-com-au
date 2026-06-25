#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Live smoke-test runner — one-command wrapper.
#
# Refuses to run unless LIVE_CONFIRM is set to the exact production
# acknowledgement token. Creates a timestamped wrapper artifact folder and
# tees stdout/stderr into run.log so the entire invocation is captured even
# if smoke.py crashes before writing its own report.
#
# Usage:
#   cd scripts/live-smoke-test
#   export LIVE_CONFIRM="I_UNDERSTAND_THIS_TOUCHES_PRODUCTION"
#   # plus the rest of the env vars from .env.example
#   ./run-live.sh
# ---------------------------------------------------------------------------
set -u
set -o pipefail

EXPECTED_CONFIRM="I_UNDERSTAND_THIS_TOUCHES_PRODUCTION"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── Safety gate ────────────────────────────────────────────────────────────
if [[ "${LIVE_CONFIRM:-}" != "$EXPECTED_CONFIRM" ]]; then
  echo "✗ Refusing to run." >&2
  echo "  LIVE_CONFIRM must be set to exactly:" >&2
  echo "    $EXPECTED_CONFIRM" >&2
  echo "  (current value: ${LIVE_CONFIRM:-<unset>})" >&2
  exit 1
fi

# ── Timestamped wrapper artifact folder ────────────────────────────────────
RUN_TS="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
WRAPPER_DIR="$SCRIPT_DIR/out/wrapper-$RUN_TS"
mkdir -p "$WRAPPER_DIR"
RUN_LOG="$WRAPPER_DIR/run.log"

echo "▶ Live smoke test"
echo "  wrapper folder : $WRAPPER_DIR"
echo "  log            : $RUN_LOG"
echo "  command        : python3 smoke.py --env live"
echo ""

# ── Run smoke.py, tee output, preserve exit code ───────────────────────────
# The PIPESTATUS trick lets us recover python3's exit code even after `tee`.
set +e
python3 smoke.py --env live 2>&1 | tee "$RUN_LOG"
SMOKE_EXIT="${PIPESTATUS[0]}"
set -e

echo ""
echo "── smoke.py exited with code $SMOKE_EXIT ──"
echo "Wrapper artifacts : $WRAPPER_DIR"

# smoke.py creates its own out/<ISO>/ run directory; surface it if visible
# in the log so the operator has both paths in one place.
SMOKE_RUN_DIR="$(grep -oE 'out/[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}-[0-9]{2}-[0-9]{2}Z' "$RUN_LOG" | head -n1 || true)"
if [[ -n "$SMOKE_RUN_DIR" ]]; then
  echo "Smoke artifacts   : $SCRIPT_DIR/$SMOKE_RUN_DIR"
fi

exit "$SMOKE_EXIT"
