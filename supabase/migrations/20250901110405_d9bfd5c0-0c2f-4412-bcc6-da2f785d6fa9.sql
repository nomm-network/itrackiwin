-- Fix duplicate constraints on personal_records and ensure proper grip flow

-- 1. Drop duplicate constraints, keep only one grip-aware constraint
ALTER TABLE personal_records DROP CONSTRAINT IF EXISTS personal_records_user_ex_kind_grip_unique;
ALTER TABLE personal_records DROP CONSTRAINT IF EXISTS personal_records_user_exercise_kind_grip_unique;
-- Keep the pr_user_ex_kind_grip_uniq constraint

-- 2. Ensure workout_exercises has grip_id column (should already exist from previous migration)
ALTER TABLE workout_exercises ADD COLUMN IF NOT EXISTS grip_id UUID REFERENCES grips(id);

-- 3. Update the populate_grip_key function to handle the new structure
CREATE OR REPLACE FUNCTION populate_grip_key_from_workout_exercise()
RETURNS TRIGGER AS $$
DECLARE
  grip_slug TEXT;
BEGIN
  -- Get grip slug from workout_exercises.grip_id
  IF NEW.grip_key IS NULL AND EXISTS (
    SELECT 1 FROM workout_exercises we 
    WHERE we.id = NEW.workout_exercise_id AND we.grip_id IS NOT NULL
  ) THEN
    SELECT g.slug INTO grip_slug
    FROM workout_exercises we
    JOIN grips g ON g.id = we.grip_id
    WHERE we.id = NEW.workout_exercise_id;
    
    NEW.grip_key := grip_slug;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Clean up any old PR trigger functions that might conflict
DROP FUNCTION IF EXISTS upsert_prs_after_set() CASCADE;
DROP FUNCTION IF EXISTS update_personal_records() CASCADE;