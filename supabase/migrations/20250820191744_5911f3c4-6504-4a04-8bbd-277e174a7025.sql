-- Remove all empty/incomplete sets that don't have actual data
DELETE FROM workout_sets 
WHERE is_completed = false 
AND weight IS NULL 
AND reps IS NULL 
AND rpe IS NULL 
AND notes IS NULL;