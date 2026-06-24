
REVOKE EXECUTE ON FUNCTION public.bootstrap_user_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bootstrap_user_role() TO authenticated, service_role;
