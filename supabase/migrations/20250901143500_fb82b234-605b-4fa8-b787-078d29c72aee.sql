-- Add missing English and Romanian translations for exercises (avoid duplicates)

-- Back Extension (only Romanian since English might exist)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
VALUES ('a04e4569-89bf-4873-a406-0bba6b91ce6a', 'ro', 'Extensie Spate', 'Întărește mușchii din partea inferioară a spatelui cu mișcare controlată de extensie')
ON CONFLICT (exercise_id, language_code) DO NOTHING;

-- EZ-Bar Curl
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
VALUES 
  ('a41ac6a1-6a86-4cec-85d1-477d446dc95f', 'en', 'EZ-Bar Curl', 'Bicep curl using an EZ-bar for comfortable wrist positioning'),
  ('a41ac6a1-6a86-4cec-85d1-477d446dc95f', 'ro', 'Curl cu Bara EZ', 'Curl pentru biceps folosind bara EZ pentru o poziție confortabilă a încheieturilor')
ON CONFLICT (exercise_id, language_code) DO NOTHING;

-- Lat Pulldown
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
VALUES 
  ('4ebb0d3c-878e-4dc7-bb8a-367ed2453fcd', 'en', 'Lat Pulldown', 'Pull down exercise targeting the latissimus dorsi muscles'),
  ('4ebb0d3c-878e-4dc7-bb8a-367ed2453fcd', 'ro', 'Tracțiuni la Scripete', 'Exercițiu de tracțiune în jos care vizează mușchii latissimus dorsi')
ON CONFLICT (exercise_id, language_code) DO NOTHING;

-- Seated Hammer Curl
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
VALUES 
  ('6075c7cc-3f4e-455c-bf4b-775775429dc3', 'en', 'Seated Hammer Curl', 'Seated bicep curl with neutral grip using dumbbells'),
  ('6075c7cc-3f4e-455c-bf4b-775775429dc3', 'ro', 'Curl Ciocan Șezând', 'Curl pentru biceps în poziție șezândă cu prindere neutră folosind gantere')
ON CONFLICT (exercise_id, language_code) DO NOTHING;

-- Seated Row Machine
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
VALUES 
  ('2f7240d5-9bd5-4c19-9073-55621e8b573b', 'en', 'Seated Row Machine', 'Seated rowing exercise using machine for back muscle development'),
  ('2f7240d5-9bd5-4c19-9073-55621e8b573b', 'ro', 'Vâslire la Aparat Șezând', 'Exercițiu de vâslire în poziție șezândă folosind aparatul pentru dezvoltarea mușchilor spatelui')
ON CONFLICT (exercise_id, language_code) DO NOTHING;

-- Upper Chest Press Machine - add Romanian translation
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
VALUES ('b0bb1fa8-83c4-4f39-a311-74f014d85bec', 'ro', 'Aparat Press Piept Superior', 'Exercițiu pentru partea superioară a pieptului folosind aparatul de presă')
ON CONFLICT (exercise_id, language_code) DO NOTHING;

-- Add translations for exercises that might be missing them
-- Use bulk insert with ON CONFLICT to avoid duplicates
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT 
  e.id,
  'en',
  COALESCE(e.display_name, 'Exercise'),
  'Exercise for strength training'
FROM exercises e
WHERE e.owner_user_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM exercises_translations et 
    WHERE et.exercise_id = e.id AND et.language_code = 'en'
  )
ON CONFLICT (exercise_id, language_code) DO NOTHING;

-- Add Romanian translations for all exercises missing them
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT 
  e.id,
  'ro',
  COALESCE(e.display_name, 'Exercițiu'),
  'Exercițiu pentru antrenament de forță'
FROM exercises e
WHERE e.owner_user_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM exercises_translations et 
    WHERE et.exercise_id = e.id AND et.language_code = 'ro'
  )
ON CONFLICT (exercise_id, language_code) DO NOTHING;