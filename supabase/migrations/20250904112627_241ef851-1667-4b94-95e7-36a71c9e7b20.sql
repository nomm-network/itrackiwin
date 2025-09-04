-- 1.1 Remove function ambiguity - rename 2-arg version and create clean 1-arg wrapper
DO $$
BEGIN
  -- drop 1-arg version if we are going to recreate it fresh
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public'
      AND p.proname='compute_readiness_for_user'
      AND p.pronargs=1
  ) THEN
    DROP FUNCTION public.compute_readiness_for_user(uuid);
  END IF;

  -- rename 2-arg version if present to *_at to avoid future ambiguity
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public'
      AND p.proname='compute_readiness_for_user'
      AND p.pronargs=2
  ) THEN
    ALTER FUNCTION public.compute_readiness_for_user(uuid, timestamptz)
    RENAME TO compute_readiness_for_user_at;
  END IF;
END$$;

-- Create a clean 1-arg wrapper that always calls the 2-arg version with now()
CREATE OR REPLACE FUNCTION public.compute_readiness_for_user(p_user_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
AS $$
  SELECT public.compute_readiness_for_user_at(p_user_id, now());
$$;

-- 1.2 Create/repair the compute_readiness_for_user_at function
CREATE OR REPLACE FUNCTION public.compute_readiness_for_user_at(p_user_id uuid, p_at timestamptz)
RETURNS numeric
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  r JSONB;
  energy int := 6;           -- defaults
  sleep_q int := 6;
  sleep_h numeric := 7.0;
  soreness int := 3;
  stress int := 3;
  took_supp boolean := false;
  illness boolean := false;
  alcohol boolean := false;
  sleep_h_score int := 60;
  base numeric;
BEGIN
  -- grab latest check-in for the user (you already store JSON in answers)
  SELECT answers
    INTO r
  FROM public.pre_workout_checkins
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF r IS NOT NULL THEN
    energy      := COALESCE((r->>'energy')::int, energy);
    sleep_q     := COALESCE((r->>'sleep_quality')::int, sleep_q);
    sleep_h     := COALESCE((r->>'sleep_hours')::numeric, sleep_h);
    soreness    := COALESCE((r->>'muscle_soreness')::int, soreness);
    stress      := COALESCE((r->>'stress_level')::int, stress);
    illness     := COALESCE((r->>'illness')::boolean, false);
    alcohol     := COALESCE((r->>'alcohol')::boolean, false);
    took_supp   := COALESCE((r->>'supplements')::boolean, false);
  END IF;

  -- sleep hours mapping: 5h→40, 6h→60, 7h→80, 8h→100, linear between
  IF     sleep_h <= 5 THEN sleep_h_score := 40;
  ELSIF  sleep_h >= 8 THEN sleep_h_score := 100;
  ELSE   sleep_h_score := 40 + ROUND((sleep_h - 5) * ( (100-40) / (8-5)::numeric ));
  END IF;

  -- weights: energy 20, sleepQ 20, sleepH 20, soreness 20, stress 10, supplements 10
  base :=
    (energy   * 10)::numeric * 0.20 +           -- 1..10 -> 10..100
    (sleep_q  * 10)::numeric * 0.20 +
    sleep_h_score         * 0.20 +
    ((11 - LEAST(10, GREATEST(1, soreness))) * 10)::numeric * 0.20 + -- lower soreness = higher score
    ((11 - LEAST(10, GREATEST(1, stress  ))) * 10)::numeric * 0.10 + -- lower stress   = higher score
    (CASE WHEN took_supp THEN 100 ELSE 0 END) * 0.10;

  -- penalties
  IF illness THEN base := base - 20; END IF;
  IF alcohol THEN base := base - 10; END IF;

  RETURN GREATEST(0, LEAST(100, ROUND(base)));
END;
$$;

-- 2) Make start_workout boring and robust
CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid;
  v_workout uuid;
BEGIN
  v_user := auth.uid();
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- create workout (note: workouts.template_id exists in your DB)
  INSERT INTO public.workouts (user_id, template_id, started_at, readiness_score)
  VALUES (v_user, p_template_id, now(), public.compute_readiness_for_user(v_user))
  RETURNING id INTO v_workout;

  -- copy template exercises (use only columns you confirmed exist)
  IF p_template_id IS NOT NULL THEN
    INSERT INTO public.workout_exercises
      (workout_id, exercise_id, order_index, target_sets, target_reps, target_weight_kg, weight_unit, notes)
    SELECT
      v_workout,
      te.exercise_id,
      te.order_index,
      te.default_sets,
      te.target_reps,
      te.target_weight_kg,
      COALESCE(te.weight_unit, 'kg'),
      te.notes
    FROM public.template_exercises te
    WHERE te.template_id = p_template_id
    ORDER BY te.order_index;
  END IF;

  RETURN v_workout;
END;
$$;

-- ensure clients can call it
GRANT EXECUTE ON FUNCTION public.start_workout(uuid) TO authenticated, anon, service_role;

-- 4) Optional warmup auto-init trigger
CREATE OR REPLACE FUNCTION public.initialize_warmup_before_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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