
-- Allow a staff member to insert their own profile row (first-time self-edit)
CREATE POLICY "Staff can insert own profile"
  ON public.staff_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Tighten self-update: non-admins cannot flip the active flag on themselves
CREATE OR REPLACE FUNCTION public.staff_profiles_guard_active()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role)
     AND NEW.active IS DISTINCT FROM COALESCE(OLD.active, true)
  THEN
    RAISE EXCEPTION 'only admins can change active flag'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER staff_profiles_guard_active
  BEFORE INSERT OR UPDATE ON public.staff_profiles
  FOR EACH ROW EXECUTE FUNCTION public.staff_profiles_guard_active();
