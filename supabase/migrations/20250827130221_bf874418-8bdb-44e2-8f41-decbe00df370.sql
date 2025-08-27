-- =====================================================
-- WORKOUT CATALOG CLEANUP: SEED EXERCISE LIBRARY (Step 4.1)
-- First batch: CHEST exercises (8 exercises)
-- =====================================================

-- Clear existing exercises first
DELETE FROM public.exercises_translations;
DELETE FROM public.exercises;

-- =====================================================
-- CHEST EXERCISES (8 exercises)
-- =====================================================

-- 1. Barbell Bench Press
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT
    'barbell-bench-press',
    bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='chest' AND m.slug='pectorals' AND eq.slug='barbell'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.desc
FROM x, (VALUES
  ('en','Barbell Bench Press','Flat barbell bench press for chest development'),
  ('ro','Împins cu haltera la bancă orizontală','Presă la bancă cu bară pentru dezvoltarea pieptului')
) AS v(lang,name,desc);

-- 2. Incline Dumbbell Press
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'incline-dumbbell-press', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='chest' AND m.slug='pectorals' AND eq.slug='dumbbells'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.desc
FROM x, (VALUES
  ('en','Incline Dumbbell Press','Incline press with dumbbells for upper chest'),
  ('ro','Împins la înclinat cu gantere','Împins cu gantere pe bancă înclinată pentru pieptul superior')
) v(lang,name,desc);

-- 3. Decline Barbell Press
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'decline-barbell-press', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='chest' AND m.slug='pectorals' AND eq.slug='barbell'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.desc
FROM x, (VALUES
  ('en','Decline Barbell Press','Decline barbell press for lower chest focus'),
  ('ro','Împins cu haltera la declinat','Presă la bancă declinată pentru pieptul inferior')
) v(lang,name,desc);

-- 4. Dumbbell Flyes
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'dumbbell-flyes', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='chest' AND m.slug='pectorals' AND eq.slug='dumbbells'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.desc
FROM x, (VALUES
  ('en','Dumbbell Flyes','Isolation exercise for chest with dumbbells'),
  ('ro','Deschideri cu gantere','Exercițiu de izolare pentru piept cu gantere')
) v(lang,name,desc);

-- 5. Cable Crossover
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'cable-crossover', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='chest' AND m.slug='pectorals' AND eq.slug='cable-machine'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.desc
FROM x, (VALUES
  ('en','Cable Crossover','Cable crossover for chest isolation'),
  ('ro','Încrucișări la cablu','Încrucișări la cablu pentru izolarea pieptului')
) v(lang,name,desc);

-- 6. Push-ups
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'push-ups', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='chest' AND m.slug='pectorals' AND eq.slug='bodyweight'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.desc
FROM x, (VALUES
  ('en','Push-ups','Classic bodyweight chest exercise'),
  ('ro','Flotări','Exercițiu clasic pentru piept cu greutatea corpului')
) v(lang,name,desc);

-- 7. Incline Barbell Press
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'incline-barbell-press', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='chest' AND m.slug='pectorals' AND eq.slug='barbell'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.desc
FROM x, (VALUES
  ('en','Incline Barbell Press','Incline barbell press for upper chest development'),
  ('ro','Împins cu haltera la înclinat','Presă cu bară înclinată pentru pieptul superior')
) v(lang,name,desc);

-- 8. Dips
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'dips', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='chest' AND m.slug='pectorals' AND eq.slug='bodyweight'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.desc
FROM x, (VALUES
  ('en','Dips','Bodyweight dips for chest and triceps'),
  ('ro','Paralele','Exercițiu la paralele pentru piept și triceps')
) v(lang,name,desc);