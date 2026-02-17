
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can upload inquiry attachments" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read inquiry attachments" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete inquiry attachments" ON storage.objects;

-- Make bucket private
UPDATE storage.buckets SET public = false WHERE id = 'inquiry-attachments';

-- Allow anyone to upload files
CREATE POLICY "Anyone can upload inquiry attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'inquiry-attachments');

-- Only admins can read files
CREATE POLICY "Admins can read inquiry attachments"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'inquiry-attachments'
    AND has_role(auth.uid(), 'admin'::app_role)
  );

-- Only admins can delete files
CREATE POLICY "Admins can delete inquiry attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'inquiry-attachments'
    AND has_role(auth.uid(), 'admin'::app_role)
  );
