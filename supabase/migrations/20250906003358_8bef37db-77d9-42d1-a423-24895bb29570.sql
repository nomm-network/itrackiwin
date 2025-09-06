-- 1A) Latest pre-checkin per user
CREATE OR REPLACE VIEW public.v_latest_pre_checkin AS
SELECT DISTINCT ON (user_id)
  user_id,
  created_at,
  answers  -- jsonb with keys like energy, sleep_quality, sleep_hours, soreness, stress, sick (bool)
FROM public.pre_workout_checkins
ORDER BY user_id, created_at DESC;

-- 1B) Readiness score (0–100) derived from that json
CREATE OR REPLACE FUNCTION public.compute_readiness_for_user(p_user_id uuid)
RETURNS int
LANGUAGE sql
STABLE
AS $$
  WITH src AS (
    SELECT answers
    FROM public.v_latest_pre_checkin
    WHERE user_id = p_user_id
  )
  SELECT COALESCE(
    (
      100
      - 5 * GREATEST(0, (src.answers->>'soreness')::int)     -- soreness hurts readiness
      - 5 * GREATEST(0, (src.answers->>'stress')::int)       -- stress hurts readiness
      + 3 * GREATEST(0, (src.answers->>'energy')::int)       -- energy helps
      + 2 * GREATEST(0, (src.answers->>'sleep_quality')::int) -- sleep quality helps
    )::int,
    65  -- sane default if no check-in yet
  )
  FROM src;
$$;

-- 1C) Multiplier (0.8–1.2)
CREATE OR REPLACE FUNCTION public.readiness_multiplier(p_score int)
RETURNS numeric
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_score IS NULL THEN 1.0
    WHEN p_score < 40 THEN 0.85
    WHEN p_score < 60 THEN 0.95
    WHEN p_score < 80 THEN 1.00
    ELSE 1.10
  END::numeric;
$$;

-- 2) Fix ROUND error in start_workout - replace the problematic line
CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL::uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
          ELSE ROUND((v_base_weight * v_multiplier)::numeric, 1) -- ✅ Fixed ROUND error
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
$function$;

-- 3) Connect warmup via trigger
DROP TRIGGER IF EXISTS trg_init_warmup ON public.workout_exercises;

CREATE TRIGGER trg_init_warmup
BEFORE INSERT ON public.workout_exercises
FOR EACH ROW
EXECUTE FUNCTION public.initialize_warmup_before_insert();

-- 4) Active workout view for Training Center
CREATE OR REPLACE VIEW public.v_active_workout AS
SELECT id, user_id, started_at, template_id
FROM public.workouts
WHERE ended_at IS NULL;