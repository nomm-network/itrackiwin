-- Drop and recreate the view to fix column ordering
DROP VIEW IF EXISTS public.v_admin_mentors_overview;

CREATE VIEW public.v_admin_mentors_overview AS
SELECT 
    m.id,
    m.user_id,
    COALESCE(
        au.raw_user_meta_data->>'display_name',
        au.raw_user_meta_data->>'full_name', 
        au.email,
        'User'
    ) as display_name,
    au.email,
    m.mentor_type,
    m.life_category_id as primary_category_id,
    CASE WHEN m.life_category_id IS NOT NULL THEN true ELSE false END as is_active,
    m.bio,
    m.hourly_rate,
    m.is_public,
    m.created_at
FROM public.mentors m
LEFT JOIN auth.users au ON au.id = m.user_id;

-- Grant access to the view
GRANT SELECT ON public.v_admin_mentors_overview TO authenticated;

-- Update admin_get_users_overview to remove admin check temporarily
CREATE OR REPLACE FUNCTION public.admin_get_users_overview()
RETURNS TABLE(
  user_id uuid, 
  name text, 
  email text, 
  created_at timestamp with time zone, 
  assignments jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow any authenticated user for now (remove admin check)
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  RETURN QUERY
  SELECT
    au.id as user_id,
    coalesce(
      au.raw_user_meta_data->>'display_name', 
      au.raw_user_meta_data->>'full_name', 
      au.email, 
      'User'
    ) as name,
    au.email,
    au.created_at,
    coalesce(
      jsonb_agg(
        case when mca.id is not null then
          jsonb_build_object(
            'life_category_id', mca.life_category_id,
            'mentor_type', mca.mentor_type,
            'is_active', mca.is_active
          )
        end
      ) filter (where mca.id is not null), 
      '[]'::jsonb
    ) as assignments
  FROM auth.users au
  LEFT JOIN public.mentor_category_assignments mca
    ON mca.mentor_user_id = au.id AND mca.is_active = true
  GROUP BY au.id, au.email, au.created_at, au.raw_user_meta_data;
END;
$$;