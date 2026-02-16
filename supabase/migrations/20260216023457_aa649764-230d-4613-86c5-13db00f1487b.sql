
-- =========================================
-- ADMIN-MANAGED SERVICES
-- =========================================
CREATE TABLE public.managed_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sort_order integer NOT NULL DEFAULT 0,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  short_description text,
  description text,
  features text[] NOT NULL DEFAULT '{}',
  starting_price text,
  icon text DEFAULT 'arena',
  image_url text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.managed_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active services"
  ON public.managed_services FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage services"
  ON public.managed_services FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_managed_services_updated_at
  BEFORE UPDATE ON public.managed_services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- ADMIN-MANAGED TESTIMONIALS
-- =========================================
CREATE TABLE public.managed_testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sort_order integer NOT NULL DEFAULT 0,
  client_name text NOT NULL,
  client_role text,
  quote text NOT NULL,
  rating integer NOT NULL DEFAULT 5,
  media_type text, -- 'image' | 'video' | null
  media_url text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.managed_testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active testimonials"
  ON public.managed_testimonials FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage testimonials"
  ON public.managed_testimonials FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_managed_testimonials_updated_at
  BEFORE UPDATE ON public.managed_testimonials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- ADMIN-MANAGED EVENTS
-- =========================================
CREATE TABLE public.managed_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  event_time time,
  location text,
  capacity integer,
  image_url text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.managed_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active events"
  ON public.managed_events FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage events"
  ON public.managed_events FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_managed_events_updated_at
  BEFORE UPDATE ON public.managed_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
