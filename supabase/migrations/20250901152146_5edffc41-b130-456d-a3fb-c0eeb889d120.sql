-- Fix the start_workout function to handle missing target_weight column and program integration
CREATE OR REPLACE FUNCTION start_workout(p_template_id uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workout_id uuid;
  v_user_id uuid;
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

  -- Create new workout
  INSERT INTO workouts (user_id, template_id, started_at)
  VALUES (v_user_id, p_template_id, now())
  RETURNING id INTO v_workout_id;

  -- If template provided, copy exercises from template
  IF p_template_id IS NOT NULL THEN
    FOR rec IN 
      SELECT 
        te.exercise_id,
        te.order_index,
        te.target_sets,
        te.target_reps,
        te.target_weight,
        te.weight_unit,
        te.notes,
        te.rest_seconds
      FROM template_exercises te
      WHERE te.template_id = p_template_id
      ORDER BY te.order_index
    LOOP
      -- Insert workout exercise with proper column names
      INSERT INTO workout_exercises (
        workout_id,
        exercise_id,
        order_index,
        target_sets,
        notes,
        target_weight_kg  -- Use correct column name
      ) VALUES (
        v_workout_id,
        rec.exercise_id,
        rec.order_index,
        COALESCE(rec.target_sets, 3),
        rec.notes,
        CASE 
          WHEN rec.weight_unit = 'lb' THEN rec.target_weight * 0.453592
          ELSE rec.target_weight
        END
      );
    END LOOP;
  END IF;

  RETURN v_workout_id;
END;
$$;