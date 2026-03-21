
-- Add workflow tracking columns to groundlock_project_setups
ALTER TABLE public.groundlock_project_setups
  ADD COLUMN IF NOT EXISTS workflow_step text NOT NULL DEFAULT 'setup',
  ADD COLUMN IF NOT EXISTS system_zones text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS system_summary text,
  ADD COLUMN IF NOT EXISTS key_notes text,
  ADD COLUMN IF NOT EXISTS completion_photo_urls text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone;
