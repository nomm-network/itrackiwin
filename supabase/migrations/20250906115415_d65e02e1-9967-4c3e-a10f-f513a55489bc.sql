-- Fix the type mismatch in admin_get_users_overview function
-- The auth.users.email column is character varying(255), but we declared text
DROP FUNCTION IF EXISTS public.admin_get_users_overview();

CREATE OR REPLACE FUNCTION public.admin_get_users_overview()
RETURNS TABLE (
  user_id uuid,
  email character varying(255),  -- Fixed: Changed from text to character varying(255)
  created_at timestamp with time zone,
  last_sign_in_at timestamp with time zone,
  email_confirmed_at timestamp with time zone,
  is_pro boolean,
  roles text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin or superadmin using fully qualified references
  IF NOT (
    SELECT EXISTS(
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'superadmin')
    )
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  RETURN QUERY
  SELECT 
    au.id as user_id,
    au.email,
    au.created_at,
    au.last_sign_in_at,
    au.email_confirmed_at,
    COALESCE(u.is_pro, false) as is_pro,
    COALESCE(
      ARRAY(
        SELECT ur.role::text 
        FROM public.user_roles ur 
        WHERE ur.user_id = au.id
      ), 
      '{}'::text[]
    ) as roles
  FROM auth.users au
  LEFT JOIN public.users u ON u.id = au.id
  ORDER BY au.created_at DESC;
END;
$$;