
-- Nurture email tracking table
CREATE TABLE public.inquiry_nurture (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id uuid NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  client_email text NOT NULL,
  step integer NOT NULL DEFAULT 0,
  next_send_at timestamp with time zone NOT NULL DEFAULT now(),
  completed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(inquiry_id)
);

ALTER TABLE public.inquiry_nurture ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage nurture" ON public.inquiry_nurture
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage nurture" ON public.inquiry_nurture
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Trigger to auto-create nurture row when inquiry is inserted
CREATE OR REPLACE FUNCTION public.create_nurture_on_inquiry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.inquiry_nurture (inquiry_id, client_name, client_email, step, next_send_at)
  VALUES (NEW.id, NEW.name, NEW.email, 0, now() + interval '1 hour')
  ON CONFLICT (inquiry_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_create_nurture_on_inquiry
  AFTER INSERT ON public.inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.create_nurture_on_inquiry();
