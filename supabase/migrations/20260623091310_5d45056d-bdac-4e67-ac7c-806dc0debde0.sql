
-- 1. Normalize legacy status values
UPDATE public.inquiries SET status = 'in-progress' WHERE status IN ('reviewed','qualified');
UPDATE public.inquiries SET status = 'won' WHERE status = 'completed';

-- 2. Employee access on inquiries
CREATE POLICY "Employees can view inquiries"
  ON public.inquiries FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'employee'::app_role));

CREATE POLICY "Employees can update inquiries"
  ON public.inquiries FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'employee'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'employee'::app_role));

-- 3. inquiry_notes table
CREATE TABLE public.inquiry_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id uuid NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  author_email text,
  body text NOT NULL CHECK (length(trim(body)) > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX inquiry_notes_inquiry_id_created_at_idx
  ON public.inquiry_notes (inquiry_id, created_at DESC);

GRANT SELECT, INSERT, DELETE ON public.inquiry_notes TO authenticated;
GRANT ALL ON public.inquiry_notes TO service_role;

ALTER TABLE public.inquiry_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view inquiry notes"
  ON public.inquiry_notes FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'employee'::app_role)
  );

CREATE POLICY "Staff can add inquiry notes"
  ON public.inquiry_notes FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'employee'::app_role)
    )
  );

CREATE POLICY "Admins can delete inquiry notes"
  ON public.inquiry_notes FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. inquiry_activity table
CREATE TABLE public.inquiry_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id uuid NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  actor_id uuid,
  actor_email text,
  from_value text,
  to_value text,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX inquiry_activity_inquiry_id_created_at_idx
  ON public.inquiry_activity (inquiry_id, created_at DESC);

GRANT SELECT, INSERT ON public.inquiry_activity TO authenticated;
GRANT ALL ON public.inquiry_activity TO service_role;

ALTER TABLE public.inquiry_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view inquiry activity"
  ON public.inquiry_activity FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'employee'::app_role)
  );

-- Inserts happen via SECURITY DEFINER triggers; no direct-insert policy needed.

-- 5. Triggers
CREATE OR REPLACE FUNCTION public.log_inquiry_created()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.inquiry_activity(inquiry_id, event_type, to_value, detail)
  VALUES (NEW.id, 'created', NEW.status, 'Inquiry submitted');
  RETURN NEW;
END $$;

CREATE TRIGGER trg_inquiry_created
  AFTER INSERT ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.log_inquiry_created();

CREATE OR REPLACE FUNCTION public.log_inquiry_status_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_email text;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    SELECT email::text INTO v_email FROM auth.users WHERE id = auth.uid();
    INSERT INTO public.inquiry_activity(inquiry_id, event_type, actor_id, actor_email, from_value, to_value)
    VALUES (NEW.id, 'status_changed', auth.uid(), v_email, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_inquiry_status_changed
  AFTER UPDATE ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.log_inquiry_status_change();

CREATE OR REPLACE FUNCTION public.log_inquiry_note_added()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.inquiry_activity(inquiry_id, event_type, actor_id, actor_email, detail)
  VALUES (NEW.inquiry_id, 'note_added', NEW.author_id, NEW.author_email, left(NEW.body, 240));
  RETURN NEW;
END $$;

CREATE TRIGGER trg_inquiry_note_added
  AFTER INSERT ON public.inquiry_notes
  FOR EACH ROW EXECUTE FUNCTION public.log_inquiry_note_added();
