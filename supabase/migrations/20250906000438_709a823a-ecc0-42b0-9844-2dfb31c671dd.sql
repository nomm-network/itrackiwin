-- Replace start_workout with corrected version that uses real tables
DROP FUNCTION IF EXISTS public.start_workout(uuid);

CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id          uuid;
  v_workout_id       uuid;
  v_score            numeric;     -- readiness 0..100
  v_multiplier       numeric;     -- readiness multiplier (e.g. 1.02)
  rec                RECORD;      -- template exercise row
  v_base_weight      numeric;     -- picked from last 3 workouts 60 days (helper)
  v_target_weight    numeric;     -- final target for this workout
  v_attr             jsonb;       -- attribute_values_json builder
BEGIN
  -- Auth
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Create workout shell (note: template_id column exists per your last change)
  INSERT INTO public.workouts (user_id, started_at, template_id)
  VALUES (v_user_id, now(), p_template_id)
  RETURNING id INTO v_workout_id;

  -- If no template: just return new workout id
  IF p_template_id IS NULL THEN
    RETURN v_workout_id;
  END IF;

  -- Template ownership (keep strict to avoid surprises)
  IF NOT EXISTS (
    SELECT 1
    FROM public.workout_templates t
    WHERE t.id = p_template_id
      AND t.user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Template not found or access denied';
  END IF;

  -- Compute readiness (uses your implemented function)
  -- This must always return 0..100; your operator fixed it to read readiness_checkins.
  SELECT public.compute_readiness_for_user(v_user_id)
  INTO v_score;

  -- Readiness multiplier (0.90 .. 1.08 etc.)
  SELECT public.readiness_multiplier(COALESCE(v_score, 65))
  INTO v_multiplier;

  -- Copy template_exercises → workout_exercises
  -- Only use columns confirmed present:
  -- template_exercises: exercise_id, order_index, default_sets, target_reps, target_weight_kg, weight_unit
  FOR rec IN
    SELECT te.exercise_id,
           te.order_index,
           te.default_sets,
           te.target_reps,
           te.target_weight_kg,
           te.weight_unit
    FROM public.template_exercises te
    WHERE te.template_id = p_template_id
    ORDER BY te.order_index NULLS LAST
  LOOP
    -- pick base load (helper fn you/ops added)
    SELECT public.pick_base_load(v_user_id, rec.exercise_id)
    INTO v_base_weight;

    -- decide target_weight:
    -- prefer explicit template target; otherwise base*multiplier; otherwise NULL
    v_target_weight :=
      COALESCE(
        rec.target_weight_kg,
        CASE
          WHEN v_base_weight IS NULL THEN NULL
          ELSE ROUND(v_base_weight * v_multiplier, 1)
        END
      );

    -- build attribute_values_json: store base & readiness for transparency
    v_attr := jsonb_build_object(
      'base_weight_kg',        v_base_weight,
      'readiness_score',       COALESCE(v_score, 65),
      'readiness_multiplier',  COALESCE(v_multiplier, 1.0)
    );

    -- add warmup if we have a target
    IF v_target_weight IS NOT NULL THEN
      v_attr := jsonb_set(
        v_attr,
        '{warmup}',
        public.generate_warmup_steps(v_target_weight),
        true
      );
    END IF;

    -- insert workout_exercise row (no rest_seconds / no bogus fields)
    INSERT INTO public.workout_exercises (
      workout_id,
      exercise_id,
      order_index,
      target_sets,
      target_reps,
      target_weight_kg,
      weight_unit,
      attribute_values_json,
      readiness_adjusted_from   -- keep NULL; it is UUID type (do not stuff text)
    )
    VALUES (
      v_workout_id,
      rec.exercise_id,
      rec.order_index,
      rec.default_sets,
      rec.target_reps,
      v_target_weight,
      COALESCE(rec.weight_unit, 'kg'),
      v_attr,
      NULL
    );
  END LOOP;

  -- also store workout-level readiness snapshot (column exists per your ops note)
  UPDATE public.workouts
  SET readiness_score = COALESCE(v_score, 65)
  WHERE id = v_workout_id;

  RETURN v_workout_id;
END;
$$;