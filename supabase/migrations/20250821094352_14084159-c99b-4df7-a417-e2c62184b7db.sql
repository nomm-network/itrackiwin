-- Fix profile privacy security vulnerability
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create more secure policies
-- 1. Users can always view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- 2. Public profiles are viewable by authenticated users only
CREATE POLICY "Public profiles are viewable by authenticated users"
ON public.profiles  
FOR SELECT
USING (
  auth.role() = 'authenticated' 
  AND is_public = true 
  AND user_id != auth.uid()  -- Avoid duplicate with own profile policy
);

-- 3. Friends can view each other's profiles regardless of public setting
CREATE POLICY "Friends can view each other's profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND user_id != auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.friendships f
    WHERE f.status = 'accepted'
    AND (
      (f.requester_id = auth.uid() AND f.addressee_id = user_id)
      OR 
      (f.addressee_id = auth.uid() AND f.requester_id = user_id)
    )
  )
);

-- Ensure is_public defaults to true for existing records where it's null
UPDATE public.profiles 
SET is_public = true 
WHERE is_public IS NULL;