-- Create the set_log RPC function that the hooks expect
CREATE OR REPLACE FUNCTION public.set_log(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  workout_exercise_id_val uuid;
  user_workout_id uuid;
  next_set_index integer;
  new_set_id uuid;
  result jsonb;
BEGIN
  -- Extract workout_exercise_id from payload
  workout_exercise_id_val := (p_payload->>'workout_exercise_id')::uuid;
  
  -- Check if user owns this workout
  SELECT w.id INTO user_workout_id
  FROM workouts w
  JOIN workout_exercises we ON we.workout_id = w.id
  WHERE we.id = workout_exercise_id_val
  AND w.user_id = auth.uid();
  
  IF user_workout_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized to modify this workout exercise';
  END IF;
  
  -- Get the next set index for this workout exercise
  SELECT COALESCE(MAX(set_index), -1) + 1 INTO next_set_index
  FROM workout_sets
  WHERE workout_exercise_id = workout_exercise_id_val;
  
  -- Insert the new workout set
  INSERT INTO workout_sets (
    id,
    workout_exercise_id,
    set_index,
    weight,
    weight_kg,
    weight_unit,
    reps,
    duration_seconds,
    distance,
    rpe,
    notes,
    feel,
    pain,
    set_kind,
    is_completed,
    completed_at
  ) VALUES (
    gen_random_uuid(),
    workout_exercise_id_val,
    next_set_index,
    COALESCE((p_payload->>'weight')::numeric, (p_payload->>'weight_kg')::numeric),
    COALESCE((p_payload->>'weight_kg')::numeric, (p_payload->>'weight')::numeric),
    COALESCE(p_payload->>'weight_unit', 'kg'),
    (p_payload->>'reps')::integer,
    (p_payload->>'duration_seconds')::integer,
    (p_payload->>'distance')::numeric,
    (p_payload->>'rpe')::integer,
    p_payload->>'notes',
    p_payload->>'feel',
    COALESCE((p_payload->>'pain')::boolean, false),
    COALESCE(p_payload->>'set_kind', 'working'),
    COALESCE((p_payload->>'is_completed')::boolean, true),
    COALESCE((p_payload->>'completed_at')::timestamptz, now())
  ) RETURNING id INTO new_set_id;
  
  -- Handle grip_ids if provided
  IF p_payload ? 'grip_ids' AND jsonb_array_length(p_payload->'grip_ids') > 0 THEN
    INSERT INTO workout_set_grips (workout_set_id, grip_id)
    SELECT new_set_id, (grip_id->>'value')::uuid
    FROM jsonb_array_elements(p_payload->'grip_ids') AS grip_id
    WHERE grip_id->>'value' IS NOT NULL;
  END IF;
  
  -- Return success result
  result := jsonb_build_object(
    'success', true,
    'set_id', new_set_id,
    'set_index', next_set_index,
    'workout_exercise_id', workout_exercise_id_val
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Return error result
    result := jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
    RETURN result;
END;
$function$;