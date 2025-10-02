-- Add rep range defaults to training programs based on goal
ALTER TABLE public.training_programs
ADD COLUMN default_rep_min INTEGER NULL DEFAULT 6,
ADD COLUMN default_rep_max INTEGER NULL DEFAULT 10;

COMMENT ON COLUMN public.training_programs.default_rep_min IS 'Default minimum reps for exercises in this program';
COMMENT ON COLUMN public.training_programs.default_rep_max IS 'Default maximum reps for exercises in this program';

-- Create a function to set smart defaults based on goal
CREATE OR REPLACE FUNCTION set_program_rep_defaults()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger to auto-set rep ranges on insert/update
CREATE TRIGGER set_program_rep_defaults_trigger
  BEFORE INSERT OR UPDATE ON public.training_programs
  FOR EACH ROW
  EXECUTE FUNCTION set_program_rep_defaults();

-- Update existing programs with goal-based defaults
UPDATE public.training_programs
SET 
  default_rep_min = CASE goal
    WHEN 'strength' THEN 3
    WHEN 'hypertrophy' THEN 8
    WHEN 'endurance' THEN 15
    WHEN 'power' THEN 1
    ELSE 8
  END,
  default_rep_max = CASE goal
    WHEN 'strength' THEN 6
    WHEN 'hypertrophy' THEN 12
    WHEN 'endurance' THEN 20
    WHEN 'power' THEN 5
    ELSE 12
  END
WHERE default_rep_min IS NULL OR default_rep_max IS NULL;