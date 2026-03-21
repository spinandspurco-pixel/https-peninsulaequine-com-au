
-- Add share token for public client access
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS share_token uuid DEFAULT gen_random_uuid() UNIQUE;

-- Add GroundLock toggle
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS groundlock_included boolean DEFAULT false;

-- Add acceptance tracking fields
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS accepted_by_name text;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS accepted_by_email text;

-- Add property/location display name for client header
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS property_name text;

-- Add project overview text
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS project_overview text;

-- RLS: Allow public read access via share_token
CREATE POLICY "Public can view quotes by share token"
ON public.quotes
FOR SELECT
TO public
USING (share_token IS NOT NULL);

-- RLS: Allow public to update quotes for acceptance (restricted columns via app logic)
CREATE POLICY "Public can accept quotes via share token"
ON public.quotes
FOR UPDATE
TO public
USING (share_token IS NOT NULL AND status = 'sent')
WITH CHECK (share_token IS NOT NULL);

-- Allow public to read line items for shared quotes
CREATE POLICY "Public can view line items for shared quotes"
ON public.quote_line_items
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.quotes
    WHERE quotes.id = quote_line_items.quote_id
    AND quotes.share_token IS NOT NULL
  )
);
