-- 0) Safety: drop older versions that keep biting us
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'start_workout' AND oid::regprocedure::text = 'start_workout(uuid)') THEN
    DROP FUNCTION public.start_workout(uuid);
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'apply_initial_targets') THEN
    DROP FUNCTION public.apply_initial_targets(uuid);
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = '_get_estimate_weight_kg') THEN
    DROP FUNCTION public._get_estimate_weight_kg(uuid, uuid);
  END IF;
END$$;

-- 1) Helper: try to read a best user estimate (if you store them).
-- Uses existing tables only; returns NULL if none.
CREATE OR REPLACE FUNCTION public._get_estimate_weight_kg(p_user_id uuid, p_exercise_id uuid)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE v numeric;
BEGIN
  -- user_exercise_estimates (if present, shape may vary). Safest read:
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema='public' AND table_name='user_exercise_estimates') THEN
    BEGIN
      EXECUTE $q$
        SELECT COALESCE(
                 NULLIF((ue.estimated_working_weight_kg)::numeric,0),
                 NULLIF((ue.value_kg)::numeric,0),
                 NULLIF((ue.weight_kg)::numeric,0),
                 CASE
                   WHEN ue.data ? 'working_weight_kg' THEN NULLIF((ue.data->>'working_weight_kg')::numeric,0)
                   WHEN ue.data ? 'target_weight_kg'  THEN NULLIF((ue.data->>'target_weight_kg')::numeric,0)
                   ELSE NULL
                 END
               )
        FROM public.user_exercise_estimates ue
        WHERE ue.user_id = $1 AND ue.exercise_id = $2
        ORDER BY ue.created_at DESC NULLS LAST
        LIMIT 1
      $q$ INTO v USING p_user_id, p_exercise_id;
    EXCEPTION WHEN undefined_column THEN
      -- ignore shape differences, fall through
      v := NULL;
    END;
  END IF;

  -- pre_workout_checkins (answers JSON) as a secondary hint, if present
  IF v IS NULL AND EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='pre_workout_checkins'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='pre_workout_checkins'
      AND column_name='answers' AND data_type='jsonb'
  ) THEN
    SELECT COALESCE(
             NULLIF((c.answers->>'working_weight_kg')::numeric,0),
             NULLIF((c.answers->>'target_weight_kg')::numeric,0),
             NULLIF((c.answers->>'top_set_kg')::numeric,0)
           )
    INTO v
    FROM public.pre_workout_checkins c
    WHERE c.user_id = p_user_id
    ORDER BY c.created_at DESC NULLS LAST
    LIMIT 1;
  END IF;

  RETURN v;
END
$$;

-- 2) Seed targets for each exercise in a workout (called by start_workout)
CREATE OR REPLACE FUNCTION public.apply_initial_targets(p_workout_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  rec RECORD;
  v_last_set numeric;
  v_pr numeric;
  v_est numeric;
BEGIN
  SELECT w.user_id INTO v_user_id
  FROM public.workouts w
  WHERE w.id = p_workout_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Workout % not found', p_workout_id;
  END IF;

  FOR rec IN
    SELECT we.id, we.exercise_id, we.target_weight_kg
    FROM public.workout_exercises we
    WHERE we.workout_id = p_workout_id
    ORDER BY COALESCE(we.order_index, 9999)
  LOOP
    -- Keep template value if present; otherwise try last set, PR, estimates.
    IF rec.target_weight_kg IS NULL OR rec.target_weight_kg = 0 THEN
      -- last completed set for this user & exercise (kg)
      SELECT ws.weight * CASE WHEN ws.weight_unit = 'lb' THEN 0.45359237 ELSE 1 END
      INTO v_last_set
      FROM public.workout_sets ws
      JOIN public.workout_exercises wex ON wex.id = ws.workout_exercise_id
      JOIN public.workouts w        ON w.id  = wex.workout_id
      WHERE w.user_id = v_user_id
        AND wex.exercise_id = rec.exercise_id
        AND ws.weight IS NOT NULL AND ws.reps IS NOT NULL
      ORDER BY ws.created_at DESC
      LIMIT 1;

      -- personal records (either 1RM→75% or heaviest as-is), stored in kg
      SELECT CASE pr.kind
               WHEN '1RM'     THEN pr.value * 0.75
               WHEN 'heaviest' THEN pr.value
               ELSE NULL
             END
      INTO v_pr
      FROM public.personal_records pr
      WHERE pr.user_id = v_user_id
        AND pr.exercise_id = rec.exercise_id
        AND pr.unit = 'kg'
      ORDER BY pr.achieved_at DESC
      LIMIT 1;

      -- user estimate/readiness fallback
      v_est := public._get_estimate_weight_kg(v_user_id, rec.exercise_id);

      UPDATE public.workout_exercises
      SET target_weight_kg = COALESCE(v_last_set, v_pr, v_est, 0)
      WHERE id = rec.id;
    END IF;
  END LOOP;
END
$$;

-- 3) Clean start_workout: writes workouts.template_id and copies normalized fields only
CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workout_id uuid;
  v_user_id uuid;
  rec RECORD;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.workouts (user_id, started_at, template_id)
  VALUES (v_user_id, now(), p_template_id)
  RETURNING id INTO v_workout_id;

  IF p_template_id IS NOT NULL THEN
    FOR rec IN
      SELECT 
        te.exercise_id,
        te.order_index,
        te.default_sets           AS target_sets,
        te.target_reps,
        te.target_weight_kg,
        te.weight_unit,
        te.notes
      FROM public.template_exercises te
      WHERE te.template_id = p_template_id
      ORDER BY COALESCE(te.order_index, 9999)
    LOOP
      INSERT INTO public.workout_exercises (
        workout_id,
        exercise_id,
        order_index,
        target_sets,
        target_reps,
        target_weight_kg,
        weight_unit,
        notes
      ) VALUES (
        v_workout_id,
        rec.exercise_id,
        rec.order_index,
        rec.target_sets,
        rec.target_reps,
        rec.target_weight_kg,
        COALESCE(rec.weight_unit, 'kg'),
        rec.notes
      );
    END LOOP;
  END IF;

  -- Seed initial targets (last set/PR/estimates) for first-set warm-up & targets
  PERFORM public.apply_initial_targets(v_workout_id);

  RETURN v_workout_id;
END
$$;