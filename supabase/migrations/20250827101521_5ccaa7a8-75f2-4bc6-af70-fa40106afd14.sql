-- 1) Create side type enum
DO $$ BEGIN
  CREATE TYPE side_type AS ENUM ('left','right','both','n/a');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Add unilateral capabilities to exercises
ALTER TABLE public.exercises
ADD COLUMN IF NOT EXISTS unilateral_capability text
  CHECK (unilateral_capability IN ('bilateral_only','unilateral_only','either'))
  DEFAULT 'bilateral_only';

ALTER TABLE public.exercises  
ADD COLUMN IF NOT EXISTS default_weight_input_mode text
  CHECK (default_weight_input_mode IN ('total','per_side','stack'))
  DEFAULT 'total';

-- 3) Add unilateral mode to workout exercises
ALTER TABLE public.workout_exercises
ADD COLUMN IF NOT EXISTS unilateral_mode_override text
  CHECK (unilateral_mode_override IN ('bilateral','unilateral_alternating','unilateral_same','auto'))
  DEFAULT 'auto';

-- 4) Add per-side tracking to workout sets
ALTER TABLE public.workout_sets
ADD COLUMN IF NOT EXISTS left_weight numeric,
ADD COLUMN IF NOT EXISTS left_reps integer,
ADD COLUMN IF NOT EXISTS right_weight numeric,
ADD COLUMN IF NOT EXISTS right_reps integer,
ADD COLUMN IF NOT EXISTS side_notes jsonb,
ADD COLUMN IF NOT EXISTS side_pain jsonb,
ADD COLUMN IF NOT EXISTS is_alternating boolean,
ADD COLUMN IF NOT EXISTS side side_type NOT NULL DEFAULT 'n/a',
ADD COLUMN IF NOT EXISTS side_pair_key uuid,
ADD COLUMN IF NOT EXISTS side_order smallint;

-- 5) Add generated column for total weight
ALTER TABLE public.workout_sets
ADD COLUMN IF NOT EXISTS total_weight numeric GENERATED ALWAYS AS
  (COALESCE(weight,0) + COALESCE(left_weight,0) + COALESCE(right_weight,0)) STORED;

-- 6) Create user side bias tracking table
CREATE TABLE IF NOT EXISTS public.user_side_bias (
  user_id uuid NOT NULL,
  exercise_id uuid NOT NULL,
  left_top numeric,
  right_top numeric,
  bias_pct numeric,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, exercise_id)
);

-- 7) Create user exercise side stats table  
CREATE TABLE IF NOT EXISTS public.user_exercise_side_stats (
  user_id uuid NOT NULL,
  exercise_id uuid NOT NULL,
  side side_type NOT NULL,
  best_weight numeric,
  best_reps int,
  last_completed_at timestamptz,
  PRIMARY KEY (user_id, exercise_id, side)
);

-- 8) Add helpful indexes
CREATE INDEX IF NOT EXISTS idx_sets_we_idx_side
  ON public.workout_sets (workout_exercise_id, set_index, side);

CREATE INDEX IF NOT EXISTS idx_user_side_bias_lookup
  ON public.user_side_bias (user_id, exercise_id);

-- 9) Set up RLS policies for new tables
ALTER TABLE public.user_side_bias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_exercise_side_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own side bias" 
ON public.user_side_bias 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own side stats" 
ON public.user_exercise_side_stats 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 10) Backfill some common unilateral exercises
UPDATE public.exercises
SET unilateral_capability = 'either',
    default_weight_input_mode = 'per_side'
WHERE slug IN (
  'dumbbell-row',
  'single-arm-row', 
  'cable-curl',
  'leg-curl-seated',
  'single-arm-press',
  'dumbbell-bench-press'
) AND unilateral_capability = 'bilateral_only';

-- Set stack exercises to stack input mode
UPDATE public.exercises  
SET default_weight_input_mode = 'stack'
WHERE slug LIKE '%stack%' OR slug LIKE '%machine%' OR slug LIKE '%cable%';