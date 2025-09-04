-- Add readiness and adjustment tracking columns
ALTER TABLE public.workouts
  ADD COLUMN IF NOT EXISTS readiness_score numeric;

ALTER TABLE public.workout_exercises
  ADD COLUMN IF NOT EXISTS readiness_adjusted_from uuid;

-- Readiness score function (single source of truth)
CREATE OR REPLACE FUNCTION public.compute_readiness_score(
  p_energy int,                 -- 1..10
  p_sleep_quality int,          -- 1..10
  p_sleep_hours numeric,        -- e.g. 7.5
  p_soreness int,               -- 1..10  (lower is better)
  p_stress int,                 -- 1..10  (lower is better)
  p_illness boolean,
  p_alcohol boolean,
  p_supplements jsonb           -- e.g. '["protein","creatine"]'
) RETURNS numeric LANGUAGE plpgsql AS $$
DECLARE
  v_energy   numeric := COALESCE(p_energy,5)*10;                    -- 20%
  v_sleepq   numeric := COALESCE(p_sleep_quality,5)*10;             -- 20%
  v_sleeph   numeric;                                               -- 20% via mapping
  v_soreness numeric := 100 - (COALESCE(p_soreness,5)-1)*11.111;    -- 20% inverted
  v_stress   numeric := 100 - (COALESCE(p_stress,5)-1)*11.111;      -- 10% inverted
  v_illness  numeric := CASE WHEN p_illness THEN -20 ELSE 0 END;    -- hard penalty
  v_alcohol  numeric := CASE WHEN p_alcohol THEN -10 ELSE 0 END;    -- penalty
  v_supp     numeric := LEAST(10, COALESCE(jsonb_array_length(p_supplements),0)*5); -- +10% max
  v_sleep_norm numeric;
  v_score   numeric;
BEGIN
  -- map sleep hours to 0..100 (5h→40, 6h→60, 7h→80, 8h→100, 9h→100)
  v_sleep_norm := GREATEST(0, LEAST(100,
      CASE
        WHEN p_sleep_hours IS NULL THEN 60
        WHEN p_sleep_hours <= 5 THEN 40
        WHEN p_sleep_hours = 6 THEN 60
        WHEN p_sleep_hours = 7 THEN 80
        WHEN p_sleep_hours >= 8 THEN 100
      END));
  v_sleeph := v_sleep_norm; -- 0..100

  -- weights: energy 20 + sleep quality 20 + sleep hours 20 + soreness 20 + stress 10 + supplements 10 (+ penalties)
  v_score :=
      0.20*v_energy
    + 0.20*v_sleepq
    + 0.20*v_sleeph
    + 0.20*v_soreness
    + 0.10*v_stress
    + 0.10*v_supp
    + v_illness + v_alcohol;

  RETURN GREATEST(0, LEAST(100, ROUND(v_score,1)));
END$$;

-- Helper to find base load (last 3 workouts within 60 days, prefer high-readiness >60 if present)
CREATE OR REPLACE FUNCTION public.pick_base_load(
  p_user uuid,
  p_exercise uuid
) RETURNS TABLE(base_weight numeric, source_workout_exercise_id uuid) LANGUAGE sql AS $$
  WITH recent AS (
    SELECT we.id as we_id, we.target_weight_kg, w.readiness_score, w.started_at
    FROM workout_exercises we
    JOIN workouts w ON w.id = we.workout_id
    WHERE w.user_id = p_user
      AND we.exercise_id = p_exercise
      AND w.started_at >= now() - interval '60 days'
      AND we.target_weight_kg IS NOT NULL
    ORDER BY w.started_at DESC
    LIMIT 3
  ),
  best_high AS (
    SELECT * FROM recent WHERE COALESCE(readiness_score,0) >= 60
    ORDER BY readiness_score DESC, started_at DESC
    LIMIT 1
  ),
  best_any AS (
    SELECT * FROM recent ORDER BY started_at DESC LIMIT 1
  ),
  chosen AS (
    SELECT * FROM best_high
    UNION ALL
    SELECT * FROM best_any WHERE NOT EXISTS (SELECT 1 FROM best_high)
    LIMIT 1
  )
  SELECT target_weight_kg, we_id FROM chosen;
$$;

-- Readiness factor → multiplier
CREATE OR REPLACE FUNCTION public.readiness_multiplier(p_score numeric)
RETURNS numeric LANGUAGE sql IMMUTABLE AS $$
  -- piecewise linear for clarity:
  SELECT CASE
    WHEN p_score IS NULL THEN 1.00
    WHEN p_score < 30  THEN 0.90
    WHEN p_score < 40  THEN 0.95
    WHEN p_score < 50  THEN 0.98
    WHEN p_score < 60  THEN 1.00
    WHEN p_score < 70  THEN 1.02
    WHEN p_score < 80  THEN 1.04
    WHEN p_score < 90  THEN 1.06
    ELSE 1.08
  END;
$$;

-- Warm-up generator (simple stepped)
CREATE OR REPLACE FUNCTION public.generate_warmup_steps(p_top_kg numeric)
RETURNS jsonb LANGUAGE sql AS $$
  SELECT jsonb_build_array(
    jsonb_build_object('pct', 0.40, 'reps', 10, 'rest_s', 60,  'weight_kg', ROUND(p_top_kg*0.40,1)),
    jsonb_build_object('pct', 0.60, 'reps', 8,  'rest_s', 90,  'weight_kg', ROUND(p_top_kg*0.60,1)),
    jsonb_build_object('pct', 0.80, 'reps', 5,  'rest_s', 120, 'weight_kg', ROUND(p_top_kg*0.80,1))
  );
$$;

-- Updated start_workout with smart readiness, targets and warmups
CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user uuid := auth.uid();
  v_workout uuid;
  v_ck RECORD;
  v_score numeric;
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

  -- latest readiness/check-in for the user (today first, else most recent)
  SELECT *
  INTO v_ck
  FROM pre_workout_checkins
  WHERE user_id = v_user
  ORDER BY created_at DESC
  LIMIT 1;

  v_score := compute_readiness_score(
    v_ck.energy, v_ck.sleep_quality, v_ck.sleep_hours,
    v_ck.soreness, v_ck.stress, v_ck.illness, v_ck.alcohol, v_ck.supplements
  );
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