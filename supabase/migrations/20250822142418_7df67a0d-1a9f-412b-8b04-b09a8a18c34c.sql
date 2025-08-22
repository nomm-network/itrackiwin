-- Recreate the trigger properly
DROP TRIGGER IF EXISTS trg_assign_next_set_index ON public.workout_sets;

CREATE OR REPLACE FUNCTION public.assign_next_set_index()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  max_idx int;
BEGIN
  -- Only auto-assign if set_index is null or 0
  IF NEW.set_index IS NOT NULL AND NEW.set_index > 0 THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(MAX(set_index), 0) INTO max_idx
  FROM public.workout_sets
  WHERE workout_exercise_id = NEW.workout_exercise_id;

  NEW.set_index := max_idx + 1;
  RETURN NEW;
END
$$;

-- Create the trigger
CREATE TRIGGER trg_assign_next_set_index
BEFORE INSERT ON public.workout_sets
FOR EACH ROW EXECUTE FUNCTION public.assign_next_set_index();