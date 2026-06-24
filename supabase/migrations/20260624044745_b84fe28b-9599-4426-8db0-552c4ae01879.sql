
-- Staff role allowlist: maps email -> role for automatic bootstrap on first sign-in.
CREATE TABLE IF NOT EXISTS public.staff_role_allowlist (
  email text PRIMARY KEY,
  role public.app_role NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT staff_role_allowlist_email_lowercase CHECK (email = lower(email))
);

GRANT SELECT ON public.staff_role_allowlist TO authenticated;
GRANT ALL ON public.staff_role_allowlist TO service_role;

ALTER TABLE public.staff_role_allowlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage allowlist"
  ON public.staff_role_allowlist
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Authenticated can read allowlist"
  ON public.staff_role_allowlist
  FOR SELECT
  TO authenticated
  USING (true);

CREATE TRIGGER staff_role_allowlist_updated_at
  BEFORE UPDATE ON public.staff_role_allowlist
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed canonical mappings.
INSERT INTO public.staff_role_allowlist (email, role, notes) VALUES
  ('info@peninsulaequine.systems', 'admin',   'HQ admin account'),
  ('josh.dales@peninsulaequine.systems', 'preview', 'Client preview login')
ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role, notes = EXCLUDED.notes, updated_at = now();

-- Bootstrap function: caller's email is matched against the allowlist; missing
-- roles are inserted into public.user_roles. Returns the resolved role list.
-- SECURITY DEFINER so it bypasses user_roles RLS for the insert path only.
CREATE OR REPLACE FUNCTION public.bootstrap_user_role()
RETURNS public.app_role[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_email text;
  v_role public.app_role;
  v_roles public.app_role[];
BEGIN
  IF v_uid IS NULL THEN
    RETURN ARRAY[]::public.app_role[];
  END IF;

  SELECT lower(email::text) INTO v_email FROM auth.users WHERE id = v_uid;
  IF v_email IS NULL THEN
    RETURN ARRAY[]::public.app_role[];
  END IF;

  SELECT role INTO v_role
    FROM public.staff_role_allowlist
   WHERE email = v_email;

  IF v_role IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_uid, v_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  SELECT COALESCE(array_agg(role), ARRAY[]::public.app_role[])
    INTO v_roles
    FROM public.user_roles
   WHERE user_id = v_uid;

  RETURN v_roles;
END;
$$;

REVOKE ALL ON FUNCTION public.bootstrap_user_role() FROM public;
GRANT EXECUTE ON FUNCTION public.bootstrap_user_role() TO authenticated;

-- Backfill: any existing auth user whose email matches the allowlist and has no
-- matching user_roles row gets it added now. Safe & idempotent.
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, a.role
  FROM auth.users u
  JOIN public.staff_role_allowlist a ON a.email = lower(u.email::text)
  LEFT JOIN public.user_roles ur ON ur.user_id = u.id AND ur.role = a.role
 WHERE ur.user_id IS NULL
ON CONFLICT (user_id, role) DO NOTHING;
