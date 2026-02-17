-- Remove the overly permissive public INSERT policy on lesson_bookings
DROP POLICY IF EXISTS "Service role can insert lesson bookings" ON public.lesson_bookings;