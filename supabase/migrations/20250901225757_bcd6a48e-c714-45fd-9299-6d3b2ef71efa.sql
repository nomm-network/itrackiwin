-- 🔥 FINAL CLEANUP: Remove all broken workout start functions and create ONE clean function

-- Step 1: Drop all old/broken functions
DROP FUNCTION IF EXISTS public.start_workout(uuid);
DROP FUNCTION IF EXISTS public.fn_start_workout_advanced(uuid, jsonb);
DROP FUNCTION IF EXISTS public.clone_template_to_workout(uuid);

-- Step 2: Drop any related triggers (if they exist)
DROP TRIGGER IF EXISTS trg_clone_template_to_workout ON workout_templates;

-- Step 3: Create ONE clean start_workout function that only uses normalized columns
CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_workout_id uuid;
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Create new workout
  INSERT INTO public.workouts (user_id, started_at)
  VALUES (v_user_id, now())
  RETURNING id INTO v_workout_id;

  -- If template provided, clone its exercises
  IF p_template_id IS NOT NULL THEN
    INSERT INTO public.workout_exercises (
      workout_id, exercise_id, order_index, target_sets,
      target_reps, target_weight_kg, weight_unit, notes
    )
    SELECT 
      v_workout_id, 
      te.exercise_id, 
      te.order_index, 
      te.default_sets,
      te.target_reps, 
      te.target_weight_kg,  -- ✅ Only normalized column
      COALESCE(te.weight_unit, 'kg'), 
      te.notes
    FROM public.template_exercises te
    WHERE te.template_id = p_template_id
      AND EXISTS (
        SELECT 1 FROM public.workout_templates wt 
        WHERE wt.id = p_template_id 
        AND wt.user_id = v_user_id
      )
    ORDER BY te.order_index;
  END IF;

  RETURN v_workout_id;
END;
$$;