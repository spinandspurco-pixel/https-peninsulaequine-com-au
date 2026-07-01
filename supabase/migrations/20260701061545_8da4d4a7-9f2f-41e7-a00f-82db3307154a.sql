DROP POLICY IF EXISTS "Public can upload inquiry attachments" ON storage.objects;

CREATE POLICY "Public can upload inquiry attachments"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'inquiry-attachments'
  AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND octet_length(coalesce(name, '')) BETWEEN 40 AND 300
);