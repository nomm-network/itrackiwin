-- Clean up ALL versions of upsert_readiness_today function
DROP FUNCTION IF EXISTS public.upsert_readiness_today(integer, integer, numeric, integer, integer, integer, boolean, boolean, boolean, uuid);
DROP FUNCTION IF EXISTS public.upsert_readiness_today(smallint, smallint, numeric, smallint, smallint, smallint, boolean, boolean, boolean, uuid);
DROP FUNCTION IF EXISTS public.upsert_readiness_today(integer, integer, numeric, integer, integer, integer, boolean, boolean, boolean);
DROP FUNCTION IF EXISTS public.upsert_readiness_today(smallint, smallint, numeric, smallint, smallint, smallint, boolean, boolean, boolean);

-- Create the single clean version
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
  p_workout_id uuid DEFAULT NULL::uuid
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

  -- Use new calculation function
  v_computed := public.compute_readiness_score_v2(
    p_energy, p_sleep_quality, p_sleep_hours, p_soreness, p_stress, 
    p_mood, p_energizers, p_illness, p_alcohol
  );

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

  -- Return the 0-100 score directly
  RETURN v_computed;
END;
$$;