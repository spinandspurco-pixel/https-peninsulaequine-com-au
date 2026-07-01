CREATE TABLE public.attachments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_id uuid REFERENCES public.inquiries(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  bucket text NOT NULL DEFAULT 'inquiry-attachments',
  storage_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text NOT NULL,
  file_size bigint NOT NULL,
  checksum text,
  status text NOT NULL DEFAULT 'uploaded',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX attachments_inquiry_id_idx ON public.attachments(inquiry_id);
CREATE INDEX attachments_owner_id_idx ON public.attachments(owner_id);
CREATE INDEX attachments_created_at_idx ON public.attachments(created_at DESC);
CREATE UNIQUE INDEX attachments_storage_path_idx ON public.attachments(bucket, storage_path);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.attachments TO authenticated;
GRANT ALL ON public.attachments TO service_role;

ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all attachments"
  ON public.attachments FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Owners can view own attachments"
  ON public.attachments FOR SELECT
  USING (owner_id IS NOT NULL AND owner_id = auth.uid());

CREATE POLICY "Owners can insert own attachments"
  ON public.attachments FOR INSERT
  WITH CHECK (owner_id IS NOT NULL AND owner_id = auth.uid());

CREATE POLICY "Owners can update own attachments"
  ON public.attachments FOR UPDATE
  USING (owner_id IS NOT NULL AND owner_id = auth.uid())
  WITH CHECK (owner_id IS NOT NULL AND owner_id = auth.uid());

CREATE POLICY "Owners can delete own attachments"
  ON public.attachments FOR DELETE
  USING (owner_id IS NOT NULL AND owner_id = auth.uid());

CREATE TRIGGER update_attachments_updated_at
  BEFORE UPDATE ON public.attachments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER block_preview_attachments_writes
  BEFORE INSERT OR UPDATE OR DELETE ON public.attachments
  FOR EACH ROW EXECUTE FUNCTION public.block_preview_writes();