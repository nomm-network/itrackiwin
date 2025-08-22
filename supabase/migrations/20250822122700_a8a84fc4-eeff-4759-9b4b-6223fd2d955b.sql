-- Create a security definer function to safely get 1RM data for current user
CREATE OR REPLACE FUNCTION public.get_user_exercise_1rm(p_exercise_id UUID DEFAULT NULL)
RETURNS TABLE(
  exercise_id UUID,
  estimated_1rm NUMERIC,
  max_weight NUMERIC,
  max_reps INTEGER,
  total_working_sets BIGINT,
  last_updated TIMESTAMPTZ
) 
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    we.exercise_id,
    MAX(epley_1rm(ws.weight, ws.reps)) AS estimated_1rm,
    MAX(ws.weight) AS max_weight,
    MAX(ws.reps) AS max_reps,
    COUNT(*) AS total_working_sets,
    MAX(ws.completed_at) AS last_updated
  FROM workouts w
  JOIN workout_exercises we ON we.workout_id = w.id
  JOIN workout_sets ws ON ws.workout_exercise_id = we.id
  WHERE w.user_id = auth.uid()
    AND ws.is_completed = true
    AND ws.set_kind IN ('normal', 'top_set', 'backoff')
    AND ws.weight IS NOT NULL
    AND ws.reps IS NOT NULL
    AND ws.reps > 0
    AND w.ended_at IS NOT NULL
    AND (p_exercise_id IS NULL OR we.exercise_id = p_exercise_id)
  GROUP BY we.exercise_id;
$$;