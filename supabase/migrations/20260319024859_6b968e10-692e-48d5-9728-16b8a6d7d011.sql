
-- Automation settings: key-value toggles for each automation type
CREATE TABLE public.automation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.automation_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage automation settings"
  ON public.automation_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Activity log: audit trail of all system actions
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  action_type TEXT NOT NULL,
  action_level TEXT NOT NULL DEFAULT 'autonomous',
  category TEXT NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  description TEXT,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  performed_by TEXT NOT NULL DEFAULT 'system',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ
);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view activity log"
  ON public.activity_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert activity log"
  ON public.activity_log FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Approval queue: items requiring human review before action
CREATE TABLE public.approval_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  action_type TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal',
  title TEXT NOT NULL,
  description TEXT,
  draft_content TEXT,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  resolution TEXT
);

ALTER TABLE public.approval_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage approval queue"
  ON public.approval_queue FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed default automation settings (all OFF)
INSERT INTO public.automation_settings (setting_key, enabled, description, category) VALUES
  ('auto_enquiry_confirmations', false, 'Send enquiry confirmation emails automatically', 'communications'),
  ('auto_booking_confirmations', false, 'Send booking confirmation emails automatically', 'communications'),
  ('auto_assessment_reminders', false, 'Send site assessment reminders 24h before', 'communications'),
  ('auto_follow_ups', false, 'Send Day 2/5/10 follow-ups using approved templates', 'communications'),
  ('auto_crm_status_updates', false, 'Update CRM statuses based on completed actions', 'pipeline'),
  ('auto_daily_briefing', false, 'Generate daily founder briefing automatically', 'operations'),
  ('auto_alerts', false, 'Create alerts for overdue tasks, stale leads, low margins', 'operations'),
  ('auto_task_assignment', false, 'Assign admin tasks automatically based on routing rules', 'operations'),
  ('approval_required_mode', true, 'Require human approval for all Level 2 actions', 'safety');

-- Trigger to update updated_at
CREATE TRIGGER update_automation_settings_updated_at
  BEFORE UPDATE ON public.automation_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
