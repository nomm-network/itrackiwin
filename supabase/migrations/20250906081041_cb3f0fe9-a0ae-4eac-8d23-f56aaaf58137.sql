-- Fix trigger to run BEFORE insert and set warmup data correctly
DROP TRIGGER IF EXISTS trg_init_warmup ON public.workout_exercises;

-- Create proper BEFORE INSERT trigger function
CREATE OR REPLACE FUNCTION public.trigger_initialize_warmup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Set warmup in attribute_values_json if target_weight_kg exists
  IF NEW.target_weight_kg IS NOT NULL THEN
    NEW.attribute_values_json = jsonb_set(
      COALESCE(NEW.attribute_values_json, '{}'::jsonb),
      '{warmup}',
      public.generate_warmup_steps(NEW.target_weight_kg)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create BEFORE INSERT trigger
CREATE TRIGGER trg_init_warmup
BEFORE INSERT ON public.workout_exercises
FOR EACH ROW
EXECUTE FUNCTION public.trigger_initialize_warmup();