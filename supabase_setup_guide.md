# Supabase Setup Guide — Peninsula Equine

> Comprehensive guide to understanding, configuring, and managing Supabase for the Peninsula Equine platform.

---

## 1. Project Overview

**Project ID:** `aizkqajrzkvwuobisnzr`  
**Canonical domain:** `peninsulaequine.systems`  
**Hosting platform:** Lovable Cloud (manages Supabase + frontend deployment)  
**Source of truth:** GitHub repository `spinandspurco-pixel/https-peninsulaequine-com-au`

Supabase provides:
- **PostgreSQL database** — schema + data storage
- **Auth system** — user authentication & session management
- **Storage** — file uploads (assessments, documents, media)
- **Edge Functions** — serverless backend logic (email, notifications, workflows)
- **Secrets management** — environment variables for external integrations

---

## 2. Accessing Supabase

### Via Lovable Cloud (Production)

The managed Supabase instance is attached to the Lovable Cloud project at **lovable.dev**.

1. Navigate to **lovable.dev** → Your project
2. Go to **Backend** tab
3. Link to Supabase dashboard is provided there
4. Use Lovable credentials to access

**Important:** Do not create a separate Supabase account. All access is managed through Lovable Cloud's integration.

### Via Supabase Dashboard (Direct Access)

If direct Supabase access is needed:

1. Go to **supabase.com** and log in
2. Navigate to project `aizkqajrzkvwuobisnzr`
3. Credentials are managed by Lovable Cloud — request access through your Lovable account settings

---

## 3. Database Configuration

### Schema Source of Truth

**All schema changes go through Git migrations:**
```
supabase/migrations/
├── 20260701_*.sql
├── 20260625_*.sql
└── ... (100+ timestamped migration files)
```

Each migration file is a SQL script applied in order. The migration at `supabase/migrations/20260701_add_attachments_and_create_inquiry_fn.sql` is representative:

```sql
-- Example: Create table
CREATE TABLE inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Example: Create function
CREATE OR REPLACE FUNCTION process_inquiry()
RETURNS void AS $$
BEGIN
  -- business logic
END;
$$ LANGUAGE plpgsql;
```

**Rules:**
1. **Never** run schema changes directly in the Supabase dashboard
2. **Always** create a `.sql` migration file in `supabase/migrations/`
3. Name files with timestamp: `YYYYMMDDHHMMSS_description.sql`
4. On `main` branch merge, migrations auto-apply to production

### Key Tables

| Table | Purpose | Notes |
|---|---|---|
| `auth.users` | Supabase Auth built-in | Managed by Supabase Auth system |
| `inquiries` | Lead capture from contact forms | Linked to `auth.users` |
| `lessons` | Horsemanship lesson bookings | Linked to `auth.users` |
| `documents` | Uploaded assessments, PDFs | Storage link + metadata |
| `notifications` | Email/SMS queue | Processed by edge functions |

Run the following to see the full schema (when you have Supabase CLI access):

```bash
supabase db pull  # Syncs remote schema into local migrations
```

---

## 4. Environment Variables & Secrets

### Frontend Variables (Auto-Managed by Lovable)

These are synced from Lovable Cloud to `.env`:

```env
VITE_SUPABASE_URL=https://aizkqajrzkvwuobisnzr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...  # Public anon key (safe to expose)
```

**Important:** These are safe to expose in frontend code (anon key is read-only by design).

### Backend Secrets (Lovable Secrets Dashboard Only)

These **must never** be committed to `.env` or source code:

| Secret | Purpose | Where to manage |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side API access (full DB privileges) | Lovable Cloud → Backend Secrets |
| `RESEND_API_KEY` | Transactional email (Resend.com) | Lovable Cloud → Backend Secrets |
| `FROM_EMAIL` | Default sender email | Lovable Cloud → Backend Secrets |
| `HQ_EMAIL_FROM` | HQ notifications sender | Lovable Cloud → Backend Secrets |
| `BOOKINGS_EMAIL_FROM` | Booking confirmations sender | Lovable Cloud → Backend Secrets |
| `QUOTES_EMAIL_FROM` | Quote responses sender | Lovable Cloud → Backend Secrets |
| `NOREPLY_EMAIL_FROM` | No-reply sender address | Lovable Cloud → Backend Secrets |
| `LOVABLE_API_KEY` | Lovable AI Gateway access | Lovable Cloud → Backend Secrets |

**Setup:**
1. In Lovable Cloud → Project → Backend
2. Scroll to "Environment Secrets"
3. Add/update each secret by key name
4. Secrets are automatically injected into edge functions

---

## 5. Edge Functions

Edge Functions are serverless TypeScript/JavaScript functions that run server-side on Supabase infrastructure.

### Function Structure

```
supabase/functions/
├── _shared/
│   └── mgmtApiGuard.ts           # Shared utilities (guards, helpers)
├── send-test-email/
│   └── index.ts                  # Edge function code
├── send-inquiry-notification/
│   └── index.ts
├── send-rsvp-confirmation/
│   └── index.ts
├── email-ops-status/             # Diagnostics: check email config
│   └── index.ts
├── resend-domain-status/         # Diagnostics: verify Resend domain
│   └── index.ts
├── verify-google-dns/            # Verify DNS records
│   └── index.ts
├── admin-ai-assistant/           # AI chat for admin panel
│   └── index.ts
└── ... (18+ functions total)
```

### Available Functions (Key)

| Function | Trigger | Purpose |
|---|---|---|
| `send-inquiry-notification` | Form submission | Email admin when inquiry received |
| `send-rsvp-confirmation` | RSVP form submit | Confirm booking via email |
| `send-document-notification` | Document upload | Notify on document received |
| `send-test-email` | Manual trigger | Test email setup (diagnostics) |
| `email-ops-status` | Scheduled / manual | Check sender email config health |
| `resend-domain-status` | Scheduled / manual | Verify `notify.peninsulaequine.systems` is verified in Resend |
| `verify-google-dns` | Scheduled / manual | Validate DNS propagation |
| `admin-ai-assistant` | Chat input (HQ) | Run AI queries via Lovable AI Gateway |
| `generate-enquiry-response` | Admin trigger | AI-assisted response drafting |
| `create-lesson-checkout` | Lesson booking | Create Stripe checkout session |
| `e2e-seed-users` | Test setup | Seed test users for E2E tests |

### Function Configuration (`config.toml`)

```toml
project_id = "aizkqajrzkvwuobisnzr"

[functions.send-test-email]
verify_jwt = false  # No auth required for testing

[functions.admin-ai-assistant]
verify_jwt = false  # Custom guard: checks mgmt token

[functions.send-inquiry-notification]
verify_jwt = false  # Called from public form
```

**JWT verification:**
- `verify_jwt = true`: Requires valid Supabase auth JWT in `Authorization: ****** header
- `verify_jwt = false`: Public endpoint; custom auth logic (if needed) is in the function code

### Example: Simple Email Function

```typescript
// supabase/functions/send-test-email/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { email, subject, message } = await req.json();

  // Send via Resend (uses RESEND_API_KEY from secrets)
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `******"RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: Deno.env.get("FROM_EMAIL"),
      to: email,
      subject,
      html: message,
    }),
  });

  return new Response(JSON.stringify(await response.json()), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
```

### Deployment

Edge functions deploy automatically:
1. Commit change to `supabase/functions/*/index.ts`
2. Create PR on GitHub
3. CI passes
4. Merge to `main` branch
5. **Lovable auto-picks up the commit** and deploys the function

No manual deploy command needed (Lovable handles it).

---

## 6. Email Integration (Resend)

The platform uses **Resend** for transactional email delivery.

### Verified Domain

- **Verified sending domain:** `notify.peninsulaequine.systems`
- **Main inbox:** `info@peninsulaequine.systems`
- **Resend account:** Managed by ops team at **resend.com**

### Sender Email Addresses

All emails sent from one of these addresses (configured via edge function secrets):

| Secret | Email | Purpose |
|---|---|---|
| `FROM_EMAIL` | `notify@peninsulaequine.systems` | Default transactional |
| `HQ_EMAIL_FROM` | `hq@peninsulaequine.systems` | Internal HQ notifications |
| `BOOKINGS_EMAIL_FROM` | `bookings@peninsulaequine.systems` | Lesson & event bookings |
| `QUOTES_EMAIL_FROM` | `quotes@peninsulaequine.systems` | Quote responses |
| `NOREPLY_EMAIL_FROM` | `noreply@peninsulaequine.systems` | No-reply (transactional) |

All must be subdomains of `notify.peninsulaequine.systems` to pass SPF/DKIM/DMARC checks.

### DNS Records Required

For `notify.peninsulaequine.systems` in domain registrar:

```
A record:        notify.peninsulaequine.systems  → Resend's IP
CNAME (DKIM):    default._domainkey.notify...   → resend.com DNS
```

**Status check:** Run edge function `resend-domain-status` to verify.

```bash
curl https://your-domain.vercel.app/api/resend-domain-status
```

---

## 7. Local Development Setup

### Prerequisites

- Node.js 18+ or Bun
- Supabase CLI: `brew install supabase/tap/supabase` (macOS)
- PostgreSQL (for local DB): `brew install postgresql`

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/spinandspurco-pixel/https-peninsulaequine-com-au.git
cd https-peninsulaequine-com-au
bun install  # or npm install
```

### 2. Set Up Local Supabase (Optional)

For full local dev, run Supabase locally:

```bash
supabase start  # Starts local Postgres, Auth, Storage, edge function emulator
```

This creates:
- Local PostgreSQL database
- Supabase Auth emulator
- Edge functions emulator

### 3. Environment File (`.env`)

The `.env` file is auto-managed by Lovable Cloud. For local development, you may need to copy from Lovable:

```bash
# From Lovable Cloud project, copy the VITE_* variables to .env
cat > .env << EOF
VITE_SUPABASE_URL=https://aizkqajrzkvwuobisnzr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
EOF
```

### 4. Run Dev Server

```bash
bun run dev   # Runs Vite dev server on http://localhost:5173
```

### 5. Test Edge Functions Locally

```bash
supabase functions serve  # Emulates edge functions on http://localhost:54321

# In another terminal, call a function:
curl -X POST http://localhost:54321/functions/v1/send-test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","subject":"Test","message":"Hello"}'
```

### 6. Push Schema Changes (Local → Remote)

After editing migrations:

```bash
supabase db push  # Applies local migrations to remote Supabase
```

**Caution:** This should typically only be done by the project maintainer on a dedicated branch before merging to `main`.

---

## 8. Common Tasks

### Add a New Table

1. Create a migration file:
   ```bash
   supabase migration new create_my_table
   ```

2. Edit the generated file in `supabase/migrations/`:
   ```sql
   CREATE TABLE my_table (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     name text NOT NULL,
     created_at timestamptz DEFAULT now()
   );
   ```

3. Commit and push to GitHub
4. Open PR, merge to `main`
5. Lovable auto-applies the migration

### Create a New Edge Function

1. Create directory:
   ```bash
   mkdir supabase/functions/my-function
   touch supabase/functions/my-function/index.ts
   ```

2. Write function code (TypeScript):
   ```typescript
   import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

   serve(async (req) => {
     return new Response(JSON.stringify({ message: "Hello" }));
   });
   ```

3. Configure in `supabase/config.toml` (optional, if special settings needed)
4. Commit, create PR, merge to `main`
5. Function deploys automatically

### Update a Secret

1. Lovable Cloud → Your project → Backend
2. Scroll to "Environment Secrets"
3. Edit secret by name (e.g., `RESEND_API_KEY`)
4. Click Save
5. Functions pick up new value on next deployment/restart

---

## 9. Monitoring & Debugging

### Health Checks

The platform provides diagnostic edge functions:

1. **Email config status:**
   ```bash
   curl https://peninsulaequine.systems/api/email-ops-status
   ```
   Returns: sender emails, Resend verification status, configuration health.

2. **Resend domain status:**
   ```bash
   curl https://peninsulaequine.systems/api/resend-domain-status
   ```
   Returns: DNS verification records, domain reputation, sender score.

3. **DNS propagation check:**
   ```bash
   curl https://peninsulaequine.systems/api/verify-google-dns
   ```
   Returns: MX, SPF, DKIM, DMARC record validation.

### View Logs

**Supabase Dashboard:**
1. Go to supabase.com → project `aizkqajrzkvwuobisnzr`
2. **Functions** → Select function → **Logs** tab
3. View recent invocations, errors, and output

**Lovable Cloud:**
1. lovable.dev → Your project → **Backend** → **Logs**
2. Real-time logs for functions and Auth events

### Troubleshooting Common Issues

| Issue | Solution |
|---|---|
| Email not sending | Run `email-ops-status` function; check sender secrets in Lovable |
| Function timeout | Increase timeout in `config.toml`, or optimize function code |
| Auth failing | Check JWT in function code; ensure `verify_jwt` setting matches expectation |
| Migration not applying | Verify `.sql` syntax; check `supabase db push` output for errors |

---

## 10. Best Practices

1. **Always use migrations for schema changes**  
   Never edit schema directly in the dashboard.

2. **Keep secrets out of code**  
   Use Lovable's Secrets dashboard, never `.env` or Git.

3. **Test edge functions locally before deploying**  
   Use `supabase functions serve` to emulate.

4. **Use meaningful migration names**  
   `20260701_add_inquiry_audit_log.sql` is better than `20260701_migration.sql`.

5. **Document complex functions**  
   Add comments explaining logic, especially in AI-related or data-processing functions.

6. **Monitor email deliverability**  
   Regularly run diagnostic functions (`email-ops-status`, `resend-domain-status`).

7. **Review migrations before merging**  
   Ensure schema changes won't break existing data or queries.

8. **Back up critical data**  
   Use Supabase's built-in backup feature (available in dashboard).

---

## 11. Useful Links

- **Supabase documentation:** https://supabase.com/docs
- **Deno (edge function runtime):** https://deno.land/manual
- **Lovable Cloud:** https://lovable.dev
- **Resend (email provider):** https://resend.com/docs
- **PostgreSQL docs:** https://www.postgresql.org/docs/

---

## 12. Support & Escalation

- **Supabase outages/issues:** Check supabase.com/status
- **Lovable Cloud support:** https://lovable.dev/support
- **Resend email issues:** https://resend.com/support
- **Repository issues:** Open a GitHub issue in `spinandspurco-pixel/https-peninsulaequine-com-au`

For production incidents, refer to **RUNBOOK.md** for escalation procedures.

---

**Last updated:** July 2, 2026  
**Project ID:** `aizkqajrzkvwuobisnzr`  
**Canonical domain:** `peninsulaequine.systems`
