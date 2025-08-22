-- Create the materialized view for 1RM calculations
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_user_exercise_1rm
AS
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
GROUP BY
  w.user_id, we.exercise_id
WITH NO DATA;

-- Add a unique index to support CONCURRENT REFRESH
CREATE UNIQUE INDEX IF NOT EXISTS mv_user_exercise_1rm_pk
  ON public.mv_user_exercise_1rm (user_id, exercise_id);

-- Initial populate
REFRESH MATERIALIZED VIEW public.mv_user_exercise_1rm;

-- Create or replace the resilient refresh function
CREATE OR REPLACE FUNCTION public.refresh_1rm_materialized_view()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  mv_exists boolean;
BEGIN
  -- Only when a completed, countable strength set
  IF NEW.is_completed = true
     AND NEW.set_kind IN ('normal','top_set','backoff')
     AND NEW.weight IS NOT NULL
     AND NEW.reps   IS NOT NULL
     AND NEW.reps > 0 THEN

    -- Check MV existence safely
    SELECT EXISTS (
      SELECT 1 FROM pg_matviews WHERE schemaname = 'public' AND matviewname = 'mv_user_exercise_1rm'
    ) INTO mv_exists;

    IF mv_exists THEN
      -- Safe concurrent refresh
      REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_user_exercise_1rm;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Recreate the trigger to ensure it uses the new function
DROP TRIGGER IF EXISTS trigger_refresh_1rm_on_set_complete ON public.workout_sets;

CREATE TRIGGER trigger_refresh_1rm_on_set_complete
AFTER INSERT OR UPDATE OF is_completed, weight, reps, set_kind
ON public.workout_sets
FOR EACH ROW
EXECUTE FUNCTION public.refresh_1rm_materialized_view();