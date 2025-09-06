-- Update the admin mentors overview view to include category information
CREATE OR REPLACE VIEW public.v_admin_mentors_overview AS
SELECT 
  m.id,
  m.user_id,
  COALESCE(u.email, 'Unknown')::text as display_name,
  u.email,
  m.mentor_type,
  m.life_category_id as primary_category_id,
  COALESCE(mca.is_active, true) as is_active,
  m.bio,
  m.hourly_rate,
  m.is_public,
  m.created_at,
  m.gym_id,
  g.name as gym_name,
  lc.slug as category_slug,
  COALESCE(lct.name, lc.slug) as category_name
FROM public.mentors m
LEFT JOIN auth.users u ON u.id = m.user_id
LEFT JOIN public.mentor_category_assignments mca ON mca.mentor_user_id = m.user_id 
  AND mca.life_category_id = m.life_category_id
LEFT JOIN public.gyms g ON g.id = m.gym_id
LEFT JOIN public.life_categories lc ON lc.id = m.life_category_id
LEFT JOIN public.life_category_translations lct ON lct.category_id = lc.id AND lct.language_code = 'en'
ORDER BY m.created_at DESC;