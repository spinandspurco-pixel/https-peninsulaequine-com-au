ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS attachments jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Backfill from existing attachment_urls so older rows expose the same shape.
UPDATE public.inquiries
SET attachments = COALESCE(
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'path', p,
        'name', regexp_replace(p, '^.*/', ''),
        'size', NULL,
        'mime', NULL,
        'uploaded_at', NULL
      )
    )
    FROM unnest(attachment_urls) AS p
  ),
  '[]'::jsonb
)
WHERE (attachments IS NULL OR attachments = '[]'::jsonb)
  AND attachment_urls IS NOT NULL
  AND array_length(attachment_urls, 1) > 0;