-- Create storage bucket for inquiry attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'inquiry-attachments',
  'inquiry-attachments',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf', 'video/mp4', 'video/quicktime']
);

-- Allow anyone to upload to inquiry-attachments (public form, no auth required)
CREATE POLICY "Anyone can upload inquiry attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'inquiry-attachments');

-- Allow public read access
CREATE POLICY "Inquiry attachments are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'inquiry-attachments');

-- Add attachment_urls column to inquiries table
ALTER TABLE public.inquiries
ADD COLUMN attachment_urls text[] DEFAULT '{}';
