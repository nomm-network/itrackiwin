-- Fix the workout set creation issue - don't create empty sets initially
-- Sets should only be created when they are actually completed

CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL::uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_workout_id uuid;
  v_we_id uuid;
  v_template_name text := 'Custom Workout';
  v_default_sets integer := 3;
  rec record;
BEGIN
  -- Get current user
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Get template name if template provided
  IF p_template_id IS NOT NULL THEN
    SELECT name INTO v_template_name 
    FROM public.workout_templates 
    WHERE id = p_template_id;
    
    IF v_template_name IS NULL THEN
      RAISE EXCEPTION 'Template not found';
    END IF;
  END IF;

  -- Create workout
  INSERT INTO public.workouts(user_id, title, started_at)
  VALUES (auth.uid(), v_template_name, now()) 
  RETURNING id INTO v_workout_id;

  -- Clone exercises from template if provided
  IF p_template_id IS NOT NULL THEN
    FOR rec IN
      SELECT te.exercise_id, te.order_index, te.default_sets
      FROM public.template_exercises te
      WHERE te.template_id = p_template_id
      ORDER BY te.order_index
    LOOP
      INSERT INTO public.workout_exercises(workout_id, exercise_id, order_index)
      VALUES (v_workout_id, rec.exercise_id, rec.order_index)
      RETURNING id INTO v_we_id;

      -- DON'T create empty sets - they will be created dynamically when completed
      -- This fixes the set_index issue where empty sets were taking up indexes 1,2,3
    END LOOP;
  END IF;

  RETURN v_workout_id;
END;
$function$;