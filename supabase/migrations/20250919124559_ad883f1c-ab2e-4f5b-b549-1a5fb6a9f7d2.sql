-- Step 1: Add bodyweight involvement percentages to specific exercises
UPDATE exercises 
SET attribute_values_json = COALESCE(attribute_values_json, '{}'::jsonb) || '{"bodyweight_involvement_pct": 1.00}'::jsonb
WHERE slug IN ('pull-up', 'chin-up', 'dip', 'dips');

UPDATE exercises 
SET attribute_values_json = COALESCE(attribute_values_json, '{}'::jsonb) || '{"bodyweight_involvement_pct": 0.65}'::jsonb
WHERE slug IN ('push-up', 'pushup');

UPDATE exercises 
SET attribute_values_json = COALESCE(attribute_values_json, '{}'::jsonb) || '{"bodyweight_involvement_pct": 0.60}'::jsonb
WHERE slug IN ('inverted-row', 'bodyweight-row');

-- Step 2: Create trigger function to automatically calculate total_weight_kg
CREATE OR REPLACE FUNCTION calculate_total_weight_kg()
RETURNS TRIGGER AS $$
DECLARE
  exercise_rec RECORD;
  bodyweight_pct NUMERIC;
  logged_bodyweight NUMERIC;
  base_weight NUMERIC;
  external_weight NUMERIC;
BEGIN
  -- Get exercise details
  SELECT e.load_mode, e.attribute_values_json
  INTO exercise_rec
  FROM exercises e
  JOIN workout_exercises we ON we.exercise_id = e.id
  WHERE we.id = NEW.workout_exercise_id;

  -- Only calculate for bodyweight_plus_optional exercises with involvement percentage
  IF exercise_rec.load_mode = 'bodyweight_plus_optional' THEN
    -- Extract bodyweight involvement percentage
    bodyweight_pct := (exercise_rec.attribute_values_json->>'bodyweight_involvement_pct')::NUMERIC;
    
    -- Extract logged bodyweight from load_meta
    logged_bodyweight := (NEW.load_meta->>'logged_bodyweight_kg')::NUMERIC;
    
    IF bodyweight_pct IS NOT NULL AND logged_bodyweight IS NOT NULL THEN
      -- Calculate base bodyweight contribution
      base_weight := logged_bodyweight * bodyweight_pct;
      
      -- Add external weight (positive for added weight, negative for assistance)
      external_weight := COALESCE(NEW.weight_kg, 0);
      
      NEW.total_weight_kg := base_weight + external_weight;
    END IF;
  ELSIF exercise_rec.load_mode = 'external_added' THEN
    -- For traditional weighted exercises, total weight = logged weight
    NEW.total_weight_kg := NEW.weight_kg;
  ELSE
    -- For cardio/time/distance exercises, no total weight calculation
    NEW.total_weight_kg := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create the trigger
DROP TRIGGER IF EXISTS trigger_calculate_total_weight ON workout_sets;
CREATE TRIGGER trigger_calculate_total_weight
  BEFORE INSERT OR UPDATE ON workout_sets
  FOR EACH ROW
  EXECUTE FUNCTION calculate_total_weight_kg();