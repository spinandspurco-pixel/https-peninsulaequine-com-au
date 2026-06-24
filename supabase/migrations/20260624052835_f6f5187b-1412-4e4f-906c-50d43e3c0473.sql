
CREATE OR REPLACE FUNCTION public.seed_staff_roles()
RETURNS TABLE(out_email text, out_role public.app_role, out_backfilled boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins (or the service role bypassing RLS) may run this from the client
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'forbidden: admin role required' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  SELECT u.id, a.role
  FROM auth.users u
  JOIN public.staff_role_allowlist a ON lower(u.email::text) = a.email
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN QUERY
    SELECT a.email,
           a.role,
           EXISTS (
             SELECT 1 FROM auth.users u
             JOIN public.user_roles ur ON ur.user_id = u.id
             WHERE lower(u.email::text) = a.email AND ur.role = a.role
           )
    FROM public.staff_role_allowlist a
    ORDER BY a.email;
END;
$$;

REVOKE ALL ON FUNCTION public.seed_staff_roles() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.seed_staff_roles() TO authenticated, service_role;
