-- Fix the start_workout function - remove unused variable and ensure it works correctly
CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_workout_id uuid;
  template_exercise record;
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