-- Enhance warmup system to handle NaN cases and ensure proper initialization

-- Create function to initialize warmup for new workout exercises
CREATE OR REPLACE FUNCTION public.initialize_warmup_for_exercise(p_workout_exercise_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_id uuid;
  v_exercise_id uuid;
  v_target_weight numeric;
  v_estimate_weight numeric;
  v_default_weight numeric := 60; -- sensible default
BEGIN
  -- Get user and exercise info
  SELECT w.user_id, we.exercise_id 
  INTO v_user_id, v_exercise_id
  FROM workout_exercises we
  JOIN workouts w ON w.id = we.workout_id
  WHERE we.id = p_workout_exercise_id;

  IF v_user_id IS NULL OR v_exercise_id IS NULL THEN
    RETURN;
  END IF;

  -- Try to find existing target weight
  SELECT target_weight INTO v_target_weight
  FROM workout_exercises 
  WHERE id = p_workout_exercise_id;

  -- If no target weight, try to get from estimates
  IF v_target_weight IS NULL THEN
    SELECT estimated_weight INTO v_estimate_weight
    FROM user_exercise_estimates
    WHERE user_id = v_user_id 
      AND exercise_id = v_exercise_id 
      AND type = 'rm10'
    ORDER BY created_at DESC
    LIMIT 1;
    
    v_target_weight := COALESCE(v_estimate_weight, v_default_weight);
  END IF;

  -- Create or update workout_exercise_feedback with warmup_top_weight
  INSERT INTO workout_exercise_feedback (workout_exercise_id, warmup_top_weight)
  VALUES (p_workout_exercise_id, v_target_weight)
  ON CONFLICT (workout_exercise_id) 
  DO UPDATE SET warmup_top_weight = COALESCE(workout_exercise_feedback.warmup_top_weight, v_target_weight);

  -- Generate initial warmup plan
  PERFORM recalc_warmup_from_last_set(p_workout_exercise_id);
END$$;

-- Enhanced warmup recalculation function with better fallbacks
CREATE OR REPLACE FUNCTION public.recalc_warmup_from_last_set(p_workout_exercise_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  wex RECORD;
  s RECORD;
  top_weight numeric;
  top_reps int;
  base jsonb;
  steps jsonb;
  adj_reps1 int := 12;
  adj_reps2 int := 10;
  adj_reps3 int := 8;
  v_user_id uuid;
  v_exercise_id uuid;
  v_estimate_weight numeric;
BEGIN
  SELECT * INTO wex FROM workout_exercises WHERE id = p_workout_exercise_id;
  IF NOT FOUND THEN RETURN; END IF;

  -- Get user and exercise info for fallbacks
  SELECT w.user_id INTO v_user_id
  FROM workouts w WHERE w.id = wex.workout_id;
  
  v_exercise_id := wex.exercise_id;

  -- Get last completed set
  SELECT weight, reps
  INTO s
  FROM workout_sets
  WHERE workout_exercise_id = p_workout_exercise_id
    AND is_completed = true
  ORDER BY COALESCE(weight,0) DESC, completed_at DESC
  LIMIT 1;

  IF FOUND AND s.weight IS NOT NULL THEN
    top_weight := s.weight;
    top_reps := s.reps;
  ELSE
    -- Fallback 1: target weight from workout_exercises
    top_weight := wex.target_weight;
    
    -- Fallback 2: warmup_top_weight from feedback table
    IF top_weight IS NULL THEN
      SELECT warmup_top_weight INTO top_weight
      FROM workout_exercise_feedback
      WHERE workout_exercise_id = p_workout_exercise_id;
    END IF;
    
    -- Fallback 3: user estimates
    IF top_weight IS NULL AND v_user_id IS NOT NULL AND v_exercise_id IS NOT NULL THEN
      SELECT estimated_weight INTO v_estimate_weight
      FROM user_exercise_estimates
      WHERE user_id = v_user_id 
        AND exercise_id = v_exercise_id 
        AND type = 'rm10'
      ORDER BY created_at DESC
      LIMIT 1;
      
      top_weight := v_estimate_weight;
    END IF;
    
    -- Final fallback: sensible default
    IF top_weight IS NULL THEN
      top_weight := 60; -- 60kg default
    END IF;
  END IF;

  -- Ensure we have a positive weight
  IF top_weight IS NULL OR top_weight <= 0 THEN
    top_weight := 60;
  END IF;

  -- Baseline warmup steps
  steps := jsonb_build_array(
    jsonb_build_object('label','W1','percent',0.40,'reps',adj_reps1,'rest_sec',45),
    jsonb_build_object('label','W2','percent',0.60,'reps',adj_reps2,'rest_sec',60),
    jsonb_build_object('label','W3','percent',0.80,'reps',adj_reps3,'rest_sec',60)
  );

  -- Adjust by feedback
  IF wex.warmup_feedback = 'too_little' THEN
    steps := jsonb_set(steps,'{0,reps}', to_jsonb(adj_reps1+3), false);
    steps := jsonb_set(steps,'{1,reps}', to_jsonb(adj_reps2+2), false);
    steps := jsonb_set(steps,'{2,reps}', to_jsonb(adj_reps3+1), false);
  ELSIF wex.warmup_feedback = 'too_much' THEN
    steps := jsonb_set(steps,'{0,reps}', to_jsonb(adj_reps1-2), false);
    steps := jsonb_set(steps,'{1,reps}', to_jsonb(adj_reps2-2), false);
  END IF;

  base := jsonb_build_object(
    'strategy','ramped',
    'top_weight', top_weight,
    'steps', steps,
    'last_recalc_at', to_jsonb(now()),
    'source','last_set'
  );

  UPDATE workout_exercises
  SET warmup_plan = base
  WHERE id = p_workout_exercise_id;

  -- Also update the feedback table with the computed top weight
  INSERT INTO workout_exercise_feedback (workout_exercise_id, warmup_top_weight)
  VALUES (p_workout_exercise_id, top_weight)
  ON CONFLICT (workout_exercise_id) 
  DO UPDATE SET warmup_top_weight = top_weight;
END$$;

-- Trigger to initialize warmup when workout exercises are created
CREATE OR REPLACE FUNCTION public.trg_initialize_warmup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Initialize warmup for new workout exercise
  PERFORM initialize_warmup_for_exercise(NEW.id);
  RETURN NEW;
END$$;

-- Create trigger for workout exercise initialization
DROP TRIGGER IF EXISTS trg_we_initialize_warmup ON workout_exercises;
CREATE TRIGGER trg_we_initialize_warmup
AFTER INSERT ON workout_exercises
FOR EACH ROW
EXECUTE FUNCTION trg_initialize_warmup();