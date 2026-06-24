# Production Seed — Staff Roles

Run this in **Cloud → Run SQL** with the **Live** environment selected.
Idempotent: safe to re-run after every deploy.

## 1. Seed staff_role_allowlist + backfill user_roles

```sql
-- 1. Allowlist (idempotent)
INSERT INTO public.staff_role_allowlist (email, role) VALUES
  ('info@peninsulaequine.systems', 'admin'),
  ('josh.dales@peninsulaequine.systems', 'preview')
ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role;

-- 2. Backfill user_roles for any auth.users already on the allowlist
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, a.role
FROM auth.users u
JOIN public.staff_role_allowlist a ON lower(u.email::text) = a.email
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Lock bootstrap_user_role() to authenticated callers only
REVOKE ALL ON FUNCTION public.bootstrap_user_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bootstrap_user_role() TO authenticated;
```

## 2. Verification

```sql
-- Allowlist rows
SELECT email, role FROM public.staff_role_allowlist ORDER BY email;

-- Resolved roles by email (info should show admin; josh shows preview if his auth user exists)
SELECT u.email, ur.role
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE lower(u.email::text) IN (
  'info@peninsulaequine.systems',
  'josh.dales@peninsulaequine.systems'
)
ORDER BY u.email;

-- Function grants (should show authenticated)
SELECT grantee, privilege_type
FROM information_schema.role_routine_grants
WHERE routine_name = 'bootstrap_user_role';
```

## 3. After-deploy checklist

1. Run section 1 against **Live** (idempotent).
2. Run section 2; confirm `info@peninsulaequine.systems → admin`.
3. If a new staff member signs in for the first time, `bootstrap_user_role()` self-heals their `user_roles` from the allowlist — but only if their email is in section 1. Add new emails there first.
4. Josh: once he signs in to production once, re-run section 1 (or just the backfill insert) and his `user_roles` row will appear.
