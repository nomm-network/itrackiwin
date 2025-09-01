-- Add missing English and Romanian translations for exercises

-- Back Extension
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
VALUES 
  ('a04e4569-89bf-4873-a406-0bba6b91ce6a', 'en', 'Back Extension', 'Strengthen your lower back muscles with controlled back extension movement'),
  ('a04e4569-89bf-4873-a406-0bba6b91ce6a', 'ro', 'Extensie Spate', 'Întărește mușchii din partea inferioară a spatelui cu mișcare controlată de extensie');

-- EZ-Bar Curl
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
VALUES 
  ('a41ac6a1-6a86-4cec-85d1-477d446dc95f', 'en', 'EZ-Bar Curl', 'Bicep curl using an EZ-bar for comfortable wrist positioning'),
  ('a41ac6a1-6a86-4cec-85d1-477d446dc95f', 'ro', 'Curl cu Bara EZ', 'Curl pentru biceps folosind bara EZ pentru o poziție confortabilă a încheieturilor');

-- Lat Pulldown
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
VALUES 
  ('4ebb0d3c-878e-4dc7-bb8a-367ed2453fcd', 'en', 'Lat Pulldown', 'Pull down exercise targeting the latissimus dorsi muscles'),
  ('4ebb0d3c-878e-4dc7-bb8a-367ed2453fcd', 'ro', 'Tracțiuni la Scripete', 'Exercițiu de tracțiune în jos care vizează mușchii latissimus dorsi');

-- Seated Hammer Curl
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
VALUES 
  ('6075c7cc-3f4e-455c-bf4b-775775429dc3', 'en', 'Seated Hammer Curl', 'Seated bicep curl with neutral grip using dumbbells'),
  ('6075c7cc-3f4e-455c-bf4b-775775429dc3', 'ro', 'Curl Ciocan Șezând', 'Curl pentru biceps în poziție șezândă cu prindere neutră folosind gantere');

-- Seated Row Machine
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
VALUES 
  ('2f7240d5-9bd5-4c19-9073-55621e8b573b', 'en', 'Seated Row Machine', 'Seated rowing exercise using machine for back muscle development'),
  ('2f7240d5-9bd5-4c19-9073-55621e8b573b', 'ro', 'Vâslire la Aparat Șezând', 'Exercițiu de vâslire în poziție șezândă folosind aparatul pentru dezvoltarea mușchilor spatelui');

-- Upper Chest Press Machine - add Romanian translation
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
VALUES 
  ('b0bb1fa8-83c4-4f39-a311-74f014d85bec', 'ro', 'Aparat Press Piept Superior', 'Exercițiu pentru partea superioară a pieptului folosind aparatul de presă');

-- Add more common exercises with translations
-- Barbell Bench Press
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT e.id, 'en', 'Barbell Bench Press', 'Classic barbell bench press for chest development'
FROM exercises e
WHERE e.slug = 'barbell-bench-press' AND e.owner_user_id IS NULL
AND NOT EXISTS (
  SELECT 1 FROM exercises_translations et 
  WHERE et.exercise_id = e.id AND et.language_code = 'en'
);

INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT e.id, 'ro', 'Press cu Bara pe Bancă', 'Press clasic cu bara pe bancă pentru dezvoltarea pieptului'
FROM exercises e
WHERE e.slug = 'barbell-bench-press' AND e.owner_user_id IS NULL
AND NOT EXISTS (
  SELECT 1 FROM exercises_translations et 
  WHERE et.exercise_id = e.id AND et.language_code = 'ro'
);

-- Deadlift
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT e.id, 'en', 'Deadlift', 'Fundamental deadlift movement for full body strength'
FROM exercises e
WHERE e.slug = 'deadlift' AND e.owner_user_id IS NULL
AND NOT EXISTS (
  SELECT 1 FROM exercises_translations et 
  WHERE et.exercise_id = e.id AND et.language_code = 'en'
);

INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT e.id, 'ro', 'Îndreptări', 'Mișcare fundamentală de îndreptări pentru forța întregului corp'
FROM exercises e
WHERE e.slug = 'deadlift' AND e.owner_user_id IS NULL
AND NOT EXISTS (
  SELECT 1 FROM exercises_translations et 
  WHERE et.exercise_id = e.id AND et.language_code = 'ro'
);

-- Squat
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT e.id, 'en', 'Squat', 'Basic squat exercise for lower body strength'
FROM exercises e
WHERE e.slug LIKE '%squat%' AND e.owner_user_id IS NULL
AND NOT EXISTS (
  SELECT 1 FROM exercises_translations et 
  WHERE et.exercise_id = e.id AND et.language_code = 'en'
);

INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT e.id, 'ro', 'Genuflexiuni', 'Exercițiu de bază de genuflexiuni pentru forța părții inferioare'
FROM exercises e
WHERE e.slug LIKE '%squat%' AND e.owner_user_id IS NULL
AND NOT EXISTS (
  SELECT 1 FROM exercises_translations et 
  WHERE et.exercise_id = e.id AND et.language_code = 'ro'
);