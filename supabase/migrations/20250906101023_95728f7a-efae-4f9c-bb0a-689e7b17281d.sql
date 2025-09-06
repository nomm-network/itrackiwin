-- Drop the view and create a security definer function instead
DROP VIEW IF EXISTS public.v_admin_users_overview;

-- Create a security definer function that only admins can access
CREATE OR REPLACE FUNCTION public.admin_get_users_overview()
RETURNS TABLE(
  user_id uuid,
  name text,
  email text,
  created_at timestamptz,
  assignments jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role)) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT
    au.id as user_id,
    coalesce(au.raw_user_meta_data->>'display_name', au.raw_user_meta_data->>'full_name', au.email, 'User') as name,
    au.email,
    au.created_at,
    coalesce(jsonb_agg(
      case when mca.id is not null then
        jsonb_build_object(
          'life_category_id', mca.life_category_id,
          'mentor_type', mca.mentor_type,
          'is_active', mca.is_active
        )
      end
    ) filter (where mca.id is not null), '[]'::jsonb) as assignments
  FROM auth.users au
  LEFT JOIN public.mentor_category_assignments mca
    ON mca.mentor_user_id = au.id AND mca.is_active
  GROUP BY au.id, au.email, au.created_at, au.raw_user_meta_data;
END;
$$;