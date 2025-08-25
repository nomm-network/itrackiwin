-- Add some basic muscle group translations
INSERT INTO muscle_groups_translations (muscle_group_id, language_code, name, description)
SELECT 
  id,
  'en',
  CASE 
    WHEN slug = 'biceps' THEN 'Biceps'
    WHEN slug = 'triceps' THEN 'Triceps'
    WHEN slug = 'chest' THEN 'Chest'
    WHEN slug = 'back' THEN 'Back'
    WHEN slug = 'shoulders' THEN 'Shoulders'
    WHEN slug = 'quadriceps' THEN 'Quadriceps'
    WHEN slug = 'hamstrings' THEN 'Hamstrings'
    WHEN slug = 'calves' THEN 'Calves'
    WHEN slug = 'glutes' THEN 'Glutes'
    WHEN slug = 'forearms' THEN 'Forearms'
    WHEN slug = 'abs' THEN 'Abdominals'
    WHEN slug = 'core' THEN 'Core'
    WHEN slug = 'traps' THEN 'Trapezius'
    WHEN slug = 'lats' THEN 'Latissimus Dorsi'
    WHEN slug = 'delts' THEN 'Deltoids'
    WHEN slug = 'rhomboids' THEN 'Rhomboids'
    WHEN slug = 'upper_trapezius' THEN 'Upper Trapezius'
    WHEN slug = 'middle_trapezius' THEN 'Middle Trapezius'
    WHEN slug = 'lower_trapezius' THEN 'Lower Trapezius'
    WHEN slug = 'rear_delts' THEN 'Rear Deltoids'
    WHEN slug = 'front_delts' THEN 'Front Deltoids'
    WHEN slug = 'side_delts' THEN 'Side Deltoids'
    ELSE INITCAP(REPLACE(slug, '_', ' '))
  END,
  CASE 
    WHEN slug = 'biceps' THEN 'Front arm muscles responsible for flexing the elbow'
    WHEN slug = 'triceps' THEN 'Back arm muscles responsible for extending the elbow'
    WHEN slug = 'chest' THEN 'Pectoral muscles in the chest area'
    WHEN slug = 'back' THEN 'Upper back muscles'
    WHEN slug = 'shoulders' THEN 'Shoulder muscles (deltoids)'
    WHEN slug = 'quadriceps' THEN 'Front thigh muscles'
    WHEN slug = 'hamstrings' THEN 'Back thigh muscles'
    ELSE NULL
  END
FROM muscle_groups
WHERE id NOT IN (
  SELECT muscle_group_id FROM muscle_groups_translations WHERE language_code = 'en'
);

-- Add some basic muscle translations
INSERT INTO muscles_translations (muscle_id, language_code, name, description)
SELECT 
  id,
  'en',
  INITCAP(REPLACE(slug, '_', ' ')),
  NULL
FROM muscles
WHERE id NOT IN (
  SELECT muscle_id FROM muscles_translations WHERE language_code = 'en'
);