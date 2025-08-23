-- Fix security linter issues by enabling RLS on missing tables

-- Enable RLS on workout_exercise_groups table
ALTER TABLE IF EXISTS public.workout_exercise_groups ENABLE ROW LEVEL SECURITY;

-- Add any missing RLS policies if the table exists but policies don't
DO $$
BEGIN
  -- Check if workout_exercise_groups table exists and add policies if missing
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'workout_exercise_groups') THEN
    -- Drop existing policy if it exists to recreate it
    DROP POLICY IF EXISTS "Users can manage their workout groups" ON public.workout_exercise_groups;
    
    -- Create the policy
    CREATE POLICY "Users can manage their workout groups"
      ON public.workout_exercise_groups
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.workouts w 
          WHERE w.id = workout_id AND w.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Update the search path for functions to make them secure
ALTER FUNCTION public.validate_muscle_group_ids(uuid[]) SET search_path = 'public';