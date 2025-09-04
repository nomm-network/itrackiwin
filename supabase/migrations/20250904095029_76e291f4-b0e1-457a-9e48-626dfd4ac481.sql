-- Drop and recreate the view
DROP VIEW IF EXISTS public.v_latest_readiness;

-- Latest readiness from pre_workout_checkins.answers (JSONB only)
CREATE VIEW public.v_latest_readiness AS
SELECT DISTINCT ON (user_id)
  user_id,
  created_at,
  NULLIF(answers->>'energy','')::numeric         AS energy,
  NULLIF(answers->>'sleep_quality','')::numeric  AS sleep_quality,
  NULLIF(answers->>'sleep_hours','')::numeric    AS sleep_hours,
  NULLIF(answers->>'soreness','')::numeric       AS soreness,
  NULLIF(answers->>'stress','')::numeric         AS stress,
  COALESCE((answers->>'illness')::boolean, false)   AS illness,
  COALESCE((answers->>'alcohol')::boolean, false)   AS alcohol,
  COALESCE(answers->'supplements','[]'::jsonb)      AS supplements
FROM public.pre_workout_checkins
WHERE user_id IS NOT NULL
ORDER BY user_id, created_at DESC;

-- Readiness score (always returns 0–100)
CREATE OR REPLACE FUNCTION public.compute_readiness_for_user(p_user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  score numeric := 65;       -- safe default
  sleep_hours_score numeric;
  supp_bonus numeric;
BEGIN
  SELECT * INTO r
  FROM public.v_latest_readiness
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;

  -- If no record at all, keep default 65
  IF NOT FOUND THEN
    RETURN score;
  END IF;

  -- Map sleep hours to 0–100 band
  sleep_hours_score :=
    CASE
      WHEN r.sleep_hours IS NULL THEN 60
      WHEN r.sleep_hours >= 8 THEN 100
      WHEN r.sleep_hours = 7 THEN 80
      WHEN r.sleep_hours = 6 THEN 60
      WHEN r.sleep_hours <= 5 THEN 40
      ELSE 60
    END;

  -- Supplements bump (+10 if any)
  supp_bonus := CASE WHEN jsonb_array_length(COALESCE(r.supplements,'[]')) > 0 THEN 10 ELSE 0 END;

  score :=
    0.20 * COALESCE(r.energy, 6)*10 +
    0.20 * COALESCE(r.sleep_quality, 7)*10 +
    0.20 * sleep_hours_score +
    0.20 * (100 - COALESCE(r.soreness, 3)*10) +
    0.10 * (100 - COALESCE(r.stress, 3)*10) +
    supp_bonus;

  IF r.illness THEN score := score - 20; END IF;
  IF r.alcohol THEN score := score - 10; END IF;

  score := GREATEST(0, LEAST(100, score));
  RETURN ROUND(score,0);
END $$;

-- Readiness multiplier
CREATE OR REPLACE FUNCTION public.readiness_multiplier(p_score numeric)
RETURNS numeric
LANGUAGE sql
AS $$
SELECT CASE
  WHEN p_score < 30 THEN 0.90
  WHEN p_score < 40 THEN 0.95
  WHEN p_score < 50 THEN 0.98
  WHEN p_score < 60 THEN 1.00
  WHEN p_score < 70 THEN 1.02
  WHEN p_score < 80 THEN 1.04
  WHEN p_score < 90 THEN 1.06
  ELSE 1.08
END;
$$;

-- Base load chooser (last 60 days, prefer high readiness)
CREATE OR REPLACE FUNCTION public.pick_base_load(p_user uuid, p_exercise uuid)
RETURNS numeric
LANGUAGE sql
STABLE
AS $$
WITH recent AS (
  SELECT we.target_weight_kg AS w, w.started_at
  FROM public.workout_exercises we
  JOIN public.workouts w ON w.id = we.workout_id
  WHERE w.user_id = p_user
    AND we.exercise_id = p_exercise
    AND we.target_weight_kg IS NOT NULL
    AND w.started_at >= now() - interval '60 days'
  ORDER BY w.started_at DESC
  LIMIT 3
),
high AS (
  SELECT we.target_weight_kg AS w, w.started_at
  FROM public.workout_exercises we
  JOIN public.workouts w ON w.id = we.workout_id
  WHERE w.user_id = p_user
    AND we.exercise_id = p_exercise
    AND we.target_weight_kg IS NOT NULL
    AND w.readiness_score >= 60
    AND w.started_at >= now() - interval '60 days'
  ORDER BY w.started_at DESC
  LIMIT 1
)
SELECT COALESCE(
         (SELECT w FROM high LIMIT 1),                       -- prefer a good day
         (SELECT w FROM recent ORDER BY w DESC LIMIT 1)      -- else best of recent
       );
$$;

-- Warm-up steps from working weight (no fragile columns)
CREATE OR REPLACE FUNCTION public.generate_warmup_steps(p_top_kg numeric)
RETURNS jsonb
LANGUAGE sql
AS $$
SELECT jsonb_build_array(
  jsonb_build_object('pct', 0.40, 'kg', ROUND(p_top_kg*0.40,1), 'reps', 10, 'rest_s', 60),
  jsonb_build_object('pct', 0.60, 'kg', ROUND(p_top_kg*0.60,1), 'reps',  8, 'rest_s', 90),
  jsonb_build_object('pct', 0.80, 'kg', ROUND(p_top_kg*0.80,1), 'reps',  5, 'rest_s',120)
);
$$;

-- Start workout (uses only normalized columns)
CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workout_id uuid;
  v_user uuid := auth.uid();
  v_score numeric;
  v_mult  numeric;
  rec RECORD;
  v_base numeric;
  v_target numeric;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Create the workout; keep template_id if you added that column
  INSERT INTO public.workouts (user_id, started_at, template_id)
  VALUES (v_user, now(), p_template_id)
  RETURNING id INTO v_workout_id;

  -- Compute and store readiness (always returns a number)
  v_score := compute_readiness_for_user(v_user);
  UPDATE public.workouts SET readiness_score = v_score WHERE id = v_workout_id;
  v_mult := readiness_multiplier(v_score);

  -- If a template was chosen, copy its exercises
  IF p_template_id IS NOT NULL THEN
    FOR rec IN
      SELECT
        te.exercise_id,
        te.order_index,
        te.default_sets,
        te.target_reps,
        te.target_weight_kg,
        COALESCE(te.weight_unit, 'kg') AS weight_unit
      FROM public.template_exercises te
      WHERE te.template_id = p_template_id
      ORDER BY te.order_index
    LOOP
      -- Base load: prefer last good session → else template → else user estimates
      v_base := COALESCE(
        pick_base_load(v_user, rec.exercise_id),
        rec.target_weight_kg,
        (SELECT estimated_weight
           FROM public.user_exercise_estimates
          WHERE user_id = v_user
            AND exercise_id = rec.exercise_id
            AND type = 'rm10'
          ORDER BY updated_at DESC NULLS LAST
          LIMIT 1)
      );

      v_target := CASE WHEN v_base IS NULL THEN NULL ELSE ROUND(v_base * v_mult, 1) END;

      INSERT INTO public.workout_exercises(
        workout_id,
        exercise_id,
        order_index,
        target_sets,
        target_reps,
        target_weight_kg,
        weight_unit
      ) VALUES (
        v_workout_id,
        rec.exercise_id,
        rec.order_index,
        rec.default_sets,
        rec.target_reps,
        v_target,
        rec.weight_unit
      );
    END LOOP;
  END IF;

  RETURN v_workout_id;
END;
$$;

-- Initialize warm-ups on insert (optional but handy)
CREATE OR REPLACE FUNCTION public.initialize_warmup_for_exercise(p_workout_exercise_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_top numeric;
  v_steps jsonb;
BEGIN
  SELECT target_weight_kg INTO v_top
  FROM public.workout_exercises
  WHERE id = p_workout_exercise_id;

  IF v_top IS NULL THEN
    RETURN;
  END IF;

  v_steps := generate_warmup_steps(v_top);

  UPDATE public.workout_exercises
  SET attribute_values_json = jsonb_set(
        COALESCE(attribute_values_json, '{}'::jsonb),
        '{warmup}',
        v_steps,
        true
      )
  WHERE id = p_workout_exercise_id;
END;
$$;