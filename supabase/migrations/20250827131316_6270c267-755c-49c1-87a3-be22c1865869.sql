-- =====================================================
-- WORKOUT CATALOG CLEANUP: SEED LEG EXERCISES (Step 4.1 continued)
-- LEG exercises (12 exercises)
-- =====================================================

-- =====================================================
-- LEG EXERCISES (12 exercises)
-- =====================================================

-- 1. Barbell Back Squat
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'barbell-back-squat', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='legs' AND m.slug='quadriceps' AND eq.slug='barbell'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Barbell Back Squat','Back squat with bar on shoulders for leg development'),
  ('ro','Genuflexiuni cu haltera','Genuflexiuni cu bară pe spate pentru dezvoltarea picioarelor')
) v(lang,name,description);

-- 2. Romanian Deadlift
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'romanian-deadlift', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='legs' AND m.slug='hamstrings' AND eq.slug='barbell'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Romanian Deadlift','Hip hinge focusing hamstrings and glutes'),
  ('ro','Îndreptări românești','Îndreptări pentru biceps femural și fesieri')
) v(lang,name,description);

-- 3. Leg Press
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'leg-press', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='legs' AND m.slug='quadriceps' AND eq.slug='leg-press'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Leg Press','Machine leg press for quadriceps development'),
  ('ro','Presa de picioare','Presă la aparatul pentru dezvoltarea cvadricepsului')
) v(lang,name,description);

-- 4. Leg Curls
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'leg-curls', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='legs' AND m.slug='hamstrings' AND eq.slug='leg-curl'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Leg Curls','Isolation exercise for hamstring development'),
  ('ro','Flexii de picioare','Exercițiu de izolare pentru biceps femural')
) v(lang,name,description);

-- 5. Leg Extensions
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'leg-extensions', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='legs' AND m.slug='quadriceps' AND eq.slug='leg-extension'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Leg Extensions','Isolation exercise for quadriceps development'),
  ('ro','Extensii de picioare','Exercițiu de izolare pentru cvadriceps')
) v(lang,name,description);

-- 6. Walking Lunges
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'walking-lunges', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='legs' AND m.slug='quadriceps' AND eq.slug='dumbbells'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Walking Lunges','Dynamic lunges with dumbbells for leg strength'),
  ('ro','Pași lungi în deplasare','Pași lungi dinamici cu gantere pentru forța picioarelor')
) v(lang,name,description);

-- 7. Bulgarian Split Squats
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'bulgarian-split-squats', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='legs' AND m.slug='quadriceps' AND eq.slug='dumbbells'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Bulgarian Split Squats','Rear-foot-elevated split squats for unilateral leg training'),
  ('ro','Genuflexiuni bulgărești','Genuflexiuni cu piciorul posterior ridicat pentru antrenament unilateral')
) v(lang,name,description);

-- 8. Calf Raises
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'calf-raises', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='legs' AND m.slug='calves' AND eq.slug='calf-raise'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Calf Raises','Standing calf raises for calf muscle development'),
  ('ro','Ridicări pe vârfuri','Ridicări pe vârfuri pentru dezvoltarea gemetelor')
) v(lang,name,description);

-- 9. Goblet Squats
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'goblet-squats', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='legs' AND m.slug='quadriceps' AND eq.slug='dumbbells'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Goblet Squats','Front-loaded squats with dumbbell for leg training'),
  ('ro','Genuflexiuni goblet','Genuflexiuni cu ganteră în față pentru antrenamentul picioarelor')
) v(lang,name,description);

-- 10. Sumo Deadlift
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'sumo-deadlift', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='legs' AND m.slug='quadriceps' AND eq.slug='barbell'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Sumo Deadlift','Wide-stance deadlift variation focusing on legs'),
  ('ro','Îndreptări sumo','Varianta de îndreptări cu priză largă pentru picioare')
) v(lang,name,description);

-- 11. Front Squats
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'front-squats', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='legs' AND m.slug='quadriceps' AND eq.slug='barbell'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Front Squats','Front-loaded barbell squats for quadriceps emphasis'),
  ('ro','Genuflexiuni frontale','Genuflexiuni cu bară în față pentru accent pe cvadriceps')
) v(lang,name,description);

-- 12. Stiff Leg Deadlift
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'stiff-leg-deadlift', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='legs' AND m.slug='hamstrings' AND eq.slug='dumbbells'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Stiff Leg Deadlift','Straight-leg deadlift for hamstring and glute focus'),
  ('ro','Îndreptări cu picioarele drepte','Îndreptări cu picioarele drepte pentru biceps femural și fesieri')
) v(lang,name,description);