CREATE TABLE public.groundlock_interest (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  interest_type TEXT NOT NULL DEFAULT 'property',
  property_type TEXT,
  location TEXT,
  estimated_area TEXT,
  message TEXT,
  source_page TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.groundlock_interest ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can register GroundLock interest"
ON public.groundlock_interest
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Admins can view GroundLock interest"
ON public.groundlock_interest
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage GroundLock interest"
ON public.groundlock_interest
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));