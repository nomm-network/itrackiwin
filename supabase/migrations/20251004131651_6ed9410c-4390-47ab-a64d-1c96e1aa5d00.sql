-- Fix start_workout function - resolve title column ambiguity
DROP FUNCTION IF EXISTS public.start_workout(uuid, uuid);

CREATE OR REPLACE FUNCTION public.start_workout(
  p_template_id uuid DEFAULT NULL,
  p_program_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_workout_id uuid;
  template_exercise record;
  workout_title text;
BEGIN
  -- Get title from template if provided
  IF p_template_id IS NOT NULL THEN
    SELECT wt.title INTO workout_title 
    FROM public.workout_templates wt 
    WHERE wt.id = p_template_id;
  ELSE
    workout_title := 'Quick Workout';
  END IF;
  
  -- Create new workout
  INSERT INTO public.workouts (user_id, started_at, title)
  VALUES (auth.uid(), now(), workout_title)
  RETURNING id INTO new_workout_id;
  
  -- If template provided, copy exercises with superset data
  IF p_template_id IS NOT NULL THEN
    FOR template_exercise IN 
      SELECT 
        id,
        exercise_id,
        order_index,
        default_sets as target_sets,
        target_rep_min as target_reps_min,
        target_rep_max as target_reps_max,
        target_weight_kg,
        notes,
        superset_group_id,
        superset_order,
        superset_rounds_target
      FROM public.template_exercises 
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