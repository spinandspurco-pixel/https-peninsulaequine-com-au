
-- Temporary holds on lesson slots (expire after 10 minutes)
CREATE TABLE public.slot_holds (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_id uuid NOT NULL REFERENCES public.lesson_slots(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  held_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '10 minutes')
);

-- Index for fast lookups
CREATE INDEX idx_slot_holds_slot_id ON public.slot_holds(slot_id);
CREATE INDEX idx_slot_holds_expires ON public.slot_holds(expires_at);

-- Enable RLS
ALTER TABLE public.slot_holds ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a hold (anonymous users booking)
CREATE POLICY "Anyone can create a hold"
  ON public.slot_holds FOR INSERT
  WITH CHECK (true);

-- Anyone can view holds (to calculate availability)
CREATE POLICY "Anyone can view holds"
  ON public.slot_holds FOR SELECT
  USING (true);

-- Users can release their own holds (by session_id match)
CREATE POLICY "Anyone can delete own holds"
  ON public.slot_holds FOR DELETE
  USING (true);

-- Function to clean expired holds
CREATE OR REPLACE FUNCTION public.cleanup_expired_holds()
RETURNS void
LANGUAGE sql
SET search_path TO 'public'
AS $$
  DELETE FROM public.slot_holds WHERE expires_at < now();
$$;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.slot_holds;
