-- Add lead routing columns
ALTER TABLE public.inquiries 
  ADD COLUMN IF NOT EXISTS lead_tier text DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS lead_tags text[] DEFAULT '{}'::text[];

-- Auto-tag function based on budget + services
CREATE OR REPLACE FUNCTION public.auto_tag_inquiry()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  tier text := 'standard';
  tags text[] := '{}';
BEGIN
  -- Tier based on budget
  CASE NEW.budget_range
    WHEN '100k-plus', '100k-250k', '250k-plus' THEN tier := 'premium';
    WHEN '50k-100k' THEN tier := 'high';
    WHEN '15k-50k', '25k-50k' THEN tier := 'standard';
    ELSE tier := 'starter';
  END CASE;

  -- Tag by service type
  IF NEW.services && ARRAY['full-facility'] THEN
    tags := array_append(tags, 'full-build');
    IF tier != 'premium' THEN tier := 'high'; END IF;
  END IF;
  IF NEW.services && ARRAY['arena-construction', 'barn-construction'] THEN
    tags := array_append(tags, 'construction');
  END IF;
  IF NEW.services && ARRAY['riding-lessons'] THEN
    tags := array_append(tags, 'lessons');
  END IF;
  IF NEW.services && ARRAY['clinics-events'] THEN
    tags := array_append(tags, 'events');
  END IF;
  IF NEW.services && ARRAY['fencing', 'round-pens', 'infrastructure'] THEN
    tags := array_append(tags, 'site-work');
  END IF;
  IF NEW.services && ARRAY['renovations'] THEN
    tags := array_append(tags, 'renovation');
  END IF;

  -- Tag preferred service
  IF NEW.preferred_service IS NOT NULL AND NEW.preferred_service != '' THEN
    tags := array_append(tags, 'priority:' || NEW.preferred_service);
  END IF;

  -- Tag experience
  IF NEW.experience_level = 'professional' THEN
    tags := array_append(tags, 'pro-client');
  END IF;

  NEW.lead_tier := tier;
  NEW.lead_tags := tags;
  RETURN NEW;
END;
$$;

-- Trigger on insert and update
CREATE TRIGGER trg_auto_tag_inquiry
  BEFORE INSERT OR UPDATE ON public.inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_tag_inquiry();