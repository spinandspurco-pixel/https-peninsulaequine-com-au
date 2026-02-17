-- Add trainer column to managed_events for clinic-trainer association
ALTER TABLE public.managed_events
ADD COLUMN trainer TEXT;

-- Index for efficient trainer-based queries
CREATE INDEX idx_managed_events_trainer ON public.managed_events (trainer) WHERE trainer IS NOT NULL;