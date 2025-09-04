-- Create RPC function to save readiness data
CREATE OR REPLACE FUNCTION public.save_readiness_checkin(
  p_energy int,
  p_sleep_quality int,
  p_sleep_hours numeric,
  p_soreness int,
  p_stress int,
  p_illness boolean,
  p_alcohol boolean,
  p_supplements jsonb
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user uuid := auth.uid();
  v_id uuid;
BEGIN
  IF v_user IS NULL THEN 
    RAISE EXCEPTION 'Not authenticated'; 
  END IF;

  INSERT INTO readiness_logs (
    user_id, energy, sleep_quality, sleep_hours, 
    soreness, stress, illness, alcohol, supplements
  ) VALUES (
    v_user, p_energy, p_sleep_quality, p_sleep_hours,
    p_soreness, p_stress, p_illness, p_alcohol, p_supplements
  ) RETURNING id INTO v_id;

  RETURN v_id;
END$$;