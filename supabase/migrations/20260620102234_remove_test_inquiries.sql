-- Remove obvious placeholder/test rows so the Client Preview dataset reads as
-- a fully curated fictional dataset (Whitcombe, Pemberton, Devereux, etc.).
DELETE FROM public.inquiries
WHERE name IN ('Test User', 'John Test Smith', 'Test Client')
   OR email = 'test@example.com'
   OR email = 'johntest@example.com';
