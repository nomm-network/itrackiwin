-- STEP 1 & 3: Inspect and drop ALL existing overloads
SELECT proname, oid::regprocedure FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace 
AND proname ILIKE 'upsert_readiness_today';

-- Drop every existing version
DROP FUNCTION IF EXISTS public.upsert_readiness_today(
  alcohol boolean, energisers_taken boolean, energy numeric, illness boolean,
  mood numeric, sleep_hours numeric, sleep_quality numeric, soreness numeric,
  stress numeric, workout_id uuid
);

-- Drop any p_ versions
DROP FUNCTION IF EXISTS public.upsert_readiness_today(
  p_alcohol boolean, p_energisers_taken boolean, p_energy numeric, p_illness boolean,
  p_mood numeric, p_sleep_hours numeric, p_sleep_quality numeric, p_soreness numeric,
  p_stress numeric, p_workout_id uuid
);

-- STEP 4: Create ONE canonical function with EXACT frontend parameter names
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
DECLARE
  v_user  uuid  := auth.uid();
  v_date  date  := (now() AT TIME ZONE 'utc')::date;
  v_score numeric;
  v_id    uuid;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Add diagnostics
  RAISE NOTICE 'upsert_readiness_today called for user: %, workout_id: %', v_user, workout_id;

  -- Compute 0–100 score
  v_score := public.compute_readiness_score(
    energy, sleep_quality, sleep_hours, soreness, stress, mood,
    energisers_taken, illness, alcohol
  );

  IF workout_id IS NOT NULL THEN
    RAISE NOTICE 'Per-workout branch for workout: %', workout_id;
    -- Per-workout record: fully qualify columns
    INSERT INTO public.readiness_checkins (
      id, user_id, workout_id, checkin_date,
      energy, sleep_quality, sleep_hours, soreness, stress, mood,
      energizers, illness, alcohol, score, computed_at, checkin_at
    ) VALUES (
      gen_random_uuid(), v_user, upsert_readiness_today.workout_id, v_date,
      upsert_readiness_today.energy,
      upsert_readiness_today.sleep_quality,
      upsert_readiness_today.sleep_hours,
      upsert_readiness_today.soreness,
      upsert_readiness_today.stress,
      upsert_readiness_today.mood,
      upsert_readiness_today.energisers_taken, -- UK->US mapping
      upsert_readiness_today.illness,
      upsert_readiness_today.alcohol,
      v_score, now(), now()
    )
    ON CONFLICT (user_id, workout_id) -- NO WHERE clause
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
    -- Daily record: UPDATE-then-INSERT, qualify columns
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
    WHERE readiness_checkins.user_id = v_user
      AND readiness_checkins.checkin_date = v_date
      AND readiness_checkins.workout_id IS NULL
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

  RAISE NOTICE 'Returning score: %', v_score;
  RETURN v_score;
END
$$;

-- STEP 5: Grant execute permissions
GRANT EXECUTE ON FUNCTION public.upsert_readiness_today(
  numeric, numeric, numeric, numeric, numeric, numeric, boolean, boolean, boolean, uuid
) TO authenticated;

-- STEP 6: Reload PostgREST schema cache
SELECT pg_notify('pgrst', 'reload schema');