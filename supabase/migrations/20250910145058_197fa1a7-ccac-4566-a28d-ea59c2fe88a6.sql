-- Fix the readiness calculation double-scaling bug
CREATE OR REPLACE FUNCTION public.upsert_readiness_today(
  p_energy integer,
  p_sleep_quality integer,
  p_sleep_hours numeric,
  p_soreness integer,
  p_stress integer,
  p_mood integer,
  p_energizers boolean,
  p_illness boolean,
  p_alcohol boolean,
  p_workout_id uuid DEFAULT NULL
) RETURNS numeric
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

  -- Add explicit logging for debugging
  RAISE NOTICE 'UPSERT FUNCTION - Received params: energy=%, mood=%, illness=%, alcohol=%, energizers=%', 
    p_energy, p_mood, p_illness, p_alcohol, p_energizers;

  -- Fixed calculation to return 0-100 directly (removed the extra * 10)
  v_computed := (
    LEAST(GREATEST(p_energy/10.0,0),1)              * 0.20 +
    LEAST(GREATEST(p_sleep_quality/10.0,0),1)       * 0.18 +
    LEAST(GREATEST(1 - ABS(p_sleep_hours - 8)/4.0,0),1) * 0.15 +
    (1 - LEAST(GREATEST(p_soreness/10.0,0),1))      * 0.15 +
    (1 - LEAST(GREATEST(p_stress/10.0,0),1))        * 0.12 +
    LEAST(GREATEST(p_mood/10.0,0),1)                * 0.10 +
    (CASE WHEN p_energizers THEN 0.8 ELSE 0.2 END)  * 0.10
  ) * 100;  -- Now multiply by 100 to get 0-100 scale directly

  -- Normalize penalties (scale them appropriately for 0-100 scale)
  IF p_illness THEN v_computed := v_computed - 20; END IF;  -- -20 points instead of -2
  IF p_alcohol THEN v_computed := v_computed - 10; END IF;  -- -10 points instead of -1
  v_computed := LEAST(GREATEST(v_computed, 0), 100);  -- clamp to 0-100

  -- Handle workout-specific vs daily readiness differently
  IF p_workout_id IS NOT NULL THEN
    -- For workout-specific readiness, check if record exists
    SELECT id INTO v_existing_id
    FROM public.readiness_checkins
    WHERE user_id = v_user AND workout_id = p_workout_id;

    IF v_existing_id IS NOT NULL THEN
      -- Update existing record with explicit boolean casting
      UPDATE public.readiness_checkins
      SET energy = p_energy,
          sleep_quality = p_sleep_quality,
          sleep_hours = p_sleep_hours,
          soreness = p_soreness,
          stress = p_stress,
          mood = p_mood,
          energizers = p_energizers::boolean,
          illness = p_illness::boolean,
          alcohol = p_alcohol::boolean,
          score = v_computed,
          computed_at = now(),
          checkin_at = now()
      WHERE id = v_existing_id;
      
      RAISE NOTICE 'UPDATED existing record with illness=%, alcohol=%, energizers=%', 
        p_illness::boolean, p_alcohol::boolean, p_energizers::boolean;
    ELSE
      -- Insert new record with explicit boolean casting
      INSERT INTO public.readiness_checkins 
        (user_id, workout_id, checkin_date, checkin_at,
         energy, sleep_quality, sleep_hours, soreness, stress,
         mood, energizers, illness, alcohol, score, computed_at)
      VALUES
        (v_user, p_workout_id, v_checkin_date, now(),
         p_energy, p_sleep_quality, p_sleep_hours, p_soreness, p_stress,
         p_mood, p_energizers::boolean, p_illness::boolean, p_alcohol::boolean, v_computed, now());
         
      RAISE NOTICE 'INSERTED new record with illness=%, alcohol=%, energizers=%', 
        p_illness::boolean, p_alcohol::boolean, p_energizers::boolean;
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
       p_mood, p_energizers::boolean, p_illness::boolean, p_alcohol::boolean, v_computed, now())
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

  -- Return the 0-100 score directly (no more multiplication)
  RETURN ROUND(v_computed, 0);
END;
$$;