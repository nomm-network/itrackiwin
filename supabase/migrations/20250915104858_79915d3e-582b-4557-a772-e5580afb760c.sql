-- Update the upsert_readiness_today function to handle the new constraint
-- The function should upsert based on user_id + workout_id when workout_id is provided
-- or user_id + date when workout_id is null

CREATE OR REPLACE FUNCTION public.upsert_readiness_today(
  p_energy numeric,
  p_sleep_quality numeric,
  p_sleep_hours numeric,
  p_soreness numeric,
  p_stress numeric,
  p_mood numeric,
  p_energizers boolean,
  p_illness boolean,
  p_alcohol boolean,
  p_workout_id uuid DEFAULT NULL
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
  v_score numeric;
  v_today date;
  v_existing_id uuid;
BEGIN
  -- Get the current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_today := CURRENT_DATE;

  -- Calculate the readiness score (0-100)
  v_score := public.compute_readiness_score(
    p_energy, p_sleep_quality, p_sleep_hours,
    p_soreness, p_stress, p_mood,
    p_energizers, p_illness, p_alcohol
  );

  -- Check if a record exists for this user and workout (if workout_id provided)
  -- or for this user and date (if workout_id is null)
  IF p_workout_id IS NOT NULL THEN
    SELECT id INTO v_existing_id
    FROM readiness_checkins
    WHERE user_id = v_user_id AND workout_id = p_workout_id;
  ELSE
    SELECT id INTO v_existing_id
    FROM readiness_checkins
    WHERE user_id = v_user_id AND checkin_date = v_today AND workout_id IS NULL
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;

  -- Upsert the record
  IF v_existing_id IS NOT NULL THEN
    -- Update existing record
    UPDATE readiness_checkins
    SET
      energy = p_energy,
      sleep_quality = p_sleep_quality,
      sleep_hours = p_sleep_hours,
      soreness = p_soreness,
      stress = p_stress,
      mood = p_mood,
      energizers = p_energizers,
      illness = p_illness,
      alcohol = p_alcohol,
      score = v_score,
      updated_at = now()
    WHERE id = v_existing_id;
  ELSE
    -- Insert new record
    INSERT INTO readiness_checkins (
      user_id,
      checkin_date,
      energy,
      sleep_quality,
      sleep_hours,
      soreness,
      stress,
      mood,
      energizers,
      illness,
      alcohol,
      score,
      workout_id
    ) VALUES (
      v_user_id,
      v_today,
      p_energy,
      p_sleep_quality,
      p_sleep_hours,
      p_soreness,
      p_stress,
      p_mood,
      p_energizers,
      p_illness,
      p_alcohol,
      v_score,
      p_workout_id
    );
  END IF;

  RETURN v_score;
END;
$$;