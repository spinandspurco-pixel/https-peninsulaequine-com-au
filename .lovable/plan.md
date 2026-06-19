## Goal
Add a CI gate that fails the build when new security findings appear in any scan result (Supabase linter + connector/Wiz-style scans), so regressions can't merge unnoticed.

## Approach

Add a new GitHub Actions workflow `.github/workflows/security-gate.yml` plus a small Node script `scripts/security-gate.ts` that:

1. Runs the Supabase DB linter via the Supabase Management API (using `SUPABASE_ACCESS_TOKEN` + project ref `aizkqajrzkvwuobisnzr`) and collects findings.
2. Reads a committed baseline at `.security/baseline.json` containing the fingerprints of all currently-known/accepted findings (mirrors what's already been marked fixed/ignored in the security memory).
3. Diffs current findings against the baseline:
   - Any finding **not in baseline** → fail the job with a non-zero exit and a `$GITHUB_STEP_SUMMARY` table listing the new issues (id, severity, table/function, remediation link).
   - Findings in baseline that disappeared → log as "resolved, consider pruning baseline" (non-fatal).
4. Writes a `security-report.json` artifact for traceability.

Baseline updates are an explicit human action: a maintainer runs `bun scripts/security-gate.ts --update-baseline` locally and commits the result. PRs that introduce a legitimately accepted finding must include the baseline change, making acceptance reviewable in code review.

## Files

- **New** `.github/workflows/security-gate.yml`
  - Triggers: `pull_request` to `main`, `push` to `main`, `workflow_dispatch`, plus a nightly `schedule` so drift from connector scans is caught even without PRs.
  - Steps: checkout → setup Bun → `bun install --frozen-lockfile` → run `bun scripts/security-gate.ts` with `SUPABASE_ACCESS_TOKEN` from secrets → upload `security-report.json` artifact → write summary.
- **New** `scripts/security-gate.ts`
  - Fetches linter results from `https://api.supabase.com/v1/projects/{ref}/database/lints`.
  - Normalises each finding to a stable fingerprint: `sha256(name + level + (metadata.schema||'') + (metadata.name||'') + cache_key)`.
  - Loads `.security/baseline.json`, diffs, prints a markdown summary, exits 1 on any new finding.
  - Supports `--update-baseline` to rewrite the baseline file.
- **New** `.security/baseline.json`
  - Seeded from the current scan output so the gate starts green. Each entry: `{ fingerprint, name, level, schema, object, acknowledged_in: "<migration or memory ref>" }`.
- **New** `.security/README.md`
  - Two-paragraph doc: what the gate does, how to refresh the baseline, and the rule that baseline changes require reviewer approval.

## Secrets

One new GitHub Actions secret required: `SUPABASE_ACCESS_TOKEN` (personal access token with read access to the project's lints endpoint). The plan will include instructions for the maintainer to add it; the workflow will fail fast with a clear message if it's missing.

## Out of scope

- No changes to existing workflows (`prerender-unit-tests.yml`, `verify-prerender.yml`).
- No changes to RLS, policies, or app code — this is CI-only.
- Connector/Wiz findings beyond what the Supabase linter surfaces are read from the same baseline mechanism; if you later want to ingest a second scanner, we extend `security-gate.ts` with another fetcher and keep the same diff logic.

## Open question

Do you want the gate to **block PRs** (required status check, hard fail) or **warn only** (annotate the PR but allow merge) for the first iteration? Default in the plan above is hard-fail on `pull_request`.
