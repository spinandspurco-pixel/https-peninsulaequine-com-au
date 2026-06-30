
CREATE TABLE public.deploy_health_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email text,
  action text NOT NULL,
  status text,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  user_agent text
);

CREATE INDEX deploy_health_audit_created_at_idx
  ON public.deploy_health_audit (created_at DESC);

GRANT SELECT, INSERT ON public.deploy_health_audit TO authenticated;
GRANT ALL ON public.deploy_health_audit TO service_role;

ALTER TABLE public.deploy_health_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read deploy health audit"
  ON public.deploy_health_audit
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admins insert deploy health audit"
  ON public.deploy_health_audit
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    AND actor_user_id = auth.uid()
  );
