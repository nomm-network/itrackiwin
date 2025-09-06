-- Drop the existing view first
DROP VIEW IF EXISTS public.v_admin_mentors_overview;

-- Create the view with correct columns matching the actual mentors table
CREATE VIEW public.v_admin_mentors_overview AS
SELECT
  m.id,
  m.user_id,
  m.display_name,
  null::text as email,  -- email is in auth.users which we can't access directly
  m.mentor_type,              -- enum: 'mentor' | 'coach'
  m.life_category_id as primary_category_id,
  lc.name        AS primary_category_name,
  m.is_public as is_active,  -- using is_public as is_active for now
  m.hourly_rate,
  m.bio,
  m.created_at,
  m.updated_at
FROM public.mentors m
LEFT JOIN public.life_categories lc ON lc.id = m.life_category_id;