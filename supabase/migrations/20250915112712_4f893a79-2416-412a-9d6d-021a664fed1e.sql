-- Fix the ambiguous column reference by updating unique constraints and RPC function
-- Drop existing partial indexes and create proper unique constraints
DROP INDEX IF EXISTS ux_readiness_user_workout;
DROP INDEX IF EXISTS ux_readiness_user_day;

-- Create unique constraints that work properly with ON CONFLICT
CREATE UNIQUE INDEX ux_readiness_user_workout 
ON public.readiness_checkins (user_id, workout_id) 
WHERE workout_id IS NOT NULL;

CREATE UNIQUE INDEX ux_readiness_user_day 
ON public.readiness_checkins (user_id, checkin_date) 
WHERE workout_id IS NULL;

-- Update the RPC function to handle conflicts without ambiguous references
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
  v_user uuid := auth.uid();
  v_date date := (now() at time zone 'utc')::date;
  v_score numeric;
  v_id uuid;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_score := public.compute_readiness_score(
    energy, sleep_quality, sleep_hours, soreness, stress, mood,
    energisers_taken, illness, alcohol
  );

  IF workout_id IS NOT NULL THEN
    -- Per-workout uniqueness - use explicit conflict target
    INSERT INTO public.readiness_checkins (
      id, user_id, workout_id, checkin_date,
      energy, sleep_quality, sleep_hours, soreness, stress, mood,
      energizers, illness, alcohol, score, computed_at, checkin_at
    ) VALUES (
      gen_random_uuid(), v_user, workout_id, v_date,
      energy, sleep_quality, sleep_hours, soreness, stress, mood,
      energisers_taken, illness, alcohol, v_score, now(), now()
    )
    ON CONFLICT (user_id, workout_id)
    DO UPDATE SET
      energy=EXCLUDED.energy, sleep_quality=EXCLUDED.sleep_quality,
      sleep_hours=EXCLUDED.sleep_hours, soreness=EXCLUDED.soreness,
      stress=EXCLUDED.stress, mood=EXCLUDED.mood,
      energizers=EXCLUDED.energizers, illness=EXCLUDED.illness, alcohol=EXCLUDED.alcohol,
      score=EXCLUDED.score, computed_at=EXCLUDED.computed_at, checkin_at=EXCLUDED.checkin_at
    RETURNING id INTO v_id;
  ELSE
    -- Per-day uniqueness (no workout) - use different approach
    -- First try to update existing record for today
    UPDATE public.readiness_checkins SET
      energy = upsert_readiness_today.energy,
      sleep_quality = upsert_readiness_today.sleep_quality,
      sleep_hours = upsert_readiness_today.sleep_hours,
      soreness = upsert_readiness_today.soreness,
      stress = upsert_readiness_today.stress,
      mood = upsert_readiness_today.mood,
      energizers = energisers_taken,
      illness = upsert_readiness_today.illness,
      alcohol = upsert_readiness_today.alcohol,
      score = v_score,
      computed_at = now(),
      checkin_at = now()
    WHERE user_id = v_user 
      AND checkin_date = v_date 
      AND workout_id IS NULL
    RETURNING id INTO v_id;
    
    -- If no record was updated, insert a new one
    IF v_id IS NULL THEN
      INSERT INTO public.readiness_checkins (
        id, user_id, workout_id, checkin_date,
        energy, sleep_quality, sleep_hours, soreness, stress, mood,
        energizers, illness, alcohol, score, computed_at, checkin_at
      ) VALUES (
        gen_random_uuid(), v_user, NULL, v_date,
        energy, sleep_quality, sleep_hours, soreness, stress, mood,
        energisers_taken, illness, alcohol, v_score, now(), now()
      )
      RETURNING id INTO v_id;
    END IF;
  END IF;

  RETURN v_score;
EXCEPTION
  WHEN OTHERS THEN
    -- Enhanced error logging with exact SQL state and message
    RAISE EXCEPTION 'RPC Error: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END $$;