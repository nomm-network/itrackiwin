-- Fix the parameter/column mapping issue in the RPC function
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
    -- Per-workout uniqueness
    INSERT INTO public.readiness_checkins AS rc (
      id, user_id, workout_id, checkin_date,
      energy, sleep_quality, sleep_hours, soreness, stress, mood,
      energizers, illness, alcohol, score, computed_at, checkin_at
    ) VALUES (
      gen_random_uuid(), v_user, workout_id, v_date,
      energy, sleep_quality, sleep_hours, soreness, stress, mood,
      energisers_taken, illness, alcohol, v_score, now(), now()
    )
    ON CONFLICT ON CONSTRAINT ux_readiness_user_workout
    DO UPDATE SET
      energy=EXCLUDED.energy, sleep_quality=EXCLUDED.sleep_quality,
      sleep_hours=EXCLUDED.sleep_hours, soreness=EXCLUDED.soreness,
      stress=EXCLUDED.stress, mood=EXCLUDED.mood,
      energizers=EXCLUDED.energizers, illness=EXCLUDED.illness, alcohol=EXCLUDED.alcohol,
      score=EXCLUDED.score, computed_at=EXCLUDED.computed_at, checkin_at=EXCLUDED.checkin_at
    RETURNING id INTO v_id;
  ELSE
    -- Per-day uniqueness (no workout)
    INSERT INTO public.readiness_checkins AS rc (
      id, user_id, workout_id, checkin_date,
      energy, sleep_quality, sleep_hours, soreness, stress, mood,
      energizers, illness, alcohol, score, computed_at, checkin_at
    ) VALUES (
      gen_random_uuid(), v_user, NULL, v_date,
      energy, sleep_quality, sleep_hours, soreness, stress, mood,
      energisers_taken, illness, alcohol, v_score, now(), now()
    )
    ON CONFLICT ON CONSTRAINT ux_readiness_user_day
    DO UPDATE SET
      energy=EXCLUDED.energy, sleep_quality=EXCLUDED.sleep_quality,
      sleep_hours=EXCLUDED.sleep_hours, soreness=EXCLUDED.soreness,
      stress=EXCLUDED.stress, mood=EXCLUDED.mood,
      energizers=EXCLUDED.energizers, illness=EXCLUDED.illness, alcohol=EXCLUDED.alcohol,
      score=EXCLUDED.score, computed_at=EXCLUDED.computed_at, checkin_at=EXCLUDED.checkin_at
    RETURNING id INTO v_id;
  END IF;

  RETURN v_score;
EXCEPTION
  WHEN OTHERS THEN
    -- Enhanced error logging with exact SQL state and message
    RAISE EXCEPTION 'RPC Error: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END $$;