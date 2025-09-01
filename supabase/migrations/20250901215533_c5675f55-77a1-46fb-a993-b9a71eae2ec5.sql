-- Step 1: Create ONE clean, bulletproof start_workout function
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
  -- 0) Auth
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1) Create workout session
  INSERT INTO public.workouts (user_id, started_at)
  VALUES (v_user_id, now())
  RETURNING id INTO v_workout_id;

  -- 2) If no template, we're done
  IF p_template_id IS NULL THEN
    RETURN v_workout_id;
  END IF;

  -- 3) Basic ownership/visibility guard
  PERFORM 1
  FROM public.workout_templates t
  WHERE t.id = p_template_id
    AND (t.user_id = v_user_id OR t.user_id IS NULL);
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found or access denied';
  END IF;

  /*
    4) Copy template_exercises -> workout_exercises
    Try NEW schema (target_weight_kg) first, fallback to OLD (target_weight)
  */
  BEGIN
    INSERT INTO public.workout_exercises (
      workout_id,
      exercise_id,
      order_index,
      target_sets,
      target_reps,
      target_weight_kg,
      weight_unit,
      notes
    )
    SELECT
      v_workout_id,
      te.exercise_id,
      te.order_index,
      te.default_sets,
      te.target_reps,
      te.target_weight_kg,                -- <- NEW schema
      COALESCE(te.weight_unit, 'kg')::text,
      te.notes
    FROM public.template_exercises te
    WHERE te.template_id = p_template_id
    ORDER BY te.order_index;

  EXCEPTION WHEN undefined_column THEN
    -- Fallback for OLD schema (no target_weight_kg; uses target_weight)
    INSERT INTO public.workout_exercises (
      workout_id,
      exercise_id,
      order_index,
      target_sets,
      target_reps,
      target_weight_kg,
      weight_unit,
      notes
    )
    SELECT
      v_workout_id,
      te.exercise_id,
      te.order_index,
      te.default_sets,
      te.target_reps,
      CASE
        WHEN COALESCE(te.weight_unit, 'kg') = 'lb'
          THEN ROUND((te.target_weight::numeric) * 0.453592, 2)
        ELSE te.target_weight::numeric
      END,
      COALESCE(te.weight_unit, 'kg')::text,
      te.notes
    FROM public.template_exercises te
    WHERE te.template_id = p_template_id
    ORDER BY te.order_index;
  END;

  RETURN v_workout_id;
END;
$$;

-- Step 2: Drop any conflicting/legacy starter functions
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'fn_start_workout_advanced') THEN
    DROP FUNCTION public.fn_start_workout_advanced(uuid, jsonb);
  END IF;
EXCEPTION WHEN undefined_function THEN NULL; END$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'clone_template_to_workout') THEN
    DROP FUNCTION public.clone_template_to_workout(uuid);
  END IF;
EXCEPTION WHEN undefined_function THEN NULL; END$$;