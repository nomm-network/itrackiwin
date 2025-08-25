-- Fix the set_log function to properly extract JSON values
CREATE OR REPLACE FUNCTION public.set_log(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_set_id uuid;
  v_workout_exercise_id uuid;
  v_exercise_id uuid;
  v_user_id uuid;
  grip_id uuid;
  metric_entry jsonb;
  result jsonb;
BEGIN
  -- Validate required fields - USE ->> not -> for text extraction
  IF p_payload->>'workout_exercise_id' IS NULL THEN
    RAISE EXCEPTION 'workout_exercise_id is required';
  END IF;

  v_workout_exercise_id := (p_payload->>'workout_exercise_id')::uuid;

  -- Verify user owns this workout exercise
  SELECT we.exercise_id, w.user_id
  INTO v_exercise_id, v_user_id
  FROM public.workout_exercises we
  JOIN public.workouts w ON w.id = we.workout_id
  WHERE we.id = v_workout_exercise_id;

  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Insert the workout set - USE ->> for all text extractions
  INSERT INTO public.workout_sets (
    workout_exercise_id,
    set_index,
    set_kind,
    weight,
    reps,
    weight_unit,
    duration_seconds,
    distance,
    rpe,
    notes,
    is_completed
  ) VALUES (
    v_workout_exercise_id,
    COALESCE((p_payload->>'set_index')::int, 
      (SELECT COALESCE(MAX(set_index), 0) + 1 
       FROM public.workout_sets 
       WHERE workout_exercise_id = v_workout_exercise_id)),
    COALESCE((p_payload->>'set_kind')::text, 'normal')::public.set_type,
    (p_payload->>'weight')::numeric,
    (p_payload->>'reps')::int,
    COALESCE(p_payload->>'weight_unit', 'kg'),
    (p_payload->>'duration_seconds')::int,
    (p_payload->>'distance')::numeric,
    (p_payload->>'rpe')::numeric,
    p_payload->>'notes',
    COALESCE((p_payload->>'is_completed')::boolean, true)
  ) RETURNING id INTO v_set_id;

  -- Insert grips if provided - USE jsonb_array_elements_text for UUID array
  IF p_payload ? 'grip_ids' AND jsonb_array_length(p_payload->'grip_ids') > 0 THEN
    FOR grip_id IN SELECT (elem)::uuid FROM jsonb_array_elements_text(p_payload->'grip_ids') AS elem
    LOOP
      INSERT INTO public.workout_set_grips (workout_set_id, grip_id)
      VALUES (v_set_id, grip_id);
    END LOOP;
  END IF;

  -- Insert metric values if provided
  IF p_payload ? 'metrics' AND jsonb_array_length(p_payload->'metrics') > 0 THEN
    FOR metric_entry IN SELECT value FROM jsonb_array_elements(p_payload->'metrics')
    LOOP
      INSERT INTO public.workout_set_metric_values (
        workout_set_id,
        metric_def_id,
        value
      ) VALUES (
        v_set_id,
        (metric_entry->>'metric_def_id')::uuid,
        metric_entry->'value'
      );
    END LOOP;
  END IF;

  -- Refresh materialized views asynchronously
  PERFORM public.refresh_exercise_views(v_user_id, v_exercise_id);

  -- Return the created set with updated snapshots
  SELECT jsonb_build_object(
    'set_id', v_set_id,
    'last_set', (
      SELECT jsonb_build_object(
        'weight', mv.weight,
        'reps', mv.reps,
        'completed_at', mv.completed_at
      )
      FROM public.mv_last_set_per_user_exercise mv
      WHERE mv.user_id = v_user_id 
        AND mv.exercise_id = v_exercise_id 
        AND mv.rn = 1
    ),
    'pr_weight', (
      SELECT mv.best_weight
      FROM public.mv_pr_weight_per_user_exercise mv
      WHERE mv.user_id = v_user_id 
        AND mv.exercise_id = v_exercise_id
    )
  ) INTO result;

  RETURN result;
END;
$function$