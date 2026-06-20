-- Reports true when the user was provisioned by the e2e-seed-users edge
-- function. SECURITY DEFINER so callers don't need direct access to
-- auth.users. Safe to call from RLS-protected client code.
CREATE OR REPLACE FUNCTION public.is_e2e_test_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT (raw_user_meta_data ->> 'is_e2e_test')::boolean
       FROM auth.users
      WHERE id = _user_id),
    false
  );
$$;

REVOKE ALL ON FUNCTION public.is_e2e_test_user(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_e2e_test_user(uuid) TO authenticated;

-- Admin-only staff directory. Returns empty for non-admins (defence in
-- depth: even if a UI guard ever slipped, preview / employee / trainer
-- accounts cannot enumerate test users). Joins user_roles with auth.users
-- so the Staff Directory can render email, display name, and the test flag.
CREATE OR REPLACE FUNCTION public.list_staff_directory()
RETURNS TABLE(
  user_id uuid,
  role app_role,
  created_at timestamptz,
  email text,
  display_name text,
  is_test_account boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ur.user_id,
    ur.role,
    ur.created_at,
    u.email::text,
    COALESCE(u.raw_user_meta_data ->> 'display_name', NULL) AS display_name,
    COALESCE((u.raw_user_meta_data ->> 'is_e2e_test')::boolean, false) AS is_test_account
  FROM public.user_roles ur
  LEFT JOIN auth.users u ON u.id = ur.user_id
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
  ORDER BY ur.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.list_staff_directory() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_staff_directory() TO authenticated;