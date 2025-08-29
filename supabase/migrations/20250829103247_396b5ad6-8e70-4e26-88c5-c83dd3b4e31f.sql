-- Fix RLS policy for exercises to allow null owner_user_id for public exercises
-- This allows creating exercises without setting owner_user_id (for public exercises)

DROP POLICY IF EXISTS "exercises_insert_own" ON public.exercises;

CREATE POLICY "exercises_insert_authenticated" 
ON public.exercises 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    owner_user_id = auth.uid() OR 
    owner_user_id IS NULL
  )
);