
CREATE TABLE public.dns_notify_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX dns_notify_sends_user_sent_at_idx
  ON public.dns_notify_sends (user_id, sent_at DESC);

GRANT SELECT ON public.dns_notify_sends TO authenticated;
GRANT ALL ON public.dns_notify_sends TO service_role;

ALTER TABLE public.dns_notify_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read dns notify sends"
  ON public.dns_notify_sends
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
