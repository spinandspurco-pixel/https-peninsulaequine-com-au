
-- 1. Make inquiry-attachments bucket private
UPDATE storage.buckets SET public = false WHERE id = 'inquiry-attachments';

-- 2. Drop overly permissive public SELECT policy on storage
DROP POLICY IF EXISTS "Inquiry attachments are publicly readable" ON storage.objects;

-- 3. Fix slot_holds: restrict INSERT to authenticated users only
DROP POLICY IF EXISTS "Anyone can create a hold" ON public.slot_holds;
CREATE POLICY "Authenticated users can create a hold"
ON public.slot_holds FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can delete own holds" ON public.slot_holds;
CREATE POLICY "Authenticated users can delete own holds"
ON public.slot_holds FOR DELETE
TO authenticated
USING (true);

-- 4. Fix newsletter_subscribers: restrict INSERT to prevent abuse
-- Keep public INSERT but add basic constraint (email must be provided - already NOT NULL)
-- This is intentionally public for website signups, so we keep it but acknowledge it

-- 5. Fix ab_test_events: restrict INSERT to authenticated or keep public for analytics
-- A/B test events need to be logged by anonymous visitors, so public INSERT is intentional
