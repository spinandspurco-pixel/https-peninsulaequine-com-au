
-- Table for MLPGS interest registrations
CREATE TABLE public.mlpgs_interest (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mlpgs_interest ENABLE ROW LEVEL SECURITY;

-- Anyone can register interest (public form)
CREATE POLICY "Anyone can register interest"
ON public.mlpgs_interest
FOR INSERT
WITH CHECK (true);

-- Admins can view registrations
CREATE POLICY "Admins can view interest registrations"
ON public.mlpgs_interest
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete registrations
CREATE POLICY "Admins can delete interest registrations"
ON public.mlpgs_interest
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
