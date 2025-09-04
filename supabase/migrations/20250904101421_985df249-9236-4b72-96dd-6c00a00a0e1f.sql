-- 0) Safety: everything in one transaction
BEGIN;

-- 1) KILL THE OVERLOADS so PostgREST stops choking
DO $$
BEGIN
  -- old 1-arg version
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'compute_readiness_for_user'
      AND pg_get_function_identity_arguments(p.oid) = 'p_user_id uuid'
  ) THEN
    EXECUTE 'DROP FUNCTION public.compute_readiness_for_user(p_user_id uuid)';
  END IF;

  -- old 2-arg version (we'll replace it with one canonical definition below)
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'compute_readiness_for_user'
      AND pg_get_function_identity_arguments(p.oid) = 'p_user_id uuid, p_workout_started_at timestamp with time zone'
  ) THEN
    EXECUTE 'DROP FUNCTION public.compute_readiness_for_user(p_user_id uuid, p_workout_started_at timestamptz)';
  END IF;
END$$;

-- 2) RECREATE A SINGLE, CANONICAL READINESS FUNCTION (one name, one signature)
--    Use a default for p_workout_started_at so callers can pass one arg or two.
CREATE OR REPLACE FUNCTION public.compute_readiness_for_user(
  p_user_id uuid,
  p_workout_started_at timestamptz DEFAULT now()
) RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  -- pull the latest pre-workout checkin (answers is JSONB in your DB)
  v_energy          int;
  v_sleep_quality   int;
  v_sleep_hours     numeric;
  v_soreness        int;
  v_stress          int;
  v_ill             boolean;
  v_alcohol         boolean;
  v_supplements     jsonb;
  v_score           numeric := 65; -- safe default
BEGIN
  -- Read latest check-in BEFORE or AT this workout start (or just latest if none)
  SELECT
    (answers->>'energy')::int,
    (answers->>'sleep_quality')::int,
    COALESCE( (answers->>'sleep_hours')::numeric, 0 ),
    (answers->>'soreness')::int,
    (answers->>'stress')::int,
    COALESCE((answers->>'illness')::boolean, false),
    COALESCE((answers->>'alcohol')::boolean, false),
    COALESCE(answers->'supplements', '[]'::jsonb)
  INTO v_energy, v_sleep_quality, v_sleep_hours, v_soreness, v_stress, v_ill, v_alcohol, v_supplements
  FROM public.pre_workout_checkins
  WHERE user_id = p_user_id
    AND created_at <= p_workout_started_at
  ORDER BY created_at DESC
  LIMIT 1;

  -- If no data found, return default 65
  IF v_energy IS NULL THEN
    RETURN v_score;
  END IF;

  -- Sleep hours mapping (piecewise to 0..100)
  -- 5h→40, 6h→60, 7h→80, 8h→100 (cap to [0,100])
  v_sleep_hours := LEAST(100, GREATEST(0,
    CASE
      WHEN v_sleep_hours >= 8     THEN 100
      WHEN v_sleep_hours >= 7     THEN 80
      WHEN v_sleep_hours >= 6     THEN 60
      WHEN v_sleep_hours >= 5     THEN 40
      WHEN v_sleep_hours >  0     THEN 20
      ELSE 0
    END));

  -- Normalize sliders already 0..10 → scale to 0..100 inside weighting
  -- Weights: energy 20%, sleep quality 20%, sleep hours 20%, soreness 20%, stress 10%, supplements 10%
  v_score :=
      (COALESCE(v_energy,0)        * 10) * 0.20
    + (COALESCE(v_sleep_quality,0) * 10) * 0.20
    + (v_sleep_hours)                      * 0.20
    + ((10 - COALESCE(v_soreness,0)) * 10) * 0.20  -- lower soreness = higher score
    + ((10 - COALESCE(v_stress,0))   * 10) * 0.10  -- lower stress   = higher score
    + (CASE WHEN jsonb_array_length(v_supplements) > 0 THEN 100 ELSE 0 END) * 0.10;

  -- Penalties
  IF v_ill THEN v_score := v_score - 20; END IF;
  IF v_alcohol THEN v_score := v_score - 10; END IF;

  -- clamp 0..100
  v_score := LEAST(100, GREATEST(0, v_score));

  RETURN v_score;
END;
$$;

-- 3) READINESS MULTIPLIER (kept here so everything is together)
CREATE OR REPLACE FUNCTION public.readiness_multiplier(p_score numeric)
RETURNS numeric
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_score < 30 THEN RETURN 0.90;
  ELSIF p_score < 40 THEN RETURN 0.95;
  ELSIF p_score < 50 THEN RETURN 0.98;
  ELSIF p_score < 60 THEN RETURN 1.00;
  ELSIF p_score < 70 THEN RETURN 1.02;
  ELSIF p_score < 80 THEN RETURN 1.04;
  ELSIF p_score < 90 THEN RETURN 1.06;
  ELSE                 RETURN 1.08;
  END IF;
END;
$$;

-- 4) WARMUP STEPS (unchanged but included for completeness)
CREATE OR REPLACE FUNCTION public.generate_warmup_steps(p_top_kg numeric)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN jsonb_build_array(
    jsonb_build_object('percent', 0.40, 'reps', 10, 'rest_s', 60,  'kg', ROUND(p_top_kg*0.40,1)),
    jsonb_build_object('percent', 0.60, 'reps', 8,  'rest_s', 90,  'kg', ROUND(p_top_kg*0.60,1)),
    jsonb_build_object('percent', 0.80, 'reps', 5,  'rest_s', 120, 'kg', ROUND(p_top_kg*0.80,1))
  );
END;
$$;

-- 5) BEFORE INSERT trigger to attach warmup to each new workout_exercises row
CREATE OR REPLACE FUNCTION public.initialize_warmup_before_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.target_weight_kg IS NOT NULL THEN
    NEW.attribute_values_json :=
      jsonb_set(
        COALESCE(NEW.attribute_values_json, '{}'::jsonb),
        '{warmup}',
        public.generate_warmup_steps(NEW.target_weight_kg),
        true
      );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_init_warmup ON public.workout_exercises;
CREATE TRIGGER trg_init_warmup
  BEFORE INSERT ON public.workout_exercises
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_warmup_before_insert();

-- 6) Update start_workout to call the NEW single readiness function signature
--    (uses only target_weight_kg etc.; adjust column names if yours differ)
CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workout_id uuid;
  v_user       uuid := auth.uid();
  v_score      numeric;
  v_mult       numeric := 1.0;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.workouts(user_id, template_id, started_at)
  VALUES (v_user, p_template_id, now())
  RETURNING id INTO v_workout_id;

  -- compute readiness ONCE for this workout start
  v_score := public.compute_readiness_for_user(v_user, now());
  v_mult  := public.readiness_multiplier(COALESCE(v_score,65));

  UPDATE public.workouts
  SET readiness_score = v_score
  WHERE id = v_workout_id;

  IF p_template_id IS NOT NULL THEN
    INSERT INTO public.workout_exercises (
      workout_id, exercise_id, order_index,
      target_sets, target_reps, target_weight_kg, weight_unit, rest_seconds, notes
    )
    SELECT
      v_workout_id,
      te.exercise_id,
      te.order_index,
      te.default_sets,
      te.target_reps,
      CASE
        WHEN te.target_weight_kg IS NULL THEN NULL
        ELSE ROUND(te.target_weight_kg * v_mult, 1)
      END,
      te.weight_unit,
      te.rest_seconds,
      te.notes
    FROM public.template_exercises te
    WHERE te.template_id = p_template_id
    ORDER BY te.order_index;
  END IF;

  RETURN v_workout_id;
END;
$$;

COMMIT;