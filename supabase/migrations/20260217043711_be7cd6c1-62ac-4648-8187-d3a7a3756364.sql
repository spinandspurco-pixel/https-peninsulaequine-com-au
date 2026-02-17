-- Add double-opt-in columns to newsletter_subscribers
ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS confirmed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS confirm_token uuid DEFAULT gen_random_uuid();

-- Index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_confirm_token ON public.newsletter_subscribers(confirm_token) WHERE confirmed = false;