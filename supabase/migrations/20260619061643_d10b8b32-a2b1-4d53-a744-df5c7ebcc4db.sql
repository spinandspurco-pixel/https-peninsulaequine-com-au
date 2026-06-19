-- Remove PII-bearing tables from the supabase_realtime publication so row-change
-- events (including client_name/email/phone and RSVP PII) are no longer broadcast
-- to any authenticated subscriber. None of the app's client code subscribes to
-- these channels; admin views read on demand via the Data API with RLS enforced.
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['bookings', 'event_rsvps', 'lesson_slots', 'slot_holds']
  LOOP
    IF EXISTS (
      SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime'
         AND schemaname = 'public'
         AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime DROP TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;