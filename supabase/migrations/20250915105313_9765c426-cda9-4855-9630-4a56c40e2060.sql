-- Create the compute_readiness_score function that calculates a readiness score from 0-100
CREATE OR REPLACE FUNCTION public.compute_readiness_score(
  p_energy numeric,
  p_sleep_quality numeric,
  p_sleep_hours numeric,
  p_soreness numeric,
  p_stress numeric,
  p_mood numeric,
  p_energizers boolean,
  p_illness boolean,
  p_alcohol boolean
)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $$
DECLARE
  v_score numeric := 0;
  v_sleep_score numeric;
  v_wellness_score numeric;
  v_mental_score numeric;
  v_bonus_penalty numeric := 0;
BEGIN
  -- Energy component (0-10 -> 0-25 points)
  v_score := v_score + (p_energy * 2.5);
  
  -- Sleep quality component (0-10 -> 0-20 points)
  v_score := v_score + (p_sleep_quality * 2.0);
  
  -- Sleep hours component (convert hours to score)
  -- Optimal sleep is around 7-9 hours
  IF p_sleep_hours >= 7 AND p_sleep_hours <= 9 THEN
    v_sleep_score := 15; -- Full 15 points for optimal sleep
  ELSIF p_sleep_hours >= 6 AND p_sleep_hours < 7 THEN
    v_sleep_score := 12; -- Decent sleep
  ELSIF p_sleep_hours >= 5 AND p_sleep_hours < 6 THEN
    v_sleep_score := 8; -- Poor sleep
  ELSIF p_sleep_hours < 5 THEN
    v_sleep_score := 3; -- Very poor sleep
  ELSIF p_sleep_hours > 9 AND p_sleep_hours <= 10 THEN
    v_sleep_score := 12; -- A bit too much but okay
  ELSE
    v_sleep_score := 5; -- Too much sleep
  END IF;
  
  v_score := v_score + v_sleep_score;
  
  -- Soreness (inverted: less soreness = better, 0-10 -> 0-15 points)
  v_score := v_score + ((10 - p_soreness) * 1.5);
  
  -- Stress (inverted: less stress = better, 0-10 -> 0-15 points)
  v_score := v_score + ((10 - p_stress) * 1.5);
  
  -- Mood component (0-10 -> 0-10 points)
  v_score := v_score + p_mood;
  
  -- Bonuses and penalties
  IF p_energizers THEN
    v_bonus_penalty := v_bonus_penalty + 5; -- +5 for energizers
  END IF;
  
  IF p_illness THEN
    v_bonus_penalty := v_bonus_penalty - 15; -- -15 for illness
  END IF;
  
  IF p_alcohol THEN
    v_bonus_penalty := v_bonus_penalty - 10; -- -10 for alcohol
  END IF;
  
  v_score := v_score + v_bonus_penalty;
  
  -- Ensure score is between 0 and 100
  v_score := GREATEST(0, LEAST(100, v_score));
  
  RETURN ROUND(v_score, 1);
END;
$$;