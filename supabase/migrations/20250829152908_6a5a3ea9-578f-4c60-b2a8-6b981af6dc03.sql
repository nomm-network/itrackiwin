-- Fix the demo exercises with proper display names and make them visible
UPDATE exercises 
SET display_name = CASE 
  WHEN slug = 'cable-lat-pulldown' THEN 'Cable Lat Pulldown'
  WHEN slug = 'cable-chest-fly' THEN 'Cable Chest Fly' 
  WHEN slug = 'cable-row' THEN 'Cable Row'
END
WHERE slug IN ('cable-lat-pulldown', 'cable-chest-fly', 'cable-row');

-- Add proper translations for these exercises
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT 
  e.id,
  'en',
  e.display_name,
  'Demo exercise for testing grip and handle system'
FROM exercises e
WHERE e.slug IN ('cable-lat-pulldown', 'cable-chest-fly', 'cable-row')
ON CONFLICT (exercise_id, language_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;