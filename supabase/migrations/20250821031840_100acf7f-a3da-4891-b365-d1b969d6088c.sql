-- Task 5: FlutterFlow-Optimized RPC Functions

-- Single-call workout opening with all data needed
CREATE OR REPLACE FUNCTION public.workout_open(p_workout_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  workout_data jsonb;
  exercises_data jsonb;
BEGIN
  -- Check if user owns this workout
  IF NOT EXISTS (
    SELECT 1 FROM public.workouts 
    WHERE id = p_workout_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Workout not found or access denied';
  END IF;

  -- Get workout basic info
  SELECT jsonb_build_object(
    'id', w.id,
    'user_id', w.user_id,
    'started_at', w.started_at,
    'ended_at', w.ended_at,
    'title', w.title,
    'notes', w.notes
  )
  INTO workout_data
  FROM public.workouts w
  WHERE w.id = p_workout_id;

  -- Get exercises with last set snapshots and template targets
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', we.id,
      'exercise_id', we.exercise_id,
      'exercise_name', e.name,
      'order_index', we.order_index,
      'notes', we.notes,
      'last_weight', COALESCE(mv_last.weight, 0),
      'last_reps', COALESCE(mv_last.reps, 0),
      'pr_weight', COALESCE(mv_pr.best_weight, 0),
      'sets', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', ws.id,
            'set_index', ws.set_index,
            'set_kind', ws.set_kind,
            'weight', ws.weight,
            'reps', ws.reps,
            'is_completed', ws.is_completed,
            'completed_at', ws.completed_at
          ) ORDER BY ws.set_index
        )
        FROM public.workout_sets ws
        WHERE ws.workout_exercise_id = we.id
      )
    ) ORDER BY we.order_index
  )
  INTO exercises_data
  FROM public.workout_exercises we
  JOIN public.exercises e ON e.id = we.exercise_id
  LEFT JOIN public.mv_last_set_per_user_exercise mv_last 
    ON mv_last.user_id = auth.uid() 
    AND mv_last.exercise_id = we.exercise_id 
    AND mv_last.rn = 1
  LEFT JOIN public.mv_pr_weight_per_user_exercise mv_pr
    ON mv_pr.user_id = auth.uid() 
    AND mv_pr.exercise_id = we.exercise_id
  WHERE we.workout_id = p_workout_id;

  -- Combine all data
  result := jsonb_build_object(
    'workout', workout_data,
    'exercises', COALESCE(exercises_data, '[]'::jsonb)
  );

  RETURN result;
END;
$$;

-- Atomic set logging with grips and metric values
CREATE OR REPLACE FUNCTION public.set_log(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_set_id uuid;
  v_workout_exercise_id uuid;
  v_exercise_id uuid;
  v_user_id uuid;
  grip_id uuid;
  metric_entry jsonb;
  result jsonb;
BEGIN
  -- Validate required fields
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

  -- Insert the workout set
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

  -- Insert grips if provided
  IF p_payload ? 'grip_ids' AND jsonb_array_length(p_payload->'grip_ids') > 0 THEN
    FOR grip_id IN SELECT (value::text)::uuid FROM jsonb_array_elements(p_payload->'grip_ids')
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
$$;

-- Optimized exercise search leveraging indexes
CREATE OR REPLACE FUNCTION public.exercise_search(
  p_query text DEFAULT '',
  p_equipment_id uuid DEFAULT NULL,
  p_body_part_id uuid DEFAULT NULL,
  p_limit int DEFAULT 20,
  p_offset int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  equipment_id uuid,
  body_part_id uuid,
  is_public boolean,
  similarity_score real
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.name,
    e.slug,
    e.equipment_id,
    e.body_part_id,
    e.is_public,
    CASE 
      WHEN p_query = '' THEN 1.0
      ELSE public.similarity(e.name, p_query)
    END as similarity_score
  FROM public.exercises e
  WHERE 
    (e.is_public = true OR e.owner_user_id = auth.uid())
    AND (p_equipment_id IS NULL OR e.equipment_id = p_equipment_id)
    AND (p_body_part_id IS NULL OR e.body_part_id = p_body_part_id)
    AND (
      p_query = '' OR 
      e.name % p_query OR
      e.name ILIKE ('%' || p_query || '%')
    )
  ORDER BY 
    CASE 
      WHEN p_query = '' THEN e.popularity_rank NULLS LAST
      ELSE public.similarity(e.name, p_query)
    END DESC
  LIMIT p_limit 
  OFFSET p_offset;
END;
$$;

-- Grant permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.workout_open(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_log(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.exercise_search(text, uuid, uuid, int, int) TO authenticated;