
-- A/B test events table for tracking impressions and conversions
CREATE TABLE public.ab_test_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_name TEXT NOT NULL,
  variant TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'impression' or 'click'
  visitor_id TEXT NOT NULL, -- anonymous localStorage ID
  page_path TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ab_test_events ENABLE ROW LEVEL SECURITY;

-- Anyone can INSERT events (anonymous tracking)
CREATE POLICY "Anyone can log ab test events"
  ON public.ab_test_events FOR INSERT
  WITH CHECK (true);

-- Only admins can read events (for stats)
CREATE POLICY "Admins can view ab test events"
  ON public.ab_test_events FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete events
CREATE POLICY "Admins can delete ab test events"
  ON public.ab_test_events FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Index for fast aggregation queries
CREATE INDEX idx_ab_test_events_lookup ON public.ab_test_events (test_name, variant, event_type);
CREATE INDEX idx_ab_test_events_created ON public.ab_test_events (created_at DESC);
