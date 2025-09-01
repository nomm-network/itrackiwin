-- 1) Make sure workout_exercises has all the columns the function will write
ALTER TABLE public.workout_exercises
  ADD COLUMN IF NOT EXISTS order_index       integer,
  ADD COLUMN IF NOT EXISTS target_sets       integer,
  ADD COLUMN IF NOT EXISTS target_reps       integer,   -- <-- missing one
  ADD COLUMN IF NOT EXISTS target_weight_kg  numeric,
  ADD COLUMN IF NOT EXISTS weight_unit       text,
  ADD COLUMN IF NOT EXISTS rest_seconds      integer,
  ADD COLUMN IF NOT EXISTS notes             text;

-- (Optional but useful) sane defaults
ALTER TABLE public.workout_exercises
  ALTER COLUMN weight_unit SET DEFAULT 'kg';

-- 2) Replace the start function with a resilient version
CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

  -- Create workout
  INSERT INTO public.workouts (user_id, started_at)
  VALUES (v_user_id, now())
  RETURNING id INTO v_workout_id;

  -- If cloning from a template, copy rows safely
  IF p_template_id IS NOT NULL THEN
    -- Verify access
    IF NOT EXISTS (
      SELECT 1
      FROM public.workout_templates t
      WHERE t.id = p_template_id
        AND (t.user_id = v_user_id OR t.is_public = true)
    ) THEN
      RAISE EXCEPTION 'Template not found or access denied';
    END IF;

    -- Copy exercises
    INSERT INTO public.workout_exercises (
      workout_id,
      exercise_id,
      order_index,
      target_sets,
      target_reps,
      target_weight_kg,
      weight_unit,
      rest_seconds,
      notes
    )
    SELECT
      v_workout_id,
      te.exercise_id,
      te.order_index,
      te.default_sets,
      te.target_reps,
      COALESCE(te.target_weight_kg, te.target_weight),   -- tolerant to old data
      COALESCE(NULLIF(te.weight_unit, ''), 'kg'),        -- default 'kg'
      te.rest_seconds,
      te.notes
    FROM public.template_exercises te
    WHERE te.template_id = p_template_id
    ORDER BY te.order_index NULLS LAST;
  END IF;

  RETURN v_workout_id;
END;
$$;