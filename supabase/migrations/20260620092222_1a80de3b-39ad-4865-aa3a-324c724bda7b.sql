DROP POLICY IF EXISTS "Anyone can upload inquiry attachments" ON storage.objects;

CREATE POLICY "Admins can upload inquiry attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'inquiry-attachments'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

REVOKE EXECUTE ON FUNCTION public.block_preview_writes() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.block_preview_writes() FROM anon;