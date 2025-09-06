-- 1) Ensure is_superadmin_simple() exists & is callable
-- First check if user_roles table exists, if not create it
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage user roles" ON public.user_roles
FOR ALL USING (true);

-- Create the superadmin check function
CREATE OR REPLACE FUNCTION public.is_superadmin_simple()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1
    FROM user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'superadmin'
  );
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_superadmin_simple() TO authenticated;

-- Insert a superadmin role for testing (replace with actual user_id)
-- This is commented out - uncomment and replace with actual user ID when needed
-- INSERT INTO public.user_roles (user_id, role) 
-- VALUES ('YOUR_USER_ID_HERE', 'superadmin') 
-- ON CONFLICT (user_id, role) DO NOTHING;