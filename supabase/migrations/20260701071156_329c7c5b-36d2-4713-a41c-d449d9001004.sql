
CREATE TABLE public.inquiry_attachments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_id uuid NULL REFERENCES public.inquiries(id) ON DELETE SET NULL,
  folder text NOT NULL,
  filename text NOT NULL,
  size_bytes bigint NOT NULL CHECK (size_bytes > 0),
  mime_type text NOT NULL,
  storage_path text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX inquiry_attachments_inquiry_id_idx ON public.inquiry_attachments (inquiry_id);
CREATE INDEX inquiry_attachments_folder_idx ON public.inquiry_attachments (folder);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.inquiry_attachments TO authenticated;
GRANT ALL ON public.inquiry_attachments TO service_role;

ALTER TABLE public.inquiry_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view inquiry attachments"
  ON public.inquiry_attachments FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update inquiry attachments"
  ON public.inquiry_attachments FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete inquiry attachments"
  ON public.inquiry_attachments FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- No INSERT policy for authenticated/anon: inserts are performed by the
-- validate-inquiry-upload edge function using the service role, which
-- bypasses RLS.

CREATE TRIGGER inquiry_attachments_set_updated_at
  BEFORE UPDATE ON public.inquiry_attachments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
