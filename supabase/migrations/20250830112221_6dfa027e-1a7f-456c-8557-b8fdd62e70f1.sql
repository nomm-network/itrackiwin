-- Clean up existing data and implement new movement patterns/movements structure

BEGIN;

-- 1. Drop existing data from related tables (cascade will handle dependencies)
DELETE FROM exercises WHERE movement_id IS NOT NULL OR movement_pattern_id IS NOT NULL;
DELETE FROM movements;
DELETE FROM movement_patterns;

-- 2. Drop existing enum types if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'movement_pattern') THEN
    DROP TYPE movement_pattern CASCADE;
  END IF;
EXCEPTION
  WHEN dependent_objects_still_exist THEN
    -- If there are still dependent objects, we'll handle them case by case
    RAISE NOTICE 'movement_pattern enum still has dependencies, will clean up manually';
END$$;

-- 3. Ensure movement_patterns table exists with proper structure
DROP TABLE IF EXISTS movement_patterns CASCADE;
CREATE TABLE movement_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Ensure movements table exists with proper structure
DO $$
BEGIN
  -- Add movement_pattern_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name='movements' AND column_name='movement_pattern_id'
  ) THEN
    ALTER TABLE movements
      ADD COLUMN movement_pattern_id UUID NULL;
  END IF;
END$$;

-- Add foreign key constraint
ALTER TABLE movements DROP CONSTRAINT IF EXISTS fk_movements_pattern;
ALTER TABLE movements 
  ADD CONSTRAINT fk_movements_pattern 
  FOREIGN KEY (movement_pattern_id) REFERENCES movement_patterns(id);

-- 5. Add unique constraint to movements.slug if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'movements' AND indexname = 'ux_movements_slug'
  ) THEN
    CREATE UNIQUE INDEX ux_movements_slug ON movements(slug);
  END IF;
END$$;

-- 6. Seed the 8 movement patterns
INSERT INTO movement_patterns (slug)
VALUES
  ('push'), ('pull'), ('squat'), ('hinge'),
  ('lunge'), ('carry'), ('rotation'), ('isolation');

-- 7. Get pattern IDs for movements seeding
WITH pattern_ids AS (
  SELECT id, slug FROM movement_patterns
),
movement_data AS (
  SELECT 
    -- PUSH movements
    'horizontal_push' as slug, 'push' as pattern_slug
  UNION ALL SELECT 'vertical_push', 'push'
  UNION ALL SELECT 'dip', 'push'
  UNION ALL SELECT 'front_raise', 'push'
  UNION ALL SELECT 'lateral_raise', 'push'
  UNION ALL SELECT 'fly', 'push'
  
  -- PULL movements  
  UNION ALL SELECT 'horizontal_pull', 'pull'
  UNION ALL SELECT 'vertical_pull', 'pull'
  UNION ALL SELECT 'pulldown', 'pull'
  UNION ALL SELECT 'row', 'pull'
  UNION ALL SELECT 'face_pull', 'pull'
  
  -- SQUAT movements
  UNION ALL SELECT 'back_squat', 'squat'
  UNION ALL SELECT 'front_squat', 'squat'
  UNION ALL SELECT 'hack_squat', 'squat'
  UNION ALL SELECT 'leg_press', 'squat'
  
  -- HINGE movements
  UNION ALL SELECT 'deadlift', 'hinge'
  UNION ALL SELECT 'rdl', 'hinge'
  UNION ALL SELECT 'good_morning', 'hinge'
  UNION ALL SELECT 'hip_thrust', 'hinge'
  UNION ALL SELECT 'back_extension', 'hinge'
  
  -- LUNGE movements
  UNION ALL SELECT 'forward_lunge', 'lunge'
  UNION ALL SELECT 'reverse_lunge', 'lunge'
  UNION ALL SELECT 'walking_lunge', 'lunge'
  UNION ALL SELECT 'step_up', 'lunge'
  UNION ALL SELECT 'bulgarian_split_squat', 'lunge'
  
  -- CARRY movements
  UNION ALL SELECT 'farmer_carry', 'carry'
  UNION ALL SELECT 'suitcase_carry', 'carry'
  UNION ALL SELECT 'overhead_carry', 'carry'
  
  -- ROTATION movements
  UNION ALL SELECT 'rotation_chop', 'rotation'
  UNION ALL SELECT 'anti_rotation_press', 'rotation'
  UNION ALL SELECT 'side_bend', 'rotation'
  
  -- ISOLATION movements
  UNION ALL SELECT 'curl', 'isolation'
  UNION ALL SELECT 'extension', 'isolation'
  UNION ALL SELECT 'raise', 'isolation'
)
INSERT INTO movements (slug, movement_pattern_id)
SELECT md.slug, pi.id
FROM movement_data md
JOIN pattern_ids pi ON pi.slug = md.pattern_slug;

-- 8. Update exercises table structure
DO $$
BEGIN
  -- Add movement_pattern_id to exercises if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name='exercises' AND column_name='movement_pattern_id'
  ) THEN
    ALTER TABLE exercises
      ADD COLUMN movement_pattern_id UUID NULL;
  END IF;
END$$;

-- Add foreign key constraint for exercises
ALTER TABLE exercises DROP CONSTRAINT IF EXISTS fk_exercises_pattern;
ALTER TABLE exercises 
  ADD CONSTRAINT fk_exercises_pattern 
  FOREIGN KEY (movement_pattern_id) REFERENCES movement_patterns(id);

-- 9. Create trigger to keep exercises.movement_pattern_id in sync with movements
CREATE OR REPLACE FUNCTION trg_exercises_sync_pattern()
RETURNS trigger AS $$
BEGIN
  IF NEW.movement_id IS NOT NULL THEN
    SELECT movement_pattern_id INTO NEW.movement_pattern_id
    FROM movements
    WHERE id = NEW.movement_id;
  END IF;
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS exercises_sync_pattern ON exercises;
CREATE TRIGGER exercises_sync_pattern
BEFORE INSERT OR UPDATE OF movement_id ON exercises
FOR EACH ROW EXECUTE FUNCTION trg_exercises_sync_pattern();

-- 10. Add constraint to ensure consistency
ALTER TABLE exercises
  DROP CONSTRAINT IF EXISTS chk_exercises_pattern_consistent;
ALTER TABLE exercises
  ADD CONSTRAINT chk_exercises_pattern_consistent
  CHECK (
    movement_id IS NULL
    OR movement_pattern_id IS NULL
    OR movement_pattern_id = (SELECT movement_pattern_id FROM movements WHERE id = movement_id)
  );

-- 11. Set NOT NULL constraints
ALTER TABLE movements
  ALTER COLUMN movement_pattern_id SET NOT NULL;

COMMIT;