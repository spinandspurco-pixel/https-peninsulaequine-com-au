
-- Scheduled messages table for auto-send timing logic
CREATE TABLE public.scheduled_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL DEFAULT 'quote',  -- 'quote' or 'lead'
  entity_id uuid NOT NULL,
  step_number integer NOT NULL DEFAULT 1,
  channel text NOT NULL DEFAULT 'email',  -- 'email' or 'sms'
  template_type text NOT NULL,  -- soft_check_in, value_reframe, decision_prompt, close_loop, scope_check_in, invitation_to_proceed
  scheduled_at timestamp with time zone NOT NULL,
  original_scheduled_at timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',  -- scheduled, due_soon, ready, sent, paused, skipped, overdue, cancelled
  automation_mode text NOT NULL DEFAULT 'assisted',  -- manual, assisted, auto_send
  client_name text NOT NULL,
  client_email text,
  client_phone text,
  subject_line text,
  message_body text,
  assigned_to text,
  sent_at timestamp with time zone,
  paused_at timestamp with time zone,
  skipped_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.scheduled_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage scheduled messages"
ON public.scheduled_messages FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Message templates table
CREATE TABLE public.message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key text NOT NULL UNIQUE,
  flow_type text NOT NULL DEFAULT 'quote',  -- 'quote' or 'lead'
  channel text NOT NULL DEFAULT 'email',
  subject text,
  body text NOT NULL,
  step_number integer NOT NULL DEFAULT 1,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage message templates"
ON public.message_templates FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Updated_at triggers
CREATE TRIGGER update_scheduled_messages_updated_at
BEFORE UPDATE ON public.scheduled_messages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_message_templates_updated_at
BEFORE UPDATE ON public.message_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default message templates
INSERT INTO public.message_templates (template_key, flow_type, channel, subject, body, step_number) VALUES
  ('soft_check_in', 'quote', 'email', 'Following up on your proposal', 'Hi {{client_name}}, I wanted to check in and see if you had any questions about the proposal we sent through for {{project_ref}}. Happy to walk through anything or adjust scope if needed.', 1),
  ('value_reframe', 'quote', 'email', 'A note about your project', 'Hi {{client_name}}, just a quick note — projects like yours benefit significantly from getting the ground right first. Happy to discuss timing or phasing if that helps.', 2),
  ('decision_prompt', 'quote', 'sms', NULL, 'Hi {{client_name}}, just checking in on the proposal for {{project_ref}}. Happy to chat if you have any questions — Ciro, Peninsula Equine', 3),
  ('close_loop', 'quote', 'email', 'Closing the loop on your proposal', 'Hi {{client_name}}, I wanted to follow up one last time on the proposal for {{project_ref}}. If now is not the right time, no problem at all — the quote remains valid and we are here when you are ready.', 4),
  ('scope_check_in', 'lead', 'email', 'Next steps for your project', 'Hi {{client_name}}, thanks for your enquiry. I wanted to check in and see if you had any further thoughts on scope or timing. Happy to arrange a site visit to discuss options.', 1),
  ('invitation_to_proceed', 'lead', 'email', 'Ready when you are', 'Hi {{client_name}}, just following up on our earlier conversation. If you are ready to move forward, I can put together a detailed proposal. No rush — just want to make sure we are available when you need us.', 2);
