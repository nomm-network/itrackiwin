-- Add the remaining schema updates
ALTER TABLE public.readiness_checkins 
ADD COLUMN IF NOT EXISTS checkin_date date DEFAULT CURRENT_DATE;

-- Update existing rows to have checkin_date based on checkin_at
UPDATE public.readiness_checkins 
SET checkin_date = COALESCE(checkin_at::date, CURRENT_DATE)
WHERE checkin_date IS NULL;

-- Make checkin_date not null
ALTER TABLE public.readiness_checkins 
ALTER COLUMN checkin_date SET NOT NULL;

-- Create unique index for idempotency (one row per user per day)
CREATE UNIQUE INDEX IF NOT EXISTS uq_readiness_user_day
ON public.readiness_checkins(user_id, checkin_date);

-- Idempotent upsert + compute function (returns 0-100 for UI)
CREATE OR REPLACE FUNCTION public.upsert_readiness_today(
  p_energy int, p_sleep_quality int, p_sleep_hours numeric,
  p_soreness int, p_stress int, p_mood int,
  p_energizers boolean, p_illness boolean, p_alcohol boolean
) 
RETURNS numeric
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public 
AS $$
DECLARE
  u uuid := auth.uid();
  cid uuid;
  s10 numeric;
BEGIN
  IF u IS NULL THEN 
    RAISE EXCEPTION 'not authenticated'; 
  END IF;

  -- Upsert today's row
  INSERT INTO public.readiness_checkins 
    (user_id, checkin_date, checkin_at, energy, sleep_quality, sleep_hours,
     soreness, stress, mood, energizers, illness, alcohol)
  VALUES (u, CURRENT_DATE, NOW(), p_energy, p_sleep_quality, p_sleep_hours,
          p_soreness, p_stress, p_mood, p_energizers, p_illness, p_alcohol)
  ON CONFLICT (user_id, checkin_date)
  DO UPDATE SET 
    energy = EXCLUDED.energy,
    sleep_quality = EXCLUDED.sleep_quality,
    sleep_hours = EXCLUDED.sleep_hours,
    soreness = EXCLUDED.soreness,
    stress = EXCLUDED.stress,
    mood = EXCLUDED.mood,
    energizers = EXCLUDED.energizers,
    illness = EXCLUDED.illness,
    alcohol = EXCLUDED.alcohol,
    checkin_at = NOW()
  RETURNING id INTO cid;

  -- Compute and persist score (0-10)
  s10 := public.fn_compute_readiness_score_v1(cid, true);
  
  -- Return as 0-100 for UI
  RETURN s10 * 10.0;
END $$;

-- Update compute_readiness_for_user to use correct scale
CREATE OR REPLACE FUNCTION public.compute_readiness_for_user(p_user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  latest_checkin_id uuid;
  readiness_score numeric;
BEGIN
  -- Get the most recent checkin for today
  SELECT id INTO latest_checkin_id
  FROM public.readiness_checkins
  WHERE user_id = p_user_id
    AND checkin_date = CURRENT_DATE
  ORDER BY checkin_at DESC
  LIMIT 1;

  IF latest_checkin_id IS NULL THEN
    -- No recent checkin, return 0 (not 65)
    RETURN 0.0;
  END IF;

  -- Compute and return the score (0-10 scale from DB function)
  SELECT public.fn_compute_readiness_score_v1(latest_checkin_id, true)
  INTO readiness_score;

  -- Convert to 0-100 scale for consistency
  RETURN COALESCE(readiness_score, 0.0) * 10.0;
END $$;