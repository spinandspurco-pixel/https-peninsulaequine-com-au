# Peninsula Equine — Platform Runbook

> **Canonical domain:** `peninsulaequine.systems` (apex + `www.`)  
> **Admin email:** `info@peninsulaequine.systems`  
> **Repo:** `spinandspurco-pixel/https-peninsulaequine-com-au`

---

## 1. Platform ownership map

| Concern | Platform | Where to manage |
|---|---|---|
| **Source of truth (code)** | GitHub | `main` branch — all changes via PR |
| **Frontend hosting (primary)** | Lovable Cloud | lovable.dev → Project → Publish |
| **Frontend hosting (secondary)** | Vercel | vercel.com → Project settings |
| **Custom domains** | Lovable Cloud | Lovable → Project → Domains (`peninsulaequine.systems`, `www.peninsulaequine.systems`) |
| **Auth + database + storage** | Supabase (managed by Lovable Cloud) | lovable.dev → Project → Backend |
| **Edge functions** | Supabase | `supabase/functions/` — deployed on commit |
| **Transactional email (sending)** | Resend | resend.com → Domain: `notify.peninsulaequine.systems` |
| **Business email (inbox/outbox)** | Mail provider (e.g., Google Workspace) | DNS MX records for `peninsulaequine.systems` |
| **DNS** | Domain registrar | Wherever `peninsulaequine.systems` is registered |
| **AI assistant** | Lovable AI Gateway | Managed by Lovable — `LOVABLE_API_KEY` secret |

---

## 2. Change-control rules

1. **No direct production edits in Lovable without a PR.** All changes must flow through a GitHub PR merged to `main`. Lovable picks up the merged commit automatically.
2. **One production host.** Lovable Cloud is the primary host for `peninsulaequine.systems`. Vercel is secondary (preview/backup only). Do not point the apex domain DNS to both simultaneously.
3. **Environment variables.** Frontend (`VITE_SUPABASE_*`) are auto-managed by Lovable Cloud and synced to `.env` in the repo. Backend secrets (`RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, sender `FROM_EMAIL`, etc.) live only in the Supabase/Lovable secrets dashboard — never in `.env` or source code.
4. **Schema migrations.** All Supabase schema changes go through `supabase/migrations/*.sql`. Never run `supabase db push` manually against the managed project.

---

## 3. Deploy process

### Standard deploy (code change)

```
1. Create a branch off main
2. Make changes → open PR → CI must pass (strict-build, security-gate)
3. Merge PR to main
4. Lovable picks up the commit and auto-publishes
5. Verify: smoke test passes (publish-smoke-test workflow)
```

### Hotfix deploy

Same as standard. For urgent production fixes, Lovable allows direct edits in their editor — but always merge back to `main` immediately after.

### Vercel deploy

Vercel auto-deploys every push to `main` (if connected).  
Build command: `bun run build`  
Output dir: `dist`  
Install command: `bun install`  
Environment variables needed in Vercel project settings:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_PUBLISHABLE_KEY` (must be `sb_publishable_*` format)

---

## 4. Rollback procedure

### Frontend rollback
1. In Lovable: go to Project → Publish history → select the last good build → Re-publish.
2. In Vercel: go to Project → Deployments → find the last good deployment → Promote to production.
3. In GitHub: revert the offending commit, open a PR, merge, let Lovable/Vercel redeploy.

### Database rollback
Supabase migrations are forward-only. To roll back a schema change:
1. Write a new migration that reverses the change.
2. Add it to `supabase/migrations/` with a new timestamp filename.
3. Merge via PR — Lovable applies it on next publish.

---

## 5. Key rotation

### Supabase publishable key (`VITE_SUPABASE_PUBLISHABLE_KEY`)

The key must be in `sb_publishable_*` format. Legacy `eyJ…` JWT keys are disabled on rotation and cause 401s.

1. In Lovable Cloud: Project → Backend → API keys → Copy the `sb_publishable_*` key.
2. Lovable automatically updates `.env` in the GitHub repo.
3. In Vercel: Project → Settings → Environment Variables → update `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. Redeploy on Vercel (trigger a new build or redeploy from the Deployments tab).

### Resend API key

1. Generate a new key in resend.com → API Keys.
2. Update the `RESEND_API_KEY` secret in Supabase/Lovable Cloud secrets dashboard.
3. Edge functions pick it up on next invocation — no redeploy needed.
4. Run the send-test-email diagnostic from `/hq/deploy-health` to confirm delivery.

### Supabase service role key

1. Rotate in Supabase dashboard → Project Settings → API.
2. Update in Lovable Cloud secrets dashboard (the key is never in the repo or `.env`).
3. Edge functions pick it up on next invocation.

---

## 6. Email system overview

| Sender purpose | Secret | Expected format |
|---|---|---|
| HQ notifications (admin-to-admin) | `HQ_EMAIL_FROM` | `Peninsula Equine HQ <hq@notify.peninsulaequine.systems>` |
| Noreply / system | `NOREPLY_EMAIL_FROM` | `Peninsula Equine <noreply@notify.peninsulaequine.systems>` |
| Bookings | `BOOKINGS_EMAIL_FROM` | `Peninsula Equine Bookings <bookings@notify.peninsulaequine.systems>` |
| Quotes | `QUOTES_EMAIL_FROM` | `Peninsula Equine <quotes@notify.peninsulaequine.systems>` |
| Default / fallback | `FROM_EMAIL` | `Peninsula Equine <hello@notify.peninsulaequine.systems>` |
| Reply-to / inbox | — (hardcoded) | `info@peninsulaequine.systems` |
| Staff notifications | `NOTIFICATION_EMAIL` | `info@peninsulaequine.systems` |

All outgoing transactional email routes through **Resend** using the verified sending domain `notify.peninsulaequine.systems`.  
The main inbox `info@peninsulaequine.systems` is a separate mailbox managed by your mail provider (MX records).

### DNS records required for email

**Resend (sending — `notify.peninsulaequine.systems`):**
- SPF `TXT` record on `notify.peninsulaequine.systems`
- DKIM `CNAME` record (provided by Resend)
- Optional DMARC `TXT` on `_dmarc.notify.peninsulaequine.systems`

**Mail provider (receiving — `peninsulaequine.systems`):**
- `MX` records pointing to your mail provider
- SPF `TXT` record on `peninsulaequine.systems`
- DKIM `TXT`/`CNAME` records per your mail provider's instructions
- DMARC `TXT` on `_dmarc.peninsulaequine.systems`

### Verifying email health

Navigate to `/hq/deploy-health` → Email tab (admin only). This runs `email-ops-status` and `resend-domain-status` edge functions to check:
- All sender secrets are configured and point to `notify.peninsulaequine.systems`
- The Resend domain is verified
- SPF/DKIM status per Resend's records
- Last successful and last failed test send

---

## 7. DNS overview

| Record | Type | Points to | Purpose |
|---|---|---|---|
| `peninsulaequine.systems` | `A` / `ALIAS` / `CNAME` | Lovable hosting IP/CNAME | Apex production hosting |
| `www.peninsulaequine.systems` | `CNAME` | Lovable hosting | www redirect/alias |
| `peninsulaequine.systems` | `MX` | Mail provider | Email receiving |
| `peninsulaequine.systems` | `TXT` | SPF value | Email authentication |
| `notify.peninsulaequine.systems` | `TXT`/`CNAME` | Resend values | Transactional email sending |

> **Check DNS propagation:** run the DNS checker at `/hq/dns-*` routes (admin only) or use `dig`/`nslookup` from the command line.

---

## 8. Auth configuration

- **Auth provider:** Supabase (managed by Lovable Cloud)
- **Sign-in methods:** Email magic link + Google OAuth
- **Redirect URL whitelist** (must be set in Supabase dashboard → Auth → URL Configuration):
  - `https://peninsulaequine.systems/**`
  - `https://www.peninsulaequine.systems/**`
  - `https://*.lovable.app/**` (for Lovable preview URLs)
  - `https://*.vercel.app/**` (for Vercel preview deployments)
  - `http://localhost:8080/**` (local dev)
- **Roles:** managed in `user_roles` table; checked server-side via `has_role()` function. Never store role in client storage.

---

## 9. Monitoring & alerts

| Signal | Where |
|---|---|
| Deploy health (bundle hash drift, stale streak) | `/hq/deploy-health` |
| Email delivery health | `/hq/deploy-health` → Email tab |
| DNS propagation status | `/hq/dns-*` routes |
| CI workflow status | GitHub Actions tab |
| Operational alerts | `OPS_ALERTS.md` in repo root |
| Smoke test results | `smoke-summary.json` in repo root |

---

## 10. Supabase project reference

| Item | Value |
|---|---|
| Project ID | `aizkqajrzkvwuobisnzr` |
| Supabase URL | `https://aizkqajrzkvwuobisnzr.supabase.co` |
| Dashboard | `https://supabase.com/dashboard/project/aizkqajrzkvwuobisnzr` |

---

*Last updated: July 2026*
