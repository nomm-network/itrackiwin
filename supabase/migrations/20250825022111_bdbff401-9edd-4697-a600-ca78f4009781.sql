-- Insert all exercises with correct muscle mapping
WITH owner AS (
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
-- Updated candidates with correct muscle names from the database
candidates(name, primary_muscle, eq_slug, body_part, popularity_rank) AS (
  VALUES
  -- CHEST
  ('Barbell Bench Press',           'Pectoralis Major Sternal',     'barbell',   'chest',    1),
  ('Dumbbell Bench Press',          'Pectoralis Major Sternal',     'dumbbell',  'chest',    2),
  ('Incline Dumbbell Press',        'Pectoralis Major Clavicular',  'dumbbell',  'chest',    3),
  ('Cable Fly',                     'Pectoralis Major Sternal',     'cable',     'chest',    4),

  -- BACK / LATS
  ('Barbell Row',                   'Latissimus Dorsi',      'barbell',   'back',     1),
  ('Lat Pulldown',                  'Latissimus Dorsi',      'machine',   'back',     2),
  ('Seated Cable Row',              'Latissimus Dorsi',      'cable',     'back',     3),
  ('Pull-Up',                       'Latissimus Dorsi',      'bodyweight','back',     4),

  -- SHOULDERS / DELTS
  ('Overhead Press',                'Anterior Deltoid',      'barbell',   'shoulders', 1),
  ('Dumbbell Shoulder Press',       'Anterior Deltoid',      'dumbbell',  'shoulders', 2),
  ('Dumbbell Lateral Raise',        'Lateral Deltoid',       'dumbbell',  'shoulders', 3),
  ('Reverse Pec Deck',              'Posterior Deltoid',     'machine',   'shoulders', 4),

  -- BICEPS
  ('Barbell Curl',                  'Biceps Brachii Long Head',     'barbell',   'arms',     1),
  ('Dumbbell Curl',                 'Biceps Brachii Long Head',     'dumbbell',  'arms',     2),
  ('Hammer Curl',                   'Brachialis',            'dumbbell',  'arms',     3),

  -- TRICEPS
  ('Triceps Pushdown',              'Triceps Long Head',     'cable',     'arms',     1),
  ('Lying Triceps Extension',       'Triceps Long Head',     'barbell',   'arms',     2),

  -- QUADS / HAMS / GLUTES / CALVES
  ('Back Squat',                    'Rectus Femoris',        'barbell',   'legs',     1),
  ('Leg Press',                     'Rectus Femoris',        'machine',   'legs',     2),
  ('Romanian Deadlift',             'Biceps Femoris',        'barbell',   'legs',     3),
  ('Seated Leg Curl',               'Biceps Femoris',        'machine',   'legs',     4),
  ('Hip Thrust',                    'Gluteus Maximus',       'barbell',   'glutes',   1),
  ('Cable Glute Kickback',          'Gluteus Maximus',       'cable',     'glutes',   2),
  ('Standing Calf Raise',           'Gastrocnemius Medial',  'machine',   'calves',   1),
  ('Seated Calf Raise',             'Soleus',                'machine',   'calves',   2),

  -- TRAPS / FOREARMS
  ('Barbell Shrug',                 'Upper Trapezius',       'barbell',   'back',     5),
  ('Wrist Curl',                    'Wrist Flexors',         'dumbbell',  'arms',     4),

  -- ABS / CORE
  ('Hanging Leg Raise',             'Rectus Abdominis',      'bodyweight','core',     1),
  ('Cable Crunch',                  'Rectus Abdominis',      'cable',     'core',     2),
  ('Plank',                         'Rectus Abdominis',      'bodyweight','core',     3)
),
muscle_lookup AS (
  SELECT
    mt.name AS primary_muscle,
    mt.muscle_id AS primary_muscle_id
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
  LEFT JOIN muscle_lookup ml ON ml.primary_muscle = c.primary_muscle
  LEFT JOIN equip e ON e.slug = c.eq_slug
)
INSERT INTO public.exercises
  (id, owner_user_id, name, description, is_public, image_url, thumbnail_url,
   source_url, popularity_rank, body_part, body_part_id, primary_muscle_id, equipment_id,
   secondary_muscle_group_ids, default_grip_ids, capability_schema, movement_pattern,
   exercise_skill_level, complexity_score, contraindications)
SELECT
  gen_random_uuid(),
  (SELECT owner_user_id FROM owner),
  r.name,
  NULL,
  TRUE,
  NULL, NULL, NULL,
  r.popularity_rank,
  r.body_part,
  NULL,
  r.primary_muscle_id,
  r.equipment_id,
  NULL,
  '{}'::uuid[],
  '{}'::jsonb,
  NULL,
  'medium'::exercise_skill_level,
  3,
  '[]'::jsonb
FROM resolved r
WHERE r.equipment_id IS NOT NULL
  AND r.primary_muscle_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.exercises e WHERE lower(e.name) = lower(r.name)
  );