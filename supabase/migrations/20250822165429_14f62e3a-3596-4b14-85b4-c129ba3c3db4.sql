-- Drop the materialized view and existing function
DROP MATERIALIZED VIEW IF EXISTS public.mv_user_exercise_1rm CASCADE;
DROP FUNCTION IF EXISTS public.get_user_exercise_1rm CASCADE;

-- Create a new function to get 1RM data 
CREATE OR REPLACE FUNCTION public.get_user_exercise_1rm(p_user_id uuid DEFAULT auth.uid())
RETURNS TABLE (
  user_id uuid,
  exercise_id uuid,
  one_rm numeric,
  last_set_at timestamp with time zone,
  refreshed_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT
    w.user_id,
    we.exercise_id,
    MAX(ws.weight * (1 + (ws.reps::numeric / 30.0)))     AS one_rm,
    MAX(ws.completed_at)                                 AS last_set_at,
    NOW()                                                AS refreshed_at
  FROM public.workout_sets ws
  JOIN public.workout_exercises we ON we.id = ws.workout_exercise_id
  JOIN public.workouts w           ON w.id  = we.workout_id
  WHERE
    ws.is_completed = true
    AND ws.weight IS NOT NULL
    AND ws.reps   IS NOT NULL
    AND ws.reps > 0
    AND w.user_id = COALESCE(p_user_id, auth.uid())
  GROUP BY
    w.user_id, we.exercise_id;
$$;

-- Update the refresh function to be a no-op since we're using a function now
CREATE OR REPLACE FUNCTION public.refresh_1rm_materialized_view()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Since we're using a function instead of materialized view, no refresh needed
  -- The function will always return current data
  RETURN NEW;
END;
$$;