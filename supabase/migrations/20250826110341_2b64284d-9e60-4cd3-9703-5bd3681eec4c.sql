-- Fix the set creation to avoid creating too many placeholder sets
-- and improve the useLastSet logic to better handle set indexing

-- First, let's clean up incomplete sets that have no data
DELETE FROM workout_sets 
WHERE is_completed = false 
  AND weight IS NULL 
  AND reps IS NULL 
  AND created_at > now() - interval '1 day';

-- Create a more intelligent function to get the next set index dynamically
CREATE OR REPLACE FUNCTION get_next_set_index(p_workout_exercise_id uuid)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_max_index integer;
BEGIN
  SELECT COALESCE(MAX(set_index), 0) INTO v_max_index
  FROM workout_sets
  WHERE workout_exercise_id = p_workout_exercise_id;
  
  RETURN v_max_index + 1;
END;
$$;

-- Modify the start workout function to create only 3 default sets initially
CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL::uuid)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_workout_id uuid;
  rec RECORD;
  v_we_id uuid;
  v_template_name text;
  v_default_sets integer := 3; -- Default to 3 sets
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get template name if template_id is provided
  IF p_template_id IS NOT NULL THEN
    SELECT name INTO v_template_name 
    FROM public.workout_templates 
    WHERE id = p_template_id AND user_id = auth.uid();
    
    IF v_template_name IS NULL THEN
      RAISE EXCEPTION 'Template not found or not owned by user';
    END IF;
  END IF;

  -- Create workout with template name as title
  INSERT INTO public.workouts(user_id, title) 
  VALUES (auth.uid(), v_template_name) 
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

      -- Use template default_sets but cap at 3 for initial creation
      v_default_sets := LEAST(COALESCE(rec.default_sets, 3), 3);
      
      IF v_default_sets > 0 THEN
        INSERT INTO public.workout_sets(workout_exercise_id, set_index, set_kind, is_completed)
        SELECT v_we_id, s, 'normal'::public.set_type, false
        FROM generate_series(1, v_default_sets) s;
      END IF;
    END LOOP;
  END IF;

  RETURN v_workout_id;
END;
$function$;