-- Fix the log_simple_workout_set function constraint
CREATE OR REPLACE FUNCTION public.log_simple_workout_set(
  p_workout_exercise_id uuid,
  p_set_index integer,
  p_reps integer,
  p_weight_kg numeric,
  p_is_completed boolean DEFAULT true,
  p_grip_key text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_set_id uuid;
  v_user_id uuid;
  v_exercise_id uuid;
  v_grip_key text;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Get exercise_id and resolve grip_key
  SELECT we.exercise_id, COALESCE(p_grip_key, we.grip_key)
  INTO v_exercise_id, v_grip_key
  FROM workout_exercises we
  WHERE we.id = p_workout_exercise_id;

  IF v_exercise_id IS NULL THEN
    RAISE EXCEPTION 'Workout exercise not found: %', p_workout_exercise_id;
  END IF;

  -- Insert or update the workout set
  INSERT INTO workout_sets (
    workout_exercise_id,
    set_index,
    reps,
    weight_kg,
    is_completed,
    completed_at,
    grip_key
  ) VALUES (
    p_workout_exercise_id,
    p_set_index,
    p_reps,
    p_weight_kg,
    p_is_completed,
    CASE WHEN p_is_completed THEN now() ELSE NULL END,
    v_grip_key
  )
  ON CONFLICT (workout_exercise_id, set_index)
  DO UPDATE SET
    reps = EXCLUDED.reps,
    weight_kg = EXCLUDED.weight_kg,
    is_completed = EXCLUDED.is_completed,
    completed_at = CASE WHEN EXCLUDED.is_completed THEN now() ELSE workout_sets.completed_at END,
    grip_key = EXCLUDED.grip_key
  RETURNING id INTO v_set_id;

  -- Update personal record if this is a completed set
  IF p_is_completed AND p_weight_kg > 0 THEN
    -- Use the correct unique constraint name from the actual database
    INSERT INTO personal_records (
      user_id,
      exercise_id,
      grip_key,
      kind,
      value,
      unit,
      achieved_at
    ) VALUES (
      v_user_id,
      v_exercise_id,
      COALESCE(v_grip_key, '__none__'),
      'heaviest',
      p_weight_kg,
      'kg',
      now()
    )
    ON CONFLICT ON CONSTRAINT personal_records_user_ex_grip_kind_unique
    DO UPDATE SET
      value = GREATEST(EXCLUDED.value, personal_records.value),
      achieved_at = CASE 
        WHEN EXCLUDED.value > personal_records.value 
        THEN EXCLUDED.achieved_at 
        ELSE personal_records.achieved_at 
      END;
  END IF;

  RETURN v_set_id;
END;
$$;