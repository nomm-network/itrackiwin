-- STEP 1 & 2: Drop existing and create internal function with p_ prefixes
DROP FUNCTION IF EXISTS public.upsert_readiness_today(
  energy numeric, sleep_quality numeric, sleep_hours numeric, soreness numeric,
  stress numeric, mood numeric, energisers_taken boolean, illness boolean,
  alcohol boolean, workout_id uuid
);

-- Internal function with p_ prefixes to avoid ambiguity
CREATE OR REPLACE FUNCTION public._upsert_readiness_internal(
  p_energy            numeric,
  p_sleep_quality     numeric,
  p_sleep_hours       numeric,
  p_soreness          numeric,
  p_stress            numeric,
  p_mood              numeric,
  p_energisers_taken  boolean,
  p_illness           boolean,
  p_alcohol           boolean,
  p_workout_id        uuid DEFAULT NULL
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

  RAISE NOTICE 'Internal function called for user: %, p_workout_id: %', v_user, p_workout_id;

  -- Compute 0–100 score
  v_score := public.compute_readiness_score(
    p_energy, p_sleep_quality, p_sleep_hours, p_soreness, p_stress, p_mood,
    p_energisers_taken, p_illness, p_alcohol
  );

  IF p_workout_id IS NOT NULL THEN
    RAISE NOTICE 'Per-workout branch for workout: %', p_workout_id;
    -- Per-workout record: alias table and use p_ parameters
    INSERT INTO public.readiness_checkins AS rc (
      id, user_id, workout_id, checkin_date,
      energy, sleep_quality, sleep_hours, soreness, stress, mood,
      energizers, illness, alcohol, score, computed_at, checkin_at
    ) VALUES (
      gen_random_uuid(), v_user, p_workout_id, v_date,
      p_energy, p_sleep_quality, p_sleep_hours, p_soreness, p_stress, p_mood,
      p_energisers_taken, p_illness, p_alcohol,
      v_score, now(), now()
    )
    ON CONFLICT (user_id, workout_id) -- Column names only
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
    RAISE NOTICE 'Daily branch for date: %', v_date;
    -- Daily record: alias table, use p_ parameters
    UPDATE public.readiness_checkins AS rc SET
      energy        = p_energy,
      sleep_quality = p_sleep_quality,
      sleep_hours   = p_sleep_hours,
      soreness      = p_soreness,
      stress        = p_stress,
      mood          = p_mood,
      energizers    = p_energisers_taken,
      illness       = p_illness,
      alcohol       = p_alcohol,
      score         = v_score,
      computed_at   = now(),
      checkin_at    = now()
    WHERE rc.user_id = v_user
      AND rc.checkin_date = v_date
      AND rc.workout_id IS NULL
    RETURNING id INTO v_id;

    IF v_id IS NULL THEN
      INSERT INTO public.readiness_checkins AS rc (
        id, user_id, workout_id, checkin_date,
        energy, sleep_quality, sleep_hours, soreness, stress, mood,
        energizers, illness, alcohol, score, computed_at, checkin_at
      ) VALUES (
        gen_random_uuid(), v_user, NULL, v_date,
        p_energy, p_sleep_quality, p_sleep_hours, p_soreness, p_stress, p_mood,
        p_energisers_taken, p_illness, p_alcohol,
        v_score, now(), now()
      );
    END IF;
  END IF;

  RAISE NOTICE 'Returning score: %', v_score;
  RETURN v_score;
END
$$;

-- STEP 2: Public wrapper with frontend parameter names
CREATE OR REPLACE FUNCTION public.upsert_readiness_today(
  energy            numeric,
  sleep_quality     numeric,
  sleep_hours       numeric,
  soreness          numeric,
  stress            numeric,
  mood              numeric,
  energisers_taken  boolean,
  illness           boolean,
  alcohol           boolean,
  workout_id        uuid DEFAULT NULL
) RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Thin wrapper: forward to internal function with p_ prefixes
  RETURN public._upsert_readiness_internal(
    p_energy => energy,
    p_sleep_quality => sleep_quality,
    p_sleep_hours => sleep_hours,
    p_soreness => soreness,
    p_stress => stress,
    p_mood => mood,
    p_energisers_taken => energisers_taken,
    p_illness => illness,
    p_alcohol => alcohol,
    p_workout_id => workout_id
  );
END
$$;

-- STEP 5: Ensure proper unique indexes exist
DROP INDEX IF EXISTS ux_readiness_user_workout;
DROP INDEX IF EXISTS ux_readiness_user_date_nullwk;

-- Unique per workout (when workout_id IS NOT NULL)
CREATE UNIQUE INDEX IF NOT EXISTS ux_readiness_user_workout
ON public.readiness_checkins(user_id, workout_id)
WHERE workout_id IS NOT NULL;

-- Unique per day (when workout_id IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS ux_readiness_user_date_nullwk
ON public.readiness_checkins(user_id, checkin_date)
WHERE workout_id IS NULL;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.upsert_readiness_today(
  numeric, numeric, numeric, numeric, numeric, numeric, boolean, boolean, boolean, uuid
) TO authenticated;

-- STEP 7: Refresh PostgREST schema cache
SELECT pg_notify('pgrst', 'reload schema');