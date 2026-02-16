
-- Lesson availability slots — admin defines when lessons are available
CREATE TABLE public.lesson_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  slot_type text NOT NULL DEFAULT 'lesson', -- lesson type: beginner, intermediate, advanced, or generic 'lesson'
  max_bookings integer NOT NULL DEFAULT 1,
  current_bookings integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

ALTER TABLE public.lesson_slots ENABLE ROW LEVEL SECURITY;

-- Anyone can view slots (for the availability calendar)
CREATE POLICY "Anyone can view lesson slots"
  ON public.lesson_slots FOR SELECT
  USING (true);

-- Only admins can manage slots
CREATE POLICY "Admins can manage lesson slots"
  ON public.lesson_slots FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_lesson_slots_updated_at
  BEFORE UPDATE ON public.lesson_slots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for live availability updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.lesson_slots;

-- Create index for fast date lookups
CREATE INDEX idx_lesson_slots_date ON public.lesson_slots (slot_date);
