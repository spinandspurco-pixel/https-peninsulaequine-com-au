
ALTER TABLE public.managed_testimonials
ADD COLUMN service_tags text[] NOT NULL DEFAULT '{}'::text[];
