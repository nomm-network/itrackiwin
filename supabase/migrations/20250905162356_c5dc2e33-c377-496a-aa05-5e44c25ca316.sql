-- BLOCKER 4: Fix set logging to use grip-aware constraint only
-- Remove any lingering 3-column constraint paths

-- Check if we need to update any existing database functions that use the old ON CONFLICT
-- We'll create a comprehensive set logging function that only uses the 4-column constraint

CREATE OR REPLACE FUNCTION public.log_set_with_grip_aware_constraint(
  p_workout_exercise_id uuid,
  p_set_index integer,
  p_reps integer,
  p_weight_kg numeric,
  p_grip_key text DEFAULT NULL,
  p_set_kind text DEFAULT 'normal',
  p_rest_seconds integer DEFAULT NULL,
  p_rpe integer DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_set_id uuid;
  v_user_id uuid;
  v_exercise_id uuid;
  v_pr_kind text;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get exercise_id for PR logging
  SELECT exercise_id INTO v_exercise_id
  FROM workout_exercises 
  WHERE id = p_workout_exercise_id;

  -- Insert the set
  INSERT INTO workout_sets (
    workout_exercise_id,
    set_index,
    reps,
    weight_kg,
    grip_key,
    set_kind,
    is_completed,
    completed_at,
    rest_seconds,
    rpe
  )
  VALUES (
    p_workout_exercise_id,
    p_set_index,
    p_reps,
    p_weight_kg,
    p_grip_key,
    p_set_kind::set_type,
    true,
    now(),
    p_rest_seconds,
    p_rpe
  )
  RETURNING id INTO v_set_id;

  -- Update personal records using ONLY the 4-column grip-aware constraint
  -- Determine PR kind
  v_pr_kind := CASE 
    WHEN p_reps = 1 THEN '1rm'
    WHEN p_reps <= 3 THEN '3rm'
    WHEN p_reps <= 5 THEN '5rm'
    WHEN p_reps <= 8 THEN '8rm'
    WHEN p_reps <= 12 THEN '12rm'
    ELSE 'volume'
  END;

  -- Insert or update PR using the 4-column constraint ONLY
  INSERT INTO personal_records (
    user_id,
    exercise_id,
    grip_key,
    kind,
    weight_kg,
    reps,
    achieved_at,
    workout_set_id
  )
  VALUES (
    v_user_id,
    v_exercise_id,
    COALESCE(p_grip_key, '__none__'),
    v_pr_kind,
    p_weight_kg,
    p_reps,
    now(),
    v_set_id
  )
  ON CONFLICT (user_id, exercise_id, COALESCE(grip_key, '__none__'), kind)
  DO UPDATE SET
    weight_kg = GREATEST(personal_records.weight_kg, EXCLUDED.weight_kg),
    reps = CASE 
      WHEN EXCLUDED.weight_kg > personal_records.weight_kg THEN EXCLUDED.reps
      ELSE personal_records.reps
    END,
    achieved_at = CASE 
      WHEN EXCLUDED.weight_kg > personal_records.weight_kg THEN EXCLUDED.achieved_at
      ELSE personal_records.achieved_at
    END,
    workout_set_id = CASE 
      WHEN EXCLUDED.weight_kg > personal_records.weight_kg THEN EXCLUDED.workout_set_id
      ELSE personal_records.workout_set_id
    END;

  RETURN v_set_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.log_set_with_grip_aware_constraint TO authenticated;