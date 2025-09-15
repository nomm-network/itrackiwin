-- Drop the p_ prefixed version that doesn't match frontend
DROP FUNCTION IF EXISTS public.upsert_readiness_today(
  p_energy numeric, p_sleep_quality numeric, p_sleep_hours numeric, p_soreness numeric, 
  p_stress numeric, p_mood numeric, p_energisers_taken boolean, p_illness boolean, 
  p_alcohol boolean, p_workout_id uuid
);

-- Create function with EXACT parameter names used by the client (no p_ prefix)
CREATE OR REPLACE FUNCTION public.upsert_readiness_today(
  alcohol           boolean,
  energisers_taken  boolean, -- UK spelling kept to match client payload
  energy            numeric,
  illness           boolean,
  mood              numeric,
  sleep_hours       numeric,
  sleep_quality     numeric,
  soreness          numeric,
  stress            numeric,
  workout_id        uuid DEFAULT NULL
) RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user  uuid  := auth.uid();
  v_date  date  := (now() AT TIME ZONE 'utc')::date;
  v_score numeric;
  v_id    uuid;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Compute 0–100 score (assumes this exists)
  v_score := public.compute_readiness_score(
    energy, sleep_quality, sleep_hours, soreness, stress, mood,
    energisers_taken, illness, alcohol
  );

  IF workout_id IS NOT NULL THEN
    -- Per-workout record: simple ON CONFLICT on (user_id, workout_id)
    INSERT INTO public.readiness_checkins (
      id, user_id, workout_id, checkin_date,
      energy, sleep_quality, sleep_hours, soreness, stress, mood,
      energizers, illness, alcohol, score, computed_at, checkin_at
    ) VALUES (
      gen_random_uuid(), v_user, workout_id, v_date,
      upsert_readiness_today.energy,
      upsert_readiness_today.sleep_quality,
      upsert_readiness_today.sleep_hours,
      upsert_readiness_today.soreness,
      upsert_readiness_today.stress,
      upsert_readiness_today.mood,
      upsert_readiness_today.energisers_taken, -- map UK→US column
      upsert_readiness_today.illness,
      upsert_readiness_today.alcohol,
      v_score, now(), now()
    )
    ON CONFLICT (user_id, workout_id)
    DO UPDATE SET
      energy        = EXCLUDED.energy,
      sleep_quality = EXCLUDED.sleep_quality,
      sleep_hours   = EXCLUDED.sleep_hours,
      soreness      = EXCLUDED.soreness,
      stress        = EXCLUDED.stress,
      mood          = EXCLUDED.mood,
      energizers    = EXCLUDED.energizers,
      illness       = EXCLUDED.illness,
      alcohol       = EXCLUDED.alcohol,
      score         = EXCLUDED.score,
      computed_at   = EXCLUDED.computed_at,
      checkin_at    = EXCLUDED.checkin_at;

  ELSE
    -- Daily record (no workout): UPDATE-then-INSERT to avoid ambiguous WHERE in ON CONFLICT
    UPDATE public.readiness_checkins SET
      energy        = upsert_readiness_today.energy,
      sleep_quality = upsert_readiness_today.sleep_quality,
      sleep_hours   = upsert_readiness_today.sleep_hours,
      soreness      = upsert_readiness_today.soreness,
      stress        = upsert_readiness_today.stress,
      mood          = upsert_readiness_today.mood,
      energizers    = upsert_readiness_today.energisers_taken,
      illness       = upsert_readiness_today.illness,
      alcohol       = upsert_readiness_today.alcohol,
      score         = v_score,
      computed_at   = now(),
      checkin_at    = now()
    WHERE user_id = v_user
      AND checkin_date = v_date
      AND workout_id IS NULL
    RETURNING id INTO v_id;

    IF v_id IS NULL THEN
      INSERT INTO public.readiness_checkins (
        id, user_id, workout_id, checkin_date,
        energy, sleep_quality, sleep_hours, soreness, stress, mood,
        energizers, illness, alcohol, score, computed_at, checkin_at
      ) VALUES (
        gen_random_uuid(), v_user, NULL, v_date,
        upsert_readiness_today.energy,
        upsert_readiness_today.sleep_quality,
        upsert_readiness_today.sleep_hours,
        upsert_readiness_today.soreness,
        upsert_readiness_today.stress,
        upsert_readiness_today.mood,
        upsert_readiness_today.energisers_taken,
        upsert_readiness_today.illness,
        upsert_readiness_today.alcohol,
        v_score, now(), now()
      );
    END IF;
  END IF;

  RETURN v_score;
END
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.upsert_readiness_today(
  boolean, boolean, numeric, boolean, numeric, numeric, numeric, numeric, numeric, uuid
) TO authenticated;