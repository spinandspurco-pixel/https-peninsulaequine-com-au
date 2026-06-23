
-- ── project_notes ─────────────────────────────────────────
CREATE TABLE public.project_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.managed_projects(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  body text NOT NULL CHECK (length(trim(body)) > 0 AND length(body) <= 8000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX project_notes_project_idx     ON public.project_notes (project_id, created_at DESC);
CREATE INDEX project_notes_author_idx      ON public.project_notes (author_id);
CREATE INDEX project_notes_active_idx      ON public.project_notes (project_id) WHERE deleted_at IS NULL;

GRANT SELECT, INSERT, UPDATE ON public.project_notes TO authenticated;
GRANT ALL ON public.project_notes TO service_role;

ALTER TABLE public.project_notes ENABLE ROW LEVEL SECURITY;

-- Read: admin, moderator, employee, trainer (NEVER preview, NEVER anon)
CREATE POLICY "Internal staff read project notes"
  ON public.project_notes FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'moderator'::app_role)
      OR public.has_role(auth.uid(), 'employee'::app_role)
      OR public.has_role(auth.uid(), 'trainer'::app_role)
    )
  );

-- Admins can see soft-deleted notes too
CREATE POLICY "Admins read all project notes"
  ON public.project_notes FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create: admin / moderator / employee (trainer read-only for now;
-- assignment-scoped writes will be added once a trainer-project link exists)
CREATE POLICY "Staff create project notes"
  ON public.project_notes FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'moderator'::app_role)
      OR public.has_role(auth.uid(), 'employee'::app_role)
    )
  );

-- Update: author can edit their own; admin can edit/soft-delete any
CREATE POLICY "Authors edit own notes"
  ON public.project_notes FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Admins edit any note"
  ON public.project_notes FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- updated_at trigger
CREATE TRIGGER project_notes_set_updated_at
  BEFORE UPDATE ON public.project_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Preview accounts cannot write (defence in depth — RLS already blocks them)
CREATE TRIGGER project_notes_block_preview_writes
  BEFORE INSERT OR UPDATE OR DELETE ON public.project_notes
  FOR EACH ROW EXECUTE FUNCTION public.block_preview_writes();


-- ── project_note_mentions ─────────────────────────────────
CREATE TABLE public.project_note_mentions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL REFERENCES public.project_notes(id) ON DELETE CASCADE,
  mentioned_user_id uuid NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (note_id, mentioned_user_id)
);

CREATE INDEX project_note_mentions_user_idx
  ON public.project_note_mentions (mentioned_user_id, read_at);
CREATE INDEX project_note_mentions_note_idx
  ON public.project_note_mentions (note_id);

GRANT SELECT, INSERT, UPDATE ON public.project_note_mentions TO authenticated;
GRANT ALL ON public.project_note_mentions TO service_role;

ALTER TABLE public.project_note_mentions ENABLE ROW LEVEL SECURITY;

-- Mentioned user sees their own mentions; admins see all
CREATE POLICY "Users read own mentions"
  ON public.project_note_mentions FOR SELECT
  TO authenticated
  USING (
    mentioned_user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

-- Staff creating a note may insert mention rows
CREATE POLICY "Staff create mentions"
  ON public.project_note_mentions FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'moderator'::app_role)
    OR public.has_role(auth.uid(), 'employee'::app_role)
  );

-- Mentioned user can mark their own mention as read; admins can update any
CREATE POLICY "Users update own mentions"
  ON public.project_note_mentions FOR UPDATE
  TO authenticated
  USING (mentioned_user_id = auth.uid())
  WITH CHECK (mentioned_user_id = auth.uid());

CREATE POLICY "Admins update any mention"
  ON public.project_note_mentions FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER project_note_mentions_block_preview_writes
  BEFORE INSERT OR UPDATE OR DELETE ON public.project_note_mentions
  FOR EACH ROW EXECUTE FUNCTION public.block_preview_writes();
