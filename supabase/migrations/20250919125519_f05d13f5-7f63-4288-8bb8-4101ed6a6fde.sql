-- 4) Create improved trigger function that uses historical bodyweight from load_meta
DROP FUNCTION IF EXISTS public.calculate_total_weight_kg() CASCADE;
DROP TRIGGER IF EXISTS trigger_calculate_total_weight ON public.workout_sets;

-- Helper function to get exercise load_mode and bodyweight percentage
CREATE OR REPLACE FUNCTION public._get_exercise_load_mode_and_bw_pct(p_workout_exercise_id UUID)
RETURNS TABLE(load_mode TEXT, bw_pct NUMERIC)
LANGUAGE SQL STABLE
SET search_path = public
AS $$
  SELECT
    ex.load_mode::TEXT,
    NULLIF((ex.attribute_values_json->>'bodyweight_involvement_pct')::NUMERIC, 0) AS bw_pct
  FROM public.workout_exercises we
  JOIN public.exercises ex ON ex.id = we.exercise_id
  WHERE we.id = p_workout_exercise_id
  LIMIT 1
$$;

-- Updated trigger function for total_weight_kg calculation
CREATE OR REPLACE FUNCTION public.trg_set_total_weight_kg()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_load_mode TEXT;
  v_bw_pct NUMERIC;
  v_bw_logged NUMERIC;
  v_weight NUMERIC;
BEGIN
  -- Read exercise load_mode + bodyweight percentage
  SELECT load_mode, bw_pct INTO v_load_mode, v_bw_pct
  FROM public._get_exercise_load_mode_and_bw_pct(NEW.workout_exercise_id);

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
END$$;

-- Create the trigger
CREATE TRIGGER trg_workout_sets_total_weight
BEFORE INSERT OR UPDATE OF weight_kg, load_meta, workout_exercise_id
ON public.workout_sets
FOR EACH ROW EXECUTE FUNCTION public.trg_set_total_weight_kg();