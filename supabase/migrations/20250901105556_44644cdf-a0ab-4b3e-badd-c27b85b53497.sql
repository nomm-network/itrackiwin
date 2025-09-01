-- Add workout_exercises.grip_id if not exists and ensure workout_sets.grip_key exists
-- These fields are needed for proper grip flow and PR tracking

-- Check if grip_id exists in workout_exercises and add if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workout_exercises' AND column_name = 'grip_id'
  ) THEN
    ALTER TABLE workout_exercises ADD COLUMN grip_id UUID REFERENCES grips(id);
  END IF;
END $$;

-- Check if grip_key exists in workout_sets and add if missing  
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workout_sets' AND column_name = 'grip_key'
  ) THEN
    ALTER TABLE workout_sets ADD COLUMN grip_key TEXT;
  END IF;
END $$;

-- Ensure personal_records has the grip-aware unique constraint
ALTER TABLE personal_records DROP CONSTRAINT IF EXISTS personal_records_user_exercise_kind_grip_unique;
ALTER TABLE personal_records ADD CONSTRAINT personal_records_user_exercise_kind_grip_unique 
  UNIQUE (user_id, exercise_id, kind, grip_key);

-- Create function to populate grip_key from workout_exercises grip_id when sets are inserted
CREATE OR REPLACE FUNCTION populate_grip_key_from_workout_exercise()
RETURNS TRIGGER AS $$
DECLARE
  grip_slug TEXT;
BEGIN
  -- Get grip slug from workout_exercises.grip_id
  IF NEW.grip_key IS NULL THEN
    SELECT g.slug INTO grip_slug
    FROM workout_exercises we
    JOIN grips g ON g.id = we.grip_id
    WHERE we.id = NEW.workout_exercise_id;
    
    NEW.grip_key := grip_slug;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to populate grip_key automatically
DROP TRIGGER IF EXISTS trigger_populate_grip_key ON workout_sets;
CREATE TRIGGER trigger_populate_grip_key
  BEFORE INSERT ON workout_sets
  FOR EACH ROW
  EXECUTE FUNCTION populate_grip_key_from_workout_exercise();