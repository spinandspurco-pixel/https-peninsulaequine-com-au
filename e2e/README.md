# /hq + role dashboard e2e suite

Playwright tests covering the production-grade auth flow audit:

- `unauth.spec.ts` — anonymous deep-link, refresh, and redirect-param behaviour.
- `role-dashboards.spec.ts` — per-role landing, deep-link, and refresh (admin / preview / employee / trainer).
- `mobile-resume.spec.ts` — iPhone viewport, background→foreground resume, nested-route refresh.
- `auth.setup.ts` — signs each role in through `/login` and saves `e2e/.auth/<role>.json`.

## Running

```bash
# All roles + anon coverage
TEST_ADMIN_EMAIL=… TEST_ADMIN_PASSWORD=… \
TEST_PREVIEW_EMAIL=… TEST_PREVIEW_PASSWORD=… \
TEST_EMPLOYEE_EMAIL=… TEST_EMPLOYEE_PASSWORD=… \
TEST_TRAINER_EMAIL=… TEST_TRAINER_PASSWORD=… \
bun run test:e2e

# Anon-only (no creds required)
bun run test:e2e --project=anon-desktop --project=anon-mobile
```

Roles without env vars are auto-skipped — the suite stays green and tells you what was skipped.

## First-time install

```bash
bunx playwright install chromium
```

## Env vars

| Variable                  | Purpose                                  |
| ------------------------- | ---------------------------------------- |
| `TEST_<ROLE>_EMAIL`       | Sign-in email for that role's test user. |
| `TEST_<ROLE>_PASSWORD`    | Sign-in password.                        |
| `E2E_BASE_URL`            | Override base URL (defaults to `http://localhost:8080`). |
| `E2E_PORT`                | Override port when no base URL is set.   |

Roles: `ADMIN`, `PREVIEW`, `EMPLOYEE`, `TRAINER`.
