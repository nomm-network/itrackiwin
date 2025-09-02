-- Add template_id column to workouts table
ALTER TABLE public.workouts
ADD COLUMN IF NOT EXISTS template_id uuid;

-- Add foreign key constraint (nullable for quick workouts)
ALTER TABLE public.workouts
  ADD CONSTRAINT workouts_template_id_fkey
  FOREIGN KEY (template_id)
  REFERENCES public.workout_templates(id)
  ON DELETE SET NULL;

-- Add helpful index
CREATE INDEX IF NOT EXISTS idx_workouts_template_id
  ON public.workouts(template_id);

-- Update start_workout to properly set template_id and copy normalized columns
CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_workout_id uuid;
  rec RECORD;
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Create the workout record with template_id
  INSERT INTO workouts (user_id, template_id, started_at)
  VALUES (v_user_id, p_template_id, now())
  RETURNING id INTO v_workout_id;

  -- If template provided, copy exercises from template
  IF p_template_id IS NOT NULL THEN
    -- Verify template exists and user has access
    IF NOT EXISTS (
      SELECT 1 FROM workout_templates t
      WHERE t.id = p_template_id AND t.user_id = v_user_id
    ) THEN
      RAISE EXCEPTION 'Template not found or access denied';
    END IF;

    -- Copy exercises from template with normalized columns
    FOR rec IN
      SELECT 
        te.exercise_id,
        te.order_index,
        te.default_sets,
        te.target_reps,
        te.target_weight_kg,
        te.weight_unit,
        te.rest_seconds,
        te.notes
      FROM template_exercises te
      WHERE te.template_id = p_template_id
      ORDER BY te.order_index
    LOOP
      INSERT INTO workout_exercises (
        workout_id,
        exercise_id,
        order_index,
        target_sets,
        target_reps,
        target_weight_kg,
        weight_unit,
        rest_seconds,
        notes
      ) VALUES (
        v_workout_id,
        rec.exercise_id,
        rec.order_index,
        rec.default_sets,
        rec.target_reps,
        rec.target_weight_kg,
        rec.weight_unit,
        rec.rest_seconds,
        rec.notes
      );
    END LOOP;
  END IF;

  -- Pre-seed targets for immediate availability
  PERFORM public.apply_initial_targets(v_workout_id);

  RETURN v_workout_id;
END
$$;