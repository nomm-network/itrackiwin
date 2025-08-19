-- Fix the remaining security definer view (v_user_pins_expanded)
DROP VIEW IF EXISTS public.v_user_pins_expanded;

-- Recreate v_user_pins_expanded with security_invoker=on
CREATE VIEW public.v_user_pins_expanded
WITH (security_invoker=on) AS
SELECT 
  ups.user_id,
  ups.subcategory_id,
  ups.pinned_at,
  s.name,
  s.slug,
  s.route_name,
  s.accent_color
FROM public.user_pinned_subcategories ups
JOIN public.life_subcategories s ON s.id = ups.subcategory_id;