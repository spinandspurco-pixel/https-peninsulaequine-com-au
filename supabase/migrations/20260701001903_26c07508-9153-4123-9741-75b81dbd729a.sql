
CREATE TABLE public.oauth_provider_config (
  provider TEXT PRIMARY KEY,
  intended_client_id TEXT,
  expected_redirect_uri TEXT,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.oauth_provider_config TO authenticated;
GRANT ALL ON public.oauth_provider_config TO service_role;

ALTER TABLE public.oauth_provider_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view oauth provider config"
  ON public.oauth_provider_config FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert oauth provider config"
  ON public.oauth_provider_config FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update oauth provider config"
  ON public.oauth_provider_config FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete oauth provider config"
  ON public.oauth_provider_config FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.oauth_provider_config_touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER oauth_provider_config_set_updated_at
  BEFORE UPDATE ON public.oauth_provider_config
  FOR EACH ROW
  EXECUTE FUNCTION public.oauth_provider_config_touch_updated_at();
