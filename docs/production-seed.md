# Staff Roles — Source of Truth & Deploy Sync

## Source of truth
**`public.staff_role_allowlist`** (table). Edit rows there to add/remove staff or change a role. A future HQ admin screen can manage it; the CSV was a one-time import only.

## How sync works
- `public.seed_staff_roles()` — idempotent backfill. Reads the allowlist, inserts matching `user_roles` rows for any existing `auth.users`. **Does not hardcode emails.** `SECURITY DEFINER`, `service_role` only.
- **On deploy:** the migration calls `seed_staff_roles()` once, so every publish that ships a migration re-syncs Live.
- **Daily safety net:** `pg_cron` job `seed-staff-roles-daily` at 03:15 UTC. Skipped gracefully if `pg_cron` isn't installed.
- **On first sign-in:** `bootstrap_user_role()` (locked to `authenticated`) self-heals from the allowlist.

## Manual re-run (Cloud → Run SQL, Live)
```sql
SELECT * FROM public.seed_staff_roles();
```
Returns one row per allowlisted email with `out_backfilled = true` once the user has signed in at least once.

## Add a new staff member
```sql
INSERT INTO public.staff_role_allowlist (email, role)
VALUES ('new.person@peninsulaequine.systems', 'admin')
ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role;

SELECT public.seed_staff_roles();
```

## Verification
```sql
SELECT email, role FROM public.staff_role_allowlist ORDER BY email;

SELECT u.email, ur.role
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE lower(u.email::text) IN (
  'info@peninsulaequine.systems',
  'josh.dales@peninsulaequine.systems'
)
ORDER BY u.email;

SELECT jobname, schedule FROM cron.job WHERE jobname = 'seed-staff-roles-daily';
```
