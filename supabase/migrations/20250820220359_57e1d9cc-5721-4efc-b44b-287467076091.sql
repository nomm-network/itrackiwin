-- PHASE 1: Extensions and Performance Indexes
-- 1) trigram extension for fast search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- indexes for fast search on translated names
CREATE INDEX IF NOT EXISTS idx_exercises_translations_name_trgm
  ON public.exercises_translations USING gin (name gin_trgm_ops);

-- heavy workout lists for user
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id
  ON public.workout_exercises (workout_id);

CREATE INDEX IF NOT EXISTS idx_workout_sets_workout_exercise_id
  ON public.workout_sets (workout_exercise_id);

-- many-to-many grips <-> set
CREATE INDEX IF NOT EXISTS idx_workout_set_grips_set_id
  ON public.workout_set_grips (workout_set_id);

CREATE INDEX IF NOT EXISTS idx_workout_set_grips_grip_id
  ON public.workout_set_grips (grip_id);

-- PHASE 2: Normalize Default Grips (replace exercises.default_grips JSONB)
-- 1) dedicated table for exercise <-> grip mapping with ordering
CREATE TABLE IF NOT EXISTS public.exercise_default_grips (
  exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  grip_id uuid NOT NULL REFERENCES public.grips(id) ON DELETE RESTRICT,
  order_index int NOT NULL DEFAULT 1,
  PRIMARY KEY (exercise_id, grip_id)
);

-- 2) migrate data from JSONB (when JSON has id objects)
INSERT INTO public.exercise_default_grips (exercise_id, grip_id, order_index)
SELECT e.id,
       (elem->>'id')::uuid as grip_id,
       row_number() OVER (PARTITION BY e.id ORDER BY ord) as order_index
FROM public.exercises e
CROSS JOIN LATERAL (
  SELECT elem, ord
  FROM jsonb_array_elements(e.default_grips) WITH ORDINALITY AS t(elem, ord)
) j
WHERE e.default_grips IS NOT NULL
  AND (elem ? 'id')
ON CONFLICT DO NOTHING;

-- 2.b. fallback: when JSON had "slug" 
INSERT INTO public.exercise_default_grips (exercise_id, grip_id, order_index)
SELECT e.id,
       g.id,
       row_number() OVER (PARTITION BY e.id ORDER BY ord) as order_index
FROM public.exercises e
CROSS JOIN LATERAL (
  SELECT elem, ord
  FROM jsonb_array_elements(e.default_grips) WITH ORDINALITY AS t(elem, ord)
) j
JOIN public.grips g ON g.slug = (elem->>'slug')
WHERE e.default_grips IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.exercise_default_grips edg
    WHERE edg.exercise_id = e.id
  )
ON CONFLICT DO NOTHING;

-- 3) add array column for fast reads
ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS default_grip_ids uuid[] DEFAULT '{}';

UPDATE public.exercises e
SET default_grip_ids = (
  SELECT COALESCE(array_agg(grip_id ORDER BY order_index), '{}')
  FROM public.exercise_default_grips d
  WHERE d.exercise_id = e.id
);

-- 4) drop legacy JSON column
ALTER TABLE public.exercises
  DROP COLUMN IF EXISTS default_grips;