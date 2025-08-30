-- Delete existing test exercises with CASCADE to clean up translations
DELETE FROM exercises 
WHERE slug IN (
    'incline-chest-press-machine', 
    'chest-press-machine', 
    'flat-bench-press', 
    'dumbbell-front-raise'
);