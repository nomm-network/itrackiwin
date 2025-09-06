-- Add gym_id column to mentors table
ALTER TABLE public.mentors ADD COLUMN gym_id UUID REFERENCES public.gyms(id);

-- Drop and recreate the admin mentors overview view to include gym information
DROP VIEW IF EXISTS public.v_admin_mentors_overview;

CREATE VIEW public.v_admin_mentors_overview AS
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
  g.name as gym_name
FROM public.mentors m
LEFT JOIN auth.users u ON u.id = m.user_id
LEFT JOIN public.mentor_category_assignments mca ON mca.mentor_user_id = m.user_id 
  AND mca.life_category_id = m.life_category_id
LEFT JOIN public.gyms g ON g.id = m.gym_id
ORDER BY m.created_at DESC;