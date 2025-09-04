-- Drop the readiness_logs table and implement the unified approach using pre_workout_checkins

-- 1. Drop the readiness_logs table since we're using pre_workout_checkins
DROP TABLE IF EXISTS public.readiness_logs;

-- 2. Create a helper view that normalizes the JSON to columns from pre_workout_checkins
CREATE OR REPLACE VIEW public.v_latest_readiness AS
SELECT
  r.user_id,
  r.workout_id,
  r.created_at,
  COALESCE((r.answers->>'energy')::int, NULL)           AS energy,
  COALESCE((r.answers->>'sleep_quality')::int, NULL)    AS sleep_quality,
  COALESCE((r.answers->>'sleep_hours')::numeric, NULL)  AS sleep_hours,
  COALESCE((r.answers->>'soreness')::int, NULL)         AS soreness,
  COALESCE((r.answers->>'stress')::int, NULL)           AS stress,
  COALESCE((r.answers->>'illness')::boolean, false)     AS illness,
  COALESCE((r.answers->>'alcohol')::boolean, false)     AS alcohol,
  COALESCE((r.answers->>'supplements')::int, 0)         AS supplements
FROM public.pre_workout_checkins r;

-- 3. Wrapper to fetch the best readiness row for a user (time-aware)
CREATE OR REPLACE FUNCTION public.get_latest_readiness(
  p_user_id uuid,
  p_workout_started_at timestamptz DEFAULT NULL
)
RETURNS TABLE (
  energy int,
  sleep_quality int,
  sleep_hours numeric,
  soreness int,
  stress int,
  illness boolean,
  alcohol boolean,
  supplements int,
  created_at timestamptz
)
LANGUAGE sql
AS $$
  -- Prefer a row within the last 6 hours around workout start, else latest overall
  WITH chosen AS (
    SELECT *
    FROM public.v_latest_readiness v
    WHERE v.user_id = p_user_id
      AND (
        p_workout_started_at IS NULL
        OR v.created_at BETWEEN (p_workout_started_at - interval '6 hours')
                           AND     (p_workout_started_at + interval '6 hours')
      )
    ORDER BY v.created_at DESC
    LIMIT 1
  )
  SELECT energy, sleep_quality, sleep_hours, soreness, stress, illness, alcohol, supplements, created_at
  FROM chosen
  UNION ALL
  SELECT energy, sleep_quality, sleep_hours, soreness, stress, illness, alcohol, supplements, created_at
  FROM (
    SELECT *
    FROM public.v_latest_readiness v
    WHERE v.user_id = p_user_id
    ORDER BY v.created_at DESC
    LIMIT 1
  ) fallback
  WHERE NOT EXISTS (SELECT 1 FROM chosen);
$$;

-- 4. Compute readiness for user wrapper
CREATE OR REPLACE FUNCTION public.compute_readiness_for_user(
  p_user_id uuid,
  p_workout_started_at timestamptz DEFAULT NULL
) RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
  r record;
  v_score numeric;
BEGIN
  SELECT *
  INTO r
  FROM public.get_latest_readiness(p_user_id, p_workout_started_at)
  LIMIT 1;

  IF r IS NULL THEN
    RETURN 65; -- default readiness score when no check-in data
  END IF;

  v_score := public.compute_readiness_score(
    r.energy, r.sleep_quality, r.sleep_hours, r.soreness,
    r.stress, r.illness, r.alcohol, 
    CASE WHEN r.supplements > 0 THEN '["supplements"]'::jsonb ELSE '[]'::jsonb END
  );
  RETURN v_score;
END;
$$;

-- 5. Update start_workout to use the unified approach
CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_workout_id uuid;
  v_user uuid;
  v_started_at timestamptz := now();
  v_score numeric;
  rec record;
  v_base numeric;
  v_base_we uuid;
  v_mult numeric;
  v_target numeric;
  v_warmup jsonb;
  v_est numeric;
BEGIN
  v_user := auth.uid();
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1) Create workout
  INSERT INTO public.workouts (user_id, started_at, template_id)
  VALUES (v_user, v_started_at, p_template_id)
  RETURNING id INTO v_workout_id;

  -- 2) Compute readiness score from unified source
  v_score := public.compute_readiness_for_user(v_user, v_started_at);
  UPDATE public.workouts SET readiness_score = v_score WHERE id = v_workout_id;

  -- 3) Copy template exercises (if any)
  IF p_template_id IS NOT NULL THEN
    FOR rec IN
      SELECT
        te.exercise_id,
        te.order_index,
        te.default_sets,
        te.target_reps,
        te.target_weight_kg,
        te.weight_unit,
        te.notes
      FROM public.template_exercises te
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
        WHERE ue.user_id = v_user AND ue.exercise_id = rec.exercise_id AND ue.type = 'rm10'
        ORDER BY updated_at DESC LIMIT 1;
        v_base := v_est;
      END IF;

      v_mult   := readiness_multiplier(v_score);
      v_target := CASE WHEN v_base IS NULL THEN NULL ELSE ROUND(v_base * v_mult, 1) END;

      v_warmup := CASE WHEN v_target IS NULL THEN NULL
                 ELSE generate_warmup_steps(v_target) END;

      INSERT INTO public.workout_exercises(
        workout_id, exercise_id, order_index,
        target_sets, target_reps, target_weight_kg, weight_unit,
        notes, readiness_adjusted_from, attribute_values_json
      ) VALUES (
        v_workout_id, rec.exercise_id, rec.order_index,
        rec.default_sets, rec.target_reps, v_target, COALESCE(rec.weight_unit,'kg'),
        rec.notes, v_base_we,
        COALESCE(jsonb_build_object('warmup', v_warmup), '{}'::jsonb)
      );
    END LOOP;
  END IF;

  RETURN v_workout_id;
END;
$$;

-- 6. Create save_readiness_checkin RPC that saves to pre_workout_checkins
CREATE OR REPLACE FUNCTION public.save_readiness_checkin(
  p_workout_id uuid,
  p_energy int,
  p_sleep_quality int,
  p_sleep_hours numeric,
  p_soreness int,
  p_stress int,
  p_illness boolean,
  p_alcohol boolean,
  p_supplements int DEFAULT 0
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.pre_workout_checkins (
    user_id,
    workout_id,
    answers,
    created_at
  ) VALUES (
    auth.uid(),
    p_workout_id,
    jsonb_build_object(
      'energy', p_energy,
      'sleep_quality', p_sleep_quality,
      'sleep_hours', p_sleep_hours,
      'soreness', p_soreness,
      'stress', p_stress,
      'illness', p_illness,
      'alcohol', p_alcohol,
      'supplements', p_supplements
    ),
    now()
  );
END;
$$;