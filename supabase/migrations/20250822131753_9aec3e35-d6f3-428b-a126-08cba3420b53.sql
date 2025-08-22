-- Update the add_set function to include had_pain field
CREATE OR REPLACE FUNCTION public.add_set(p_workout_exercise_id uuid, p_payload jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_set_id uuid;
  v_next_index int;
  v_kind public.set_type;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  PERFORM 1 FROM public.workout_exercises we
  JOIN public.workouts w ON w.id = we.workout_id
  WHERE we.id = p_workout_exercise_id AND w.user_id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Workout exercise not found or not owned by user';
  END IF;

  SELECT COALESCE(MAX(set_index), 0) + 1 INTO v_next_index
  FROM public.workout_sets WHERE workout_exercise_id = p_workout_exercise_id;

  v_kind := COALESCE((p_payload->>'set_kind')::public.set_type, 'normal');

  INSERT INTO public.workout_sets (
    workout_exercise_id, set_index, set_kind, reps, weight, weight_unit, duration_seconds, distance, rpe, notes, is_completed, had_pain
  ) VALUES (
    p_workout_exercise_id,
    COALESCE((p_payload->>'set_index')::int, v_next_index),
    v_kind,
    (p_payload->>'reps')::int,
    (p_payload->>'weight')::numeric,
    COALESCE(p_payload->>'weight_unit', 'kg'),
    (p_payload->>'duration_seconds')::int,
    (p_payload->>'distance')::numeric,
    (p_payload->>'rpe')::numeric,
    NULLIF(p_payload->>'notes',''),
    COALESCE((p_payload->>'is_completed')::boolean, true),
    COALESCE((p_payload->>'had_pain')::boolean, false)
  ) RETURNING id INTO v_set_id;

  RETURN v_set_id;
END;
$function$