-- Fix security issues: add search_path to new function
CREATE OR REPLACE FUNCTION get_next_set_index(p_workout_exercise_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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