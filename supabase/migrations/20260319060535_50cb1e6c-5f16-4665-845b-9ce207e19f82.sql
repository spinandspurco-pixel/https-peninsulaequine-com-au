
ALTER TABLE public.inquiries 
  ADD COLUMN IF NOT EXISTS deal_value numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS probability integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS expected_value numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deal_stage text DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS last_contact_at timestamp with time zone;

CREATE OR REPLACE FUNCTION public.compute_expected_value()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path TO 'public'
AS $$
BEGIN
  NEW.expected_value := COALESCE(NEW.deal_value, 0) * COALESCE(NEW.probability, 0) / 100.0;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_compute_expected_value
  BEFORE INSERT OR UPDATE OF deal_value, probability ON public.inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.compute_expected_value();
