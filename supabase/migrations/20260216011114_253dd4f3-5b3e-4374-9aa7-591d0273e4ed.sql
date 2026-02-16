
-- Create table for event RSVPs
CREATE TABLE public.event_rsvps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  guests INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an RSVP
CREATE POLICY "Anyone can submit RSVP"
  ON public.event_rsvps
  FOR INSERT
  WITH CHECK (true);

-- Admins can view all RSVPs
CREATE POLICY "Admins can view RSVPs"
  ON public.event_rsvps
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete RSVPs
CREATE POLICY "Admins can delete RSVPs"
  ON public.event_rsvps
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));
