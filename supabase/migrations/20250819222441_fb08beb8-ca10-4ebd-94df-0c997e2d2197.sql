-- Update v_user_pins_expanded to use translations instead of name column
DROP VIEW IF EXISTS public.v_user_pins_expanded;

-- Recreate v_user_pins_expanded with translations
CREATE VIEW public.v_user_pins_expanded
WITH (security_invoker=on) AS
SELECT 
  ups.user_id,
  ups.subcategory_id,
  ups.pinned_at,
  st.name,
  s.slug,
  s.route_name,
  s.accent_color
FROM public.user_pinned_subcategories ups
JOIN public.life_subcategories s ON s.id = ups.subcategory_id
LEFT JOIN public.life_subcategory_translations st ON st.subcategory_id = s.id AND st.language_code = 'en';