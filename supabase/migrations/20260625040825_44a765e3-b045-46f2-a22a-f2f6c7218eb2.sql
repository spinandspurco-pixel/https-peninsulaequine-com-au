
CREATE TABLE public.graph_smoke_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  triggered_by_email text,
  environment text NOT NULL DEFAULT 'cloud',
  result text NOT NULL CHECK (result IN ('PASS','FAIL','RUNNING')),
  exit_code integer NOT NULL DEFAULT 0,
  error_message text,
  duration_ms integer,
  report jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.graph_smoke_reports TO authenticated;
GRANT ALL ON public.graph_smoke_reports TO service_role;

ALTER TABLE public.graph_smoke_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read smoke reports"
  ON public.graph_smoke_reports FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Service role manages smoke reports"
  ON public.graph_smoke_reports FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX graph_smoke_reports_created_at_idx
  ON public.graph_smoke_reports (created_at DESC);
