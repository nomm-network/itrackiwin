-- Update database views to remove fallback_name dependency
DROP VIEW IF EXISTS public.v_categories_with_translations;
DROP VIEW IF EXISTS public.v_subcategories_with_translations;

-- Recreate views without fallback_name
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
  ) FILTER (WHERE ct.language_code IS NOT NULL) AS translations
FROM public.life_categories c
LEFT JOIN public.life_category_translations ct ON c.id = ct.category_id
GROUP BY c.id, c.slug, c.display_order, c.color, c.icon, c.created_at;

-- Recreate subcategories view without fallback_name
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
  ) FILTER (WHERE st.language_code IS NOT NULL) AS translations
FROM public.life_subcategories s
LEFT JOIN public.life_subcategory_translations st ON s.id = st.subcategory_id
GROUP BY s.id, s.slug, s.category_id, s.display_order, s.default_pinned, s.accent_color, s.route_name, s.created_at;