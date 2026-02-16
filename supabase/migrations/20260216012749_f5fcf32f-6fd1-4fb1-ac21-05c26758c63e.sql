-- Enable realtime for event_rsvps so guest list auto-updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_rsvps;

-- Allow anyone to view RSVPs (for public guest count / attendee list)
CREATE POLICY "Anyone can view RSVP counts"
  ON public.event_rsvps FOR SELECT
  USING (true);
