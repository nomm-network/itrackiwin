-- Clear all exercises and fix foreign key relationships

-- Delete all existing exercises (cascades to related tables)
DELETE FROM exercises;

-- Drop existing foreign key constraints
ALTER TABLE exercises DROP CONSTRAINT IF EXISTS exercises_movement_id_fkey;
ALTER TABLE exercises DROP CONSTRAINT IF EXISTS exercises_movement_pattern_fkey;

-- Drop the current movement_pattern column (enum)
ALTER TABLE exercises DROP COLUMN IF EXISTS movement_pattern;

-- Add new movement_pattern_id column that references movement_patterns table
ALTER TABLE exercises ADD COLUMN movement_pattern_id UUID;

-- Add proper foreign key constraints
ALTER TABLE exercises ADD CONSTRAINT exercises_movement_id_fkey 
    FOREIGN KEY (movement_id) REFERENCES movements(id);
    
ALTER TABLE exercises ADD CONSTRAINT exercises_movement_pattern_id_fkey 
    FOREIGN KEY (movement_pattern_id) REFERENCES movement_patterns(id);