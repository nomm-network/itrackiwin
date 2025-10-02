-- Fix security warning: drop trigger, then function, then recreate with search_path
DROP TRIGGER IF EXISTS set_program_rep_defaults_trigger ON public.training_programs;
DROP FUNCTION IF EXISTS set_program_rep_defaults();

CREATE OR REPLACE FUNCTION set_program_rep_defaults()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- If rep ranges not explicitly set, use goal-based defaults
  IF NEW.default_rep_min IS NULL OR NEW.default_rep_max IS NULL THEN
    CASE NEW.goal
      WHEN 'strength' THEN
        NEW.default_rep_min := 3;
        NEW.default_rep_max := 6;
      WHEN 'hypertrophy' THEN
        NEW.default_rep_min := 8;
        NEW.default_rep_max := 12;
      WHEN 'endurance' THEN
        NEW.default_rep_min := 15;
        NEW.default_rep_max := 20;
      WHEN 'power' THEN
        NEW.default_rep_min := 1;
        NEW.default_rep_max := 5;
      ELSE
        -- Default to hypertrophy range if goal not set
        NEW.default_rep_min := 8;
        NEW.default_rep_max := 12;
    END CASE;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER set_program_rep_defaults_trigger
  BEFORE INSERT OR UPDATE ON public.training_programs
  FOR EACH ROW
  EXECUTE FUNCTION set_program_rep_defaults();