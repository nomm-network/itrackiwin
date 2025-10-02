-- Add rep range columns to workout_exercises table
ALTER TABLE public.workout_exercises
ADD COLUMN IF NOT EXISTS target_reps_min integer,
ADD COLUMN IF NOT EXISTS target_reps_max integer;

-- Add helpful comment
COMMENT ON COLUMN public.workout_exercises.target_reps_min IS 'Minimum target reps for this exercise (for rep range targeting)';
COMMENT ON COLUMN public.workout_exercises.target_reps_max IS 'Maximum target reps for this exercise (for rep range targeting)';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_workout_exercises_rep_range ON public.workout_exercises(target_reps_min, target_reps_max) WHERE target_reps_min IS NOT NULL;