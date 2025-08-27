-- Step 0: Safety net
SET statement_timeout = '5min';

-- Step 1: Normalize naming - add slug to exercises and remove stray columns
ALTER TABLE public.exercises
ADD COLUMN IF NOT EXISTS slug text;

-- Create unique index for slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_exercises_slug ON public.exercises(slug);

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

-- Fix uniqueness for unilateral tracking
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'uq_workout_sets_ex_idx') THEN
    DROP INDEX uq_workout_sets_ex_idx;
  END IF;
END$$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_workout_sets_ex_idx
  ON public.workout_sets (workout_exercise_id, set_index, side);

-- Step 5: Fix "Continue workout" & duplicate UUID bugs
CREATE POLICY IF NOT EXISTS p_workouts_select_own
ON public.workouts FOR SELECT
USING (user_id = auth.uid());

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

-- Create localized exercises view
CREATE OR REPLACE VIEW public.v_exercises_localized AS
SELECT 
  e.id,
  e.slug,
  e.primary_muscle_id,
  e.equipment_id,
  e.load_type,
  e.requires_handle,
  e.allows_grips,
  e.is_unilateral,
  COALESCE(et_user.name, et_en.name) AS name,
  COALESCE(et_user.description, et_en.description) AS description
FROM public.exercises e
LEFT JOIN public.exercises_translations et_user
  ON et_user.exercise_id = e.id
  AND et_user.language_code = COALESCE(current_setting('app.lang', true), 'en')
LEFT JOIN public.exercises_translations et_en
  ON et_en.exercise_id = e.id
  AND et_en.language_code = 'en';

-- Warmup recalculation function
CREATE OR REPLACE FUNCTION public.recalc_warmup_from_last_set(p_workout_exercise_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  wex  RECORD;
  s    RECORD;
  top_weight numeric;
  top_reps   int;
  base jsonb;
  steps jsonb;
  adj_reps1 int := 12;
  adj_reps2 int := 10;
  adj_reps3 int := 8;
BEGIN
  SELECT * INTO wex FROM public.workout_exercises WHERE id = p_workout_exercise_id;
  IF NOT FOUND THEN RETURN; END IF;

  -- Get last completed set
  SELECT weight, reps
  INTO s
  FROM public.workout_sets
  WHERE workout_exercise_id = p_workout_exercise_id
    AND is_completed = true
  ORDER BY COALESCE(weight,0) DESC, completed_at DESC
  LIMIT 1;

  IF NOT FOUND OR s.weight IS NULL THEN
    top_weight := NULL;
  ELSE
    top_weight := s.weight;
    top_reps   := s.reps;
  END IF;

  -- Fallback to target weight if no completed sets
  IF top_weight IS NULL THEN
    SELECT target_weight INTO top_weight FROM public.workout_exercises WHERE id = p_workout_exercise_id;
  END IF;

  IF top_weight IS NULL THEN
    RETURN;
  END IF;

  -- Baseline warmup steps
  steps := jsonb_build_array(
    jsonb_build_object('label','W1','percent',0.40,'reps',adj_reps1,'rest_sec',45),
    jsonb_build_object('label','W2','percent',0.60,'reps',adj_reps2,'rest_sec',60),
    jsonb_build_object('label','W3','percent',0.80,'reps',adj_reps3,'rest_sec',60)
  );

  -- Adjust by feedback
  IF wex.warmup_feedback = 'too_little' THEN
    steps := jsonb_set(steps,'{0,reps}', to_jsonb(adj_reps1+3), false);
    steps := jsonb_set(steps,'{1,reps}', to_jsonb(adj_reps2+2), false);
    steps := jsonb_set(steps,'{2,reps}', to_jsonb(adj_reps3+1), false);
  ELSIF wex.warmup_feedback = 'too_much' THEN
    steps := jsonb_set(steps,'{0,reps}', to_jsonb(adj_reps1-2), false);
    steps := jsonb_set(steps,'{1,reps}', to_jsonb(adj_reps2-2), false);
  END IF;

  base := jsonb_build_object(
    'strategy','ramped',
    'top_weight', top_weight,
    'steps', steps,
    'last_recalc_at', to_jsonb(now()),
    'source','last_set'
  );

  UPDATE public.workout_exercises
  SET warmup_plan = base
  WHERE id = p_workout_exercise_id;
END$$;

-- Trigger to recalc warmup after set completion
CREATE OR REPLACE FUNCTION public.trg_after_set_logged()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.is_completed = true THEN
    PERFORM public.recalc_warmup_from_last_set(NEW.workout_exercise_id);
  END IF;
  RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS trg_wset_after_insupd ON public.workout_sets;
CREATE TRIGGER trg_wset_after_insupd
AFTER INSERT OR UPDATE OF is_completed, weight, reps
ON public.workout_sets
FOR EACH ROW
EXECUTE FUNCTION public.trg_after_set_logged();

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_workout_sets_exercise_completed 
ON public.workout_sets(workout_exercise_id, set_index, side, is_completed, completed_at);

CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout 
ON public.workout_exercises(workout_id);

CREATE INDEX IF NOT EXISTS idx_template_exercises_template 
ON public.template_exercises(template_id, order_index);

-- Seed common handles
INSERT INTO public.handles (id, slug, category)
VALUES
  (gen_random_uuid(),'straight-bar','bar'),
  (gen_random_uuid(),'ez-bar','bar'),
  (gen_random_uuid(),'v-handle','handle'),
  (gen_random_uuid(),'triangle-row','handle'),
  (gen_random_uuid(),'rope','rope'),
  (gen_random_uuid(),'single-d','handle')
ON CONFLICT (slug) DO NOTHING;