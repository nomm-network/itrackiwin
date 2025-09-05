-- Fix the start_workout function to handle readiness_adjusted_from correctly
CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL::uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_workout_id uuid;
  v_user_id    uuid;
  v_we_record  record;
  v_base_weight numeric;
  v_readiness_score numeric;
  v_multiplier numeric;
  v_target_weight numeric;
  v_warmup_steps jsonb;
BEGIN
  -- Authentication check
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Create the workout shell
  INSERT INTO public.workouts (user_id, started_at)
  VALUES (v_user_id, now())
  RETURNING id INTO v_workout_id;

  -- If no template, we're done
  IF p_template_id IS NULL THEN
    RETURN v_workout_id;
  END IF;

  -- Verify template access
  IF NOT EXISTS (
    SELECT 1 FROM public.workout_templates wt
    WHERE wt.id = p_template_id AND wt.user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Template % not found or not accessible', p_template_id;
  END IF;

  -- Copy template exercises to workout exercises with basic fields only
  INSERT INTO public.workout_exercises (
    workout_id, 
    exercise_id, 
    order_index,
    target_sets,
    target_reps,
    target_weight_kg,
    weight_unit,
    rest_seconds,
    notes
  )
  SELECT 
    v_workout_id,
    te.exercise_id,
    COALESCE(te.order_index, ROW_NUMBER() OVER (ORDER BY te.id)),
    te.default_sets,
    te.target_reps,
    NULL, -- Will be computed below
    COALESCE(te.weight_unit, 'kg'),
    te.rest_seconds,
    te.notes
  FROM template_exercises te
  WHERE te.template_id = p_template_id
  ORDER BY COALESCE(te.order_index, 999999), te.id;

  -- Get a readiness score (fixed column names)
  SELECT COALESCE(AVG(
    CASE 
      WHEN energy IS NOT NULL AND sleep_quality IS NOT NULL THEN (energy + sleep_quality) / 2.0
      ELSE 70.0 
    END
  ), 70.0) INTO v_readiness_score
  FROM readiness_checkins 
  WHERE user_id = v_user_id 
    AND created_at >= NOW() - INTERVAL '7 days';

  -- Calculate readiness multiplier
  v_multiplier := CASE
    WHEN v_readiness_score >= 80 THEN 1.05
    WHEN v_readiness_score >= 60 THEN 1.0
    WHEN v_readiness_score >= 40 THEN 0.95
    ELSE 0.9
  END;

  -- Now process each workout exercise to set proper targets and warmup
  FOR v_we_record IN 
    SELECT we.id, we.exercise_id, te.target_weight_kg as template_weight
    FROM workout_exercises we
    JOIN template_exercises te ON te.exercise_id = we.exercise_id AND te.template_id = p_template_id
    WHERE we.workout_id = v_workout_id
  LOOP
    -- Get base weight (last 60 days, prefer high readiness)
    SELECT ws.weight_kg INTO v_base_weight
    FROM workout_sets ws
    JOIN workout_exercises we_prev ON we_prev.id = ws.workout_exercise_id  
    JOIN workouts w_prev ON w_prev.id = we_prev.workout_id
    WHERE we_prev.exercise_id = v_we_record.exercise_id
      AND w_prev.user_id = v_user_id
      AND ws.is_completed = true
      AND w_prev.started_at >= NOW() - INTERVAL '60 days'
    ORDER BY 
      w_prev.started_at DESC,
      ws.weight_kg DESC
    LIMIT 1;

    -- Fallback to template weight if no history
    IF v_base_weight IS NULL THEN
      v_base_weight := v_we_record.template_weight;
    END IF;

    -- Final fallback for completely new exercises
    IF v_base_weight IS NULL THEN
      v_base_weight := 20.0; -- Safe starting weight
    END IF;

    -- Apply readiness multiplier
    v_target_weight := ROUND((v_base_weight * v_multiplier) / 2.5) * 2.5;

    -- Generate basic warmup steps (3 steps: 50%, 70%, 85% of target)
    v_warmup_steps := jsonb_build_array(
      jsonb_build_object(
        'set_index', 1,
        'weight_kg', ROUND((v_target_weight * 0.5) / 2.5) * 2.5,
        'reps', 12,
        'set_kind', 'warmup'
      ),
      jsonb_build_object(
        'set_index', 2,
        'weight_kg', ROUND((v_target_weight * 0.7) / 2.5) * 2.5,
        'reps', 8,
        'set_kind', 'warmup'
      ),
      jsonb_build_object(
        'set_index', 3,
        'weight_kg', ROUND((v_target_weight * 0.85) / 2.5) * 2.5,
        'reps', 3,
        'set_kind', 'warmup'
      )
    );

    -- Update the workout exercise with computed values (removed readiness_adjusted_from)
    UPDATE workout_exercises 
    SET 
      target_weight_kg = v_target_weight,
      target_origin = CASE 
        WHEN v_base_weight = v_we_record.template_weight THEN 'template'
        ELSE 'last_workout'
      END,
      attribute_values_json = COALESCE(attribute_values_json, '{}'::jsonb) || jsonb_build_object(
        'warmup', v_warmup_steps,
        'readiness_multiplier', v_multiplier,
        'base_weight_kg', v_base_weight
      )
    WHERE id = v_we_record.id;

  END LOOP;

  RETURN v_workout_id;
END;
$function$;