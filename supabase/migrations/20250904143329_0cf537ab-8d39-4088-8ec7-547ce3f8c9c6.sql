-- Fix the trigger to get attribute_values_json from exercises table
DROP TRIGGER IF EXISTS trg_init_warmup ON public.workout_exercises;
DROP FUNCTION IF EXISTS public.trg_init_warmup();

-- Recreate the trigger function to properly reference exercises.attribute_values_json
CREATE OR REPLACE FUNCTION public.trg_init_warmup()
RETURNS TRIGGER AS $$
DECLARE
  exercise_attrs jsonb;
BEGIN
  -- Get attribute_values_json from the exercises table
  SELECT e.attribute_values_json INTO exercise_attrs
  FROM public.exercises e
  WHERE e.id = NEW.exercise_id;

  -- Initialize warmup_plan if it's null and exercise has attributes
  IF NEW.warmup_plan IS NULL AND exercise_attrs IS NOT NULL THEN
    NEW.warmup_plan := jsonb_build_object(
      'auto_generate', true,
      'steps', '[]'::jsonb
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;