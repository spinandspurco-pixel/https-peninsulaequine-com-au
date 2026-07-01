ALTER TABLE public.managed_testimonials ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;
ALTER TABLE public.managed_events ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_managed_testimonials_featured ON public.managed_testimonials(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_managed_events_featured ON public.managed_events(featured) WHERE featured = true;