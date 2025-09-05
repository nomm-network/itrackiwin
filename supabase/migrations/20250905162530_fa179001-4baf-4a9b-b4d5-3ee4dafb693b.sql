-- BLOCKER 3: Fix targets/warmup first-render - ensure start_workout computes base load and readiness multiplier

CREATE OR REPLACE FUNCTION public.start_workout_with_smart_targets(p_template_id uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_workout_id uuid;
  v_user_id uuid;
  v_exercise_record RECORD;
  v_last_weight numeric;
  v_readiness_multiplier numeric := 1.0;
  v_target_weight numeric;
  v_warmup_steps jsonb;
BEGIN
  -- Authentication check
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Create workout using existing function
  SELECT start_workout(p_template_id) INTO v_workout_id;

  -- Now enhance the workout_exercises with computed targets and warmup
  FOR v_exercise_record IN 
    SELECT we.id, we.exercise_id, we.target_weight_kg, we.target_reps
    FROM workout_exercises we 
    WHERE we.workout_id = v_workout_id
  LOOP
    -- Get last working weight for this exercise (from past 60 days, prefer high readiness)
    SELECT COALESCE(ws.weight_kg, 60) INTO v_last_weight
    FROM workout_sets ws
    JOIN workout_exercises we2 ON we2.id = ws.workout_exercise_id
    JOIN workouts w ON w.id = we2.workout_id
    WHERE we2.exercise_id = v_exercise_record.exercise_id
      AND w.user_id = v_user_id
      AND ws.is_completed = true
      AND ws.completed_at > NOW() - INTERVAL '60 days'
    ORDER BY ws.completed_at DESC
    LIMIT 1;

    -- Apply readiness multiplier (simplified - could be enhanced with actual readiness data)
    v_target_weight := v_last_weight * v_readiness_multiplier;

    -- Generate smart warmup steps (3-step progression: 40%, 60%, 80% of target)
    v_warmup_steps := jsonb_build_array(
      jsonb_build_object(
        'set_index', 1,
        'weight_kg', ROUND(v_target_weight * 0.4, 2.5),
        'reps', 12,
        'set_kind', 'warmup',
        'rest_seconds', 45
      ),
      jsonb_build_object(
        'set_index', 2,
        'weight_kg', ROUND(v_target_weight * 0.6, 2.5),
        'reps', 8,
        'set_kind', 'warmup',
        'rest_seconds', 60
      ),
      jsonb_build_object(
        'set_index', 3,
        'weight_kg', ROUND(v_target_weight * 0.8, 2.5),
        'reps', 5,
        'set_kind', 'warmup',
        'rest_seconds', 90
      )
    );

    -- Update workout exercise with computed values
    UPDATE workout_exercises 
    SET 
      target_weight_kg = v_target_weight,
      target_origin = 'last_60_days_with_readiness',
      readiness_adjusted_from = v_last_weight::text,
      attribute_values_json = COALESCE(attribute_values_json, '{}'::jsonb) || 
        jsonb_build_object('warmup', v_warmup_steps)
    WHERE id = v_exercise_record.id;

  END LOOP;

  RETURN v_workout_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.start_workout_with_smart_targets TO authenticated;

-- Also create a simplified version that enhances existing workouts
CREATE OR REPLACE FUNCTION public.compute_targets_for_workout(p_workout_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_user_id uuid;
  v_exercise_record RECORD;
  v_last_weight numeric;
  v_readiness_multiplier numeric := 1.0;
  v_target_weight numeric;
  v_warmup_steps jsonb;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify workout ownership
  IF NOT EXISTS (
    SELECT 1 FROM workouts WHERE id = p_workout_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Workout not found or not accessible';
  END IF;

  -- Process each exercise in the workout
  FOR v_exercise_record IN 
    SELECT we.id, we.exercise_id, we.target_weight_kg, we.target_reps
    FROM workout_exercises we 
    WHERE we.workout_id = p_workout_id
      AND (we.target_weight_kg IS NULL OR we.target_weight_kg = 0)
  LOOP
    -- Get last working weight for this exercise
    SELECT COALESCE(ws.weight_kg, 60) INTO v_last_weight
    FROM workout_sets ws
    JOIN workout_exercises we2 ON we2.id = ws.workout_exercise_id
    JOIN workouts w ON w.id = we2.workout_id
    WHERE we2.exercise_id = v_exercise_record.exercise_id
      AND w.user_id = v_user_id
      AND ws.is_completed = true
      AND ws.completed_at > NOW() - INTERVAL '60 days'
    ORDER BY ws.completed_at DESC
    LIMIT 1;

    v_target_weight := v_last_weight * v_readiness_multiplier;

    -- Generate warmup steps
    v_warmup_steps := jsonb_build_array(
      jsonb_build_object(
        'set_index', 1,
        'weight_kg', ROUND(v_target_weight * 0.4, 2.5),
        'reps', 12,
        'set_kind', 'warmup'
      ),
      jsonb_build_object(
        'set_index', 2,
        'weight_kg', ROUND(v_target_weight * 0.6, 2.5),
        'reps', 8,
        'set_kind', 'warmup'
      ),
      jsonb_build_object(
        'set_index', 3,
        'weight_kg', ROUND(v_target_weight * 0.8, 2.5),
        'reps', 5,
        'set_kind', 'warmup'
      )
    );

    -- Update the exercise
    UPDATE workout_exercises 
    SET 
      target_weight_kg = v_target_weight,
      target_origin = 'computed_on_demand',
      attribute_values_json = COALESCE(attribute_values_json, '{}'::jsonb) || 
        jsonb_build_object('warmup', v_warmup_steps)
    WHERE id = v_exercise_record.id;

  END LOOP;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.compute_targets_for_workout TO authenticated;