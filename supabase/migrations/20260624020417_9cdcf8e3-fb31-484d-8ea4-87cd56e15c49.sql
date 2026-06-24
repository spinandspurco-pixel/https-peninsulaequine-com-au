
-- 1. Additive columns on managed_services
ALTER TABLE public.managed_services
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS summary text,
  ADD COLUMN IF NOT EXISTS body text,
  ADD COLUMN IF NOT EXISTS cta_label text,
  ADD COLUMN IF NOT EXISTS cta_url text,
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS updated_by uuid;

-- 2. Additive columns on managed_events
ALTER TABLE public.managed_events
  ADD COLUMN IF NOT EXISTS summary text,
  ADD COLUMN IF NOT EXISTS body text,
  ADD COLUMN IF NOT EXISTS cta_label text,
  ADD COLUMN IF NOT EXISTS cta_url text,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS updated_by uuid;

-- 3. Additive columns on managed_testimonials (client_context complements existing client_role)
ALTER TABLE public.managed_testimonials
  ADD COLUMN IF NOT EXISTS client_context text,
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS updated_by uuid;

-- 4. New cms_gallery_items table
CREATE TABLE IF NOT EXISTS public.cms_gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text,
  image_url text NOT NULL,
  alt_text text,
  caption text,
  project text,
  location text,
  category text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid
);

-- 5. Grants (Data API requires explicit grants)
GRANT SELECT ON public.cms_gallery_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_gallery_items TO authenticated;
GRANT ALL ON public.cms_gallery_items TO service_role;

-- 6. RLS + policies — mirror managed_* style
ALTER TABLE public.cms_gallery_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active gallery items"
  ON public.cms_gallery_items
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage gallery items"
  ON public.cms_gallery_items
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 7. updated_at trigger (reuses existing public.update_updated_at_column())
DROP TRIGGER IF EXISTS trg_cms_gallery_items_updated_at ON public.cms_gallery_items;
CREATE TRIGGER trg_cms_gallery_items_updated_at
  BEFORE UPDATE ON public.cms_gallery_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Helpful indexes
CREATE INDEX IF NOT EXISTS idx_cms_gallery_items_active_sort
  ON public.cms_gallery_items (is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_cms_gallery_items_category
  ON public.cms_gallery_items (category);
