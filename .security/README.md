# Security baseline

The CI workflow `.github/workflows/security-gate.yml` runs
`scripts/security-gate.ts` on every PR, every push to `main`, and nightly
(`nightly-security-scan.yml`). The script merges findings from every
wired-in source — Supabase DB linter today, optional Wiz when its
credentials are configured, and any future connector — then compares
them, by stable fingerprint, to `baseline.json` in this folder.

The required database target is `mxjuknqwzbvvmmdrvkql` (Peninsula Equine HQ).
Both security workflows set `SUPABASE_PROJECT_REF` at job scope. The scanner
rejects a baseline whose `project_ref` differs before requesting a scan.
Correcting the baseline's project metadata does not refresh its scan date or
accept any findings.

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
SB_MGMT_ACCESS_TOKEN=... bun scripts/security-gate.ts --update-baseline
git add .security/baseline.json
```

Baseline changes are deliberately reviewable — a PR that silently widens
the baseline should be challenged in code review.

## Required secret

`SB_MGMT_ACCESS_TOKEN` — a scoped Supabase management personal access token
restricted to this project with **Advisors → Read** (`advisors_read`). Store
it as a GitHub Actions repository secret. See the
[scope guide](../docs/security/sb-mgmt-access-token.md). Keep the deployment
secret `SUPABASE_ACCESS_TOKEN` and runtime credentials separate.

## Scan completion and exit status

| Exit | Meaning |
| --- | --- |
| `0` | Required database scan completed and no new findings in available sources. |
| `1` | Required database scan completed; new findings need review. |
| `2` | Required database coverage unavailable or a configuration/scan error occurred. |

`security-report.json` records `project_ref`, `database_scan` (`completed` or
`unavailable`) and each source's status. Missing credentials, HTTP errors,
network failures and malformed advisor responses cannot produce a passing
gate. An optional Wiz scan cannot substitute for the database scan.
Unavailable sources' baseline findings are not marked resolved. A baseline
update is refused while the required database scan is unavailable.

The credential verifier makes only a GET to the advisor endpoint. A successful
GET proves read access, not the absence of extra token permissions; review
the scoped token's resource and permission settings in Supabase.

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
