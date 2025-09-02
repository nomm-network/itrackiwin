-- Add translations for the newly created exercises
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT 
  e.id,
  'en',
  'Barbell Deadlift',
  'A fundamental compound exercise that targets the posterior chain, involving lifting a loaded barbell from the ground to hip level while maintaining proper form.'
FROM exercises e 
WHERE e.slug = 'barbell-deadlift'
ON CONFLICT (exercise_id, language_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT 
  e.id,
  'ro',
  'Deadlift cu Halteră',
  'Un exercițiu compus fundamental care vizează lanțul posterior, implicând ridicarea unei halterele încărcate de la sol la nivelul șoldurilor menținând forma corectă.'
FROM exercises e 
WHERE e.slug = 'barbell-deadlift'
ON CONFLICT (exercise_id, language_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT 
  e.id,
  'en',
  'Leg Curl (Machine)',
  'An isolation exercise targeting the hamstrings, performed on a leg curl machine with adjustable weight stack for controlled resistance.'
FROM exercises e 
WHERE e.slug = 'machine-leg-curl'
ON CONFLICT (exercise_id, language_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT 
  e.id,
  'ro',
  'Flexii Picioare (Aparat)',
  'Un exercițiu de izolare care vizează mușchii ischiojambieri, executat pe un aparat pentru flexii picioare cu greutăți ajustabile pentru rezistență controlată.'
FROM exercises e 
WHERE e.slug = 'machine-leg-curl'
ON CONFLICT (exercise_id, language_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;