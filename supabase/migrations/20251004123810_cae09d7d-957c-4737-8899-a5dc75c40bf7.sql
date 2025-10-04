-- Add superset columns to workout_exercises table
ALTER TABLE public.workout_exercises 
  ADD COLUMN IF NOT EXISTS superset_group_id uuid,
  ADD COLUMN IF NOT EXISTS superset_order integer,
  ADD COLUMN IF NOT EXISTS superset_rounds_target integer DEFAULT 3;

-- Add index for superset grouping queries
CREATE INDEX IF NOT EXISTS idx_workout_exercises_superset_group 
  ON public.workout_exercises(workout_id, superset_group_id) 
  WHERE superset_group_id IS NOT NULL;

-- Update the start_workout RPC function to copy superset data from template
CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_workout_id uuid;
  template_exercise record;
  new_exercise_id uuid;
BEGIN
  -- Create new workout
  INSERT INTO public.workouts (user_id, started_at, title)
  VALUES (
    auth.uid(),
    now(),
    CASE 
      WHEN p_template_id IS NOT NULL THEN (SELECT title FROM public.workout_templates WHERE id = p_template_id)
      ELSE 'Quick Workout'
    END
  )
  RETURNING id INTO new_workout_id;
  
  -- If template provided, copy exercises with superset data
  IF p_template_id IS NOT NULL THEN
    FOR template_exercise IN 
      SELECT * FROM public.workout_template_exercises 
      WHERE template_id = p_template_id 
      ORDER BY order_index
    LOOP
      INSERT INTO public.workout_exercises (
        workout_id,
        exercise_id,
        order_index,
        target_sets,
        target_reps_min,
        target_reps_max,
        target_weight_kg,
        notes,
        superset_group_id,
        superset_order,
        superset_rounds_target
      ) VALUES (
        new_workout_id,
        template_exercise.exercise_id,
        template_exercise.order_index,
        template_exercise.target_sets,
        template_exercise.target_reps_min,
        template_exercise.target_reps_max,
        template_exercise.target_weight_kg,
        template_exercise.notes,
        template_exercise.superset_group_id,
        template_exercise.superset_order,
        template_exercise.superset_rounds_target
      );
    END LOOP;
  END IF;
  
  RETURN new_workout_id;
END;
$function$;