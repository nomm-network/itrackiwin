-- Task 1: Core Database Indexes & Constraints
-- Sets & Metrics Optimization

-- Unique constraint: 1 set per position in workout exercise
ALTER TABLE public.workout_sets
ADD CONSTRAINT uq_workout_sets_ex_idx
UNIQUE (workout_exercise_id, set_index);

-- Fast fetch "all sets for exercise, in order"
CREATE INDEX IF NOT EXISTS idx_workout_sets_exercise_order
ON public.workout_sets (workout_exercise_id, set_index DESC);

-- Metric lookups per set
CREATE INDEX IF NOT EXISTS idx_ws_metrics_set_metric
ON public.workout_set_metric_values (workout_set_id, metric_def_id);

-- Backfills like "all metric values for a set"
CREATE INDEX IF NOT EXISTS idx_ws_metrics_set
ON public.workout_set_metric_values (workout_set_id);

-- Template/Exercise Ordering
-- Immediate workout exercise list rendering
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_order
ON public.workout_exercises (workout_id, order_index);

-- Grips Optimization
-- Default grips lookup
CREATE INDEX IF NOT EXISTS idx_exercise_default_grips_ex_order
ON public.exercise_default_grips (exercise_id, order_index);

-- Set-specific grips
CREATE INDEX IF NOT EXISTS idx_workout_set_grips_set
ON public.workout_set_grips (workout_set_id);

CREATE INDEX IF NOT EXISTS idx_workout_set_grips_grip
ON public.workout_set_grips (grip_id);

-- Personal Records & History
-- PR lookups for AI suggestions
CREATE INDEX IF NOT EXISTS idx_pr_user_ex_time
ON public.personal_records (user_id, exercise_id, achieved_at DESC);

-- Exercise Search
-- Enable fuzzy search extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Fuzzy search on exercise names
CREATE INDEX IF NOT EXISTS idx_exercises_name_trgm
ON public.exercises USING gin (name gin_trgm_ops);

-- Common filter indexes
CREATE INDEX IF NOT EXISTS idx_exercises_equipment
ON public.exercises (equipment_id);

CREATE INDEX IF NOT EXISTS idx_exercises_body_part
ON public.exercises (body_part_id);

-- Task 2: Performance Materialized Views

-- Last Set Snapshot View
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_last_set_per_user_exercise AS
SELECT w.user_id,
       we.exercise_id,
       ws.weight, 
       ws.reps, 
       ws.completed_at,
       row_number() OVER (PARTITION BY w.user_id, we.exercise_id ORDER BY ws.completed_at DESC) AS rn
FROM public.workout_sets ws
JOIN public.workout_exercises we ON we.id = ws.workout_exercise_id
JOIN public.workouts w ON w.id = we.workout_id
WHERE ws.is_completed = true;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_last_set_per_user_exercise
ON public.mv_last_set_per_user_exercise (user_id, exercise_id, rn);

-- Personal Records View
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_pr_weight_per_user_exercise AS
SELECT w.user_id,
       we.exercise_id,
       max(ws.weight) AS best_weight
FROM public.workout_sets ws
JOIN public.workout_exercises we ON we.id = ws.workout_exercise_id
JOIN public.workouts w ON w.id = we.workout_id
WHERE ws.is_completed = true AND ws.weight IS NOT NULL
GROUP BY w.user_id, we.exercise_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_pr_weight_per_user_exercise
ON public.mv_pr_weight_per_user_exercise (user_id, exercise_id);

-- RPC function to refresh materialized views for specific user and exercise
CREATE OR REPLACE FUNCTION public.refresh_exercise_views(p_user_id uuid, p_exercise_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Refresh last set view for specific user+exercise
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_last_set_per_user_exercise;
  
  -- Refresh PR view for specific user+exercise  
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_pr_weight_per_user_exercise;
END;
$$;