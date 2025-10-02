-- Update start_workout function to copy rep range fields from templates
CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_workout_id uuid;
  v_user_id    uuid;
BEGIN
  -- Auth
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Create workout shell
  INSERT INTO public.workouts (user_id, started_at)
  VALUES (v_user_id, now())
  RETURNING id INTO v_workout_id;

  -- If a template is provided, copy exercise data including rep ranges
  IF p_template_id IS NOT NULL THEN
    INSERT INTO public.workout_exercises (
      workout_id,
      exercise_id,
      order_index,
      notes,
      target_sets,
      target_reps,
      target_reps_min,
      target_reps_max,
      target_weight_kg,
      weight_unit
    )
    SELECT
      v_workout_id,
      te.exercise_id,
      te.order_index,
      te.notes,
      COALESCE(te.default_sets, 3) as target_sets,
      te.target_reps,
      te.rep_range_min as target_reps_min,
      te.rep_range_max as target_reps_max,
      te.target_weight_kg,
      COALESCE(te.weight_unit, 'kg') as weight_unit
    FROM public.template_exercises te
    WHERE te.template_id = p_template_id
    ORDER BY te.order_index NULLS LAST, te.created_at;
  END IF;

  RETURN v_workout_id;
END;
$$;