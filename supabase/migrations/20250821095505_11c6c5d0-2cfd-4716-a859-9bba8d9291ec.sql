-- Remove SECURITY DEFINER from more functions that don't need elevated privileges
-- Keep SECURITY DEFINER only for: has_role, is_admin, bootstrap_admin_if_empty, enforce_max_pins, refresh_exercise_views

-- Remove from workout and fitness functions that work with user's own data
CREATE OR REPLACE FUNCTION public.fn_start_workout_advanced(p_template_id uuid DEFAULT NULL::uuid, p_readiness_data jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_workout_id UUID;
  v_readiness_id UUID;
  v_estimated_duration INTEGER;
  v_exercise_count INTEGER;
  rec RECORD;
  v_we_id UUID;
BEGIN
  -- Validate user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Create the workout
  INSERT INTO public.workouts(user_id) 
  VALUES (auth.uid()) 
  RETURNING id INTO v_workout_id;

  -- Create readiness checkin if data provided
  IF p_readiness_data != '{}'::jsonb THEN
    INSERT INTO public.readiness_checkins(
      user_id, 
      workout_id,
      energy, 
      sleep_quality, 
      sleep_hours, 
      soreness, 
      stress, 
      illness, 
      alcohol, 
      supplements,
      notes
    ) VALUES (
      auth.uid(),
      v_workout_id,
      (p_readiness_data->>'energy')::smallint,
      (p_readiness_data->>'sleep_quality')::smallint,
      (p_readiness_data->>'sleep_hours')::numeric,
      (p_readiness_data->>'soreness')::smallint,
      (p_readiness_data->>'stress')::smallint,
      (p_readiness_data->>'illness')::boolean,
      (p_readiness_data->>'alcohol')::boolean,
      p_readiness_data->'supplements',
      p_readiness_data->>'notes'
    ) RETURNING id INTO v_readiness_id;
  END IF;

  -- Add exercises from template if provided
  IF p_template_id IS NOT NULL THEN
    -- Validate template ownership
    IF NOT EXISTS (
      SELECT 1 FROM public.workout_templates t 
      WHERE t.id = p_template_id AND t.user_id = auth.uid()
    ) THEN
      RAISE EXCEPTION 'Template not found or not owned by user';
    END IF;

    -- Add exercises from template
    FOR rec IN
      SELECT te.exercise_id, te.order_index, te.default_sets, te.target_settings
      FROM public.template_exercises te
      WHERE te.template_id = p_template_id
      ORDER BY te.order_index
    LOOP
      INSERT INTO public.workout_exercises(workout_id, exercise_id, order_index)
      VALUES (v_workout_id, rec.exercise_id, rec.order_index)
      RETURNING id INTO v_we_id;

      -- Add default sets if specified
      IF rec.default_sets IS NOT NULL AND rec.default_sets > 0 THEN
        INSERT INTO public.workout_sets(workout_exercise_id, set_index, set_kind, is_completed)
        SELECT v_we_id, s, 'normal'::public.set_type, false
        FROM generate_series(1, rec.default_sets) s;
      END IF;
    END LOOP;
  END IF;

  -- Calculate estimated duration (rough estimate: 3-5 minutes per set + 15 min overhead)
  SELECT COUNT(*) INTO v_exercise_count
  FROM public.workout_exercises we
  WHERE we.workout_id = v_workout_id;
  
  v_estimated_duration := (v_exercise_count * 4 * 60) + (15 * 60); -- 4 min per exercise + 15 min overhead

  -- Return workout info with estimates
  RETURN jsonb_build_object(
    'workout_id', v_workout_id,
    'readiness_checkin_id', v_readiness_id,
    'estimated_duration_seconds', v_estimated_duration,
    'exercise_count', v_exercise_count,
    'started_at', now()
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.fn_suggest_sets(p_exercise_id uuid, p_progression_type text DEFAULT 'linear'::text, p_target_reps integer DEFAULT 8)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID := auth.uid();
  v_last_workout RECORD;
  v_suggested_weight NUMERIC;
  v_suggested_sets INTEGER := 3;
  v_increment NUMERIC := 2.5;
  v_1rm_estimate NUMERIC;
BEGIN
  -- Get last performance for this exercise
  SELECT * INTO v_last_workout
  FROM public.v_last_working_set
  WHERE user_id = v_user_id AND exercise_id = p_exercise_id;

  -- Get 1RM estimate
  SELECT estimated_1rm INTO v_1rm_estimate
  FROM public.mv_user_exercise_1rm
  WHERE user_id = v_user_id AND exercise_id = p_exercise_id;

  -- Calculate suggested weight based on progression type
  IF p_progression_type = 'linear' THEN
    -- Simple linear progression: add increment if last workout was successful
    v_suggested_weight := COALESCE(v_last_workout.weight, 40) + v_increment;
    
  ELSIF p_progression_type = 'percentage' AND v_1rm_estimate IS NOT NULL THEN
    -- Percentage-based: use % of 1RM based on rep range
    v_suggested_weight := v_1rm_estimate * CASE 
      WHEN p_target_reps <= 3 THEN 0.90  -- 90% for 1-3 reps
      WHEN p_target_reps <= 5 THEN 0.85  -- 85% for 4-5 reps
      WHEN p_target_reps <= 8 THEN 0.80  -- 80% for 6-8 reps
      WHEN p_target_reps <= 12 THEN 0.75 -- 75% for 9-12 reps
      ELSE 0.70                          -- 70% for 13+ reps
    END;
    
  ELSIF p_progression_type = 'pyramid' THEN
    -- Pyramid: start lighter, work up
    v_suggested_weight := COALESCE(v_last_workout.weight, 40) * 0.85;
    v_suggested_sets := 4; -- More sets for pyramid
    
  ELSE
    -- Fallback to linear
    v_suggested_weight := COALESCE(v_last_workout.weight, 40) + v_increment;
  END IF;

  -- Round to nearest increment
  v_suggested_weight := ROUND(v_suggested_weight / v_increment) * v_increment;

  RETURN jsonb_build_object(
    'exercise_id', p_exercise_id,
    'progression_type', p_progression_type,
    'suggested_weight', v_suggested_weight,
    'suggested_sets', v_suggested_sets,
    'target_reps', p_target_reps,
    'last_weight', v_last_workout.weight,
    'estimated_1rm', v_1rm_estimate,
    'notes', CASE 
      WHEN v_last_workout.weight IS NULL THEN 'Starting weight - adjust as needed'
      WHEN v_suggested_weight > v_last_workout.weight THEN 'Progressive overload: +' || (v_suggested_weight - v_last_workout.weight) || 'kg'
      ELSE 'Maintaining previous weight'
    END
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.fn_suggest_warmup(p_exercise_id uuid, p_working_weight numeric DEFAULT NULL::numeric, p_working_reps integer DEFAULT 8)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID := auth.uid();
  v_last_weight NUMERIC;
  v_target_weight NUMERIC;
  v_warmup_sets JSONB := '[]'::jsonb;
  v_set JSONB;
  i INTEGER;
BEGIN
  -- Get last working weight for this exercise
  SELECT lws.weight INTO v_last_weight
  FROM public.v_last_working_set lws
  WHERE lws.user_id = v_user_id 
    AND lws.exercise_id = p_exercise_id;

  -- Use provided weight or fall back to last weight
  v_target_weight := COALESCE(p_working_weight, v_last_weight, 60); -- 60kg default

  -- Generate warmup progression: 40%, 60%, 80% of working weight
  FOR i IN 1..3 LOOP
    v_set := jsonb_build_object(
      'set_index', i,
      'weight', ROUND(v_target_weight * (0.2 + i * 0.2), 2.5), -- Round to nearest 2.5
      'reps', GREATEST(15 - i * 3, 5), -- 12, 9, 6 reps (minimum 5)
      'set_kind', 'warmup',
      'rest_seconds', 45
    );
    v_warmup_sets := v_warmup_sets || v_set;
  END LOOP;

  RETURN jsonb_build_object(
    'exercise_id', p_exercise_id,
    'target_weight', v_target_weight,
    'warmup_sets', v_warmup_sets,
    'total_warmup_time_estimate', 180 -- 3 minutes
  );
END;
$function$;