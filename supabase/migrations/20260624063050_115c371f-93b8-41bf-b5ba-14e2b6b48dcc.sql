-- Re-assert canonical allowlist seed (idempotent, safe on Test + Live)
INSERT INTO public.staff_role_allowlist (email, role) VALUES
  ('info@peninsulaequine.systems', 'admin'),
  ('josh.dales@peninsulaequine.systems', 'preview')
ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role;

-- Re-run backfill into user_roles for any matching auth.users
SELECT public.seed_staff_roles();

-- Verification function: returns a structured report of allowlist + user_roles state
CREATE OR REPLACE FUNCTION public.verify_staff_seed()
RETURNS TABLE(
  email text,
  expected_role public.app_role,
  allowlist_present boolean,
  auth_user_present boolean,
  user_role_present boolean,
  auth_uid uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH expected(email, expected_role) AS (
    VALUES
      ('info@peninsulaequine.systems'::text, 'admin'::public.app_role),
      ('josh.dales@peninsulaequine.systems'::text, 'preview'::public.app_role)
  )
  SELECT
    e.email,
    e.expected_role,
    EXISTS (SELECT 1 FROM public.staff_role_allowlist a
              WHERE a.email = e.email AND a.role = e.expected_role) AS allowlist_present,
    u.id IS NOT NULL AS auth_user_present,
    EXISTS (SELECT 1 FROM public.user_roles ur
              WHERE ur.user_id = u.id AND ur.role = e.expected_role) AS user_role_present,
    u.id AS auth_uid
  FROM expected e
  LEFT JOIN auth.users u ON lower(u.email::text) = e.email;
$$;

REVOKE ALL ON FUNCTION public.verify_staff_seed() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_staff_seed() TO service_role;
GRANT EXECUTE ON FUNCTION public.verify_staff_seed() TO authenticated;

-- Inline post-migration assertion: hard-fail if allowlist seed didn't take.
-- We do NOT fail when a matching auth.users row is missing (the user may not
-- have signed in yet on this environment), but we do log a NOTICE.
DO $verify$
DECLARE
  r RECORD;
  missing_allowlist text[] := ARRAY[]::text[];
  missing_user_role text[] := ARRAY[]::text[];
BEGIN
  FOR r IN SELECT * FROM public.verify_staff_seed() LOOP
    IF NOT r.allowlist_present THEN
      missing_allowlist := array_append(missing_allowlist, r.email);
    END IF;
    IF r.auth_user_present AND NOT r.user_role_present THEN
      missing_user_role := array_append(missing_user_role, r.email);
    END IF;
    RAISE NOTICE 'seed-verify % role=% allowlist=% auth_user=% user_role=%',
      r.email, r.expected_role, r.allowlist_present, r.auth_user_present, r.user_role_present;
  END LOOP;

  IF array_length(missing_allowlist, 1) > 0 THEN
    RAISE EXCEPTION 'staff seed verification failed: missing allowlist rows for %',
      array_to_string(missing_allowlist, ', ');
  END IF;

  IF array_length(missing_user_role, 1) > 0 THEN
    RAISE EXCEPTION 'staff seed verification failed: auth.users exist but user_roles missing for % (seed_staff_roles did not backfill)',
      array_to_string(missing_user_role, ', ');
  END IF;
END
$verify$;