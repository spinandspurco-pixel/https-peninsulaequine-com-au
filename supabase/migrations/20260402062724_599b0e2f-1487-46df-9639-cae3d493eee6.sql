CREATE TABLE public.equus_ridge_interest (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  interest_type TEXT NOT NULL DEFAULT 'general',
  message TEXT,
  source_page TEXT DEFAULT 'equus-ridge',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.equus_ridge_interest ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can register Equus Ridge interest"
  ON public.equus_ridge_interest
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view Equus Ridge interest"
  ON public.equus_ridge_interest
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage Equus Ridge interest"
  ON public.equus_ridge_interest
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));