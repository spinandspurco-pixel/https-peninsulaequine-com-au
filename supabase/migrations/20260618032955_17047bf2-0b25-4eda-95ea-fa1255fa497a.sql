
CREATE TABLE public.lumenarc_briefing_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  property_context TEXT,
  source TEXT DEFAULT 'lumenarc_teaser',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT INSERT ON public.lumenarc_briefing_requests TO anon, authenticated;
GRANT ALL ON public.lumenarc_briefing_requests TO service_role;
ALTER TABLE public.lumenarc_briefing_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a briefing request"
  ON public.lumenarc_briefing_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND length(email) BETWEEN 5 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND (name IS NULL OR length(name) <= 120)
    AND (property_context IS NULL OR length(property_context) <= 600)
  );
