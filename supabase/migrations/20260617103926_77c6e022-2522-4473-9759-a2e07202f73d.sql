-- Drop GroundLock-specific objects (post site refactor)

-- 1. Drop dependent function (uses groundlock_proposals)
DROP FUNCTION IF EXISTS public.generate_proposal_ref() CASCADE;

-- 2. Drop GroundLock tables
DROP TABLE IF EXISTS public.groundlock_proposals CASCADE;
DROP TABLE IF EXISTS public.groundlock_project_setups CASCADE;
DROP TABLE IF EXISTS public.groundlock_interest CASCADE;

-- 3. Drop unused groundlock_included column on quotes and client_portal_projects
ALTER TABLE public.quotes DROP COLUMN IF EXISTS groundlock_included;
ALTER TABLE public.client_portal_projects DROP COLUMN IF EXISTS groundlock_included;