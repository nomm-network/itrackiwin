-- Fix foreign key constraint to point to movement_patterns instead of movements
ALTER TABLE exercises DROP CONSTRAINT IF EXISTS exercises_movement_id_fkey;
ALTER TABLE exercises ADD CONSTRAINT exercises_movement_id_fkey 
    FOREIGN KEY (movement_id) REFERENCES movement_patterns(id);