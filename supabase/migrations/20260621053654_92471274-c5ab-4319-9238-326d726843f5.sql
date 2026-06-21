REVOKE EXECUTE ON FUNCTION public.is_e2e_test_user(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.list_staff_directory() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_staff_directory() TO authenticated;