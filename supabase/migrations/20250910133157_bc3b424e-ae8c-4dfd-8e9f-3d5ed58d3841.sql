-- Update the upsert_readiness_today function to accept and store workout_id
-- and make it workout-specific rather than day-specific

DROP FUNCTION IF EXISTS public.upsert_readiness_today(
  smallint, smallint, numeric, smallint, smallint, smallint, boolean, boolean, boolean
);

CREATE OR REPLACE FUNCTION public.upsert_readiness_today(
  p_energy        smallint,
  p_sleep_quality smallint,
  p_sleep_hours   numeric,
  p_soreness      smallint,
  p_stress        smallint,
  p_mood          smallint,
  p_energizers    boolean,
  p_illness       boolean,
  p_alcohol       boolean,
  p_workout_id    uuid DEFAULT NULL
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_checkin_date date := CURRENT_DATE;
  v_computed numeric;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Inline calculation to avoid function dependencies
  v_computed := (
    LEAST(GREATEST(p_energy/10.0,0),1)              * 0.20 +
    LEAST(GREATEST(p_sleep_quality/10.0,0),1)       * 0.18 +
    LEAST(GREATEST(1 - ABS(p_sleep_hours - 8)/4.0,0),1) * 0.15 +
    (1 - LEAST(GREATEST(p_soreness/10.0,0),1))      * 0.15 +
    (1 - LEAST(GREATEST(p_stress/10.0,0),1))        * 0.12 +
    LEAST(GREATEST(p_mood/10.0,0),1)                * 0.10 +
    (CASE WHEN p_energizers THEN 0.8 ELSE 0.2 END)  * 0.10
  ) * 10;  -- 0..10

  -- Normalize penalties
  IF p_illness THEN v_computed := v_computed - 2; END IF;
  IF p_alcohol THEN v_computed := v_computed - 1; END IF;
  v_computed := LEAST(GREATEST(v_computed, 0), 10);  -- clamp

  -- If workout_id is provided, use workout-specific conflict resolution
  -- Otherwise, use day-specific conflict resolution (old behavior)
  IF p_workout_id IS NOT NULL THEN
    INSERT INTO public.readiness_checkins AS rc
      (user_id, workout_id, checkin_date, checkin_at,
       energy, sleep_quality, sleep_hours, soreness, stress,
       mood, energizers, illness, alcohol,
       score, computed_at)
    VALUES
      (v_user, p_workout_id, v_checkin_date, now(),
       p_energy, p_sleep_quality, p_sleep_hours, p_soreness, p_stress,
       p_mood, p_energizers, p_illness, p_alcohol,
       v_computed, now())
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
       computed_at   = now(),
       checkin_at    = now()
    WHERE rc.user_id = EXCLUDED.user_id
      AND rc.workout_id = EXCLUDED.workout_id;
  ELSE
    -- Legacy day-specific behavior
    INSERT INTO public.readiness_checkins AS rc
      (user_id, checkin_date, checkin_at,
       energy, sleep_quality, sleep_hours, soreness, stress,
       mood, energizers, illness, alcohol,
       score, computed_at)
    VALUES
      (v_user, v_checkin_date, now(),
       p_energy, p_sleep_quality, p_sleep_hours, p_soreness, p_stress,
       p_mood, p_energizers, p_illness, p_alcohol,
       v_computed, now())
    ON CONFLICT (user_id, checkin_date)
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
       computed_at   = now(),
       checkin_at    = now()
    WHERE rc.user_id = EXCLUDED.user_id
      AND rc.checkin_date = EXCLUDED.checkin_date;
  END IF;

  -- Return 0..100 for UI
  RETURN ROUND(v_computed * 10, 0);
END;
$$;

-- Create unique constraint for workout-specific readiness
CREATE UNIQUE INDEX IF NOT EXISTS ux_readiness_user_workout
  ON public.readiness_checkins(user_id, workout_id)
  WHERE workout_id IS NOT NULL;