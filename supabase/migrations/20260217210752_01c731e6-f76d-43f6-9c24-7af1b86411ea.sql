-- Remove the overly permissive public SELECT policy on inquiry attachments
-- Admins already have their own SELECT policy; signed URLs via the edge function use the service role
DROP POLICY IF EXISTS "Inquiry attachments are publicly readable" ON storage.objects;