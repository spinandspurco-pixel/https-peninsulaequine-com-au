# Security baseline

The CI workflow `.github/workflows/security-gate.yml` runs
`scripts/security-gate.ts` on every PR, every push to `main`, and nightly
(`nightly-security-scan.yml`). The script merges findings from every
wired-in source — Supabase DB linter today, optional Wiz when its
credentials are configured, and any future connector — then compares
them, by stable fingerprint, to `baseline.json` in this folder.

**Any finding present in the current scan but missing from the baseline
fails the build.** Nightly runs additionally open (or comment on) a
tracking GitHub issue and attach an *Affected code areas* section: each
new finding is grepped against `src/`, `supabase/`, and `scripts/` so
the on-call reviewer lands on candidate files immediately.

## Refreshing the baseline

When a finding is intentionally accepted (documented in the security
memory) or genuinely resolved, regenerate the baseline locally and commit
it in the same PR that explains the change:

```bash
SUPABASE_ACCESS_TOKEN=... bun scripts/security-gate.ts --update-baseline
git add .security/baseline.json
```

Baseline changes are deliberately reviewable — a PR that silently widens
the baseline should be challenged in code review.

## Required secret

`SUPABASE_ACCESS_TOKEN` — a personal access token with read access to the
project's lint endpoint, stored as a GitHub Actions repository secret.
The workflow fails fast with a clear message if it is missing.

## Optional connector secrets

The gate cleanly skips a connector source when its credentials are not
configured, so partial wiring is non-blocking.

| Secret | Purpose |
| --- | --- |
| `WIZ_API_URL` | Wiz GraphQL endpoint, e.g. `https://api.us17.app.wiz.io/graphql` |
| `WIZ_CLIENT_ID` / `WIZ_CLIENT_SECRET` | Wiz service-account credentials |
| `WIZ_AUTH_URL` | Override Wiz OAuth URL (defaults to `https://auth.app.wiz.io/oauth/token`) |
| `WIZ_PROJECT_ID` | Restrict to a single Wiz project |

When any of these is added, the next nightly run pulls open Wiz issues,
fingerprints them, and includes them in the diff against the baseline.
