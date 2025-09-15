-- Drop the old function with integer parameters to resolve the conflict
DROP FUNCTION IF EXISTS public.upsert_readiness_today(
  p_energy integer,
  p_sleep_quality integer,
  p_sleep_hours numeric,
  p_soreness integer,
  p_stress integer,
  p_mood integer,
  p_energizers boolean,
  p_illness boolean,
  p_alcohol boolean,
  p_workout_id uuid
);

-- Ensure we only have the numeric version
-- The function with numeric parameters should already exist from the previous migration