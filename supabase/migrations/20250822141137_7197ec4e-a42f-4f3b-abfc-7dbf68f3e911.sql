-- Fix function permissions and recreate trigger
GRANT EXECUTE ON FUNCTION public.can_mutate_workout_set(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.can_mutate_workout_set(uuid) TO authenticated;

-- Recreate the trigger function with proper permissions
CREATE OR REPLACE FUNCTION public.assign_next_set_index()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  max_idx int;
BEGIN
  IF NEW.set_index IS NOT NULL THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(MAX(set_index), 0) INTO max_idx
  FROM public.workout_sets
  WHERE workout_exercise_id = NEW.workout_exercise_id;

  NEW.set_index := max_idx + 1;
  RETURN NEW;
END
$$;

-- Grant permissions on the trigger function
GRANT EXECUTE ON FUNCTION public.assign_next_set_index() TO anon;
GRANT EXECUTE ON FUNCTION public.assign_next_set_index() TO authenticated;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS trg_assign_next_set_index ON public.workout_sets;
CREATE TRIGGER trg_assign_next_set_index
BEFORE INSERT ON public.workout_sets
FOR EACH ROW EXECUTE FUNCTION public.assign_next_set_index();

-- Test a simple insert to see if RLS is working
-- First, let's check if we have a test user and workout setup