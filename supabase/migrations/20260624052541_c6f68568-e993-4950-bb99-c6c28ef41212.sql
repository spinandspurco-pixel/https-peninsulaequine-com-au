
-- One-time idempotent allowlist seed (managed in-table from now on)
INSERT INTO public.staff_role_allowlist (email, role) VALUES
  ('info@peninsulaequine.systems', 'admin'),
  ('josh.dales@peninsulaequine.systems', 'preview')
ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role;

-- Allowlist-driven backfill; emails NOT hardcoded
CREATE OR REPLACE FUNCTION public.seed_staff_roles()
RETURNS TABLE(out_email text, out_role public.app_role, out_backfilled boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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

REVOKE ALL ON FUNCTION public.seed_staff_roles() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.seed_staff_roles() TO service_role;

-- Run once now (deploy-time backfill)
SELECT public.seed_staff_roles();

-- Daily auto-sync — only if pg_cron is available; never fail the migration
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    BEGIN
      PERFORM cron.unschedule('seed-staff-roles-daily')
        WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'seed-staff-roles-daily');
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    BEGIN
      PERFORM cron.schedule(
        'seed-staff-roles-daily',
        '15 3 * * *',
        $cron$ SELECT public.seed_staff_roles(); $cron$
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'pg_cron schedule skipped: %', SQLERRM;
    END;
  ELSE
    RAISE NOTICE 'pg_cron not installed — daily auto-sync skipped; manual seed_staff_roles() remains available';
  END IF;
END $$;
