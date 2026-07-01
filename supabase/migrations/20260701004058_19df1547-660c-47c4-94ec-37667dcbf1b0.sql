
DROP POLICY IF EXISTS "Admins can upload inquiry attachments" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload inquiry attachments" ON storage.objects;

CREATE POLICY "Public can upload inquiry attachments"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'inquiry-attachments');
