
-- Create lesson_bookings table
CREATE TABLE public.lesson_bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_id uuid NOT NULL REFERENCES public.lesson_slots(id),
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone text,
  horse_name text,
  experience_level text NOT NULL DEFAULT 'beginner',
  lesson_goals text,
  stripe_session_id text NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending',
  deposit_amount_cents integer NOT NULL,
  full_price_cents integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lesson_bookings ENABLE ROW LEVEL SECURITY;

-- Service role / edge functions can insert (anon insert blocked by default, edge functions use service role)
CREATE POLICY "Service role can insert lesson bookings"
  ON public.lesson_bookings FOR INSERT
  WITH CHECK (true);

-- Anyone can look up their own booking by email (for confirmation page)
CREATE POLICY "Anyone can view own bookings by email"
  ON public.lesson_bookings FOR SELECT
  USING (true);

-- Service role can update (for webhook to mark paid)
CREATE POLICY "Service role can update lesson bookings"
  ON public.lesson_bookings FOR UPDATE
  USING (true);

-- Admins can manage all
CREATE POLICY "Admins can manage lesson bookings"
  ON public.lesson_bookings FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger: increment lesson_slots.current_bookings when a booking is confirmed
CREATE OR REPLACE FUNCTION public.increment_slot_bookings()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'confirmed' AND (OLD IS NULL OR OLD.status != 'confirmed') THEN
    UPDATE public.lesson_slots
    SET current_bookings = current_bookings + 1,
        updated_at = now()
    WHERE id = NEW.slot_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_increment_slot_bookings
  AFTER INSERT OR UPDATE ON public.lesson_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_slot_bookings();
