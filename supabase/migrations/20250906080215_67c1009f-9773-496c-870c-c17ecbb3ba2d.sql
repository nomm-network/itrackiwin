-- Fix warmup trigger - create proper trigger function and reconnect

-- Drop any old triggers
DROP TRIGGER IF EXISTS trg_init_warmup ON public.workout_exercises;
DROP TRIGGER IF EXISTS trg_initialize_warmup ON public.workout_exercises;

-- Create trigger function that calls the existing parameterized function
CREATE OR REPLACE FUNCTION public.trigger_initialize_warmup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Call the existing function with the NEW row's ID
  PERFORM public.initialize_warmup_for_exercise(NEW.id);
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER trg_init_warmup
AFTER INSERT ON public.workout_exercises
FOR EACH ROW
EXECUTE FUNCTION public.trigger_initialize_warmup();