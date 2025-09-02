-- Fix the deadlift exercise translation in English
UPDATE exercises_translations 
SET name = 'Barbell Deadlift'
WHERE exercise_id = '7dc0ef00-cdf2-491c-a58b-4745620492d0' 
AND language_code = 'en' 
AND name LIKE 'Exercise %';

-- Ensure we have proper English translation for deadlift
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
VALUES (
  '7dc0ef00-cdf2-491c-a58b-4745620492d0',
  'en', 
  'Barbell Deadlift',
  'A compound exercise involving lifting a barbell from the ground to hip level'
)
ON CONFLICT (exercise_id, language_code) 
DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;