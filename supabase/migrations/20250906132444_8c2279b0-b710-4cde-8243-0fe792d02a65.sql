-- Create admin mentors overview view
CREATE OR REPLACE VIEW public.v_admin_mentors_overview AS
SELECT 
  mp.id,
  mp.user_id,
  mp.mentor_type,
  mp.primary_category_id,
  mp.is_active,
  mp.bio,
  mp.hourly_rate,
  mp.is_public,
  mp.created_at,
  mp.updated_at,
  u.email,
  COALESCE(p.display_name, u.email, 'Unknown') as display_name
FROM mentor_profiles mp
LEFT JOIN auth.users u ON u.id = mp.user_id
LEFT JOIN profiles p ON p.id = mp.user_id
ORDER BY mp.created_at DESC;