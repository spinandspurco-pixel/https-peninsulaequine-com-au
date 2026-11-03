# `SB_MGMT_ACCESS_TOKEN` — least-privilege scope guide

This document defines the dedicated CI security-advisor token's minimum
permissions. Runtime management consumers and deployment credentials are
separate; do not replace or revoke them as part of CI configuration.

## Actual usage in this repo

The CI scanner and read-access verifier use the documented advisor endpoint.
The existing runtime endpoint remains allowlisted without changing its code:

| Method | Endpoint                                                         | Caller                     | Purpose                                       |
| ------ | ---------------------------------------------------------------- | -------------------------- | --------------------------------------------- |
| `GET` | `https://api.supabase.com/v1/projects/{ref}/advisors/security` | `scripts/security-gate.ts`, `scripts/ci/verifyMgmtTokenScopes.ts` | Required CI database security advisors. |
| `GET` | `https://api.supabase.com/v1/projects/{ref}/database/lints` | Existing `supabase/functions/mgmt-db-lints` | Separate runtime consumer; unchanged. |

Project ref: `mxjuknqwzbvvmmdrvkql` (production). No `POST`, `PATCH`, `PUT`, or
`DELETE` call is made against `api.supabase.com` anywhere in `scripts/`, `src/`,
`supabase/functions/`, or the GitHub Actions workflows. The token is never
imported by browser code — this is enforced by
`src/test/mgmt-token-guard.test.ts` and by the runtime guard
`scripts/ci/assertMgmtToken.ts`.

## Required scopes (least privilege)

When minting the token in Supabase → Account → Access Tokens, tick **only**:

- **Advisors → Read** (`advisors_read`) for the CI advisor endpoint.

Restrict the token to the **single project** `mxjuknqwzbvvmmdrvkql` in its
owning organisation. Do **not** grant any of the
following — none are used and each expands blast radius materially:

- Secrets (read or write)
- Auth config / SSO
- Edge Functions deploy
- Storage admin
- Billing
- Organisation members
- Any `write` / `admin` scope

## Operational rules

1. **Dedicated CI token.** Store it in GitHub Actions secrets as
   `SB_MGMT_ACCESS_TOKEN`. Leave the existing runtime secret unchanged. It is
   never checked into git, never referenced from `src/`, and never returned
   from an edge function.
2. **Redacted in logs.** `assertMgmtToken()` installs a `console.*` sanitiser
   that replaces the token with `[REDACTED:SB_MGMT_ACCESS_TOKEN]` before any
   log line leaves the process.
3. **Rotation.** Rotate every 90 days, or immediately if a workflow log or
   third-party service may have captured it. Rotation steps:
   - Mint a new token with the scopes above.
   - Update the GitHub secret `SB_MGMT_ACCESS_TOKEN`.
   - Confirm completed database coverage in the generated report.
   - Revoke a previous CI-only token after validating its replacement and
     confirming it has no other consumers. Runtime rotation is separate.
4. **Adding a new endpoint.** If a future task genuinely needs another
   management route, add the endpoint to the table above, add the matching
   scope to the "Required scopes" list, and re-mint the token. Do not silently
   widen scopes.

## Verification checklist

- [ ] Review token resources and permissions in Supabase: this project and
      Advisors Read only. The verifier cannot prove absence of write access.
- [ ] `bun test scripts/security-gate.test.ts` passes.
- [ ] `bun run vitest run src/test/mgmt-token-guard.test.ts` passes.
- [ ] `security-report.json` identifies this project, `database_scan: completed`
      and `sources.supabase.status: ok`. Exit `1` means completed coverage with
      new findings; review them rather than automatically accepting a baseline.

Reference: [Supabase security-advisor API](https://supabase.com/docs/reference/api/v1-get-security-advisors)
and [scoped personal access tokens](https://supabase.com/docs/guides/platform/personal-access-tokens).
