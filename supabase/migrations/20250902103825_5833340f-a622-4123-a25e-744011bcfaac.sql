-- Fix admin user creation by ensuring proper RLS policies
-- Allow service role to create users in the users table
DROP POLICY IF EXISTS "Service role can manage users" ON public.users;
CREATE POLICY "Service role can manage users"
ON public.users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated users with admin role to view all users
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users"
ON public.users
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Allow authenticated users with admin role to insert users
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
CREATE POLICY "Admins can insert users"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.uid()));