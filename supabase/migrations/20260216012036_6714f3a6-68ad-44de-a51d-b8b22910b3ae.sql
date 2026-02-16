
-- Bookings table for confirmed appointments
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID REFERENCES public.inquiries(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  service_type TEXT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'confirmed',
  assigned_to UUID,
  notes TEXT,
  reminder_sent BOOLEAN NOT NULL DEFAULT false,
  reminder_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage all bookings"
  ON public.bookings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Employees can view bookings assigned to them
CREATE POLICY "Employees can view assigned bookings"
  ON public.bookings FOR SELECT
  USING (assigned_to = auth.uid());

-- Employees can update status of assigned bookings
CREATE POLICY "Employees can update assigned bookings"
  ON public.bookings FOR UPDATE
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for bookings
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
