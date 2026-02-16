
-- Create a settings table for admin-configurable integrations
CREATE TABLE public.integration_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write settings
CREATE POLICY "Admins can manage integration settings"
  ON public.integration_settings FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_integration_settings_updated_at
  BEFORE UPDATE ON public.integration_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create a database webhook trigger that calls sync-to-hubspot on new inquiries
CREATE OR REPLACE FUNCTION public.notify_hubspot_on_inquiry()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  hubspot_key text;
BEGIN
  -- Check if HubSpot API key is configured
  SELECT value INTO hubspot_key FROM public.integration_settings WHERE key = 'hubspot_api_key';
  
  IF hubspot_key IS NOT NULL AND hubspot_key != '' THEN
    -- Use pg_net to call the edge function asynchronously
    PERFORM net.http_post(
      url := current_setting('app.settings.supabase_url', true) || '/functions/v1/sync-to-hubspot',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'inquiry_id', NEW.id,
        'name', NEW.name,
        'email', NEW.email,
        'phone', NEW.phone,
        'services', NEW.services,
        'project_vision', NEW.project_vision,
        'project_details', NEW.project_details,
        'budget_range', NEW.budget_range,
        'preferred_start', NEW.preferred_start,
        'horse_name', NEW.horse_name,
        'horse_breed', NEW.horse_breed,
        'experience_level', NEW.experience_level,
        'status', NEW.status
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_hubspot_sync_on_inquiry
  AFTER INSERT ON public.inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_hubspot_on_inquiry();
