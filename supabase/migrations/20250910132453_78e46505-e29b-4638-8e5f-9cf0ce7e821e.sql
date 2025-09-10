-- Drop the problematic function and replace compute_readiness_for_user to be self-contained
DROP FUNCTION IF EXISTS public.fn_compute_readiness_score_v1(uuid, boolean);

-- Replace compute_readiness_for_user with a self-contained version
CREATE OR REPLACE FUNCTION public.compute_readiness_for_user(p_user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

  -- Use the stored score directly (already computed and stored as 0-10)
  -- Convert to 0-100 scale for consistency with the rest of the system
  computed_score := COALESCE(latest_checkin.score, 6.5) * 10.0;

  RETURN LEAST(GREATEST(computed_score, 0), 100);
END;
$$;