# Production Seed — Staff Roles (Automated)

Roles on Live are kept in sync **automatically**. You don't need to run anything by hand.

## How it works

1. **Source of truth:** `public.seed_staff_roles()` (database function, `SECURITY DEFINER`, `service_role` only).
   It upserts `staff_role_allowlist` and backfills `user_roles` for any matching `auth.users`. Fully idempotent.
2. **On deploy:** the migration that defines the function calls it once, so every publish that includes a migration re-seeds Live.
3. **Daily safety net:** `pg_cron` job `seed-staff-roles-daily` runs `SELECT public.seed_staff_roles();` at 03:15 UTC.
4. **On first sign-in:** `bootstrap_user_role()` (already in place, now locked to `authenticated`) self-heals a new user's `user_roles` from the allowlist.

## Current allowlist (canonical)

| email                                  | role    |
| -------------------------------------- | ------- |
| info@peninsulaequine.systems           | admin   |
| josh.dales@peninsulaequine.systems     | preview |

To add/change a staff role, edit the `INSERT … VALUES` block inside `seed_staff_roles()` via a new migration. Do **not** insert into `staff_role_allowlist` ad-hoc — the seeder will overwrite drift on the next run.

## Manual re-run (only if needed)

In Cloud → Run SQL, **Live** selected:

```sql
SELECT * FROM public.seed_staff_roles();
```

Returns one row per allowlisted email with `out_backfilled = true` once that user has signed in at least once.

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
