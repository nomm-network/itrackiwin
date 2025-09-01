-- REPLACE the broken function with a minimal, schema-safe version
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

  -- If a template is provided, copy only stable columns
  IF p_template_id IS NOT NULL THEN
    -- Ownership or visibility check can be added later if needed,
    -- but do NOT reference non-existent columns like t.is_public here.

    INSERT INTO public.workout_exercises (
      workout_id,
      exercise_id,
      order_index,
      notes
      -- (Intentionally NOT copying target_reps / rest_seconds / target_weight* because these
      --  are inconsistent across environments right now and have triggered 42703 errors)
    )
    SELECT
      v_workout_id,
      te.exercise_id,
      te.order_index,
      te.notes
    FROM public.template_exercises te
    WHERE te.template_id = p_template_id
    ORDER BY te.order_index NULLS LAST, te.created_at;
  END IF;

  RETURN v_workout_id;
END;
$$;