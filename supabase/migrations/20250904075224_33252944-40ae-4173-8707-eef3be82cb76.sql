-- Update start_workout to handle readiness without requiring pre_workout_checkins
CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user uuid := auth.uid();
  v_workout uuid;
  v_ck RECORD;
  v_score numeric := 65; -- default neutral score
  rec RECORD;
  v_base numeric;
  v_base_we uuid;
  v_mult numeric;
  v_target numeric;
  v_est numeric;
  v_steps jsonb;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  INSERT INTO workouts(user_id, started_at, template_id)
  VALUES (v_user, now(), p_template_id)
  RETURNING id INTO v_workout;

  -- Try to get latest readiness check-in (optional)
  SELECT *
  INTO v_ck
  FROM pre_workout_checkins
  WHERE user_id = v_user
  ORDER BY created_at DESC
  LIMIT 1;

  -- Compute readiness score if we have data
  IF v_ck IS NOT NULL THEN
    v_score := compute_readiness_score(
      (v_ck.answers->>'energy')::int,
      (v_ck.answers->>'sleep_quality')::int, 
      (v_ck.answers->>'sleep_hours')::numeric,
      (v_ck.answers->>'soreness')::int,
      (v_ck.answers->>'stress')::int,
      (v_ck.answers->>'illness')::boolean,
      (v_ck.answers->>'alcohol')::boolean,
      v_ck.answers->'supplements'
    );
  END IF;

  UPDATE workouts SET readiness_score = v_score WHERE id = v_workout;

  IF p_template_id IS NOT NULL THEN
    FOR rec IN
      SELECT te.*, e.id AS exercise_id
      FROM template_exercises te
      JOIN exercises e ON e.id = te.exercise_id
      WHERE te.template_id = p_template_id
      ORDER BY te.order_index
    LOOP
      -- base from last 3 within 60d (prefer high readiness)
      SELECT base_weight, source_workout_exercise_id INTO v_base, v_base_we
      FROM pick_base_load(v_user, rec.exercise_id);

      -- fallback to template target, else user estimates
      IF v_base IS NULL THEN
        v_base := rec.target_weight_kg;
      END IF;

      IF v_base IS NULL THEN
        SELECT ue.estimated_weight::numeric INTO v_est
        FROM user_exercise_estimates ue
        WHERE ue.user_id = v_user AND ue.exercise_id = rec.exercise_id
        ORDER BY updated_at DESC LIMIT 1;
        v_base := v_est;
      END IF;

      v_mult   := readiness_multiplier(v_score);
      v_target := CASE WHEN v_base IS NULL THEN NULL ELSE ROUND(v_base * v_mult, 1) END;

      v_steps  := CASE WHEN v_target IS NULL THEN NULL
                 ELSE generate_warmup_steps(v_target) END;

      INSERT INTO workout_exercises(
        workout_id, exercise_id, order_index,
        target_sets, target_reps, target_weight_kg, weight_unit,
        notes, readiness_adjusted_from, attribute_values_json
      ) VALUES (
        v_workout, rec.exercise_id, rec.order_index,
        rec.default_sets, rec.target_reps, v_target, COALESCE(rec.weight_unit,'kg'),
        rec.notes, v_base_we,
        COALESCE(jsonb_build_object('warmup', v_steps), '{}'::jsonb)
      );
    END LOOP;
  END IF;

  RETURN v_workout;
END$$;