-- Fix the start_workout function to work with actual table schema
CREATE OR REPLACE FUNCTION start_workout(p_template_id uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workout_id uuid;
  v_user_id uuid;
  v_template_name text := 'Custom Workout';
  rec record;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if user already has an active workout
  IF EXISTS (
    SELECT 1 FROM workouts 
    WHERE user_id = v_user_id 
    AND ended_at IS NULL
  ) THEN
    RAISE EXCEPTION 'You already have an active workout. Please end it first.';
  END IF;

  -- Get template name if template provided
  IF p_template_id IS NOT NULL THEN
    SELECT name INTO v_template_name 
    FROM workout_templates 
    WHERE id = p_template_id AND user_id = v_user_id;
    
    IF v_template_name IS NULL THEN
      RAISE EXCEPTION 'Template not found or not accessible';
    END IF;
  END IF;

  -- Create new workout with correct columns
  INSERT INTO workouts (user_id, title, started_at)
  VALUES (v_user_id, v_template_name, now())
  RETURNING id INTO v_workout_id;

  -- If template provided, copy exercises from template
  IF p_template_id IS NOT NULL THEN
    FOR rec IN 
      SELECT 
        te.exercise_id,
        te.order_index,
        te.default_sets,
        te.target_reps,
        te.target_weight,
        te.weight_unit,
        te.notes
      FROM template_exercises te
      WHERE te.template_id = p_template_id
      ORDER BY te.order_index
    LOOP
      -- Insert workout exercise with correct column names
      INSERT INTO workout_exercises (
        workout_id,
        exercise_id,
        order_index,
        target_sets,
        notes,
        target_weight_kg
      ) VALUES (
        v_workout_id,
        rec.exercise_id,
        rec.order_index,
        COALESCE(rec.default_sets, 3),
        rec.notes,
        CASE 
          WHEN rec.weight_unit = 'lb' AND rec.target_weight IS NOT NULL 
          THEN rec.target_weight * 0.453592
          ELSE rec.target_weight
        END
      );
    END LOOP;
  END IF;

  RETURN v_workout_id;
END;
$$;