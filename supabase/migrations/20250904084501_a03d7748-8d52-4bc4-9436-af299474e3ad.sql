-- Clean up duplicate and old readiness functions
-- Keep only the new unified versions

-- Drop the old save_readiness_checkin function that references readiness_logs
DROP FUNCTION IF EXISTS public.save_readiness_checkin(
  p_energy integer,
  p_sleep_quality integer,
  p_sleep_hours numeric,
  p_soreness integer,
  p_stress integer,
  p_illness boolean,
  p_alcohol boolean,
  p_supplements integer
);

-- Create the unified save_readiness_checkin function with proper readiness score calculation
CREATE OR REPLACE FUNCTION public.save_readiness_checkin(
  p_workout_id uuid,
  p_energy integer,
  p_sleep_quality integer,
  p_sleep_hours numeric,
  p_soreness integer,
  p_stress integer,
  p_illness boolean,
  p_alcohol boolean,
  p_supplements integer
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_user uuid;
  v_checkin_id uuid;
  v_readiness_score numeric;
BEGIN
  v_user := auth.uid();
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Calculate readiness score
  v_readiness_score := public.compute_readiness_score(
    p_energy,
    p_sleep_quality,
    p_sleep_hours,
    p_soreness,
    p_stress,
    p_illness,
    p_alcohol,
    CASE WHEN p_supplements > 0 THEN '["supplements"]'::jsonb ELSE '[]'::jsonb END
  );

  -- Save to pre_workout_checkins
  INSERT INTO public.pre_workout_checkins (
    user_id,
    workout_id,
    answers,
    readiness_score,
    energisers_taken,
    created_at
  ) VALUES (
    v_user,
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
    v_readiness_score,
    p_supplements > 0,
    now()
  ) RETURNING id INTO v_checkin_id;

  RETURN v_checkin_id;
END;
$$;

-- Ensure the start_workout function uses the unified approach correctly
CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL)
RETURNS TABLE(workout_id uuid)
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
  v_mult numeric;
  v_target numeric;
  v_warmup jsonb;
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
        te.rest_seconds,
        te.notes
      FROM public.template_exercises te
      WHERE te.template_id = p_template_id
      ORDER BY te.order_index
    LOOP
      -- base load (prefer last 3 high-readiness within 60d; falls back internally)
      v_base := public.pick_base_load(v_user, rec.exercise_id);

      -- choose template's target if base missing
      IF v_base IS NULL THEN
        v_base := rec.target_weight_kg;
      END IF;

      -- multiplier from readiness (NULL => 1.00)
      v_mult := COALESCE(public.readiness_multiplier(v_score), 1.0);

      -- smart target for Set 1
      v_target := CASE
                    WHEN v_base IS NULL THEN NULL
                    ELSE ROUND(v_base * v_mult, 1)
                  END;

      -- warm-up off the smart target (falls back to template target if needed)
      v_warmup := public.generate_warmup_steps(COALESCE(v_target, rec.target_weight_kg));

      INSERT INTO public.workout_exercises (
        workout_id,
        exercise_id,
        order_index,
        target_sets,
        target_reps,
        target_weight_kg,
        weight_unit,
        rest_seconds,
        notes,
        warmup_plan
      ) VALUES (
        v_workout_id,
        rec.exercise_id,
        rec.order_index,
        rec.default_sets,
        rec.target_reps,
        v_target,
        COALESCE(rec.weight_unit, 'kg'),
        rec.rest_seconds,
        rec.notes,
        v_warmup
      );
    END LOOP;
  END IF;

  RETURN QUERY SELECT v_workout_id;
END;
$$;