-- Drop unused priority column from user_category_prefs
ALTER TABLE public.user_category_prefs
DROP COLUMN IF EXISTS priority;

-- Bootstrap function to grant the first authenticated user superadmin if no admins exist
CREATE OR REPLACE FUNCTION public.bootstrap_admin_if_empty()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_admin boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role IN ('admin','superadmin')
  ) INTO has_admin;

  IF NOT has_admin THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (auth.uid(), 'superadmin')
    ON CONFLICT DO NOTHING;
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

GRANT EXECUTE ON FUNCTION public.bootstrap_admin_if_empty() TO authenticated;