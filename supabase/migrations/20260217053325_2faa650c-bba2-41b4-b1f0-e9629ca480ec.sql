-- Add trainer column to managed_testimonials for trainer-based filtering
ALTER TABLE public.managed_testimonials
ADD COLUMN trainer text;

-- Index for faster trainer filtering
CREATE INDEX idx_managed_testimonials_trainer ON public.managed_testimonials (trainer) WHERE trainer IS NOT NULL;