
-- Add trainer_id column to lesson_slots
ALTER TABLE public.lesson_slots ADD COLUMN trainer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- RLS: Trainers can insert their own slots
CREATE POLICY "Trainers can create own slots"
ON public.lesson_slots
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'trainer'::app_role) AND trainer_id = auth.uid());

-- RLS: Trainers can update their own slots
CREATE POLICY "Trainers can update own slots"
ON public.lesson_slots
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'trainer'::app_role) AND trainer_id = auth.uid())
WITH CHECK (has_role(auth.uid(), 'trainer'::app_role) AND trainer_id = auth.uid());

-- RLS: Trainers can delete their own slots
CREATE POLICY "Trainers can delete own slots"
ON public.lesson_slots
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'trainer'::app_role) AND trainer_id = auth.uid());
