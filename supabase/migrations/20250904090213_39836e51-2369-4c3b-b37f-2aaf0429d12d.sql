-- Fix readiness system to work with new pre_workout_checkins structure

-- Drop the problematic view first
DROP VIEW IF EXISTS public.v_latest_readiness CASCADE;

-- Create a new view that properly extracts data from the answers jsonb column
CREATE OR REPLACE VIEW public.v_latest_readiness AS
SELECT 
  user_id,
  created_at,
  readiness_score,
  COALESCE((answers->>'energy')::integer, 5) as energy,
  COALESCE((answers->>'sleep_quality')::integer, 5) as sleep_quality,
  COALESCE((answers->>'sleep_hours')::numeric, 8) as sleep_hours,
  COALESCE((answers->>'soreness')::integer, 1) as soreness,
  COALESCE((answers->>'stress')::integer, 1) as stress,
  COALESCE((answers->>'illness')::integer, 0) as illness,
  COALESCE((answers->>'alcohol')::integer, 0) as alcohol,
  COALESCE(CASE WHEN energisers_taken THEN 1 ELSE 0 END, 0) as supplements
FROM public.pre_workout_checkins
WHERE answers IS NOT NULL;

-- Update the compute_readiness_for_user function to handle potential null cases better
CREATE OR REPLACE FUNCTION public.compute_readiness_for_user(
  p_user_id uuid,
  p_workout_started_at timestamptz DEFAULT now()
)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
  r record;
  v_score numeric;
BEGIN
  -- Try to get the latest readiness data
  SELECT *
  INTO r
  FROM public.get_latest_readiness(p_user_id, p_workout_started_at)
  LIMIT 1;

  -- If no readiness data found, return default score
  IF r IS NULL OR r.energy IS NULL THEN
    RETURN 65; -- default readiness score when no check-in data
  END IF;

  -- Calculate the readiness score
  v_score := public.compute_readiness_score(
    COALESCE(r.energy, 5),
    COALESCE(r.sleep_quality, 5), 
    COALESCE(r.sleep_hours, 8), 
    COALESCE(r.soreness, 1),
    COALESCE(r.stress, 1), 
    COALESCE(r.illness, 0), 
    COALESCE(r.alcohol, 0), 
    CASE WHEN COALESCE(r.supplements, 0) > 0 THEN '["supplements"]'::jsonb ELSE '[]'::jsonb END
  );
  
  RETURN COALESCE(v_score, 65);
END;
$$;