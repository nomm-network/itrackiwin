-- Create policies for parent tables if they don't exist
-- workouts: owners can select their workouts
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'workouts' AND policyname = 'workouts_owner_select'
    ) THEN
        CREATE POLICY workouts_owner_select
        ON public.workouts
        FOR SELECT
        TO authenticated
        USING ( user_id = auth.uid() );
    END IF;
END $$;

-- workout_exercises: can view when parent workout is yours
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'workout_exercises' AND policyname = 'workout_exercises_owner_select'
    ) THEN
        CREATE POLICY workout_exercises_owner_select
        ON public.workout_exercises
        FOR SELECT
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.workouts w
            WHERE w.id = workout_exercises.workout_id
              AND w.user_id = auth.uid()
          )
        );
    END IF;
END $$;