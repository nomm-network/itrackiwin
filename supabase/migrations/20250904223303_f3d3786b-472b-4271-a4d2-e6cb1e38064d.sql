-- Create a simple function to log workout sets
CREATE OR REPLACE FUNCTION log_simple_workout_set(
  p_workout_exercise_id uuid,
  p_set_index integer,
  p_weight_kg numeric,
  p_reps integer,
  p_set_kind text DEFAULT 'normal'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_set_id uuid;
  v_user_id uuid := auth.uid();
BEGIN
  -- Verify user owns this workout
  IF NOT EXISTS (
    SELECT 1 FROM workout_exercises we
    JOIN workouts w ON w.id = we.workout_id
    WHERE we.id = p_workout_exercise_id AND w.user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Unauthorized or workout not found';
  END IF;

  -- Insert or update the workout set
  INSERT INTO workout_sets (
    workout_exercise_id,
    set_index,
    weight_kg,
    reps,
    set_kind,
    is_completed,
    completed_at
  ) VALUES (
    p_workout_exercise_id,
    p_set_index,
    p_weight_kg,
    p_reps,
    p_set_kind::set_type,
    true,
    now()
  )
  ON CONFLICT (workout_exercise_id, set_index)
  DO UPDATE SET
    weight_kg = EXCLUDED.weight_kg,
    reps = EXCLUDED.reps,
    is_completed = true,
    completed_at = now()
  RETURNING id INTO v_set_id;

  RETURN v_set_id;
END;
$$;