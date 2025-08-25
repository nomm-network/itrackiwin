-- Seed "most used" exercises per primary muscle for Bro's program builder
-- Safe to run multiple times (skips existing exercise names).

-- 1) Make sure core equipment exists
WITH core_equipment(slug, equipment_type, default_stack) AS (
  VALUES
    ('barbell','free_weight', NULL),
    ('dumbbell','free_weight', NULL),
    ('cable','machine', '[]'::jsonb),
    ('machine','machine', '[]'::jsonb),
    ('bodyweight','body', NULL)
)
INSERT INTO public.equipment (id, slug, equipment_type, default_stack)
SELECT gen_random_uuid(), ce.slug, ce.equipment_type, ce.default_stack
FROM core_equipment ce
LEFT JOIN public.equipment e ON e.slug = ce.slug
WHERE e.id IS NULL;

-- 2) Resolve helper IDs
WITH owner AS (
  -- choose any existing user as the canonical owner (earliest created)
  SELECT id AS owner_user_id
  FROM auth.users
  ORDER BY created_at NULLS LAST, id
  LIMIT 1
),
equip AS (
  SELECT slug, id AS equipment_id
  FROM public.equipment
  WHERE slug IN ('barbell','dumbbell','cable','machine','bodyweight')
),
-- 3) Candidate exercises (name, primary_muscle_en_name, equipment_slug, body_part_text, popularity_rank)
candidates(name, primary_muscle, eq_slug, body_part, popularity_rank) AS (
  VALUES
  -- CHEST
  ('Barbell Bench Press',           'Pectoralis Major',      'barbell',   'chest',    1),
  ('Dumbbell Bench Press',          'Pectoralis Major',      'dumbbell',  'chest',    2),
  ('Incline Dumbbell Press',        'Pectoralis Major',      'dumbbell',  'chest',    3),
  ('Cable Fly',                     'Pectoralis Major',      'cable',     'chest',    4),

  -- BACK / LATS
  ('Barbell Row',                   'Latissimus Dorsi',      'barbell',   'back',     1),
  ('Lat Pulldown',                  'Latissimus Dorsi',      'machine',   'back',     2),
  ('Seated Cable Row',              'Latissimus Dorsi',      'cable',     'back',     3),
  ('Pull-Up',                       'Latissimus Dorsi',      'bodyweight','back',     4),

  -- SHOULDERS / DELTS
  ('Overhead Press',                'Deltoid (Anterior)',    'barbell',   'shoulders', 1),
  ('Dumbbell Shoulder Press',       'Deltoid (Anterior)',    'dumbbell',  'shoulders', 2),
  ('Dumbbell Lateral Raise',        'Deltoid (Lateral)',     'dumbbell',  'shoulders', 3),
  ('Reverse Pec Deck',              'Deltoid (Posterior)',   'machine',   'shoulders', 4),

  -- BICEPS
  ('Barbell Curl',                  'Biceps Brachii',        'barbell',   'arms',     1),
  ('Dumbbell Curl',                 'Biceps Brachii',        'dumbbell',  'arms',     2),
  ('Hammer Curl',                   'Brachialis',            'dumbbell',  'arms',     3),

  -- TRICEPS
  ('Triceps Pushdown',              'Triceps Brachii',       'cable',     'arms',     1),
  ('Lying Triceps Extension',       'Triceps Brachii',       'barbell',   'arms',     2),

  -- QUADS / HAMS / GLUTES / CALVES
  ('Back Squat',                    'Quadriceps',            'barbell',   'legs',     1),
  ('Leg Press',                     'Quadriceps',            'machine',   'legs',     2),
  ('Romanian Deadlift',             'Hamstrings',            'barbell',   'legs',     1),
  ('Seated Leg Curl',               'Hamstrings',            'machine',   'legs',     2),
  ('Hip Thrust',                    'Gluteus Maximus',       'barbell',   'glutes',   1),
  ('Cable Glute Kickback',          'Gluteus Maximus',       'cable',     'glutes',   2),
  ('Standing Calf Raise',           'Gastrocnemius',         'machine',   'calves',   1),
  ('Seated Calf Raise',             'Soleus',                'machine',   'calves',   2),

  -- TRAPS / FOREARMS
  ('Barbell Shrug',                 'Trapezius (Upper)',     'barbell',   'back',     1),
  ('Wrist Curl',                    'Forearm Flexors',       'dumbbell',  'arms',     1),

  -- ABS / CORE
  ('Hanging Leg Raise',             'Rectus Abdominis',      'bodyweight','core',     1),
  ('Cable Crunch',                  'Rectus Abdominis',      'cable',     'core',     2),
  ('Plank',                         'Rectus Abdominis',      'bodyweight','core',     3)
),
muscle_lookup AS (
  -- Resolve primary_muscle_id by English muscle name in muscles_translations.
  SELECT
    mt.name                                      AS primary_muscle,
    mt.muscle_id                                 AS primary_muscle_id
  FROM public.muscles_translations mt
  WHERE mt.language_code = 'en'
),
resolved AS (
  SELECT
    c.name,
    c.body_part,
    c.popularity_rank,
    ml.primary_muscle_id,
    e.equipment_id
  FROM candidates c
  LEFT JOIN muscle_lookup ml ON lower(ml.primary_muscle) = lower(c.primary_muscle)
  LEFT JOIN equip e          ON e.slug = c.eq_slug
)
INSERT INTO public.exercises
  (id, owner_user_id, name, slug, description, is_public, image_url, thumbnail_url,
   source_url, popularity_rank, body_part, body_part_id, primary_muscle_id, equipment_id,
   secondary_muscle_group_ids, default_grip_ids, capability_schema, movement_pattern,
   exercise_skill_level, complexity_score, contraindications)
SELECT
  gen_random_uuid(),
  (SELECT owner_user_id FROM owner),
  r.name,
  regexp_replace(lower(r.name), '\s+', '-', 'g'),           -- slug
  NULL,                                                     -- description
  TRUE,                                                     -- is_public
  NULL, NULL, NULL,                                         -- images/source
  r.popularity_rank,
  r.body_part,                                              -- simple text tag; optional
  NULL,                                                     -- body_part_id (can be backfilled later if desired)
  r.primary_muscle_id,
  r.equipment_id,
  NULL,                                                     -- secondary_muscle_group_ids
  '{}'::uuid[],                                             -- default_grip_ids
  '{}'::jsonb,                                              -- capability_schema
  NULL,                                                     -- movement_pattern (enum) - leave null for safety
  'medium'::exercise_skill_level,                           -- default aligns with schema default
  3,                                                        -- complexity_score default
  '[]'::jsonb                                               -- contraindications
FROM resolved r
WHERE r.equipment_id IS NOT NULL
  AND r.primary_muscle_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.exercises e WHERE lower(e.name) = lower(r.name)
  );