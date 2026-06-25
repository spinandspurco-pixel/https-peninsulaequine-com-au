# Live Smoke Test — Knowledge Graph Phase (C.1b)

Automated end-to-end regression that proves the project → media graph pipeline
is functioning on a target environment, not just that migrations ran.

## What it does

1. **SQL seed verification** — status counts, suggested=0, Main Ridge system_linked=5, no orphans, no duplicates.
2. **UI sweep** (Playwright, headless):
   - HQ → Project → Main Ridge → Coverage = Media 5 / Documents missing / Field Notes missing
   - Media Vault → 0 Suggested chips
   - `/hq/review` → empty queue
3. **Pipeline smoke test:**
   - Insert throwaway `main-ridge-test.jpg` (no project_id, tag `main-ridge`)
   - Confirm one `suggested` edge for Main Ridge
   - `/hq/review` → click **Verify** → edge.status → `verified`
   - **Cleanup is guaranteed** by a `finally` block — the throwaway is deleted even when an assertion fails halfway through
   - Confirm `suggested` returns to **0** (the final bell) and no orphans

## Artifact retention

Every run writes to `out/<ISO-timestamp>/`, never overwriting a previous run:

```
out/2026-06-25T12-14-33Z/
  report.json              # full structured report
  ui_project.png
  ui_media.png
  ui_review_empty.png
  ui_review_with_item.png
  ui_review_after_verify.png
  FAIL_*.png               # only on failure
  FAIL_*.html
  FAIL_*.console.json
  FAIL_*.network.json
```

`report.json` includes: `run_id`, `started_at`/`ended_at`, `environment`,
`build_id` (commit hash or CI env var), `runtime` (python/platform/host),
per-phase results, and on failure a `diagnostics` block with URL, screenshot
filename, DOM snapshot, console logs, network 4xx/5xx, and the failing SQL.

## Exit codes (granular)

| Code | Meaning |
|---|---|
| 0 | Pass — C.1b production-ready |
| 1 | Config: missing env / safety flag |
| 2 | Verification mismatch (graph integrity or Coverage UI) |
| 3 | UI navigation / selector failure |
| 4 | Upload / trigger failure (throwaway didn't produce a suggested edge) |
| 5 | Verify-flow failure (button missing or status didn't transition) |
| 6 | Cleanup residue (suggested ≠ 0 or orphans) |

## Production safety flag

Running against Live requires an explicit acknowledgement:

```bash
export LIVE_CONFIRM=I_UNDERSTAND_THIS_TOUCHES_PRODUCTION
python scripts/live-smoke-test/smoke.py --env live
```

Without `LIVE_CONFIRM` the script exits `1` immediately. `--env test` has no
such gate — it's intended for nightly CI against the Test environment.

## Prerequisites

Run from a workstation or CI runner — not the Lovable sandbox.

```bash
python -m pip install --no-cache-dir psycopg2-binary playwright
python -m playwright install chromium
```

## Configuration

| Var | Purpose |
|---|---|
| `LIVE_URL` | Target site origin, e.g. `https://peninsulaequine.systems` |
| `LIVE_DATABASE_URL` | Target Postgres URL |
| `LIVE_ADMIN_EMAIL` | Admin login for the UI sweep |
| `LIVE_ADMIN_PASSWORD` | Password for the admin |
| `LIVE_SUPABASE_URL` | Supabase project URL |
| `LIVE_SUPABASE_ANON_KEY` | Supabase anon key |
| `LIVE_CONFIRM` | Must be `I_UNDERSTAND_THIS_TOUCHES_PRODUCTION` when `--env live` |
| `COMMIT_SHA` / `GITHUB_SHA` / `LOVABLE_COMMIT` | Optional build ID (falls back to `git rev-parse`) |

The script never prints secrets. A `.env` file next to `smoke.py` is loaded
automatically (and should be gitignored).

## Run

```bash
# Test (no safety flag required)
python scripts/live-smoke-test/smoke.py --env test

# Live (safety flag required)
export LIVE_CONFIRM=I_UNDERSTAND_THIS_TOUCHES_PRODUCTION
python scripts/live-smoke-test/smoke.py --env live

# Read-only verification only (skip pipeline writes)
python scripts/live-smoke-test/smoke.py --env live --skip-pipeline
```

### One-command Live runner

For routine Live runs use the wrapper instead of invoking `python3` directly:

```bash
cd scripts/live-smoke-test
export LIVE_CONFIRM=I_UNDERSTAND_THIS_TOUCHES_PRODUCTION
# plus the rest of the vars from .env.example
./run-live.sh
```

The wrapper:

- Refuses to run unless `LIVE_CONFIRM` is **exactly** `I_UNDERSTAND_THIS_TOUCHES_PRODUCTION` (exits `1`).
- Creates a timestamped wrapper folder `out/wrapper-<ISO>/` **before** invoking `smoke.py`.
- Tees combined stdout/stderr into `out/wrapper-<ISO>/run.log` so the full session is captured even if `smoke.py` crashes early.
- Preserves and re-exits with `smoke.py`'s exit code (see the granular codes above).
- Prints both the wrapper folder and the `smoke.py` artifact folder at the end.

The wrapper is intentionally thin — it does not modify test logic; `smoke.py` remains the single source of truth for verification.

## Nightly regression (recommended)

Wire `--env test` into CI (GitHub Actions or equivalent) on a nightly schedule
or post-deploy hook. Keep `--env live` as a deliberate, manual run after each
Live publish that touches the graph surface.
