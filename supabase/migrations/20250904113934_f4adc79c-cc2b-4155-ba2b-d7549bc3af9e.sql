-- Fix the compute_readiness_for_user_at function to handle array/non-boolean values
CREATE OR REPLACE FUNCTION public.compute_readiness_for_user_at(p_user_id uuid, p_at timestamptz)
RETURNS numeric
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  r JSONB;
  energy int := 6;           -- defaults
  sleep_q int := 6;
  sleep_h numeric := 7.0;
  soreness int := 3;
  stress int := 3;
  took_supp boolean := false;
  illness boolean := false;
  alcohol boolean := false;
  sleep_h_score int := 60;
  base numeric;
BEGIN
  -- grab latest check-in for the user (you already store JSON in answers)
  SELECT answers
    INTO r
  FROM public.pre_workout_checkins
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF r IS NOT NULL THEN
    -- Safely extract numeric values
    energy      := COALESCE((r->>'energy')::int, energy);
    sleep_q     := COALESCE((r->>'sleep_quality')::int, sleep_q);
    sleep_h     := COALESCE((r->>'sleep_hours')::numeric, sleep_h);
    soreness    := COALESCE((r->>'muscle_soreness')::int, soreness);
    stress      := COALESCE((r->>'stress_level')::int, stress);
    
    -- Safely extract boolean values - handle various formats
    BEGIN
      illness := CASE 
        WHEN jsonb_typeof(r->'illness') = 'boolean' THEN (r->>'illness')::boolean
        WHEN jsonb_typeof(r->'illness') = 'string' AND (r->>'illness') IN ('true', '1', 'yes') THEN true
        WHEN jsonb_typeof(r->'illness') = 'array' AND jsonb_array_length(r->'illness') > 0 THEN true
        ELSE false
      END;
    EXCEPTION WHEN OTHERS THEN
      illness := false;
    END;
    
    BEGIN
      alcohol := CASE 
        WHEN jsonb_typeof(r->'alcohol') = 'boolean' THEN (r->>'alcohol')::boolean
        WHEN jsonb_typeof(r->'alcohol') = 'string' AND (r->>'alcohol') IN ('true', '1', 'yes') THEN true
        WHEN jsonb_typeof(r->'alcohol') = 'array' AND jsonb_array_length(r->'alcohol') > 0 THEN true
        ELSE false
      END;
    EXCEPTION WHEN OTHERS THEN
      alcohol := false;
    END;
    
    BEGIN
      took_supp := CASE 
        WHEN jsonb_typeof(r->'supplements') = 'boolean' THEN (r->>'supplements')::boolean
        WHEN jsonb_typeof(r->'supplements') = 'string' AND (r->>'supplements') IN ('true', '1', 'yes') THEN true
        WHEN jsonb_typeof(r->'supplements') = 'array' AND jsonb_array_length(r->'supplements') > 0 THEN true
        ELSE false
      END;
    EXCEPTION WHEN OTHERS THEN
      took_supp := false;
    END;
  END IF;

  -- sleep hours mapping: 5h→40, 6h→60, 7h→80, 8h→100, linear between
  IF     sleep_h <= 5 THEN sleep_h_score := 40;
  ELSIF  sleep_h >= 8 THEN sleep_h_score := 100;
  ELSE   sleep_h_score := 40 + ROUND((sleep_h - 5) * ( (100-40) / (8-5)::numeric ));
  END IF;

  -- weights: energy 20, sleepQ 20, sleepH 20, soreness 20, stress 10, supplements 10
  base :=
    (energy   * 10)::numeric * 0.20 +           -- 1..10 -> 10..100
    (sleep_q  * 10)::numeric * 0.20 +
    sleep_h_score         * 0.20 +
    ((11 - LEAST(10, GREATEST(1, soreness))) * 10)::numeric * 0.20 + -- lower soreness = higher score
    ((11 - LEAST(10, GREATEST(1, stress  ))) * 10)::numeric * 0.10 + -- lower stress   = higher score
    (CASE WHEN took_supp THEN 100 ELSE 0 END) * 0.10;

  -- penalties
  IF illness THEN base := base - 20; END IF;
  IF alcohol THEN base := base - 10; END IF;

  RETURN GREATEST(0, LEAST(100, ROUND(base)));
END;
$$;