-- First drop existing functions that need to change return types
DROP FUNCTION IF EXISTS public.pick_base_load(uuid, uuid);

-- Drop and recreate the view to avoid column drop issues  
DROP VIEW IF EXISTS public.v_latest_readiness;

-- Latest readiness from pre_workout_checkins only
CREATE VIEW public.v_latest_readiness AS
WITH src AS (
  SELECT
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
)
SELECT DISTINCT ON (user_id)
  user_id, created_at,
  energy, sleep_quality, sleep_hours, soreness, stress, illness, alcohol, supplements
FROM src
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
  score numeric := 65;
  sleep_hours_score numeric;
  supp_bonus numeric;
BEGIN
  SELECT * INTO r
  FROM public.v_latest_readiness
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN score;
  END IF;

  sleep_hours_score := CASE
    WHEN r.sleep_hours IS NULL THEN 60
    WHEN r.sleep_hours >= 8 THEN 100
    WHEN r.sleep_hours = 7 THEN 80
    WHEN r.sleep_hours = 6 THEN 60
    WHEN r.sleep_hours <= 5 THEN 40
    ELSE 60
  END;

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

-- Base load chooser (recreated)
CREATE FUNCTION public.pick_base_load(p_user uuid, p_exercise uuid)
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
         (SELECT w FROM high LIMIT 1),
         (SELECT w FROM recent ORDER BY w DESC LIMIT 1)
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

  INSERT INTO public.workouts (user_id, started_at, template_id)
  VALUES (v_user, now(), p_template_id)
  RETURNING id INTO v_workout_id;

  v_score := compute_readiness_for_user(v_user);
  UPDATE public.workouts SET readiness_score = v_score WHERE id = v_workout_id;
  v_mult := readiness_multiplier(v_score);

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