
CREATE TABLE public.email_diagnostic_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  triggered_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  triggered_by_email text,
  sender_key text NOT NULL,
  from_address text NOT NULL,
  recipient text NOT NULL,
  subject text,
  status text NOT NULL CHECK (status IN ('sent','failed')),
  resend_id text,
  error_message text,
  raw jsonb
);

CREATE INDEX email_diagnostic_log_created_at_idx ON public.email_diagnostic_log (created_at DESC);

GRANT SELECT ON public.email_diagnostic_log TO authenticated;
GRANT ALL ON public.email_diagnostic_log TO service_role;

ALTER TABLE public.email_diagnostic_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read diagnostic log"
  ON public.email_diagnostic_log
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
