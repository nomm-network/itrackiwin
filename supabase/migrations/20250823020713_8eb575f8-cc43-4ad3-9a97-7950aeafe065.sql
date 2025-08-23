-- Create missing enums for coach functionality
CREATE TYPE public.movement_pattern AS ENUM (
  'squat',
  'hinge', 
  'horizontal_push',
  'vertical_push',
  'horizontal_pull',
  'vertical_pull',
  'lunge',
  'carry',
  'rotation',
  'isolation'
);

CREATE TYPE public.exercise_skill_level AS ENUM (
  'low',
  'medium', 
  'high'
);

CREATE TYPE public.sex_type AS ENUM (
  'male',
  'female',
  'other'
);

CREATE TYPE public.group_type AS ENUM (
  'solo',
  'superset',
  'circuit',
  'dropset'
);

CREATE TYPE public.warmup_quality AS ENUM (
  'poor',
  'average',
  'good',
  'excellent'
);

-- Add new columns to exercises table for coach selection
ALTER TABLE public.exercises 
ADD COLUMN movement_pattern public.movement_pattern,
ADD COLUMN exercise_skill_level public.exercise_skill_level DEFAULT 'medium',
ADD COLUMN complexity_score smallint DEFAULT 3 CHECK (complexity_score >= 1 AND complexity_score <= 10);

-- Create function to intelligently assign movement patterns based on exercise name/slug
CREATE OR REPLACE FUNCTION assign_movement_patterns()
RETURNS void AS $$
BEGIN
  -- Squat movements
  UPDATE public.exercises 
  SET movement_pattern = 'squat'
  WHERE movement_pattern IS NULL 
    AND (
      slug ILIKE '%squat%' OR
      slug ILIKE '%goblet%' OR
      name ILIKE '%squat%' OR
      name ILIKE '%goblet%'
    );

  -- Hinge movements (deadlifts, hip hinges)
  UPDATE public.exercises 
  SET movement_pattern = 'hinge'
  WHERE movement_pattern IS NULL 
    AND (
      slug ILIKE '%deadlift%' OR
      slug ILIKE '%hip-hinge%' OR
      slug ILIKE '%good-morning%' OR
      slug ILIKE '%rdl%' OR
      slug ILIKE '%romanian%' OR
      name ILIKE '%deadlift%' OR
      name ILIKE '%hip hinge%' OR
      name ILIKE '%good morning%' OR
      name ILIKE '%romanian%'
    );

  -- Horizontal push (bench, push-ups)
  UPDATE public.exercises 
  SET movement_pattern = 'horizontal_push'
  WHERE movement_pattern IS NULL 
    AND (
      slug ILIKE '%bench%' OR
      slug ILIKE '%push-up%' OR
      slug ILIKE '%pushup%' OR
      slug ILIKE '%chest-press%' OR
      slug ILIKE '%dip%' OR
      name ILIKE '%bench%' OR
      name ILIKE '%push up%' OR
      name ILIKE '%pushup%' OR
      name ILIKE '%chest press%' OR
      name ILIKE '%dip%'
    );

  -- Vertical push (overhead press, shoulder press)
  UPDATE public.exercises 
  SET movement_pattern = 'vertical_push'
  WHERE movement_pattern IS NULL 
    AND (
      slug ILIKE '%overhead%' OR
      slug ILIKE '%shoulder-press%' OR
      slug ILIKE '%military%' OR
      slug ILIKE '%press%' OR
      name ILIKE '%overhead%' OR
      name ILIKE '%shoulder press%' OR
      name ILIKE '%military%' OR
      (name ILIKE '%press%' AND name NOT ILIKE '%bench%' AND name NOT ILIKE '%leg%')
    );

  -- Horizontal pull (rows)
  UPDATE public.exercises 
  SET movement_pattern = 'horizontal_pull'
  WHERE movement_pattern IS NULL 
    AND (
      slug ILIKE '%row%' OR
      slug ILIKE '%reverse-fly%' OR
      name ILIKE '%row%' OR
      name ILIKE '%reverse fly%'
    );

  -- Vertical pull (pull-ups, lat pulldowns)
  UPDATE public.exercises 
  SET movement_pattern = 'vertical_pull'
  WHERE movement_pattern IS NULL 
    AND (
      slug ILIKE '%pull-up%' OR
      slug ILIKE '%pullup%' OR
      slug ILIKE '%chin-up%' OR
      slug ILIKE '%lat-pulldown%' OR
      slug ILIKE '%pulldown%' OR
      name ILIKE '%pull up%' OR
      name ILIKE '%pullup%' OR
      name ILIKE '%chin up%' OR
      name ILIKE '%lat pulldown%' OR
      name ILIKE '%pulldown%'
    );

  -- Lunge movements
  UPDATE public.exercises 
  SET movement_pattern = 'lunge'
  WHERE movement_pattern IS NULL 
    AND (
      slug ILIKE '%lunge%' OR
      slug ILIKE '%step-up%' OR
      slug ILIKE '%split-squat%' OR
      name ILIKE '%lunge%' OR
      name ILIKE '%step up%' OR
      name ILIKE '%split squat%'
    );

  -- Carry movements
  UPDATE public.exercises 
  SET movement_pattern = 'carry'
  WHERE movement_pattern IS NULL 
    AND (
      slug ILIKE '%carry%' OR
      slug ILIKE '%walk%' OR
      slug ILIKE '%farmer%' OR
      name ILIKE '%carry%' OR
      name ILIKE '%walk%' OR
      name ILIKE '%farmer%'
    );

  -- Rotation movements
  UPDATE public.exercises 
  SET movement_pattern = 'rotation'
  WHERE movement_pattern IS NULL 
    AND (
      slug ILIKE '%twist%' OR
      slug ILIKE '%rotation%' OR
      slug ILIKE '%wood-chop%' OR
      slug ILIKE '%russian%' OR
      name ILIKE '%twist%' OR
      name ILIKE '%rotation%' OR
      name ILIKE '%wood chop%' OR
      name ILIKE '%russian%'
    );

  -- Default remaining to isolation
  UPDATE public.exercises 
  SET movement_pattern = 'isolation'
  WHERE movement_pattern IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Run the movement pattern assignment
SELECT assign_movement_patterns();

-- Create function to assign skill levels and complexity scores
CREATE OR REPLACE FUNCTION assign_exercise_complexity()
RETURNS void AS $$
BEGIN
  -- High skill/complexity exercises (Olympic lifts, advanced movements)
  UPDATE public.exercises 
  SET exercise_skill_level = 'high', complexity_score = 8
  WHERE exercise_skill_level = 'medium' 
    AND complexity_score = 3
    AND (
      slug ILIKE '%snatch%' OR
      slug ILIKE '%clean%' OR
      slug ILIKE '%jerk%' OR
      slug ILIKE '%turkish%' OR
      slug ILIKE '%pistol%' OR
      slug ILIKE '%muscle-up%' OR
      name ILIKE '%snatch%' OR
      name ILIKE '%clean%' OR
      name ILIKE '%jerk%' OR
      name ILIKE '%turkish%' OR
      name ILIKE '%pistol%' OR
      name ILIKE '%muscle up%'
    );

  -- Medium-high complexity (compound movements requiring coordination)
  UPDATE public.exercises 
  SET exercise_skill_level = 'medium', complexity_score = 6
  WHERE exercise_skill_level = 'medium' 
    AND complexity_score = 3
    AND movement_pattern IN ('squat', 'hinge', 'lunge')
    AND (
      slug ILIKE '%barbell%' OR
      slug ILIKE '%overhead%' OR
      name ILIKE '%barbell%' OR
      name ILIKE '%overhead%'
    );

  -- Low complexity (machine exercises, simple movements)
  UPDATE public.exercises 
  SET exercise_skill_level = 'low', complexity_score = 2
  WHERE exercise_skill_level = 'medium' 
    AND complexity_score = 3
    AND (
      slug ILIKE '%machine%' OR
      slug ILIKE '%cable%' OR
      slug ILIKE '%seated%' OR
      slug ILIKE '%lying%' OR
      movement_pattern = 'isolation' OR
      name ILIKE '%machine%' OR
      name ILIKE '%cable%' OR
      name ILIKE '%seated%' OR
      name ILIKE '%lying%'
    );

  -- Bodyweight movements - medium complexity
  UPDATE public.exercises 
  SET exercise_skill_level = 'medium', complexity_score = 4
  WHERE exercise_skill_level = 'medium' 
    AND complexity_score = 3
    AND equipment_id IS NULL;

  -- Push/pull movements - medium complexity
  UPDATE public.exercises 
  SET exercise_skill_level = 'medium', complexity_score = 5
  WHERE exercise_skill_level = 'medium' 
    AND complexity_score = 3
    AND movement_pattern IN ('horizontal_push', 'vertical_push', 'horizontal_pull', 'vertical_pull');
END;
$$ LANGUAGE plpgsql;

-- Run the complexity assignment
SELECT assign_exercise_complexity();

-- Add constraint to ensure secondary_muscle_group_ids reference valid muscle groups
-- First, let's create a function to validate the array
CREATE OR REPLACE FUNCTION validate_muscle_group_ids(muscle_group_ids uuid[])
RETURNS boolean AS $$
DECLARE
  invalid_count integer;
BEGIN
  IF muscle_group_ids IS NULL OR array_length(muscle_group_ids, 1) IS NULL THEN
    RETURN true; -- NULL or empty arrays are valid
  END IF;
  
  -- Check if all IDs exist in muscle_groups table
  SELECT COUNT(*) INTO invalid_count
  FROM unnest(muscle_group_ids) AS mg_id
  WHERE mg_id NOT IN (SELECT id FROM public.muscle_groups);
  
  RETURN invalid_count = 0;
END;
$$ LANGUAGE plpgsql;

-- Add constraint using the validation function
ALTER TABLE public.exercises 
ADD CONSTRAINT valid_secondary_muscle_groups 
CHECK (validate_muscle_group_ids(secondary_muscle_group_ids));

-- Clean up invalid secondary muscle group references
UPDATE public.exercises 
SET secondary_muscle_group_ids = (
  SELECT array_agg(mg_id)
  FROM unnest(secondary_muscle_group_ids) AS mg_id
  WHERE mg_id IN (SELECT id FROM public.muscle_groups)
)
WHERE secondary_muscle_group_ids IS NOT NULL;

-- Create index for better performance on movement pattern queries
CREATE INDEX idx_exercises_movement_pattern ON public.exercises(movement_pattern);
CREATE INDEX idx_exercises_skill_level ON public.exercises(exercise_skill_level);
CREATE INDEX idx_exercises_complexity_score ON public.exercises(complexity_score);

-- Add user_exercise_warmups table if not exists for warmup quality tracking
CREATE TABLE IF NOT EXISTS public.user_exercise_warmups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  warmup_sets jsonb NOT NULL DEFAULT '[]'::jsonb,
  quality public.warmup_quality DEFAULT 'average',
  duration_seconds integer,
  notes text,
  completed_at timestamp with time zone DEFAULT now(),
  workout_id uuid REFERENCES public.workouts(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, exercise_id, completed_at)
);

-- Enable RLS for warmup tracking
ALTER TABLE public.user_exercise_warmups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own warmups"
  ON public.user_exercise_warmups
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add workout_exercise_groups table for grouping exercises (supersets, circuits)
CREATE TABLE IF NOT EXISTS public.workout_exercise_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  group_type public.group_type NOT NULL DEFAULT 'solo',
  group_name text,
  rest_seconds integer DEFAULT 120,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.workout_exercise_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their workout groups"
  ON public.workout_exercise_groups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.workouts w 
      WHERE w.id = workout_id AND w.user_id = auth.uid()
    )
  );

-- Add group_id to workout_exercises if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workout_exercises' 
    AND column_name = 'group_id'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.workout_exercises 
    ADD COLUMN group_id uuid REFERENCES public.workout_exercise_groups(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create coaching context view for easy coach decision making
CREATE OR REPLACE VIEW public.v_exercises_for_coach AS
SELECT 
  e.id,
  e.name,
  e.slug,
  e.movement_pattern,
  e.exercise_skill_level,
  e.complexity_score,
  e.primary_muscle_id,
  e.secondary_muscle_group_ids,
  e.equipment_id,
  eq.slug as equipment_slug,
  mg.slug as primary_muscle_slug,
  bp.slug as body_part_slug,
  e.is_public,
  e.popularity_rank
FROM public.exercises e
LEFT JOIN public.equipment eq ON eq.id = e.equipment_id
LEFT JOIN public.muscle_groups mg ON mg.id = e.primary_muscle_id  
LEFT JOIN public.body_parts bp ON bp.id = e.body_part_id
WHERE e.is_public = true OR e.owner_user_id = auth.uid()
ORDER BY e.popularity_rank ASC NULLS LAST, e.name;

-- Grant select on the view
GRANT SELECT ON public.v_exercises_for_coach TO authenticated;

-- Drop the assignment functions as they're no longer needed
DROP FUNCTION IF EXISTS assign_movement_patterns();
DROP FUNCTION IF EXISTS assign_exercise_complexity();