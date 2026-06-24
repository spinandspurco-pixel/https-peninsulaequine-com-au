
CREATE TABLE public.staff_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  title text,
  phone text,
  timezone text DEFAULT 'Australia/Melbourne',
  avatar_url text,
  avatar_path text,
  bio text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_profiles TO authenticated;
GRANT ALL ON public.staff_profiles TO service_role;

ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read active staff profiles"
  ON public.staff_profiles FOR SELECT
  TO authenticated
  USING (active = true OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Staff can update own profile"
  ON public.staff_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage staff profiles"
  ON public.staff_profiles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER staff_profiles_block_preview_writes
  BEFORE INSERT OR UPDATE OR DELETE ON public.staff_profiles
  FOR EACH ROW EXECUTE FUNCTION public.block_preview_writes();

CREATE TRIGGER staff_profiles_set_updated_at
  BEFORE UPDATE ON public.staff_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP FUNCTION IF EXISTS public.list_staff_directory();

CREATE FUNCTION public.list_staff_directory()
 RETURNS TABLE(
   user_id uuid,
   role app_role,
   created_at timestamp with time zone,
   email text,
   display_name text,
   title text,
   phone text,
   timezone text,
   avatar_url text,
   bio text,
   active boolean,
   last_active timestamp with time zone,
   is_test_account boolean
 )
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
    sp.phone,
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

CREATE POLICY "Authenticated can read staff avatars"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'staff-avatars');

CREATE POLICY "Admins can upload staff avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'staff-avatars'
    AND public.has_role(auth.uid(), 'admin'::public.app_role)
  );

CREATE POLICY "Admins can update staff avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'staff-avatars'
    AND public.has_role(auth.uid(), 'admin'::public.app_role)
  );

CREATE POLICY "Admins can delete staff avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'staff-avatars'
    AND public.has_role(auth.uid(), 'admin'::public.app_role)
  );
