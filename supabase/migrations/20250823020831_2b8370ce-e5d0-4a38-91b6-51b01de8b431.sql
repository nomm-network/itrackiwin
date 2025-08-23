-- Create missing enums for coach functionality (conditional creation)
DO $$ 
BEGIN
  -- Create movement_pattern enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'movement_pattern') THEN
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
  END IF;

  -- Create exercise_skill_level enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'exercise_skill_level') THEN
    CREATE TYPE public.exercise_skill_level AS ENUM (
      'low',
      'medium', 
      'high'
    );
  END IF;

  -- Create sex_type enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sex_type') THEN
    CREATE TYPE public.sex_type AS ENUM (
      'male',
      'female',
      'other'
    );
  END IF;

  -- Create group_type enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'group_type') THEN
    CREATE TYPE public.group_type AS ENUM (
      'solo',
      'superset',
      'circuit',
      'dropset'
    );
  END IF;

  -- Create warmup_quality enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'warmup_quality') THEN
    CREATE TYPE public.warmup_quality AS ENUM (
      'poor',
      'average',
      'good',
      'excellent'
    );
  END IF;
END $$;

-- Add new columns to exercises table for coach selection
DO $$ 
BEGIN
  -- Add movement_pattern column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'exercises' 
    AND column_name = 'movement_pattern'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.exercises 
    ADD COLUMN movement_pattern public.movement_pattern;
  END IF;

  -- Add exercise_skill_level column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'exercises' 
    AND column_name = 'exercise_skill_level'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.exercises 
    ADD COLUMN exercise_skill_level public.exercise_skill_level DEFAULT 'medium';
  END IF;

  -- Add complexity_score column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'exercises' 
    AND column_name = 'complexity_score'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.exercises 
    ADD COLUMN complexity_score smallint DEFAULT 3 CHECK (complexity_score >= 1 AND complexity_score <= 10);
  END IF;
END $$;

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

-- Add constraint using the validation function (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'valid_secondary_muscle_groups'
    AND table_name = 'exercises'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.exercises 
    ADD CONSTRAINT valid_secondary_muscle_groups 
    CHECK (validate_muscle_group_ids(secondary_muscle_group_ids));
  END IF;
END $$;

-- Clean up invalid secondary muscle group references
UPDATE public.exercises 
SET secondary_muscle_group_ids = (
  SELECT array_agg(mg_id)
  FROM unnest(secondary_muscle_group_ids) AS mg_id
  WHERE mg_id IN (SELECT id FROM public.muscle_groups)
)
WHERE secondary_muscle_group_ids IS NOT NULL;

-- Create indexes for better performance on movement pattern queries
CREATE INDEX IF NOT EXISTS idx_exercises_movement_pattern ON public.exercises(movement_pattern);
CREATE INDEX IF NOT EXISTS idx_exercises_skill_level ON public.exercises(exercise_skill_level);
CREATE INDEX IF NOT EXISTS idx_exercises_complexity_score ON public.exercises(complexity_score);

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