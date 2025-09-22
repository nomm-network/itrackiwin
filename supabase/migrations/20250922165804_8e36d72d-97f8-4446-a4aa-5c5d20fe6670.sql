-- Fix trigger function that calls missing function
CREATE OR REPLACE FUNCTION public.trg_set_total_weight_kg()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_load_mode TEXT;
  v_bw_pct NUMERIC := 1.0; -- Default to 100% bodyweight involvement
  v_bw_logged NUMERIC;
  v_weight NUMERIC;
BEGIN
  -- Get load_mode directly from workout_exercises -> exercises
  SELECT e.load_mode INTO v_load_mode
  FROM workout_exercises we
  JOIN exercises e ON e.id = we.exercise_id
  WHERE we.id = NEW.workout_exercise_id;

  v_weight := NEW.weight_kg;

  IF v_load_mode = 'bodyweight_plus_optional' AND v_bw_pct IS NOT NULL THEN
    -- Extract logged bodyweight from load_meta
    v_bw_logged := COALESCE((NEW.load_meta->>'logged_bodyweight_kg')::NUMERIC, NULL);

    IF v_bw_logged IS NOT NULL THEN
      -- Calculate effective load: (bodyweight * involvement%) + external weight
      NEW.total_weight_kg := (v_bw_logged * v_bw_pct) + COALESCE(v_weight, 0);
    ELSE
      -- No bodyweight logged, leave null (client should pass it)
      NEW.total_weight_kg := NULL;
    END IF;

  ELSIF v_load_mode = 'external_added' THEN
    -- Traditional weighted exercises
    NEW.total_weight_kg := v_weight;

  ELSE
    -- Cardio, time-based, etc.
    NEW.total_weight_kg := NULL;
  END IF;

  RETURN NEW;
END;
$function$;