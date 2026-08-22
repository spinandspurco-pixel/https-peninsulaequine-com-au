# Peninsula Equine — Platform Runbook

> **Public website:** `peninsulaequine.com.au` (apex + `www.`)
> **Admin email:** `info@peninsulaequine.systems`
> **Repo:** `spinandspurco-pixel/https-peninsulaequine-com-au`

---

## 1. Platform ownership map

| Concern | Platform | Where to manage |
|---|---|---|
| **Source of truth (code)** | GitHub | `main` branch — all changes via PR |
| **Frontend hosting** | GitHub Pages (redirect) + `peninsulaequine.com.au` (production) | GitHub Actions → `Deploy Peninsula Equine to GitHub Pages` publishes a route-preserving redirect; verify DNS origin for production |
| **Custom domains** | Registrar DNS + GitHub Pages | `peninsulaequine.com.au` and `www.peninsulaequine.com.au` |
| **Auth + database + storage** | Supabase | Supabase project dashboard |
| **Edge functions** | Supabase | `supabase/functions/` — deployed on commit |
| **Transactional email (sending)** | Resend | resend.com → Domain: `notify.peninsulaequine.systems` |
| **Business email (inbox/outbox)** | Mail provider (e.g., Google Workspace) | DNS MX records for `peninsulaequine.systems` |
| **DNS** | Instra | Instra DNS records for `peninsulaequine.com.au` |
| **AI assistant** | Lovable AI Gateway | Managed by Lovable — `LOVABLE_API_KEY` secret |

---

## 2. Change-control rules

1. **All production changes go through GitHub.** Merge reviewed changes to `main`; the GitHub Pages workflow publishes the result.
2. **One production domain.** `peninsulaequine.com.au` is the sole public-facing domain. GitHub Pages now publishes a route-preserving redirect to that domain rather than the application itself. Do not point the apex domain at any legacy CloudFront, Vercel, or preview host, and confirm the authoritative origin of `peninsulaequine.com.au` before making DNS changes.
3. **Environment variables.** Frontend (`VITE_SUPABASE_*`) live in GitHub repository variables. Backend secrets (`RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, sender `FROM_EMAIL`, etc.) live only in Supabase secrets — never in `.env` or source code.
4. **Schema migrations.** All Supabase schema changes go through `supabase/migrations/*.sql`. Never run `supabase db push` manually against the managed project.
5. **Retired routes stay retired.** Do not restart Cloud Run/GCP, Vercel, CloudFront, S3, or another frontend host as production, preview, or failover. Historical deployment documents are records, not runbooks; see [HOSTING_GOVERNANCE.md](./HOSTING_GOVERNANCE.md).

---

## 3. Deploy process

### Standard deploy (code change)

```
1. Create a branch off main
2. Make changes → open PR → CI must pass (strict-build, security-gate)
3. Merge PR to main
4. GitHub Actions builds and deploys GitHub Pages
5. Verify: smoke test passes (publish-smoke-test workflow)
```

### Hotfix deploy

Same as standard. For urgent fixes, merge a small GitHub PR and verify the Pages workflow before changing DNS or backend configuration.

### GitHub Pages deploy

GitHub Pages deploys each merge to `main`. The workflow (`deploy-github-pages.yml`) now publishes `retired-site/index.html` as a route-preserving redirect to `https://peninsulaequine.com.au`; it does **not** run `bun run build` or serve the React application. The redirect page is static HTML — no repository variables or build steps are needed.

---

## 4. Rollback procedure

### Frontend rollback
1. In GitHub: revert the offending commit or open a corrective PR.
2. Merge to `main` and confirm the GitHub Pages deployment succeeds.
3. Verify the public domain only after the deployment is live.

### Database rollback
Supabase migrations are forward-only. To roll back a schema change:
1. Write a new migration that reverses the change.
2. Add it to `supabase/migrations/` with a new timestamp filename.
3. Merge via PR — the Supabase deployment workflow applies it.

---

## 5. Key rotation

### Supabase publishable key (`VITE_SUPABASE_PUBLISHABLE_KEY`)

The key must be in `sb_publishable_*` format. Legacy `eyJ…` JWT keys are disabled on rotation and cause 401s.

1. In Supabase Dashboard: Project Settings → API → copy the `sb_publishable_*` key.
2. Update the GitHub repository variable `VITE_SUPABASE_PUBLISHABLE_KEY`.
3. Trigger or merge a GitHub Pages deployment.

### Resend API key

1. Generate a new key in resend.com → API Keys.
2. Update the `RESEND_API_KEY` secret in Supabase secrets.
3. Edge functions pick it up on next invocation — no redeploy needed.
4. Run the send-test-email diagnostic from `/hq/deploy-health` to confirm delivery.

### Supabase service role key

1. Rotate in Supabase dashboard → Project Settings → API.
2. Update the Supabase secret (the key is never in the repo or `.env`).
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
| `peninsulaequine.com.au` | four `A` records | GitHub Pages IPs | Apex public hosting |
| `www.peninsulaequine.com.au` | `CNAME` | `spinandspurco-pixel.github.io.` | www public hosting |
| `peninsulaequine.systems` | `MX` | Mail provider | Email receiving |
| `peninsulaequine.systems` | `TXT` | SPF value | Email authentication |
| `notify.peninsulaequine.systems` | `TXT`/`CNAME` | Resend values | Transactional email sending |

> **Check DNS propagation:** run the DNS checker at `/hq/dns-*` routes (admin only) or use `dig`/`nslookup` from the command line.

---

## 8. Auth configuration

- **Auth provider:** Supabase
- **Sign-in methods:** Email magic link + Google OAuth
- **Redirect URL whitelist** (must be set in Supabase dashboard → Auth → URL Configuration):
  - `https://peninsulaequine.com.au/**`
  - `https://www.peninsulaequine.com.au/**`
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
| Project ID | `mxjuknqwzbvvmmdrvkql` |
| Supabase URL | `https://mxjuknqwzbvvmmdrvkql.supabase.co` |
| Dashboard | `https://supabase.com/dashboard/project/mxjuknqwzbvvmmdrvkql` |

---

*Last updated: July 2026*
