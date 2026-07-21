# `SB_MGMT_ACCESS_TOKEN` — least-privilege scope guide

This document defines the minimum scopes the Supabase Management API token needs
for this project, and lists every endpoint the codebase is allowed to call with
it. Anything outside this list is out of scope; if a new call is added, update
this document in the same PR.

## Actual usage in this repo

Only **one** endpoint is called with this token today:

| Method | Endpoint                                                         | Caller                     | Purpose                                       |
| ------ | ---------------------------------------------------------------- | -------------------------- | --------------------------------------------- |
| `GET`  | `https://api.supabase.com/v1/projects/{ref}/advisors/security`      | `scripts/security-gate.ts` | Nightly + PR security gate — reads DB linter. |

Project ref: `aizkqajrzkvwuobisnzr` (production). No `POST`, `PATCH`, `PUT`, or
`DELETE` call is made against `api.supabase.com` anywhere in `scripts/`, `src/`,
`supabase/functions/`, or the GitHub Actions workflows. The token is never
imported by browser code — this is enforced by
`src/test/mgmt-token-guard.test.ts` and by the runtime guard
`scripts/ci/assertMgmtToken.ts`.

## Required scopes (least privilege)

When minting the token in Supabase → Account → Access Tokens, tick **only**:

- **Advisors → Read** (`advisors_read`) — needed to read the security-advisor result.

Restrict the token to a **single organisation** and, if the UI offers it, a
**single project** (`aizkqajrzkvwuobisnzr`). Do **not** grant any of the
following — none are used and each expands blast radius materially:

- Secrets (read or write)
- Auth config / SSO
- Edge Functions deploy
- Storage admin
- Billing
- Organisation members
- Any `write` / `admin` scope

## Operational rules

1. **CI-only.** The token lives in GitHub Actions secrets as
   `SB_MGMT_ACCESS_TOKEN` and in the Lovable Cloud runtime secret store. It is
   never checked into git, never referenced from `src/`, and never returned
   from an edge function.
2. **Redacted in logs.** `assertMgmtToken()` installs a `console.*` sanitiser
   that replaces the token with `[REDACTED:SB_MGMT_ACCESS_TOKEN]` before any
   log line leaves the process.
3. **Rotation.** Rotate every 90 days, or immediately if a workflow log or
   third-party service may have captured it. Rotation steps:
   - Mint a new token with the scopes above.
   - Update the GitHub secret `SB_MGMT_ACCESS_TOKEN`.
   - Update the Lovable Cloud secret `SB_MGMT_ACCESS_TOKEN`.
   - Revoke the previous token in the Supabase account UI.
4. **Adding a new endpoint.** If a future task genuinely needs another
   management route, add the endpoint to the table above, add the matching
   scope to the "Required scopes" list, and re-mint the token. Do not silently
   widen scopes.

## Verification checklist

- [ ] `rg "api.supabase.com" .` returns only the single URL in
      `scripts/security-gate.ts`.
- [ ] `bun run vitest run src/test/mgmt-token-guard.test.ts` passes.
- [ ] `scripts/security-gate.ts` exits 0 against production with the newly
      minted token (proves the `advisors_read` permission is sufficient).
