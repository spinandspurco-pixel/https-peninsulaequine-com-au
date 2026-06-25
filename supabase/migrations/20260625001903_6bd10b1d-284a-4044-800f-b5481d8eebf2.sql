-- Drop the no-op column REVOKE (it was masked by the table-wide grant) and do it properly.
-- 1. Strip the broad SELECT for authenticated/anon so column-level grants can take effect.
REVOKE SELECT ON public.staff_profiles FROM authenticated;
REVOKE SELECT ON public.staff_profiles FROM anon;

-- 2. Re-grant SELECT on every column EXCEPT phone for authenticated.
--    Admin / self phone access continues to flow through public.list_staff_directory(),
--    which is SECURITY DEFINER and bypasses table grants.
GRANT SELECT (
  user_id,
  display_name,
  title,
  timezone,
  avatar_url,
  avatar_path,
  bio,
  active,
  created_at,
  updated_at
) ON public.staff_profiles TO authenticated;

-- 3. anon stays with no SELECT at all — RLS already blocks it and there is no
--    legitimate anon read path for staff profiles.