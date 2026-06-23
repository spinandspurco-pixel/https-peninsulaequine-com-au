
CREATE OR REPLACE FUNCTION public.list_staff_for_mentions()
RETURNS TABLE(user_id uuid, email text, display_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT
    ur.user_id,
    u.email::text AS email,
    COALESCE(u.raw_user_meta_data ->> 'display_name', split_part(u.email::text, '@', 1)) AS display_name
  FROM public.user_roles ur
  JOIN auth.users u ON u.id = ur.user_id
  WHERE ur.role IN ('admin','moderator','employee','trainer')
    AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'moderator'::app_role)
      OR public.has_role(auth.uid(), 'employee'::app_role)
      OR public.has_role(auth.uid(), 'trainer'::app_role)
    )
  ORDER BY display_name;
$$;

REVOKE EXECUTE ON FUNCTION public.list_staff_for_mentions() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.list_staff_for_mentions() TO authenticated;
