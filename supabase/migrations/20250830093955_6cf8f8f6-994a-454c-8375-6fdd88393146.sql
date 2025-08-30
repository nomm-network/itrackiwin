-- Fix the foreign key relationships for exercises table

-- First, fix movement_id to reference movements table
ALTER TABLE exercises DROP CONSTRAINT IF EXISTS exercises_movement_id_fkey;
ALTER TABLE exercises ADD CONSTRAINT exercises_movement_id_fkey 
    FOREIGN KEY (movement_id) REFERENCES movements(id);

-- Now change movement_pattern from enum to UUID referencing movement_patterns
-- First, drop the current movement_pattern column (it's currently empty anyway)
ALTER TABLE exercises DROP COLUMN IF EXISTS movement_pattern;

-- Add new movement_pattern_id column that references movement_patterns table
ALTER TABLE exercises ADD COLUMN movement_pattern_id UUID;
ALTER TABLE exercises ADD CONSTRAINT exercises_movement_pattern_id_fkey 
    FOREIGN KEY (movement_pattern_id) REFERENCES movement_patterns(id);