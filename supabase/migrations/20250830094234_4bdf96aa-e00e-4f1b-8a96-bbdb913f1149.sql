-- Clear all exercises and fix foreign key relationships with CASCADE

-- Delete all existing exercises (cascades to related tables)  
DELETE FROM exercises;

-- Drop dependent views that reference movement_pattern column
DROP VIEW IF EXISTS v_exercises_for_coach CASCADE;
DROP VIEW IF EXISTS v_safe_exercises_for_user CASCADE; 
DROP VIEW IF EXISTS v_exercises_with_translations CASCADE;

-- Drop existing foreign key constraints
ALTER TABLE exercises DROP CONSTRAINT IF EXISTS exercises_movement_id_fkey;
ALTER TABLE exercises DROP CONSTRAINT IF EXISTS exercises_movement_pattern_fkey;

-- Drop the current movement_pattern column (enum)
ALTER TABLE exercises DROP COLUMN IF EXISTS movement_pattern CASCADE;

-- Add new movement_pattern_id column that references movement_patterns table
ALTER TABLE exercises ADD COLUMN movement_pattern_id UUID;

-- Add proper foreign key constraints
ALTER TABLE exercises ADD CONSTRAINT exercises_movement_id_fkey 
    FOREIGN KEY (movement_id) REFERENCES movements(id);
    
ALTER TABLE exercises ADD CONSTRAINT exercises_movement_pattern_id_fkey 
    FOREIGN KEY (movement_pattern_id) REFERENCES movement_patterns(id);