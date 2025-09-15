-- Drop conflicting indexes & the old function (safe)
-- indexes: keep ONE unique path per mode
DROP INDEX IF EXISTS ux_readiness_daily;
DROP INDEX IF EXISTS ux_readiness_user_workout;
DROP INDEX IF EXISTS idx_readiness_user_workout_unique;
DROP INDEX IF EXISTS idx_readiness_user_date_nullwk;

-- function (any signature variants)
DROP FUNCTION IF EXISTS public.upsert_readiness_today(
  numeric,numeric,numeric,numeric,numeric,numeric,boolean,boolean,boolean,uuid
);
DROP FUNCTION IF EXISTS public.upsert_readiness_today(
  integer,integer,numeric,integer,integer,integer,boolean,boolean,boolean,uuid
);

-- Rebuild unambiguous unique constraints (partial indexes)
-- one per workout (only when workout_id IS NOT NULL)
CREATE UNIQUE INDEX IF NOT EXISTS ux_readiness_user_workout
ON public.readiness_checkins(user_id, workout_id)
WHERE workout_id IS NOT NULL;

-- one per day (only when workout_id IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS ux_readiness_user_date_nullwk
ON public.readiness_checkins(user_id, checkin_date)
WHERE workout_id IS NULL;

-- Create a clean, unambiguous RPC
CREATE OR REPLACE FUNCTION public.upsert_readiness_today(
  p_energy           numeric,
  p_sleep_quality    numeric,
  p_sleep_hours      numeric,
  p_soreness         numeric,
  p_stress           numeric,
  p_mood             numeric,
  p_energisers_taken boolean,  -- UK spelling accepted
  p_illness          boolean,
  p_alcohol          boolean,
  p_workout_id       uuid DEFAULT NULL
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user  uuid   := auth.uid();
  v_date  date   := (now() at time zone 'utc')::date;
  v_score numeric;
  v_id    uuid;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- compute 0–100 (or 0–10; use the same function you already created)
  v_score := public.compute_readiness_score(
    p_energy, p_sleep_quality, p_sleep_hours,
    p_soreness, p_stress, p_mood,
    p_energisers_taken, p_illness, p_alcohol
  );

  IF p_workout_id IS NOT NULL THEN
    -- Per-workout path (unique by user_id + workout_id)
    INSERT INTO public.readiness_checkins (
      id, user_id, workout_id, checkin_date,
      energy, sleep_quality, sleep_hours, soreness, stress, mood,
      energizers, illness, alcohol, score, computed_at, checkin_at
    ) VALUES (
      gen_random_uuid(), v_user, p_workout_id, v_date,
      p_energy, p_sleep_quality, p_sleep_hours, p_soreness, p_stress, p_mood,
      p_energisers_taken, p_illness, p_alcohol, v_score, now(), now()
    )
    ON CONFLICT (user_id, workout_id)  -- ← no WHERE here
    DO UPDATE SET
      energy       = EXCLUDED.energy,
      sleep_quality= EXCLUDED.sleep_quality,
      sleep_hours  = EXCLUDED.sleep_hours,
      soreness     = EXCLUDED.soreness,
      stress       = EXCLUDED.stress,
      mood         = EXCLUDED.mood,
      energizers   = EXCLUDED.energizers,
      illness      = EXCLUDED.illness,
      alcohol      = EXCLUDED.alcohol,
      score        = EXCLUDED.score,
      computed_at  = EXCLUDED.computed_at,
      checkin_at   = EXCLUDED.checkin_at;
  ELSE
    -- Daily path (unique by user_id + date when workout_id IS NULL)
    UPDATE public.readiness_checkins SET
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
        p_energy, p_sleep_quality, p_sleep_hours, p_soreness, p_stress, p_mood,
        p_energisers_taken, p_illness, p_alcohol, v_score, now(), now()
      );
    END IF;
  END IF;

  RETURN v_score;
END;
$$;