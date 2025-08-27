-- =====================================================
-- WORKOUT CATALOG CLEANUP: STEP 5 - CREATE SAMPLE TEMPLATES (SIMPLE VERSION)
-- =====================================================

-- Create sample templates using minimal columns

-- Create template: Push Day - Chest Focus
WITH t AS (
  INSERT INTO workout_templates (name, user_id)
  VALUES ('Push Day - Chest Focus', '00000000-0000-0000-0000-000000000000'::uuid)
  RETURNING id
)
INSERT INTO template_exercises (template_id, exercise_id, order_index, default_sets, target_reps)
SELECT
  t.id,
  e.id,
  1,              -- first exercise
  3,              -- 3 sets
  8              -- target reps
FROM t
CROSS JOIN exercises e
WHERE e.slug='barbell-bench-press'

UNION ALL
SELECT
  t.id, e.id, 2, 3, 10
FROM t
CROSS JOIN exercises e
WHERE e.slug='incline-dumbbell-press'

UNION ALL
SELECT
  t.id, e.id, 3, 3, 12
FROM t
CROSS JOIN exercises e
WHERE e.slug='cable-crossover';

-- Create template: Pull Day - Back Focus 
WITH t AS (
  INSERT INTO workout_templates (name, user_id)
  VALUES ('Pull Day - Back Focus', '00000000-0000-0000-0000-000000000000'::uuid)
  RETURNING id
)
INSERT INTO template_exercises (template_id, exercise_id, order_index, default_sets, target_reps)
SELECT
  t.id,
  e.id,
  1,              
  3,              
  8              
FROM t
CROSS JOIN exercises e
WHERE e.slug='barbell-rows'

UNION ALL
SELECT
  t.id, e.id, 2, 3, 10
FROM t
CROSS JOIN exercises e
WHERE e.slug='lat-pulldown'

UNION ALL
SELECT
  t.id, e.id, 3, 3, 12
FROM t
CROSS JOIN exercises e
WHERE e.slug='seated-cable-row';

-- Create template: Leg Day
WITH t AS (
  INSERT INTO workout_templates (name, user_id)
  VALUES ('Leg Day - Strength Focus', '00000000-0000-0000-0000-000000000000'::uuid)
  RETURNING id
)
INSERT INTO template_exercises (template_id, exercise_id, order_index, default_sets, target_reps)
SELECT
  t.id,
  e.id,
  1,              
  4,              -- 4 sets for compound movement
  5              -- lower reps for strength
FROM t
CROSS JOIN exercises e
WHERE e.slug='barbell-back-squat'

UNION ALL
SELECT
  t.id, e.id, 2, 3, 8
FROM t
CROSS JOIN exercises e
WHERE e.slug='romanian-deadlift'

UNION ALL
SELECT
  t.id, e.id, 3, 3, 12
FROM t
CROSS JOIN exercises e
WHERE e.slug='leg-press'

UNION ALL
SELECT
  t.id, e.id, 4, 3, 15
FROM t
CROSS JOIN exercises e
WHERE e.slug='calf-raises';

-- =====================================================
-- FINAL PROGRESS UPDATE - ALL STEPS COMPLETE!
-- =====================================================