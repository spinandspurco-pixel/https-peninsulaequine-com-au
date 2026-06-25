-- Column-level lockdown: anon and authenticated can no longer read phone via the Data API.
-- Admins / self-reads continue to work via the SECURITY DEFINER directory RPC below.
REVOKE SELECT (phone) ON public.staff_profiles FROM anon;
REVOKE SELECT (phone) ON public.staff_profiles FROM authenticated;

-- Redact phone in the directory RPC for non-admin, non-self callers.
CREATE OR REPLACE FUNCTION public.list_staff_directory()
 RETURNS TABLE(user_id uuid, role app_role, created_at timestamp with time zone, email text, display_name text, title text, phone text, timezone text, avatar_url text, bio text, active boolean, last_active timestamp with time zone, is_test_account boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    ur.user_id,
    ur.role,
    ur.created_at,
    u.email::text,
    COALESCE(
      sp.display_name,
      u.raw_user_meta_data ->> 'display_name',
      u.raw_user_meta_data ->> 'full_name',
      u.raw_user_meta_data ->> 'name'
    ) AS display_name,
    sp.title,
    CASE
      WHEN public.has_role(auth.uid(), 'admin'::app_role) THEN sp.phone
      WHEN ur.user_id = auth.uid() THEN sp.phone
      ELSE NULL
    END AS phone,
    sp.timezone,
    sp.avatar_url,
    sp.bio,
    COALESCE(sp.active, true) AS active,
    u.last_sign_in_at AS last_active,
    COALESCE((u.raw_user_meta_data ->> 'is_e2e_test')::boolean, false) AS is_test_account
  FROM public.user_roles ur
  LEFT JOIN auth.users u ON u.id = ur.user_id
  LEFT JOIN public.staff_profiles sp ON sp.user_id = ur.user_id
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
     OR ur.user_id = auth.uid()
     OR COALESCE(sp.active, true) = true
  ORDER BY ur.created_at DESC;
$function$;