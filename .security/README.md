# Security baseline

The CI workflow `.github/workflows/security-gate.yml` runs
`scripts/security-gate.ts` on every PR, every push to `main`, and nightly.
The script fetches the current Supabase database linter findings and
compares them — by stable fingerprint — to `baseline.json` in this folder.

**Any finding present in the current scan but missing from the baseline
fails the build.** That includes net-new misconfigurations introduced by a
PR as well as drift surfaced by connector / Wiz-style scans we later wire
into the same script.

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
