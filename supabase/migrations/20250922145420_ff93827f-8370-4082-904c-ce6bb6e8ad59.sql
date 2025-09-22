-- Check current RLS policies on workout_sets table and create proper ones
-- First, ensure RLS is enabled
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can manage their own workout sets" ON public.workout_sets;
DROP POLICY IF EXISTS "Users can view their own workout sets" ON public.workout_sets;
DROP POLICY IF EXISTS "Users can insert their own workout sets" ON public.workout_sets;
DROP POLICY IF EXISTS "Users can update their own workout sets" ON public.workout_sets;
DROP POLICY IF EXISTS "Users can delete their own workout sets" ON public.workout_sets;

-- Create comprehensive RLS policies for workout_sets
-- Allow users to view their own workout sets
CREATE POLICY "Users can view their own workout sets"
ON public.workout_sets
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM workout_exercises we
    JOIN workouts w ON w.id = we.workout_id
    WHERE we.id = workout_sets.workout_exercise_id
    AND w.user_id = auth.uid()
  )
);

-- Allow users to insert workout sets for their own workouts
CREATE POLICY "Users can insert their own workout sets"
ON public.workout_sets
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM workout_exercises we
    JOIN workouts w ON w.id = we.workout_id
    WHERE we.id = workout_sets.workout_exercise_id
    AND w.user_id = auth.uid()
  )
);

-- Allow users to update their own workout sets
CREATE POLICY "Users can update their own workout sets"
ON public.workout_sets
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM workout_exercises we
    JOIN workouts w ON w.id = we.workout_id
    WHERE we.id = workout_sets.workout_exercise_id
    AND w.user_id = auth.uid()
  )
);

-- Allow users to delete their own workout sets
CREATE POLICY "Users can delete their own workout sets"
ON public.workout_sets
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM workout_exercises we
    JOIN workouts w ON w.id = we.workout_id
    WHERE we.id = workout_sets.workout_exercise_id
    AND w.user_id = auth.uid()
  )
);