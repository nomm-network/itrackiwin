-- Drop the existing function with specific signature
DROP FUNCTION IF EXISTS public.save_readiness_checkin(uuid,integer,integer,numeric,integer,integer,boolean,boolean,integer);

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