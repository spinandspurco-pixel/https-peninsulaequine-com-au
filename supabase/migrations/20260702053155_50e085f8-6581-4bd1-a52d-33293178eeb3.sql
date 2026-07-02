
CREATE POLICY "Admins read publish failure attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'publish-failure-attachments'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins upload publish failure attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'publish-failure-attachments'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins delete publish failure attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'publish-failure-attachments'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);
