-- Migration: add attachments table and create_inquiry_with_attachments RPC
-- File: supabase/migrations/20260701_add_attachments_and_create_inquiry_fn.sql

-- Drop any overly-broad anonymous INSERT policy for storage.objects (if present)
DROP POLICY IF EXISTS "Public can upload inquiry attachments" ON storage.objects;

-- Restrict client INSERTs: allow only authenticated users to INSERT into the inquiry-attachments bucket.
-- If you prefer server-only uploads (recommended), remove this policy entirely so only the service role can insert.
CREATE POLICY IF NOT EXISTS "Authenticated can insert to inquiry-attachments"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'inquiry-attachments');

-- Create attachments table for per-file metadata, scan status, and audit trail
CREATE TABLE IF NOT EXISTS public.attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id uuid NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
  bucket_id text NOT NULL DEFAULT 'inquiry-attachments',
  object_path text NOT NULL,
  filename text NOT NULL,
  content_type text NULL,
  size bigint NULL,
  checksum text NULL,
  uploaded_by uuid NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  scan_status text NOT NULL DEFAULT 'pending', -- pending | scanning | clean | infected | failed
  scan_result jsonb NULL,
  metadata jsonb NULL
);

CREATE INDEX IF NOT EXISTS idx_attachments_inquiry_id ON public.attachments (inquiry_id);

-- RPC: insert an inquiry and atomically link attachments by id
CREATE OR REPLACE FUNCTION public.create_inquiry_with_attachments(
  p_name text,
  p_email text,
  p_phone text,
  p_property_location text,
  p_property_type text,
  p_services text[],
  p_budget_range text,
  p_preferred_start text,
  p_project_details text,
  p_notes text,
  p_attachment_ids uuid[]
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  inserted_row public.inquiries%ROWTYPE;
BEGIN
  INSERT INTO public.inquiries
    (name, email, phone, property_location, property_type, services, budget_range, preferred_start, project_details, notes, created_at)
  VALUES
    (p_name, p_email, p_phone, p_property_location, p_property_type, p_services, p_budget_range, p_preferred_start, p_project_details, p_notes, now())
  RETURNING * INTO inserted_row;

  IF p_attachment_ids IS NOT NULL AND array_length(p_attachment_ids, 1) > 0 THEN
    -- Only link attachments that are currently unlinked to avoid reassigning attachments
    UPDATE public.attachments
    SET inquiry_id = inserted_row.id
    WHERE id = ANY(p_attachment_ids) AND inquiry_id IS NULL;
  END IF;

  RETURN row_to_json(inserted_row)::jsonb;
END;
$$;
