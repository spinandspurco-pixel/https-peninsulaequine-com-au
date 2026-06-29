# Ops Alerts

Operational notes for external infrastructure issues that are **not** part of this codebase. Nothing here changes app code, DNS, SSL, env vars, Supabase, or deployment config — this file is a tracking record only.

---

## 🟠 Open: `procasa.com.au` AutoSSL renewal failing

**Logged:** June 29, 2026
**Status:** Open — action required before July 7, 2026
**Owner:** Ciro (cPanel account holder)

### Source
cPanel AutoSSL / Let's Encrypt renewal failure emails (recurring).

### Domain affected
`procasa.com.au` — including the following service hostnames bundled in the same certificate:
- `procasa.com.au`
- `www.procasa.com.au`
- `mail.procasa.com.au`
- `webmail.procasa.com.au`
- `cpanel.procasa.com.au`
- `webdisk.procasa.com.au`
- `cpcontacts.procasa.com.au`
- `cpcalendars.procasa.com.au`

### Root cause (as reported in the email)
**Disk quota exceeded** on the cPanel account. AutoSSL cannot write the renewal challenge files, so Let's Encrypt declines to issue a new certificate.

### Risk
The current SSL certificate expires **July 7, 2026**. If renewal does not succeed before then, browsers will show a security warning on every listed hostname and mail clients (IMAP/SMTP over TLS) will start rejecting connections.

### Immediate fix
1. Log into cPanel for `procasa.com.au`.
2. Open **Disk Usage** and identify what is consuming the quota (commonly: mailbox bloat, `logs/`, `tmp/`, old backups, or `error_log` files).
3. Free enough space to drop comfortably below the quota.
4. Go to **SSL/TLS Status**, select all affected domains, and click **Run AutoSSL**.
5. Confirm the new certificate's expiry date moves out ~90 days.

### Secondary fix
Review cPanel's notification recipients / contact settings so that once the cert renews successfully, Ciro is not repeatedly spammed by stale or duplicate AutoSSL failure notices. Consider:
- Removing redundant contact emails.
- Reducing notification frequency for AutoSSL warnings.
- Adding a secondary ops contact so alerts are not single-pointed on one inbox.

### Out of scope
This issue is on the external cPanel host for `procasa.com.au`. It has **no relationship** to:
- `peninsulaequine.systems` / `peninsulaequine.com.au` (hosted on Lovable / Vercel)
- Supabase / Lovable Cloud
- Any DNS or auth configuration inside this repo

No code, env, or deployment changes are required here.
