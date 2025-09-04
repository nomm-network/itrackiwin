-- Create a simple RPC function to get last sets for exercises if it doesn't exist
CREATE OR REPLACE FUNCTION public.get_last_sets_for_exercises(p_exercise_ids uuid[])
RETURNS TABLE(
  exercise_id uuid,
  prev_weight_kg numeric,
  prev_reps integer,
  prev_date text,
  base_weight_kg numeric,
  readiness_multiplier numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (we.exercise_id)
    we.exercise_id,
    ws.weight_kg as prev_weight_kg,
    ws.reps as prev_reps,
    to_char(ws.completed_at, 'YYYY-MM-DD') as prev_date,
    ws.weight_kg as base_weight_kg,
    1.0::numeric as readiness_multiplier
  FROM workout_exercises we
  JOIN workout_sets ws ON ws.workout_exercise_id = we.id
  WHERE we.exercise_id = ANY(p_exercise_ids)
    AND ws.completed_at IS NOT NULL
    AND ws.is_completed = true
  ORDER BY we.exercise_id, ws.completed_at DESC;
END;
$function$;