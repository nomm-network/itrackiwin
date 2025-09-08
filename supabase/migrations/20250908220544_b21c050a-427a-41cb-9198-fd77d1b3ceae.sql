-- Add missing columns for readiness score tracking
ALTER TABLE public.readiness_checkins 
  ADD COLUMN IF NOT EXISTS score numeric,
  ADD COLUMN IF NOT EXISTS computed_at timestamptz,
  ADD COLUMN IF NOT EXISTS energizers boolean DEFAULT false;

-- Create function to compute readiness score v1
CREATE OR REPLACE FUNCTION public.fn_compute_readiness_score_v1(p_checkin_id uuid, p_persist boolean DEFAULT true)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  n_energy          numeric;
  n_sleep_quality   numeric;
  sleep_hours_score numeric;
  soreness_score    numeric;
  stress_score      numeric;
  mood_score        numeric;
  energizers_score  numeric;
  base              numeric;
  final_score       numeric;
BEGIN
  SELECT
    energy, 
    sleep_quality, 
    sleep_hours, 
    soreness,  -- mapped from muscle_soreness 
    stress,
    illness    AS sick,        -- mapped from feeling_sick
    alcohol    AS alcohol_24h, -- mapped from had_alcohol_24h
    energizers,
    mood
  INTO r
  FROM public.readiness_checkins
  WHERE id = p_checkin_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'checkin % not found', p_checkin_id;
  END IF;

  -- Normalize 0-10 scale inputs to 0-1
  n_energy        := LEAST(GREATEST(COALESCE(r.energy, 5) / 10.0, 0), 1);
  n_sleep_quality := LEAST(GREATEST(COALESCE(r.sleep_quality, 5) / 10.0, 0), 1);

  -- Sleep hours: favor 7-9h (center at 8h), linear penalty
  sleep_hours_score := 1 - (ABS(COALESCE(r.sleep_hours, 8) - 8) / 4.0);
  sleep_hours_score := LEAST(GREATEST(sleep_hours_score, 0), 1);

  -- Invert negative factors (higher soreness/stress = lower score)
  soreness_score := 1 - LEAST(GREATEST(COALESCE(r.soreness, 0) / 10.0, 0), 1);
  stress_score   := 1 - LEAST(GREATEST(COALESCE(r.stress, 0) / 10.0, 0), 1);
  
  -- Include mood as positive factor
  mood_score := LEAST(GREATEST(COALESCE(r.mood, 5) / 10.0, 0), 1);

  -- Energizers: small boost if taken
  energizers_score := CASE WHEN COALESCE(r.energizers, false) THEN 0.8 ELSE 0.2 END;

  -- Weighted base score (all weights sum to 1.00)
  base :=
      0.20 * n_energy           -- Energy level
    + 0.18 * n_sleep_quality    -- Sleep quality  
    + 0.15 * sleep_hours_score  -- Sleep duration
    + 0.15 * soreness_score     -- Muscle recovery
    + 0.12 * stress_score       -- Stress level (inverted)
    + 0.10 * mood_score         -- Mood/motivation
    + 0.10 * energizers_score;  -- Supplement boost

  -- Convert to 0-10 scale
  final_score := LEAST(GREATEST(base, 0), 1) * 10;

  -- Apply hard penalties
  IF COALESCE(r.sick, false) THEN
    final_score := final_score - 2.0;
  END IF;

  IF COALESCE(r.alcohol_24h, false) THEN
    final_score := final_score - 1.0;
  END IF;

  -- Final clamp to [0, 10]
  final_score := LEAST(GREATEST(final_score, 0), 10);

  -- Persist if requested
  IF p_persist THEN
    UPDATE public.readiness_checkins
      SET score = final_score, computed_at = now()
      WHERE id = p_checkin_id;
  END IF;

  RETURN final_score;
END;
$$;

-- Create trigger function for auto-computation
CREATE OR REPLACE FUNCTION public.trg_readiness_autoscore_v1()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.fn_compute_readiness_score_v1(NEW.id, true);
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS readiness_autoscore_v1 ON public.readiness_checkins;

-- Create trigger to auto-compute score on insert/update
CREATE TRIGGER readiness_autoscore_v1
AFTER INSERT OR UPDATE OF energy, sleep_quality, sleep_hours, soreness, stress, illness, alcohol, energizers, mood
ON public.readiness_checkins
FOR EACH ROW
EXECUTE FUNCTION public.trg_readiness_autoscore_v1();

-- Create helper function to get user's latest readiness score
CREATE OR REPLACE FUNCTION public.compute_readiness_for_user(p_user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  latest_checkin_id uuid;
  readiness_score numeric;
BEGIN
  -- Get the most recent checkin for today or yesterday
  SELECT id INTO latest_checkin_id
  FROM public.readiness_checkins
  WHERE user_id = p_user_id
    AND checkin_at >= CURRENT_DATE - INTERVAL '1 day'
  ORDER BY checkin_at DESC
  LIMIT 1;

  IF latest_checkin_id IS NULL THEN
    -- No recent checkin, return default moderate score
    RETURN 65.0;
  END IF;

  -- Compute and return the score
  SELECT public.fn_compute_readiness_score_v1(latest_checkin_id, true)
  INTO readiness_score;

  RETURN COALESCE(readiness_score, 65.0);
END;
$$;