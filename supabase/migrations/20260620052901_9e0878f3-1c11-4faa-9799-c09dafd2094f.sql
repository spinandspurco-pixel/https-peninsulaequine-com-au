
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'bookings'
    ) THEN
      EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.bookings';
    END IF;
    IF EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'event_rsvps'
    ) THEN
      EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.event_rsvps';
    END IF;
  END IF;
END;
$$;
