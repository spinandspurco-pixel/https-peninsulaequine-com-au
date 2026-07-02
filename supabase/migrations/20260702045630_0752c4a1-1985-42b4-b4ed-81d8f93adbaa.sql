
CREATE OR REPLACE FUNCTION public.get_latest_deploy_status()
RETURNS TABLE(
  run_id uuid,
  status text,
  failing_step text,
  failing_phase text,
  failing_hint text,
  commit_short text,
  branch text,
  finished_at timestamptz,
  duration_ms integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH latest AS (
    SELECT run_id, max(created_at) AS finished_at
      FROM public.publish_logs
     GROUP BY run_id
     ORDER BY max(created_at) DESC
     LIMIT 1
  )
  SELECT
    l.run_id::uuid,
    COALESCE(s.status, 'info')::text AS status,
    NULLIF(s.meta ->> 'failing_step', '')::text AS failing_step,
    NULLIF(s.meta ->> 'failing_phase', '')::text AS failing_phase,
    NULLIF(s.meta ->> 'failing_hint', '')::text AS failing_hint,
    left(coalesce(s.commit_sha, ''), 7) AS commit_short,
    s.branch,
    l.finished_at,
    s.duration_ms
  FROM latest l
  LEFT JOIN public.publish_logs s
    ON s.run_id = l.run_id AND s.kind = 'summary'
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_latest_deploy_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_latest_deploy_status() TO anon, authenticated, service_role;
