-- Update the v_subcategories_with_translations view to include the icon column
DROP VIEW IF EXISTS public.v_subcategories_with_translations;

CREATE VIEW public.v_subcategories_with_translations AS
SELECT 
  ls.id,
  ls.category_id,
  ls.slug,
  ls.display_order,
  ls.created_at,
  ls.default_pinned,
  ls.route_name,
  ls.accent_color,
  ls.icon,  -- Add the icon column
  COALESCE(
    jsonb_object_agg(
      lst.language_code, 
      jsonb_build_object(
        'name', lst.name,
        'description', lst.description
      )
    ) FILTER (WHERE lst.language_code IS NOT NULL),
    '{}'::jsonb
  ) AS translations
FROM public.life_subcategories ls
LEFT JOIN public.life_subcategory_translations lst 
  ON ls.id = lst.subcategory_id
GROUP BY 
  ls.id, 
  ls.category_id, 
  ls.slug, 
  ls.display_order, 
  ls.created_at, 
  ls.default_pinned, 
  ls.route_name, 
  ls.accent_color,
  ls.icon;