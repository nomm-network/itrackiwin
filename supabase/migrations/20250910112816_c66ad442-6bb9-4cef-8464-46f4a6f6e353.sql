-- Add checkin_date column for idempotency
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

-- Core readiness score computation function (returns 0-10)
CREATE OR REPLACE FUNCTION public.fn_compute_readiness_score_v1(p_checkin_id uuid, p_persist boolean)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  n_energy numeric; n_sleepq numeric; sh_score numeric;
  s_score numeric; stress_score numeric;
  mood_score numeric; boost numeric;
  base numeric; score numeric;
BEGIN
  SELECT energy, sleep_quality, sleep_hours, soreness, stress,
         mood, energizers, illness as sick, alcohol as alcohol_24h
  INTO r
  FROM public.readiness_checkins WHERE id = p_checkin_id;

  IF NOT FOUND THEN 
    RAISE EXCEPTION 'checkin % not found', p_checkin_id; 
  END IF;

  -- Normalize to 0-1 scale
  n_energy := GREATEST(LEAST(COALESCE(r.energy,5)/10.0,1),0);
  n_sleepq := GREATEST(LEAST(COALESCE(r.sleep_quality,5)/10.0,1),0);

  -- Sleep hours: 7-9 sweet spot, penalty for deviation
  sh_score := 1 - ABS(COALESCE(r.sleep_hours,8)-8)/4.0;
  sh_score := GREATEST(LEAST(sh_score,1),0);

  -- Invert negative factors (lower soreness/stress is better)
  s_score := 1 - GREATEST(LEAST(COALESCE(r.soreness,0)/10.0,1),0);
  stress_score := 1 - GREATEST(LEAST(COALESCE(r.stress,0)/10.0,1),0);

  mood_score := GREATEST(LEAST(COALESCE(r.mood,5)/10.0,1),0);
  boost := CASE WHEN COALESCE(r.energizers,false) THEN 0.8 ELSE 0.2 END;

  -- Weighted calculation (weights sum to 1.0)
  base := 0.20*n_energy + 0.18*n_sleepq + 0.15*sh_score
        + 0.15*s_score + 0.12*stress_score + 0.10*mood_score + 0.10*boost;

  score := GREATEST(LEAST(base,1),0)*10;

  -- Apply penalties
  IF COALESCE(r.sick,false) THEN score := score - 2.0; END IF;
  IF COALESCE(r.alcohol_24h,false) THEN score := score - 1.0; END IF;

  -- Final clamp to [0,10]
  score := GREATEST(LEAST(score,10),0);

  -- Persist if requested
  IF p_persist THEN
    UPDATE public.readiness_checkins
      SET score = score, computed_at = NOW()
      WHERE id = p_checkin_id;
  END IF;

  RETURN score;
END $$;

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