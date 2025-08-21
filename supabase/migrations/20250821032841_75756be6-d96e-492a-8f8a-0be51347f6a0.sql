-- Add unique constraint to prevent duplicate metric definitions
ALTER TABLE public.exercise_metric_defs
ADD CONSTRAINT uq_exercise_metric_defs_ex_eq_metric
UNIQUE (exercise_id, equipment_id, metric_def_id);

-- Add index for form building (exercise + equipment lookups)
CREATE INDEX IF NOT EXISTS idx_exercise_metric_defs_ex_eq
ON public.exercise_metric_defs (exercise_id, equipment_id);

-- Add index for equipment-only lookups
CREATE INDEX IF NOT EXISTS idx_exercise_metric_defs_equipment
ON public.exercise_metric_defs (equipment_id) 
WHERE exercise_id IS NULL;

-- Ensure workout_set_grips has proper indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_workout_set_grips_set_grip
ON public.workout_set_grips (workout_set_id, grip_id);

-- Add validation trigger for metric value types
CREATE OR REPLACE FUNCTION validate_metric_value_type()
RETURNS TRIGGER AS $$
DECLARE
  expected_type public.metric_value_type;
BEGIN
  -- Get the expected value type for this metric
  SELECT md.value_type INTO expected_type
  FROM public.metric_defs md
  WHERE md.id = NEW.metric_def_id;
  
  -- Validate value matches expected type
  CASE expected_type
    WHEN 'number' THEN
      IF NOT (NEW.value ? 'number' AND jsonb_typeof(NEW.value->'number') = 'number') THEN
        RAISE EXCEPTION 'Expected number value for metric %', NEW.metric_def_id;
      END IF;
    WHEN 'text' THEN
      IF NOT (NEW.value ? 'text' AND jsonb_typeof(NEW.value->'text') = 'string') THEN
        RAISE EXCEPTION 'Expected text value for metric %', NEW.metric_def_id;
      END IF;
    WHEN 'boolean' THEN
      IF NOT (NEW.value ? 'boolean' AND jsonb_typeof(NEW.value->'boolean') = 'boolean') THEN
        RAISE EXCEPTION 'Expected boolean value for metric %', NEW.metric_def_id;
      END IF;
    WHEN 'enum' THEN
      DECLARE
        valid_options text[];
        provided_value text;
      BEGIN
        -- Get valid enum options
        SELECT md.enum_options INTO valid_options
        FROM public.metric_defs md
        WHERE md.id = NEW.metric_def_id;
        
        -- Extract provided enum value
        IF NEW.value ? 'enum' AND jsonb_typeof(NEW.value->'enum') = 'string' THEN
          provided_value := NEW.value->>'enum';
          
          -- Check if value is in valid options
          IF NOT (provided_value = ANY(valid_options)) THEN
            RAISE EXCEPTION 'Invalid enum value "%" for metric %. Valid options: %', 
              provided_value, NEW.metric_def_id, array_to_string(valid_options, ', ');
          END IF;
        ELSE
          RAISE EXCEPTION 'Expected enum value for metric %', NEW.metric_def_id;
        END IF;
      END;
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply validation trigger to workout set metric values
CREATE TRIGGER tr_validate_workout_set_metric_values
  BEFORE INSERT OR UPDATE ON public.workout_set_metric_values
  FOR EACH ROW EXECUTE FUNCTION validate_metric_value_type();