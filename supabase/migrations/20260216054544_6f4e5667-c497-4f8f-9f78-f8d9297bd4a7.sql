-- Add status column to event_rsvps for waitlist tracking
ALTER TABLE public.event_rsvps
  ADD COLUMN status text NOT NULL DEFAULT 'confirmed';

-- Add index for efficient status-based queries
CREATE INDEX idx_event_rsvps_status ON public.event_rsvps (event_id, status);