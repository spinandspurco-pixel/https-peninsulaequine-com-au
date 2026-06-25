# Live Smoke Test — Knowledge Graph Phase (C.1b)

Automated end-to-end gate that proves the project → media graph pipeline is
functioning on Live, not just that migrations ran. Runs after publish + seed.

## What it does

1. **Seed verification** — status counts, suggested=0, Main Ridge system_linked=5, no orphans, no duplicates.
2. **UI sweep** (Playwright, headless) on Live:
   - HQ → Project → Main Ridge → Coverage = Media 5 / Documents missing / Field Notes missing
   - Media Vault → 5 demo assets present, zero Suggested chips
   - `/hq/review` → empty queue, Command Centre banner hidden
3. **Pipeline smoke test:**
   - Insert throwaway `main-ridge-test.jpg` (no project_id, tag `main-ridge`)
   - Confirm one `suggested` edge exists for Main Ridge
   - Open `/hq/review`, click **Verify**, confirm edge.status → `verified` and queue empties
   - Delete the throwaway asset
   - Confirm `suggested` count returns to **0** (the final bell)

Exits non-zero on any failure. Screenshots and a JSON report land in `./out/`.

## Prerequisites

Run from a workstation, not the Lovable sandbox (no Live DB access in sandbox).

```bash
pip install playwright psycopg2-binary
playwright install chromium
```

## Configuration

Export the following env vars (or put them in `.env` next to the script):

| Var | Purpose |
|---|---|
| `LIVE_URL` | Live site origin, e.g. `https://peninsulaequine.systems` |
| `LIVE_DATABASE_URL` | Live Postgres URL (Cloud View → Connection string) |
| `LIVE_ADMIN_EMAIL` | Admin login used by the UI sweep |
| `LIVE_ADMIN_PASSWORD` | Password for the admin |
| `LIVE_SUPABASE_URL` | Live Supabase project URL |
| `LIVE_SUPABASE_ANON_KEY` | Live anon key (for the auth login call) |

The script never echoes secrets.

## Run

```bash
python scripts/live-smoke-test/smoke.py
```

Exit codes:
- `0` — all checks passed; C.1b is production-ready.
- `1` — SQL verification failed.
- `2` — UI sweep failed.
- `3` — Pipeline smoke test failed.
- `4` — Cleanup left residue (suggested ≠ 0 or orphans).

Always inspect `out/report.json` and `out/*.png` for the final state.
