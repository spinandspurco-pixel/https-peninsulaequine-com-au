
-- Add pricing columns to managed_events
ALTER TABLE public.managed_events
  ADD COLUMN price text DEFAULT NULL,
  ADD COLUMN early_bird_price text DEFAULT NULL,
  ADD COLUMN early_bird_deadline date DEFAULT NULL;
