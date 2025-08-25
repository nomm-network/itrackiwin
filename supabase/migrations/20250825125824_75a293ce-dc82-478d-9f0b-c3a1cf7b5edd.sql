-- Ensure proper RLS policies for workouts table
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workouts' 
    AND policyname = 'workouts_select_own'
  ) THEN
    CREATE POLICY "workouts_select_own" 
    ON public.workouts 
    FOR SELECT 
    TO authenticated 
    USING (user_id = auth.uid());
  END IF;
END $$;

-- Ensure proper RLS policies for workout_exercises table
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workout_exercises' 
    AND policyname = 'workout_exercises_select_own'
  ) THEN
    CREATE POLICY "workout_exercises_select_own" 
    ON public.workout_exercises 
    FOR SELECT 
    TO authenticated 
    USING (EXISTS (
      SELECT 1 FROM public.workouts w
      WHERE w.id = workout_exercises.workout_id
        AND w.user_id = auth.uid()
    ));
  END IF;
END $$;

-- Ensure proper RLS policies for workout_sets table
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workout_sets' 
    AND policyname = 'workout_sets_select_own'
  ) THEN
    CREATE POLICY "workout_sets_select_own" 
    ON public.workout_sets 
    FOR SELECT 
    TO authenticated 
    USING (EXISTS (
      SELECT 1 FROM public.workout_exercises we
      JOIN public.workouts w ON w.id = we.workout_id
      WHERE we.id = workout_sets.workout_exercise_id
        AND w.user_id = auth.uid()
    ));
  END IF;
END $$;

-- Create unique index to prevent multiple active workouts per user
CREATE UNIQUE INDEX IF NOT EXISTS one_active_workout_per_user
ON public.workouts (user_id)
WHERE ended_at IS NULL;

-- Create performance index for active workout lookup
CREATE INDEX IF NOT EXISTS workouts_user_started_idx
ON public.workouts (user_id, started_at DESC)
WHERE ended_at IS NULL;