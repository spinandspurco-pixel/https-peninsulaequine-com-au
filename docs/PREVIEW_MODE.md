# Client Preview Mode — Operational Standard

Peninsula Equine HQ runs in two modes: **Staff** (full read/write Command
Centre) and **Client Preview** (view-only, share-safe). This document is the
permanent standard for how the preview environment is prepared, audited, and
released to a prospective client.

> No update — code, data, or migration — may cause real client information to
> appear inside the preview environment. The Preview Mint Gate exists to make
> that guarantee enforceable, not aspirational.

---

## 1 · Purpose of Client Preview mode

Client Preview is the view-only mirror of HQ that prospective clients,
sponsors, partners and recruits use to experience the Peninsula Equine
operating system without seeing live operational data.

It must feel **intentionally prepared** for the person signing in:

- Identity header reads their name and role (e.g. *Josh Dales · Client Preview*)
- Every record they encounter is a curated fictional client
- No surface reveals real names, emails, phones, addresses, deal values,
  internal notes, or operational drawers

If any of those guarantees slip, the preview is no longer share-safe.

---

## 2 · Demo-data requirements

Every row that may appear in a preview surface must satisfy **all** of the
following. The Preview Mint Gate enforces these automatically.

| Field          | Rule                                                                                                  |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| Name fields    | Must not contain any name on the placeholder blocklist (see §3)                                       |
| Email fields   | Domain must be one of: `example.com`, `example.org`, or a `peninsulaequine.*` domain. Nothing else.  |
| Phone fields   | Must be `NULL`, `0400 000 000`, or `+614 0000 00000`. No other AU mobile pattern is permitted.        |
| Address fields | Must not contain a digit + street-type word (e.g. `12 Smith Street`) in any committed seed migration. |
| Notes / scope  | Free-text fields may use natural prose, but must not embed real PII.                                  |

Preview-visible tables currently include: `inquiries`, `quotes`,
`managed_projects`, `managed_testimonials`, `client_followups`, `event_rsvps`,
`equus_ridge_interest`, `bookings`, `lesson_bookings`, `site_assessments`,
`newsletter_subscribers`.

The curated fictional cast in use today: Eleanor Whitcombe, James Holloway,
Margaux Devereux, Hugo Pemberton, Annika Sørensen, Roderick Ashworth,
Catriona Mackelvie, Tobias Lindqvist.

---

## 3 · Forbidden data types

The gate blocks merge / mint whenever any of the following is detected.

**Placeholder / generic identities** (word-boundary match, case-insensitive):

- `Josh Smith`, `Test User`, `Test Client`, `Demo User`, `Placeholder User`,
  `Placeholder`, `John Doe`, `Jane Doe`, `Lorem Ipsum`
- Literal `"Operator"` / `'Operator'` tokens in source

**Real-looking PII in any preview-visible table**:

- Email addresses outside the allowed-domain list → `real_email_domain`
- Phone numbers outside the fake-marker patterns → `real_phone_pii`

**Real-looking PII committed to source** (`supabase/migrations/**`):

- Email literals outside the allowed-domain list
- AU mobile patterns (`04xx xxx xxx`, `+614xxxxxxxx`) that are not the fake marker
- Street-address patterns (digit + street-type word)

---

## 4 · How to mint a preview account

1. Confirm the codebase scan passes locally: `bash scripts/preview-mint-check.sh`.
2. Open HQ → Operations → expand → **Client Preview Gate** → *Run pre-mint check*.
3. Wait for the lamp to read **Cleared — safe to mint**. If not, resolve every
   finding before continuing.
4. Create the auth user (e.g. `josh.dales@peninsulaequine.org`) and grant the
   `preview` role:
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('<auth-user-id>', 'preview');
   ```
5. Send the login. The identity directory in `src/components/hq/hqIdentity.ts`
   maps the email's local-part to the displayed name and role — add a new
   entry there if the account belongs to a named individual.

---

## 5 · How to regenerate demo datasets

When the demo dataset needs refreshing (new fictional clients, refreshed
quotes, additional pipeline depth):

1. Author a new migration under `supabase/migrations/` that:
   - Deletes the previous demo cohort by primary key or by the demo-domain
     email match.
   - Inserts the new cohort using only allowed email domains and fake-marker
     phones.
2. Run `bash scripts/preview-mint-check.sh` locally — it scans the migration
   file before commit.
3. Open the PR. The `Preview Mint Gate` CI job re-runs the same scan on the
   committed diff and blocks merge on any finding.
4. After merge and publish, run the HQ-side **Client Preview Gate** to confirm
   the live database reads clean.

Never edit demo data by hand in production. All demo data lives in versioned
migrations so the scan has something durable to inspect.

---

## 6 · What causes the Preview Mint Gate to fail

The gate has two enforcement points:

### CI (`scripts/preview-mint-check.sh`, required status check on `main`)

Fails the PR if any of the following are present in the diff:

- A blocklisted placeholder identity anywhere under `src/` or `supabase/`
- An email literal in `supabase/migrations/**` whose domain is not on the
  allowed list
- An AU mobile pattern in `supabase/migrations/**` that is not the fake marker
- A street-address pattern in `supabase/migrations/**`

### Runtime (`preview-mint-check` edge function, HQ admin only)

Fails the gate (lamp turns red, mint affordance locks) if any preview-visible
row contains:

- A blocklisted placeholder identity in a name column
- An email with a non-allowed domain (`real_email_domain`)
- A phone that is not NULL and not the fake marker (`real_phone_pii`)

Both checks must pass before sending Josh — or any future preview client — the
login.

---

## 7 · Branch protection

The CI workflow lives at `.github/workflows/preview-mint-check.yml`. To make
it merge-blocking, mark **Preview Mint Gate / Scan for forbidden preview
data** as a *required status check* under GitHub → Settings → Branches →
branch protection rule for `main`. Without that setting the workflow is
advisory only.
