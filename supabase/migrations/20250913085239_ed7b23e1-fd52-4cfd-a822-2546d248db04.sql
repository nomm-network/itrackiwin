-- Fix the corrupted lateral raise weight entry (20kg -> 4kg)
UPDATE workout_sets 
SET weight = 4.0 
WHERE id = '604bd27a-00f9-4d21-8ef9-77e72cac8984' 
  AND weight = 20.0;