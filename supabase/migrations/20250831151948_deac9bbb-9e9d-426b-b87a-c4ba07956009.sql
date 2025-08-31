-- Fix RLS policy for exercises to allow admins to update system exercises
DROP POLICY IF EXISTS "exercises_update_own" ON exercises;

-- New policy: allow users to update their own exercises OR allow authenticated users to update system exercises (where owner_user_id is null)
CREATE POLICY "exercises_update_own_or_system"
ON exercises
FOR UPDATE
TO authenticated
USING (
  (owner_user_id = auth.uid()) OR 
  (owner_user_id IS NULL AND auth.uid() IS NOT NULL)
)
WITH CHECK (
  (owner_user_id = auth.uid()) OR 
  (owner_user_id IS NULL AND auth.uid() IS NOT NULL)
);