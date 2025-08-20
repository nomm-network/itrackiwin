-- Fix RLS policies for exercises table to allow users to create their own exercises
-- Drop existing policies
DROP POLICY IF EXISTS "ex_user_write" ON public.exercises;
DROP POLICY IF EXISTS "ex_read_all" ON public.exercises;

-- Create new policies that allow users to create their own exercises
CREATE POLICY "exercises_select_public_or_owned" 
ON public.exercises 
FOR SELECT 
USING (is_public = true OR owner_user_id = auth.uid());

CREATE POLICY "exercises_insert_own" 
ON public.exercises 
FOR INSERT 
WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "exercises_update_own" 
ON public.exercises 
FOR UPDATE 
USING (owner_user_id = auth.uid()) 
WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "exercises_delete_own" 
ON public.exercises 
FOR DELETE 
USING (owner_user_id = auth.uid());