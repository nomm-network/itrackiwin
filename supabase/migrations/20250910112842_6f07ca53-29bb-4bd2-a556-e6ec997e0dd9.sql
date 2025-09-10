-- Drop existing function to allow parameter changes
DROP FUNCTION IF EXISTS public.fn_compute_readiness_score_v1(uuid, boolean);

-- Create the corrected function
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