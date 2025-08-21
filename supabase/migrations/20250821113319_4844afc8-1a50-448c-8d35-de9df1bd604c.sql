-- Create simpler admin functions without rate limiting for now to bypass the timestamp issue
CREATE OR REPLACE FUNCTION public.is_admin_simple()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role IN ('admin'::app_role, 'superadmin'::app_role)
  );
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin_simple()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'superadmin'::app_role
  );
$$;