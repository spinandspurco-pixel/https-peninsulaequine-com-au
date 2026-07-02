CREATE TABLE IF NOT EXISTS public.publish_logs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  run_id       text NOT NULL,
  kind         text NOT NULL CHECK (kind IN ('typecheck','lint','test','build','publish','summary')),
  status       text NOT NULL CHECK (status IN ('pass','fail','skipped','info')),
  duration_ms  integer,
  commit_sha   text,
  actor        text,
  branch       text,
  log          text NOT NULL DEFAULT '',
  meta         jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS publish_logs_run_id_idx     ON public.publish_logs (run_id);
CREATE INDEX IF NOT EXISTS publish_logs_created_at_idx ON public.publish_logs (created_at DESC);
GRANT SELECT ON public.publish_logs TO authenticated;
GRANT ALL    ON public.publish_logs TO service_role;
ALTER TABLE public.publish_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admins read publish logs" ON public.publish_logs;
CREATE POLICY "admins read publish logs"
  ON public.publish_logs
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));