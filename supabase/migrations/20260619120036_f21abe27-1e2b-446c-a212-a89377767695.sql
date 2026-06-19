CREATE TABLE public.client_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  payload jsonb,
  page_path text,
  user_agent text,
  viewport_w integer,
  viewport_h integer,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT INSERT ON public.client_logs TO anon;
GRANT ALL ON public.client_logs TO service_role;

ALTER TABLE public.client_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anonymous users can insert client logs"
  ON public.client_logs FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Service role can read client logs"
  ON public.client_logs FOR SELECT
  TO service_role
  USING (true);