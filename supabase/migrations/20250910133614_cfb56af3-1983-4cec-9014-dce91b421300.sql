-- Clean up redundant unique constraints and fix the ON CONFLICT issue

-- Drop redundant daily unique constraints (keep only one)
DROP INDEX IF EXISTS public.uq_readiness_user_day;
DROP INDEX IF EXISTS public.readiness_unique_user_date;
-- Keep ux_readiness_daily as the main daily constraint

-- The issue is that ON CONFLICT can't use a conditional unique constraint
-- We need to handle this differently in the function

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
  v_existing_id uuid;
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

  -- Handle workout-specific vs daily readiness differently
  IF p_workout_id IS NOT NULL THEN
    -- For workout-specific readiness, check if record exists
    SELECT id INTO v_existing_id
    FROM public.readiness_checkins
    WHERE user_id = v_user AND workout_id = p_workout_id;

    IF v_existing_id IS NOT NULL THEN
      -- Update existing record
      UPDATE public.readiness_checkins
      SET energy = p_energy,
          sleep_quality = p_sleep_quality,
          sleep_hours = p_sleep_hours,
          soreness = p_soreness,
          stress = p_stress,
          mood = p_mood,
          energizers = p_energizers,
          illness = p_illness,
          alcohol = p_alcohol,
          score = v_computed,
          computed_at = now(),
          checkin_at = now()
      WHERE id = v_existing_id;
    ELSE
      -- Insert new record
      INSERT INTO public.readiness_checkins 
        (user_id, workout_id, checkin_date, checkin_at,
         energy, sleep_quality, sleep_hours, soreness, stress,
         mood, energizers, illness, alcohol, score, computed_at)
      VALUES
        (v_user, p_workout_id, v_checkin_date, now(),
         p_energy, p_sleep_quality, p_sleep_hours, p_soreness, p_stress,
         p_mood, p_energizers, p_illness, p_alcohol, v_computed, now());
    END IF;
  ELSE
    -- For daily readiness (legacy), use ON CONFLICT with daily constraint
    INSERT INTO public.readiness_checkins AS rc
      (user_id, checkin_date, checkin_at,
       energy, sleep_quality, sleep_hours, soreness, stress,
       mood, energizers, illness, alcohol, score, computed_at)
    VALUES
      (v_user, v_checkin_date, now(),
       p_energy, p_sleep_quality, p_sleep_hours, p_soreness, p_stress,
       p_mood, p_energizers, p_illness, p_alcohol, v_computed, now())
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
       checkin_at    = now();
  END IF;

  -- Return 0..100 for UI
  RETURN ROUND(v_computed * 10, 0);
END;
$$;