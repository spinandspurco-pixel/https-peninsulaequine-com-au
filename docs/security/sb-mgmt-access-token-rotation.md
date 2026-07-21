# Runbook — Rotating `SB_MGMT_ACCESS_TOKEN`

Operational procedure for re-minting the Supabase Management API personal
access token, rolling it into every consumer, and validating the rotation.

**Scope guide (what the token is / is not allowed to do):** see
[`sb-mgmt-access-token.md`](./sb-mgmt-access-token.md). This runbook assumes
those constraints and only covers the mechanical rotation.

**When to run this:**

- Scheduled: every **90 days** (calendar reminder on the security rota).
- Ad-hoc: a workflow log, screenshot, or third-party service may have captured
  the value; the previous holder leaves the team; a scanner flags the token.

**Expected duration:** ~10 minutes. **Downtime:** none if steps are followed
in order (old token stays live until step 6).

**Roles required:**

- Supabase account owner for the `peninsulaequine` org (to mint / revoke PATs).
- GitHub repo admin (to update Actions secrets).
- Lovable Cloud project admin (to update the runtime secret).

---

## 1. Pre-flight

Confirm the current token still works before you replace it — if it's already
broken you want to know that's the starting condition, not the result of your
change.

```bash
# From a machine that has the current token exported locally, NOT from CI logs.
curl -sS -o /dev/null -w "%{http_code}\n" \
  -H "Authorization: Bearer $SB_MGMT_ACCESS_TOKEN" \
  "https://api.supabase.com/v1/projects/aizkqajrzkvwuobisnzr/advisors/security"
# Expect: 200
```

Also confirm no unrelated CI run is in flight — check the Actions tab for
`Security gate`, `verify-no-mgmt-token-leak`, and `nightly-security-scan`.
If one is running, wait for it to finish so you can attribute any post-rotation
failure to the rotation itself.

## 2. Mint the new token (least privilege)

1. Supabase → **Account → Access Tokens → Generate new token**.
2. **Name:** `peninsula-os-mgmt-YYYY-MM` (e.g. `peninsula-os-mgmt-2026-10`).
   The date suffix makes the audit trail readable at a glance.
3. **Scopes:** tick only
   - Advisors → **Read**
   - Advisors → **Read**
4. **Organisation:** restrict to `peninsulaequine` only.
5. **Project:** if the UI offers project-level restriction, restrict to
   `aizkqajrzkvwuobisnzr`.
6. **Expiry:** 90 days.
7. Copy the value **once** into a password manager entry named
   `SB_MGMT_ACCESS_TOKEN — <YYYY-MM>`. Do not paste it into chat, email, or
   any file on disk.

## 3. Roll into GitHub Actions

1. Repo → **Settings → Secrets and variables → Actions**.
2. Locate `SB_MGMT_ACCESS_TOKEN` → **Update secret** (do **not** delete/re-add;
   updating preserves the audit log).
3. Paste the new value → **Save**.

There is no code change — every workflow references the secret by name
(`.github/workflows/security-gate.yml`, `verify-no-mgmt-token-leak.yml`,
`nightly-security-scan.yml`). Confirm with:

```bash
rg -n "SB_MGMT_ACCESS_TOKEN" .github/workflows/
```

## 4. Roll into Lovable Cloud runtime

The edge function `mgmt-db-lints` reads the same secret at runtime.

1. Lovable Cloud → **Backend → Secrets**.
2. Update `SB_MGMT_ACCESS_TOKEN` to the new value → **Save**.
3. No redeploy needed — edge function secrets are hot-reloaded.

## 5. Validate the new token

Run these three checks **before** revoking the old token. If any fails, stop
and diagnose — the old token is still live so nothing is broken yet.

### 5a. Scope probe (proves least-privilege in CI)

Trigger the `Security gate` workflow manually:

- GitHub → **Actions → Security gate → Run workflow → Run workflow**.
- The **Verify token scopes are least-privilege** step must pass. It will
  fail with **exit 1** if the required read permission is missing. CI does not
  issue mutating requests to infer write access; verify the token selection in Supabase —
  return to step 2.

### 5b. End-to-end scan (proves the token unblocks the gate)

Same workflow run: the subsequent **Run security gate** step must exit 0.
This is the real-world check that `GET /v1/projects/{ref}/advisors/security`
succeeds with the new token.

### 5c. Edge function smoke (proves runtime rollout)

Curl the edge function directly:

```bash
curl -sS -o /dev/null -w "%{http_code}\n" \
  "https://aizkqajrzkvwuobisnzr.supabase.co/functions/v1/mgmt-db-lints"
# Expect: 200 (or 401 without auth — but never 500)
```

A `500` here means the runtime secret didn't update. Re-do step 4 and retry.

## 6. Revoke the old token

Only after steps 5a–5c are all green.

1. Supabase → **Account → Access Tokens**.
2. Find the previous entry (the one whose date suffix is *not* the token you
   just minted).
3. **Revoke**.
4. Confirm revocation by curling with the old value from step 1's local shell:

```bash
curl -sS -o /dev/null -w "%{http_code}\n" \
  -H "Authorization: Bearer $OLD_TOKEN" \
  "https://api.supabase.com/v1/projects/aizkqajrzkvwuobisnzr/advisors/security"
# Expect: 401
```

## 7. Post-rotation record

Update the security log (Notion or `mem://tech/security/data-access` — use
whichever the team currently maintains) with:

- Date of rotation.
- Reason (scheduled / suspected exposure / staff change).
- Name of the previous token (for cross-reference with Supabase audit log).
- Next scheduled rotation date (today + 90 days).

Delete the old token from any password-manager entry so the vault contains
exactly one live value.

---

## Rollback

If step 5 fails and you have not yet revoked the old token:

1. In GitHub secrets and Lovable Cloud secrets, re-paste the **old** value.
2. Re-run `Security gate` — it should return to green immediately.
3. File an incident note describing what the new token did wrong (e.g.
   over-scoped, wrong org, expired-on-mint) before retrying step 2.

If the old token was already revoked when a failure surfaced, mint a
replacement immediately following steps 2–5. There is no way to un-revoke.

## Blast-radius reminders

- The token is CI-only. It must never appear in `src/` — `mgmt-api-allowlist.test.ts`
  and `mgmt-token-guard.test.ts` enforce this at test time; `verify-no-mgmt-token-leak.yml`
  enforces it against built artifacts.
- The token must never be logged. `assertMgmtToken()` installs a `console.*`
  sanitiser plus Node `uncaughtException` / `unhandledRejection` scrubbers.
- If you widen scopes, update `docs/security/sb-mgmt-access-token.md`,
  `scripts/ci/verifyMgmtTokenScopes.ts` (add a read-only endpoint check), and
  `src/test/mgmt-api-allowlist.test.ts` (add the new endpoint) in the **same
  PR** as the code that uses it.
