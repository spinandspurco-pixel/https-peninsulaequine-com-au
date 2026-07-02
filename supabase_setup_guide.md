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
| `inquiry_attachments` | Files uploaded with inquiries | Storage links + metadata |
| `lessons` | Horsemanship lesson bookings | Linked to `auth.users` |
| `documents` | Uploaded assessments, PDFs | Storage link + metadata |
| `notifications` | Email/SMS queue | Processed by edge functions |

Run the following to see the full schema (when you have Supabase CLI access):

```bash
supabase db pull  # Syncs remote schema into local migrations
```

**Current Schema Status:** 128 database migrations applied, synced with source control at `supabase/migrations/`.

---

## 4. Environment Variables & Secrets

### Frontend Variables (Auto-Managed by Lovable)

These are synced from Lovable Cloud to `.env`:

```env
VITE_SUPABASE_URL=https://aizkqajrzkvwuobisnzr.supabase.co
VITE_SUPABASE_PROJECT_ID=aizkqajrzkvwuobisnzr
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...  # Current format (or eyJ... legacy format - see warning below)
SUPABASE_URL=https://aizkqajrzkvwuobisnzr.supabase.co  # Backend/local dev
```

**Important:** These are safe to expose in frontend code (publishable key is not inherently read-only—it can perform writes wherever Row Level Security (RLS) policies allow them).

⚠️ **Legacy JWT Warning:** Supabase has two key formats: older JWT format (`eyJ...`) which is **deprecated** and newer `sb_publishable_*` format which is current. The JWT format is susceptible to rotation issues. If you're experiencing 401 authentication errors (especially "invalid_grant"), you must update from Lovable Cloud → Backend → API keys to get the current `sb_publishable_*` key format.

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

### @supabase/server SDK

The `@supabase/server` package provides type-safe request handlers with built-in Supabase authentication and client management for Edge Functions.

**Installation:**
```bash
npm install @supabase/server
```

**Environment Variables for @supabase/server:**

In addition to the secrets above, @supabase/server requires these environment variables (auto-injected in Supabase Edge Functions):

| Variable | Purpose | Format |
|---|---|---|
| `SUPABASE_URL` | Supabase project URL | `https://[projectid].supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | Public API key (publishable/anon key) | `sb_publishable_*` or `eyJ...` (legacy) |
| `SUPABASE_SECRET_KEY` | Secret service role key (full privileges) | NOT exposed in frontend; injected into functions only |
| `SUPABASE_JWKS_URL` | URL to download JWT signing keys for verification | `https://[projectid].supabase.co/auth/v1/jwks` |

**Key Format Notes:**
- Supabase projects created after mid-2024 use the `sb_publishable_*` format for the anon/public key (recommended)
- Older projects may still use the JWT format `eyJ...` which is considered legacy and deprecated
- Both formats work with @supabase/server, but newer projects should use `sb_publishable_*`
- If you see 401 errors, verify you have the latest key format from Lovable Cloud → Backend → API keys

**⚠️ Important:**
- **NEVER** commit `SUPABASE_SECRET_KEY` or `SUPABASE_JWKS_URL` to `.env` or source code
- Manage these only through Lovable Cloud → Backend → Secrets
- The SDK automatically injects these when running on Supabase Edge Functions
- For local development, copy the values from Supabase dashboard's "Connect" dialog (only for testing)

**Usage: Creating Request Handlers with `withSupabase`**

The `withSupabase` middleware validates authentication and provides scoped Supabase clients:

```typescript
// supabase/functions/example-handler/index.ts
import { withSupabase } from "@supabase/server"

export default {
  fetch: withSupabase({ auth: "user" }, async (_req, ctx) => {
    const { supabase, supabaseAdmin, userClaims } = ctx
    
    // supabase is an RLS-scoped client (respects user permissions)
    const { data: todos } = await supabase
      .from("todos")
      .select()
    
    // supabaseAdmin bypasses RLS (full access)
    const { data: allData } = await supabaseAdmin
      .from("todos")
      .select()
    
    return Response.json({ todos, allData })
  }),
}
```

**Auth Modes:**

The `auth` parameter controls how the handler validates requests:

| Mode | Requires | Use Case | config.toml Setting |
|---|---|---|---|
| `"user"` | Valid JWT from authenticated user | User-specific data access | `verify_jwt = true` |
| `"publishable"` | Valid publishable/anon key | Public, anonymous access | `verify_jwt = false` |
| `"secret"` | Valid secret key | Admin/backend-only operations | `verify_jwt = false` + custom guard |
| `"none"` | No auth required | Public endpoints | `verify_jwt = false` |

**Config.toml Settings:**

For each function using `withSupabase`, update `supabase/config.toml`:

```toml
[functions.example-handler]
# If auth mode is "user", keep verify_jwt = true (default)
verify_jwt = true

[functions.public-form-handler]
# For "publishable" or "none" modes, set verify_jwt = false
# @supabase/server will handle auth via the middleware
verify_jwt = false
```

**Complete Example: User Todos Handler**

```typescript
// supabase/functions/user-todos/index.ts
import { withSupabase } from "@supabase/server"

interface TodoRequest {
  title: string;
  completed?: boolean;
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    // User is authenticated; ctx.userClaims contains user identity (id, email, role)
    const { supabase, supabaseAdmin, userClaims } = ctx
    
    if (req.method === "GET") {
      // Fetch user's todos (RLS-scoped to their data)
      const { data, error } = await supabase
        .from("todos")
        .select()
        .eq("user_id", userClaims.id)
      
      return Response.json({ data, error })
    }
    
    if (req.method === "POST") {
      const body = await req.json() as TodoRequest
      
      // Create todo for authenticated user
      const { data, error } = await supabase
        .from("todos")
        .insert([{
          user_id: userClaims.id,
          title: body.title,
          completed: body.completed || false
        }])
      
      return Response.json({ data, error }, { status: error ? 400 : 201 })
    }
    
    return Response.json({ error: "Method not allowed" }, { status: 405 })
  }),
}
```

In `supabase/config.toml`:
```toml
[functions.user-todos]
verify_jwt = true
```

---

## 5. Edge Functions

Edge Functions are serverless TypeScript/JavaScript functions that run server-side on Supabase infrastructure.

### Function Structure

```
supabase/functions/
├── _shared/
│   └── mgmtApiGuard.ts           # Shared utilities (guards, helpers)
├── send-test-email/              # Manual diagnostic
├── send-inquiry-notification/    # Auto: inquiry form submission
├── send-rsvp-confirmation/       # Auto: RSVP booking confirmation
├── send-document-notification/   # Auto: document upload notification
├── send-welcome-series/          # Email automation sequence
├── submit-inquiry/               # Form handler
├── validate-inquiry-upload/      # File validation
├── create-staff-account/         # Admin staff provisioning
├── verify-admin-login/           # Admin auth verification
├── email-ops-status/             # Diagnostics: check email config
├── resend-domain-status/         # Diagnostics: verify Resend domain
├── verify-google-dns/            # Verify DNS records
├── notify-dns-propagated/        # DNS notification handler
├── admin-ai-assistant/           # AI chat for admin panel
├── generate-enquiry-response/    # AI-assisted response drafting
├── create-lesson-checkout/       # Stripe checkout creation
├── e2e-seed-users/               # Test data seeding
├── mgmt-db-lints/                # Database integrity checks
├── mint-josh-preview/            # Preview system integration
├── preview-mint-check/           # Preview health check
├── publish-log-ingest/           # Publishing log handler
├── report-publish-failure/       # Publish failure reporting
└── run-graph-smoke-test/         # GraphQL smoke test
```

### Available Functions (Complete List)

| Function | Trigger | Purpose | Auth |
|---|---|---|---|
| `send-inquiry-notification` | Form submission | Email admin when inquiry received | Public |
| `send-rsvp-confirmation` | RSVP form submit | Confirm booking via email | Public |
| `send-document-notification` | Document upload | Notify on document received | Public |
| `send-test-email` | Manual trigger | Test email setup (diagnostics) | Admin only |
| `send-welcome-series` | Scheduled / manual | Automated welcome email sequence | Admin |
| `email-ops-status` | Scheduled / manual | Check sender email config health | Admin |
| `resend-domain-status` | Scheduled / manual | Verify `notify.peninsulaequine.systems` is verified in Resend | Admin |
| `verify-google-dns` | Scheduled / manual | Validate DNS propagation | Public |
| `notify-dns-propagated` | Scheduled | Notify on DNS propagation complete | Public |
| `admin-ai-assistant` | Chat input (HQ) | Run AI queries via Lovable AI Gateway | Admin (custom guard) |
| `generate-enquiry-response` | Admin trigger | AI-assisted response drafting | Admin |
| `create-lesson-checkout` | Lesson booking | Create Stripe checkout session | Public |
| `e2e-seed-users` | Test setup | Seed test users for E2E tests | Test only |
| `submit-inquiry` | Form submission | Process inquiry form data | Public |
| `validate-inquiry-upload` | File upload | Validate uploaded inquiry files | Public |
| `verify-admin-login` | Admin login | Verify admin credentials | Public (custom guard) |
| `create-staff-account` | Admin trigger | Provision new staff account | Admin |
| `mgmt-db-lints` | Scheduled / manual | Run database integrity checks | Admin (custom guard) |
| `mint-josh-preview` | Manual | Preview system integration | Admin (custom guard) |
| `preview-mint-check` | Scheduled | Health check for preview system | Public |
| `publish-log-ingest` | Scheduled | Process publishing logs | Public |
| `report-publish-failure` | Triggered | Report publishing failures | Public |
| `run-graph-smoke-test` | Scheduled | Run GraphQL API smoke tests | Public |

**Total: 23 edge functions** deployed and auto-updated with each commit to `main`.

### Function Configuration (`config.toml`)

The project's `supabase/config.toml` defines JWT verification and environment settings:

```toml
project_id = "aizkqajrzkvwuobisnzr"

[functions.admin-ai-assistant]
verify_jwt = false  # Custom guard: checks mgmt token

[functions.verify-google-dns]
verify_jwt = false  # Public diagnostic endpoint

[functions.verify-admin-login]
verify_jwt = false  # Custom guard: admin auth check

[functions.validate-inquiry-upload]
verify_jwt = false  # Called from public form

[functions.submit-inquiry]
verify_jwt = false  # Called from public form
```

**JWT verification:**
- `verify_jwt = true`: Requires valid Supabase auth JWT in the `Authorization` header
- `verify_jwt = false`: Disables automatic JWT verification; however, this **does NOT mean no authentication**. Authentication is instead handled by custom logic within the function code (e.g., custom guards in `supabase/functions/_shared/mgmtApiGuard.ts` for admin functions)

Most admin/protected functions use custom guards in `supabase/functions/_shared/mgmtApiGuard.ts` to verify management tokens, providing more flexible authentication than the automatic JWT check.

### Example: Simple Email Function

Here's a simplified example based on `send-test-email`:

```typescript
// supabase/functions/send-test-email/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestEmailRequest {
  recipient?: string;
  sender?: "hq" | "noreply" | "bookings" | "quotes" | "from";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Supabase auto-injects these environment variables at runtime:
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceRole);

  const body = await req.json() as TestEmailRequest;
  const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

  // Example: send via Resend using FROM_EMAIL secret
  const response = await resend.emails.send({
    from: Deno.env.get("FROM_EMAIL")!,
    to: body.recipient || "test@example.com",
    subject: "Test Email",
    html: "<p>This is a test email</p>",
  });

  return new Response(JSON.stringify(response), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
```

**Key points:**
- **Runtime environment variables**: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `RESEND_API_KEY` are auto-injected into edge functions at execution time
  - Frontend uses: `VITE_SUPABASE_PUBLISHABLE_KEY` (from `.env`, passed to browser client)
  - Backend runtime uses: `SUPABASE_ANON_KEY` (injected by Supabase at runtime, contains same key value as `VITE_SUPABASE_PUBLISHABLE_KEY`)
  - Naming difference: `VITE_` prefix exposes to frontend; `SUPABASE_` runtime names are internal
- These backend secrets should NOT be hardcoded in `.env` — they're managed through Lovable Cloud → Backend Secrets
- Each function runs in a Deno runtime with full access to environment secrets

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

For full local dev with Supabase emulation, run Supabase locally:

```bash
supabase start  # Starts local Postgres, Auth, Storage, edge function emulator
```

This creates:
- Local PostgreSQL database (run `supabase status` to see connection details; default: `postgresql://localhost:54322/postgres`)
- Supabase Auth emulator
- Edge functions emulator on `http://localhost:54321`
- Storage emulator

**Note:** Local Supabase requires Docker. For development against production Supabase, skip this step and proceed to `.env` setup.

### 3. Environment File (`.env`)

The `.env` file is auto-managed by Lovable Cloud. For local development, ensure you have the current keys:

**Option A: Copy from Lovable Cloud (Recommended)**
```bash
# From Lovable Cloud project → Backend → API keys, copy these to .env:
cat > .env << EOF
SUPABASE_URL=https://aizkqajrzkvwuobisnzr.supabase.co
VITE_SUPABASE_URL=https://aizkqajrzkvwuobisnzr.supabase.co
VITE_SUPABASE_PROJECT_ID=aizkqajrzkvwuobisnzr
VITE_SUPABASE_PUBLISHABLE_KEY=<your sb_publishable_* key from Lovable>
EOF
```

**Option B: Use local Supabase (if running `supabase start`)**
```bash
# After running `supabase start`, Supabase CLI outputs local keys
# Copy them to .env for local development:
supabase start
supabase status  # Shows local keys
```

⚠️ **If you see an `eyJ...` key in .env**: This is a legacy JWT format that may cause 401 errors. Update it from Lovable Cloud → Backend → API keys to get the current `sb_publishable_*` key.

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
| **Email not sending** | Run `email-ops-status` function; check sender secrets in Lovable |
| **Function timeout** | Increase timeout in `config.toml`, or optimize function code |
| **Auth failing (401 Unauthorized)** | Check JWT in function code; ensure `verify_jwt` setting matches. A common cause is missing the `Authorization: ****** header when calling admin/protected functions (even when `verify_jwt = false`, custom guards still check for this header). If your VITE_SUPABASE_PUBLISHABLE_KEY starts with `eyJ...` (JWT format), it's deprecated. Look in Lovable Cloud → Backend → API keys for a key starting with `sb_publishable_*` and update .env |
| **Legacy JWT "invalid_grant" errors** | Supabase disabled the old JWT key family. Update VITE_SUPABASE_PUBLISHABLE_KEY from Lovable Cloud → Backend → API keys |
| **Migration not applying** | Verify `.sql` syntax; check `supabase db push` output for errors |
| **Local Supabase connection refused** | Ensure `supabase start` is running and Docker daemon is active |
| **Edge function not deploying** | Verify function is in `supabase/functions/` and has `index.ts`; check CI/CD logs in GitHub |

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

## 11. Current Project State & Recent Updates (July 2026)

### Verified Components
- ✅ **Database**: 128 migrations deployed and synced with Git
- ✅ **Edge Functions**: 23 functions deployed and auto-updating with each commit
- ✅ **Email System**: Resend integration verified; 5 sender email addresses configured
- ✅ **Auth**: Supabase Auth with admin/user roles via custom guards
- ✅ **API Keys**: VITE_SUPABASE_PUBLISHABLE_KEY updated to current format (legacy JWT keys deprecated)
- ✅ **DNS**: `notify.peninsulaequine.systems` verified in Resend with SPF/DKIM/DMARC

### Recent Changes
- Migrated from legacy JWT anon keys to new `sb_publishable_*` format
- Added 12 new edge functions: `submit-inquiry`, `validate-inquiry-upload`, `mgmt-db-lints`, `mint-josh-preview`, `preview-mint-check`, `publish-log-ingest`, `report-publish-failure`, `run-graph-smoke-test`, `send-welcome-series`, `create-staff-account`, `notify-dns-propagated`, `verify-admin-login`
- Expanded inquiry system with validation and automation
- Added management/admin-only functions with custom authentication guards
- Implemented comprehensive database integrity checks via `mgmt-db-lints`

### Next Steps / Known Limitations
- Local Supabase development requires Docker installation
- Email deliverability monitoring should be regular (use `email-ops-status` endpoint)
- Migration naming convention uses UUIDs (auto-generated by Supabase CLI) — use descriptive names in commit messages

---

## 12. Useful Links

- **Supabase documentation:** https://supabase.com/docs
- **Deno (edge function runtime):** https://deno.land/manual
- **Lovable Cloud:** https://lovable.dev
- **Resend (email provider):** https://resend.com/docs
- **PostgreSQL docs:** https://www.postgresql.org/docs/
- **@supabase/supabase-js v2 docs:** https://supabase.com/docs/reference/javascript/v2

---

## 13. Support & Escalation

- **Supabase outages/issues:** Check supabase.com/status
- **Lovable Cloud support:** https://lovable.dev/support
- **Resend email issues:** https://resend.com/support
- **Repository issues:** Open a GitHub issue in `spinandspurco-pixel/https-peninsulaequine-com-au`

For production incidents, refer to **RUNBOOK.md** for escalation procedures.

---

**Last updated:** July 2, 2026  
**Project ID:** `aizkqajrzkvwuobisnzr`  
**Canonical domain:** `peninsulaequine.systems`  
**Verified Status:** All components tested and operational
