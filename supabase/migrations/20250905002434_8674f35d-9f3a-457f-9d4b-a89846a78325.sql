-- Warmup generator (idempotent helper)
CREATE OR REPLACE FUNCTION public.generate_warmup_steps(p_top_kg numeric)
RETURNS jsonb
LANGUAGE plpgsql AS $$
BEGIN
  IF p_top_kg IS NULL THEN
    RETURN '[]'::jsonb;
  END IF;
  RETURN jsonb_build_array(
    jsonb_build_object('percent',0.40,'reps',10,'rest_s',60 ,'kg',ROUND(p_top_kg*0.40,1)),
    jsonb_build_object('percent',0.60,'reps', 8,'rest_s',90 ,'kg',ROUND(p_top_kg*0.60,1)),
    jsonb_build_object('percent',0.80,'reps', 5,'rest_s',120,'kg',ROUND(p_top_kg*0.80,1))
  );
END$$;

-- MAIN RPC: initialize warmups + fill first target_weight_kg where missing
CREATE OR REPLACE FUNCTION public.initialize_warmups_for_workout(p_workout_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid;
  v_tid  uuid;
  v_cnt  int := 0;
  rec    record;
BEGIN
  -- guard: ownership
  SELECT user_id, template_id INTO v_user, v_tid
  FROM public.workouts WHERE id = p_workout_id;
  IF v_user IS NULL OR v_user <> auth.uid() THEN
    RAISE EXCEPTION 'Not authorized or workout not found';
  END IF;

  FOR rec IN
    SELECT
      we.id            AS we_id,
      we.exercise_id   AS ex_id,
      we.target_weight_kg AS we_target,
      COALESCE(we.weight_unit, 'kg') AS unit,
      -- last completed working set for this user/exercise
      (
        SELECT ws.weight_kg
        FROM public.workout_sets ws
        JOIN public.workout_exercises we2 ON we2.id = ws.workout_exercise_id
        JOIN public.workouts w2 ON w2.id = we2.workout_id
        WHERE w2.user_id = v_user
          AND we2.exercise_id = we.exercise_id
          AND ws.is_completed = true
          AND ws.set_kind IN ('normal','top_set','backoff')
        ORDER BY w2.started_at DESC, ws.set_index DESC
        LIMIT 1
      ) AS last_working_kg,
      -- template default (if workout was started from a template)
      (
        SELECT te.target_weight_kg
        FROM public.template_exercises te
        WHERE te.template_id = v_tid AND te.exercise_id = we.exercise_id
        LIMIT 1
      ) AS tpl_kg,
      -- user estimate (10RM etc.)
      (
        SELECT CAST(estimated_weight AS numeric)
        FROM public.user_exercise_estimates uee
        WHERE uee.user_id = v_user
          AND uee.exercise_id = we.exercise_id
        ORDER BY uee.updated_at DESC NULLS LAST, uee.created_at DESC NULLS LAST
        LIMIT 1
      ) AS est_kg
    FROM public.workout_exercises we
    WHERE we.workout_id = p_workout_id
    ORDER BY we.order_index
  LOOP
    -- choose base: prefer last high-fidelity data → template → estimate
    -- (we keep existing we_target if it already exists)
    IF rec.we_target IS NULL THEN
      rec.we_target := COALESCE(rec.last_working_kg, rec.tpl_kg, rec.est_kg);
    END IF;

    -- write back: set target + warmup JSON
    UPDATE public.workout_exercises
    SET
      target_weight_kg = rec.we_target,
      attribute_values_json = jsonb_set(
        COALESCE(attribute_values_json,'{}'::jsonb),
        '{warmup}',
        generate_warmup_steps(rec.we_target),
        true
      )
    WHERE id = rec.we_id;

    v_cnt := v_cnt + 1;
  END LOOP;

  RETURN v_cnt;
END;
$$;