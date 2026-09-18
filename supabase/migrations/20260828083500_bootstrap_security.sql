-- Restrict bootstrap_mission function execution to authenticated users only
REVOKE EXECUTE ON FUNCTION public.bootstrap_mission() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bootstrap_mission() TO authenticated;
