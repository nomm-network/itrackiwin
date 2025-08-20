-- PHASE 3: Optimize Personal Records with grip_ids array
ALTER TABLE public.personal_records
  ADD COLUMN IF NOT EXISTS grip_ids uuid[];

-- Populate from workout_set_grips if workout_set_id exists
UPDATE public.personal_records pr
SET grip_ids = (
  SELECT COALESCE(array_agg(wsg.grip_id ORDER BY wsg.created_at), '{}')
  FROM public.workout_set_grips wsg
  JOIN public.workout_sets ws ON ws.id = wsg.workout_set_id
  WHERE ws.id = pr.workout_set_id
)
WHERE pr.workout_set_id IS NOT NULL
  AND pr.grip_ids IS NULL;

-- Fallback from JSON (if grip_combination has 'id' objects)
UPDATE public.personal_records pr
SET grip_ids = (
  SELECT COALESCE(array_agg( (elem->>'id')::uuid ), '{}')
  FROM jsonb_array_elements(pr.grip_combination) elem
  WHERE pr.grip_combination IS NOT NULL
)
WHERE pr.grip_ids IS NULL;

-- PHASE 4: Dynamic Metrics System
-- Create enum for metric value types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'metric_value_type') THEN
    CREATE TYPE metric_value_type AS ENUM ('int','numeric','text','bool','enum');
  END IF;
END$$;

-- 1) Global catalog of metrics
CREATE TABLE IF NOT EXISTS public.metric_defs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,            -- ex: 'incline', 'resistance_level'
  label text NOT NULL,          -- default label (can add translations later)
  value_type metric_value_type NOT NULL,
  unit text,                    -- ex: '%', 'level', 'km/h', 'rpm', 'W', 'bpm'
  enum_options text[],          -- if value_type='enum'
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(key)
);

-- Enable RLS on metric_defs
ALTER TABLE public.metric_defs ENABLE ROW LEVEL SECURITY;

-- RLS policies for metric_defs
CREATE POLICY "metric_defs_select_all" 
ON public.metric_defs 
FOR SELECT 
USING (true);

CREATE POLICY "metric_defs_admin_manage" 
ON public.metric_defs 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- 2) Mapping metrics to equipment OR exercise (XOR constraint)
CREATE TABLE IF NOT EXISTS public.exercise_metric_defs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id uuid REFERENCES public.exercises(id) ON DELETE CASCADE,
  equipment_id uuid REFERENCES public.equipment(id) ON DELETE CASCADE,
  metric_id uuid NOT NULL REFERENCES public.metric_defs(id) ON DELETE CASCADE,
  is_required boolean NOT NULL DEFAULT false,
  default_value jsonb,             -- ex: {"int":5} or {"numeric":2.5}
  order_index int NOT NULL DEFAULT 1,
  CHECK ( ((exercise_id IS NOT NULL)::int + (equipment_id IS NOT NULL)::int) = 1 ),
  UNIQUE (exercise_id, metric_id),
  UNIQUE (equipment_id, metric_id)
);

-- Enable RLS on exercise_metric_defs
ALTER TABLE public.exercise_metric_defs ENABLE ROW LEVEL SECURITY;

-- RLS policies for exercise_metric_defs
CREATE POLICY "exercise_metric_defs_select_all" 
ON public.exercise_metric_defs 
FOR SELECT 
USING (true);

CREATE POLICY "exercise_metric_defs_admin_manage" 
ON public.exercise_metric_defs 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- 3) Actual values on workout sets
CREATE TABLE IF NOT EXISTS public.workout_set_metric_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_set_id uuid NOT NULL REFERENCES public.workout_sets(id) ON DELETE CASCADE,
  metric_def_id uuid NOT NULL REFERENCES public.exercise_metric_defs(id) ON DELETE CASCADE,
  int_value int,
  numeric_value numeric,
  text_value text,
  bool_value boolean,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workout_set_id, metric_def_id)
);

-- Enable RLS on workout_set_metric_values
ALTER TABLE public.workout_set_metric_values ENABLE ROW LEVEL SECURITY;

-- RLS policies for workout_set_metric_values (user can only see their own data)
CREATE POLICY "workout_set_metric_values_per_user_select" 
ON public.workout_set_metric_values 
FOR SELECT 
USING (EXISTS (
  SELECT 1
  FROM workout_sets ws
  JOIN workout_exercises we ON we.id = ws.workout_exercise_id
  JOIN workouts w ON w.id = we.workout_id
  WHERE ws.id = workout_set_metric_values.workout_set_id 
    AND w.user_id = auth.uid()
));

CREATE POLICY "workout_set_metric_values_per_user_mutate" 
ON public.workout_set_metric_values 
FOR ALL 
USING (EXISTS (
  SELECT 1
  FROM workout_sets ws
  JOIN workout_exercises we ON we.id = ws.workout_exercise_id
  JOIN workouts w ON w.id = we.workout_id
  WHERE ws.id = workout_set_metric_values.workout_set_id 
    AND w.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1
  FROM workout_sets ws
  JOIN workout_exercises we ON we.id = ws.workout_exercise_id
  JOIN workouts w ON w.id = we.workout_id
  WHERE ws.id = workout_set_metric_values.workout_set_id 
    AND w.user_id = auth.uid()
));

-- Performance indexes for metrics
CREATE INDEX IF NOT EXISTS idx_ws_metric_values_set_id 
ON public.workout_set_metric_values (workout_set_id);

CREATE INDEX IF NOT EXISTS idx_ws_metric_values_metric 
ON public.workout_set_metric_values (metric_def_id);