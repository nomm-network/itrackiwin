-- Step 0: Safety net
SET statement_timeout = '5min';

-- Step 1: Normalize naming - add slug to exercises and remove stray columns
ALTER TABLE public.exercises
ADD COLUMN IF NOT EXISTS slug text;

-- Populate slug from existing data or generate from ID
UPDATE public.exercises 
SET slug = COALESCE(
  lower(regexp_replace(COALESCE(
    (SELECT name FROM exercises_translations WHERE exercise_id = exercises.id AND language_code = 'en' LIMIT 1),
    exercises.id::text
  ), '[^a-zA-Z0-9]+', '-', 'g')),
  substr(id::text, 1, 8)
)
WHERE slug IS NULL;

-- Create unique index for slug
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_exercises_slug') THEN
    CREATE UNIQUE INDEX idx_exercises_slug ON public.exercises(slug);
  END IF;
END$$;

-- Step 2: Bar & load semantics - create load type enum and add fields
DO $$
BEGIN
  CREATE TYPE load_type_enum AS ENUM ('barbell', 'single_load', 'dual_load', 'stack', 'bodyweight', 'fixed');
EXCEPTION WHEN duplicate_object THEN NULL;
END$$;

ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS load_type load_type_enum,
  ADD COLUMN IF NOT EXISTS default_bar_type_id uuid REFERENCES public.bar_types(id),
  ADD COLUMN IF NOT EXISTS requires_handle boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS allows_grips boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_unilateral boolean DEFAULT false;

-- Step 3: Handles & grips as first-class citizens
CREATE TABLE IF NOT EXISTS public.exercise_default_handles (
  exercise_id uuid REFERENCES public.exercises(id) ON DELETE CASCADE,
  handle_id   uuid REFERENCES public.handles(id)   ON DELETE CASCADE,
  PRIMARY KEY (exercise_id, handle_id)
);

CREATE TABLE IF NOT EXISTS public.exercise_default_grips (
  exercise_id uuid REFERENCES public.exercises(id) ON DELETE CASCADE,
  grip_id     uuid REFERENCES public.grips(id)     ON DELETE CASCADE,
  PRIMARY KEY (exercise_id, grip_id)
);

-- Add handle and grip selection to template exercises
ALTER TABLE public.template_exercises
  ADD COLUMN IF NOT EXISTS handle_id uuid REFERENCES public.handles(id),
  ADD COLUMN IF NOT EXISTS grip_ids  uuid[];

-- Step 4: Two-side (unilateral) tracking
ALTER TABLE public.workout_sets
  ADD COLUMN IF NOT EXISTS side text CHECK (side IN ('both','left','right')) DEFAULT 'both';

-- Fix uniqueness for unilateral tracking - drop constraint and recreate
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_workout_sets_ex_idx') THEN
    ALTER TABLE public.workout_sets DROP CONSTRAINT uq_workout_sets_ex_idx;
  END IF;
END$$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_workout_sets_ex_idx
  ON public.workout_sets (workout_exercise_id, set_index, side);

-- Step 5: Fix "Continue workout" policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'workouts' 
    AND policyname = 'p_workouts_select_own'
  ) THEN
    CREATE POLICY p_workouts_select_own
    ON public.workouts FOR SELECT
    USING (user_id = auth.uid());
  END IF;
END$$;

-- Enforce 1 active workout per user
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_workout_per_user
ON public.workouts (user_id)
WHERE ended_at IS NULL;

-- Step 6: Warmup system - single canonical JSON shape
ALTER TABLE public.workout_exercises
  ADD COLUMN IF NOT EXISTS warmup_plan jsonb,
  ADD COLUMN IF NOT EXISTS warmup_feedback text CHECK (warmup_feedback IN ('too_little','excellent','too_much'));

-- Step 7: Target generation - store targets on sets
ALTER TABLE public.workout_sets
  ADD COLUMN IF NOT EXISTS target_weight numeric,
  ADD COLUMN IF NOT EXISTS target_reps int;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_workout_sets_exercise_completed 
ON public.workout_sets(workout_exercise_id, set_index, side, is_completed, completed_at);

CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout 
ON public.workout_exercises(workout_id);

CREATE INDEX IF NOT EXISTS idx_template_exercises_template 
ON public.template_exercises(template_id, order_index);