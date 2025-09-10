-- Replace readiness calculation with new formula
-- Clean up and implement the new weighting system:
-- Sleep bundle: 20% (50/50 quality & hours)
-- Energy: 15% (reduced from 30%)  
-- Soreness: 15%
-- Stress: 15%
-- Mood: 25%
-- Energizers: +10 bonus
-- Illness: -20 penalty
-- Alcohol: -10 penalty

-- 1) New core calculator function
CREATE OR REPLACE FUNCTION public.compute_readiness_score_v2(
  p_energy integer,
  p_sleep_quality integer,
  p_sleep_hours numeric,
  p_soreness integer,
  p_stress integer,
  p_mood integer,
  p_energizers boolean,
  p_illness boolean,
  p_alcohol boolean
)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_energy_score    numeric := GREATEST(0, LEAST(100, COALESCE(p_energy,0)*10));           -- 0..100 (10=100)
  v_quality_score   numeric := GREATEST(0, LEAST(100, COALESCE(p_sleep_quality,0)*10));    -- 0..100
  v_hours_score     numeric;                                                                -- 0..100 (mapped)
  v_sleep_bundle    numeric;
  v_soreness_score  numeric := GREATEST(0, LEAST(100, 110 - COALESCE(p_soreness,10)*10));  -- 1 best → 100
  v_stress_score    numeric := GREATEST(0, LEAST(100, 110 - COALESCE(p_stress,10)*10));    -- 1 best → 100
  v_mood_score      numeric := GREATEST(0, LEAST(100, COALESCE(p_mood,0)*10));             -- 0..100
  v_base            numeric;
  v_bonus           numeric := CASE WHEN COALESCE(p_energizers,false) THEN 10 ELSE 0 END;
  v_penalty         numeric := 0;
  v_total           numeric;
BEGIN
  -- Sleep hours mapping (5→40, 6→60, 7→80, 8+→100, <5 → 20, >9 → 100)
  v_hours_score :=
    CASE
      WHEN p_sleep_hours IS NULL THEN 50
      WHEN p_sleep_hours >= 9 THEN 100
      WHEN p_sleep_hours >= 8 THEN 100
      WHEN p_sleep_hours = 7 THEN 80
      WHEN p_sleep_hours = 6 THEN 60
      WHEN p_sleep_hours = 5 THEN 40
      WHEN p_sleep_hours < 5 THEN 20
      ELSE 60
    END;

  -- Sleep bundle: 50/50 quality & hours, then weight 20% overall
  v_sleep_bundle := (v_quality_score * 0.5 + v_hours_score * 0.5);

  -- Weights (sum 90). Energizers adds +10 → **max 100** before penalties.
  -- Energy 15%, Sleep bundle 20%, Soreness 15%, Stress 15%, Mood 25%
  v_base :=
      v_energy_score    * 0.15
    + v_sleep_bundle    * 0.20
    + v_soreness_score  * 0.15
    + v_stress_score    * 0.15
    + v_mood_score      * 0.25;

  -- Penalties
  IF COALESCE(p_illness,false) THEN v_penalty := v_penalty + 20; END IF;
  IF COALESCE(p_alcohol,false)  THEN v_penalty := v_penalty + 10; END IF;

  v_total := v_base + v_bonus - v_penalty;

  RETURN ROUND(GREATEST(0, LEAST(100, v_total))::numeric, 0);  -- integer 0..100
END;
$$;

-- 2) Update the main upsert function to use new calculator
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

-- 3) Update compute_readiness_for_user to handle the corrected scale
CREATE OR REPLACE FUNCTION public.compute_readiness_for_user(p_user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  latest_checkin RECORD;
  computed_score numeric;
BEGIN
  -- Get the most recent checkin for today
  SELECT * INTO latest_checkin
  FROM public.readiness_checkins
  WHERE user_id = p_user_id
    AND checkin_date = CURRENT_DATE
  ORDER BY checkin_at DESC
  LIMIT 1;

  IF latest_checkin IS NULL THEN
    -- No recent checkin, return default readiness (65 out of 100)
    RETURN 65.0;
  END IF;

  -- If score is already 0-100, use directly; if it's 0-10, multiply by 10
  computed_score := COALESCE(latest_checkin.score, 6.5);
  
  -- Handle both old (0-10) and new (0-100) scale scores
  IF computed_score <= 10 THEN
    computed_score := computed_score * 10.0;
  END IF;

  RETURN LEAST(GREATEST(computed_score, 0), 100);
END;
$$;

-- 4) Clean up old functions that are no longer needed
DROP FUNCTION IF EXISTS public.compute_readiness_score(
  p_energy numeric, p_sleep_quality numeric, p_sleep_hours numeric, 
  p_soreness numeric, p_stress numeric, p_illness boolean, p_alcohol boolean
);

-- 5) Remove old triggers if they exist
DROP TRIGGER IF EXISTS readiness_autoscore_v1 ON public.readiness_checkins;