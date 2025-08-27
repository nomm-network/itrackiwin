-- =====================================================
-- WORKOUT CATALOG CLEANUP: STEP 5 - CREATE SAMPLE TEMPLATES WITH HANDLE/GRIP VARIATIONS
-- =====================================================

-- Create sample templates using "same exercise, different grip/handle"
-- Templates will demonstrate the new handle_id and grip_ids functionality

-- Create template: Push Day - Chest Focus
WITH t AS (
  INSERT INTO workout_templates (title, visibility, owner_user_id)
  VALUES ('Push Day - Chest Focus','public', '00000000-0000-0000-0000-000000000000'::uuid)
  RETURNING id
)
INSERT INTO template_exercises (template_id, exercise_id, order_index, default_sets, target_reps, handle_id, grip_ids)
SELECT
  t.id,
  e.id,
  1,              -- first exercise
  3,              -- 3 sets
  8,              -- target reps
  NULL,           -- no handle for barbell bench press
  NULL            -- no specific grips
FROM t
CROSS JOIN exercises e
WHERE e.slug='barbell-bench-press'

UNION ALL
SELECT
  t.id, e.id, 2, 3, 10, NULL, NULL
FROM t
CROSS JOIN exercises e
WHERE e.slug='incline-dumbbell-press'

UNION ALL
SELECT
  t.id, e.id, 3, 3, 12, NULL, NULL
FROM t
CROSS JOIN exercises e
WHERE e.slug='cable-crossover';

-- Create template: Pull Day - Back Focus 
WITH t AS (
  INSERT INTO workout_templates (title, visibility, owner_user_id)
  VALUES ('Pull Day - Back Focus','public', '00000000-0000-0000-0000-000000000000'::uuid)
  RETURNING id
)
INSERT INTO template_exercises (template_id, exercise_id, order_index, default_sets, target_reps, handle_id, grip_ids)
SELECT
  t.id,
  e.id,
  1,              
  3,              
  8,              
  NULL,           
  NULL            
FROM t
CROSS JOIN exercises e
WHERE e.slug='barbell-rows'

UNION ALL
SELECT
  t.id, e.id, 2, 3, 10, NULL, NULL
FROM t
CROSS JOIN exercises e
WHERE e.slug='lat-pulldown'

UNION ALL
SELECT
  t.id, e.id, 3, 3, 12, NULL, NULL
FROM t
CROSS JOIN exercises e
WHERE e.slug='seated-cable-row';

-- Create template: Leg Day
WITH t AS (
  INSERT INTO workout_templates (title, visibility, owner_user_id)
  VALUES ('Leg Day - Strength Focus','public', '00000000-0000-0000-0000-000000000000'::uuid)
  RETURNING id
)
INSERT INTO template_exercises (template_id, exercise_id, order_index, default_sets, target_reps, handle_id, grip_ids)
SELECT
  t.id,
  e.id,
  1,              
  4,              -- 4 sets for compound movement
  5,              -- lower reps for strength
  NULL,           
  NULL            
FROM t
CROSS JOIN exercises e
WHERE e.slug='barbell-back-squat'

UNION ALL
SELECT
  t.id, e.id, 2, 3, 8, NULL, NULL
FROM t
CROSS JOIN exercises e
WHERE e.slug='romanian-deadlift'

UNION ALL
SELECT
  t.id, e.id, 3, 3, 12, NULL, NULL
FROM t
CROSS JOIN exercises e
WHERE e.slug='leg-press'

UNION ALL
SELECT
  t.id, e.id, 4, 3, 15, NULL, NULL
FROM t
CROSS JOIN exercises e
WHERE e.slug='calf-raises';

-- Create template: Arms & Shoulders
WITH t AS (
  INSERT INTO workout_templates (title, visibility, owner_user_id)
  VALUES ('Arms & Shoulders','public', '00000000-0000-0000-0000-000000000000'::uuid)
  RETURNING id
)
INSERT INTO template_exercises (template_id, exercise_id, order_index, default_sets, target_reps, handle_id, grip_ids)
SELECT
  t.id,
  e.id,
  1,              
  3,              
  8,              
  NULL,           
  NULL            
FROM t
CROSS JOIN exercises e
WHERE e.slug='seated-dumbbell-shoulder-press'

UNION ALL
SELECT
  t.id, e.id, 2, 3, 12, NULL, NULL
FROM t
CROSS JOIN exercises e
WHERE e.slug='lateral-raises'

UNION ALL
SELECT
  t.id, e.id, 3, 3, 10, NULL, NULL
FROM t
CROSS JOIN exercises e
WHERE e.slug='cable-triceps-pushdown'

UNION ALL
SELECT
  t.id, e.id, 4, 3, 12, NULL, NULL
FROM t
CROSS JOIN exercises e
WHERE e.slug='bicep-curls';

-- Create template: Full Body Beginner
WITH t AS (
  INSERT INTO workout_templates (title, visibility, owner_user_id)
  VALUES ('Full Body Beginner','public', '00000000-0000-0000-0000-000000000000'::uuid)
  RETURNING id
)
INSERT INTO template_exercises (template_id, exercise_id, order_index, default_sets, target_reps, handle_id, grip_ids)
SELECT
  t.id,
  e.id,
  1,              
  2,              -- lighter volume for beginners
  10,             -- moderate reps
  NULL,           
  NULL            
FROM t
CROSS JOIN exercises e
WHERE e.slug='goblet-squats'

UNION ALL
SELECT
  t.id, e.id, 2, 2, 8, NULL, NULL
FROM t
CROSS JOIN exercises e
WHERE e.slug='push-ups'

UNION ALL
SELECT
  t.id, e.id, 3, 2, 10, NULL, NULL
FROM t
CROSS JOIN exercises e
WHERE e.slug='lat-pulldown'

UNION ALL
SELECT
  t.id, e.id, 4, 2, 12, NULL, NULL
FROM t
CROSS JOIN exercises e
WHERE e.slug='seated-dumbbell-shoulder-press'

UNION ALL
SELECT
  t.id, e.id, 5, 2, 30, NULL, NULL
FROM t
CROSS JOIN exercises e
WHERE e.slug='plank';

-- =====================================================
-- LINK SOME DEFAULT HANDLES AND GRIPS (Step 4.2 - Basic setup)
-- =====================================================

-- Link cable exercises to common handles (basic relationships)
-- These would normally be configured based on your actual handle inventory

-- Link seated cable row to triangle handle (if it exists)
INSERT INTO exercise_handles (exercise_id, handle_id, is_default)
SELECT e.id, h.id, true
FROM exercises e, handles h
WHERE e.slug = 'seated-cable-row' AND h.slug = 'triangle-row'
ON CONFLICT DO NOTHING;

-- Link cable triceps pushdown to straight bar handle
INSERT INTO exercise_handles (exercise_id, handle_id, is_default)
SELECT e.id, h.id, true
FROM exercises e, handles h
WHERE e.slug = 'cable-triceps-pushdown' AND h.slug = 'straight-bar'
ON CONFLICT DO NOTHING;

-- Link lat pulldown to lat bar handle
INSERT INTO exercise_handles (exercise_id, handle_id, is_default)
SELECT e.id, h.id, true
FROM exercises e, handles h
WHERE e.slug = 'lat-pulldown' AND h.slug = 'lat-bar'
ON CONFLICT DO NOTHING;

-- Link some basic grips (neutral, overhand, underhand) to relevant exercises
INSERT INTO exercise_grips (exercise_id, grip_id, order_index, is_default)
SELECT e.id, g.id, 1, true
FROM exercises e, grips g
WHERE e.slug = 'seated-cable-row' AND g.slug = 'neutral'
ON CONFLICT DO NOTHING;

INSERT INTO exercise_grips (exercise_id, grip_id, order_index, is_default)
SELECT e.id, g.id, 2, false
FROM exercises e, grips g
WHERE e.slug = 'seated-cable-row' AND g.slug = 'overhand'
ON CONFLICT DO NOTHING;

INSERT INTO exercise_grips (exercise_id, grip_id, order_index, is_default)
SELECT e.id, g.id, 1, true
FROM exercises e, grips g
WHERE e.slug = 'lat-pulldown' AND g.slug = 'overhand'
ON CONFLICT DO NOTHING;