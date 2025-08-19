-- Create languages table
CREATE TABLE public.languages (
  code text PRIMARY KEY,
  name text NOT NULL,
  native_name text NOT NULL,
  flag_emoji text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "languages_select_all" ON public.languages FOR SELECT USING (true);
CREATE POLICY "languages_admin_manage" ON public.languages FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Insert supported languages
INSERT INTO public.languages (code, name, native_name, flag_emoji, is_active) VALUES
  ('en', 'English', 'English', '🇺🇸', true),
  ('es', 'Spanish', 'Español', '🇪🇸', true),
  ('ro', 'Romanian', 'Română', '🇷🇴', true);

-- Create life_category_translations table
CREATE TABLE public.life_category_translations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid NOT NULL REFERENCES public.life_categories(id) ON DELETE CASCADE,
  language_code text NOT NULL REFERENCES public.languages(code) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(category_id, language_code)
);

-- Enable RLS
ALTER TABLE public.life_category_translations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "life_category_translations_select_all" ON public.life_category_translations FOR SELECT USING (true);
CREATE POLICY "life_category_translations_admin_manage" ON public.life_category_translations FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Create life_subcategory_translations table
CREATE TABLE public.life_subcategory_translations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subcategory_id uuid NOT NULL REFERENCES public.life_subcategories(id) ON DELETE CASCADE,
  language_code text NOT NULL REFERENCES public.languages(code) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(subcategory_id, language_code)
);

-- Enable RLS
ALTER TABLE public.life_subcategory_translations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "life_subcategory_translations_select_all" ON public.life_subcategory_translations FOR SELECT USING (true);
CREATE POLICY "life_subcategory_translations_admin_manage" ON public.life_subcategory_translations FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Create text_translations table for UI texts
CREATE TABLE public.text_translations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL,
  language_code text NOT NULL REFERENCES public.languages(code) ON DELETE CASCADE,
  value text NOT NULL,
  context text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(key, language_code)
);

-- Enable RLS
ALTER TABLE public.text_translations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "text_translations_select_all" ON public.text_translations FOR SELECT USING (true);
CREATE POLICY "text_translations_admin_manage" ON public.text_translations FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Create triggers for updated_at
CREATE TRIGGER update_life_category_translations_updated_at
  BEFORE UPDATE ON public.life_category_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_life_subcategory_translations_updated_at
  BEFORE UPDATE ON public.life_subcategory_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_text_translations_updated_at
  BEFORE UPDATE ON public.text_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get translated category name
CREATE OR REPLACE FUNCTION public.get_category_name(p_category_id uuid, p_language_code text DEFAULT 'en')
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (SELECT name FROM public.life_category_translations 
     WHERE category_id = p_category_id AND language_code = p_language_code),
    (SELECT name FROM public.life_category_translations 
     WHERE category_id = p_category_id AND language_code = 'en'),
    (SELECT name FROM public.life_categories WHERE id = p_category_id)
  );
$$;

-- Function to get translated subcategory name
CREATE OR REPLACE FUNCTION public.get_subcategory_name(p_subcategory_id uuid, p_language_code text DEFAULT 'en')
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (SELECT name FROM public.life_subcategory_translations 
     WHERE subcategory_id = p_subcategory_id AND language_code = p_language_code),
    (SELECT name FROM public.life_subcategory_translations 
     WHERE subcategory_id = p_subcategory_id AND language_code = 'en'),
    (SELECT name FROM public.life_subcategories WHERE id = p_subcategory_id)
  );
$$;

-- Function to get translated text
CREATE OR REPLACE FUNCTION public.get_text(p_key text, p_language_code text DEFAULT 'en')
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (SELECT value FROM public.text_translations 
     WHERE key = p_key AND language_code = p_language_code),
    (SELECT value FROM public.text_translations 
     WHERE key = p_key AND language_code = 'en'),
    p_key
  );
$$;

-- View for categories with translations
CREATE VIEW public.v_categories_with_translations AS
SELECT 
  c.id,
  c.slug,
  c.display_order,
  c.color,
  c.icon,
  c.created_at,
  jsonb_object_agg(
    ct.language_code, 
    jsonb_build_object(
      'name', ct.name,
      'description', ct.description
    )
  ) FILTER (WHERE ct.language_code IS NOT NULL) AS translations,
  c.name as fallback_name
FROM public.life_categories c
LEFT JOIN public.life_category_translations ct ON c.id = ct.category_id
GROUP BY c.id, c.slug, c.display_order, c.color, c.icon, c.created_at, c.name;

-- View for subcategories with translations
CREATE VIEW public.v_subcategories_with_translations AS
SELECT 
  s.id,
  s.slug,
  s.category_id,
  s.display_order,
  s.default_pinned,
  s.accent_color,
  s.route_name,
  s.created_at,
  jsonb_object_agg(
    st.language_code, 
    jsonb_build_object(
      'name', st.name,
      'description', st.description
    )
  ) FILTER (WHERE st.language_code IS NOT NULL) AS translations,
  s.name as fallback_name
FROM public.life_subcategories s
LEFT JOIN public.life_subcategory_translations st ON s.id = st.subcategory_id
GROUP BY s.id, s.slug, s.category_id, s.display_order, s.default_pinned, s.accent_color, s.route_name, s.created_at, s.name;