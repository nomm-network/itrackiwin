-- Add superset support to workout_exercises
ALTER TABLE public.workout_exercises 
ADD COLUMN IF NOT EXISTS superset_group_id uuid,
ADD COLUMN IF NOT EXISTS superset_order smallint,
ADD COLUMN IF NOT EXISTS superset_rounds_target smallint DEFAULT 3;

-- Add superset support to template_exercises
ALTER TABLE public.template_exercises 
ADD COLUMN IF NOT EXISTS superset_group_id uuid,
ADD COLUMN IF NOT EXISTS superset_order smallint,
ADD COLUMN IF NOT EXISTS superset_rounds_target smallint DEFAULT 3;

-- Add round tracking to workout_sets
ALTER TABLE public.workout_sets 
ADD COLUMN IF NOT EXISTS round_number smallint;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workout_exercises_superset_group 
ON public.workout_exercises(superset_group_id) 
WHERE superset_group_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_template_exercises_superset_group 
ON public.template_exercises(superset_group_id) 
WHERE superset_group_id IS NOT NULL;

COMMENT ON COLUMN public.workout_exercises.superset_group_id IS 'Groups exercises into supersets - all exercises with same group_id form one superset';
COMMENT ON COLUMN public.workout_exercises.superset_order IS 'Order within superset (1=A, 2=B, 3=C, etc.)';
COMMENT ON COLUMN public.workout_exercises.superset_rounds_target IS 'Target number of rounds for this superset group';
COMMENT ON COLUMN public.workout_sets.round_number IS 'Round number within a superset (1, 2, 3...). NULL for non-superset exercises';