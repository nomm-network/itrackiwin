-- Fix security warnings - recreate views with security_invoker=on
DROP VIEW IF EXISTS public.v_categories_with_translations;
DROP VIEW IF EXISTS public.v_subcategories_with_translations;

-- Recreate views with security_invoker=on to respect RLS policies
CREATE VIEW public.v_categories_with_translations
WITH (security_invoker=on) AS
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

-- Recreate view with security_invoker=on
CREATE VIEW public.v_subcategories_with_translations
WITH (security_invoker=on) AS
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