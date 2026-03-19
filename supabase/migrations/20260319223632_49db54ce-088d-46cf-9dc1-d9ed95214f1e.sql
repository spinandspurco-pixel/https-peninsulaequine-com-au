
-- Create storage bucket for staff document photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('staff-document-photos', 'staff-document-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Staff (admin, employee, trainer) can upload photos
CREATE POLICY "Staff can upload document photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'staff-document-photos'
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'employee'::public.app_role)
    OR public.has_role(auth.uid(), 'trainer'::public.app_role)
  )
);

-- Staff can view their own uploads (folder = user id)
CREATE POLICY "Staff can view own document photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'staff-document-photos'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

-- Staff can delete their own uploads
CREATE POLICY "Staff can delete own document photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'staff-document-photos'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);
