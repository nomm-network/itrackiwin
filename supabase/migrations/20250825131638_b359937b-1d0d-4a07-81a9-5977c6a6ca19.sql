-- Enable RLS on all workout-related tables that are missing it
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;

-- Add missing RLS policies for workout_exercises
CREATE POLICY "workout_exercises_insert_own" 
ON public.workout_exercises 
FOR INSERT 
TO authenticated 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.workouts w
  WHERE w.id = workout_exercises.workout_id
    AND w.user_id = auth.uid()
));

CREATE POLICY "workout_exercises_update_own" 
ON public.workout_exercises 
FOR UPDATE 
TO authenticated 
USING (EXISTS (
  SELECT 1 FROM public.workouts w
  WHERE w.id = workout_exercises.workout_id
    AND w.user_id = auth.uid()
));

CREATE POLICY "workout_exercises_delete_own" 
ON public.workout_exercises 
FOR DELETE 
TO authenticated 
USING (EXISTS (
  SELECT 1 FROM public.workouts w
  WHERE w.id = workout_exercises.workout_id
    AND w.user_id = auth.uid()
));

-- Add missing RLS policies for workout_sets
CREATE POLICY "workout_sets_insert_own" 
ON public.workout_sets 
FOR INSERT 
TO authenticated 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.workout_exercises we
  JOIN public.workouts w ON w.id = we.workout_id
  WHERE we.id = workout_sets.workout_exercise_id
    AND w.user_id = auth.uid()
));

CREATE POLICY "workout_sets_update_own" 
ON public.workout_sets 
FOR UPDATE 
TO authenticated 
USING (EXISTS (
  SELECT 1 FROM public.workout_exercises we
  JOIN public.workouts w ON w.id = we.workout_id
  WHERE we.id = workout_sets.workout_exercise_id
    AND w.user_id = auth.uid()
));

CREATE POLICY "workout_sets_delete_own" 
ON public.workout_sets 
FOR DELETE 
TO authenticated 
USING (EXISTS (
  SELECT 1 FROM public.workout_exercises we
  JOIN public.workouts w ON w.id = we.workout_id
  WHERE we.id = workout_sets.workout_exercise_id
    AND w.user_id = auth.uid()
));