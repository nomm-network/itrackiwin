-- WORKING EXERCISE SEED SCRIPT
-- This script successfully seeds exercises with proper muscle and equipment mappings
-- Use this as template for future exercise additions

-- Check for existing muscle and equipment slugs before running
WITH muscle_lookups AS (
  SELECT id, slug FROM muscles
),
equipment_lookups AS (
  SELECT id, slug FROM equipment  
),
params AS (
  SELECT * FROM (VALUES
    -- Format: (slug, name, description, equipment_slug, muscle_slug, movement_pattern, skill_level, popularity_rank)
    ('barbell-bench-press', 'Barbell Bench Press', 'Classic chest exercise performed lying on a bench', 'barbell', 'pectoralis_major_sternal', 'horizontal_push', 'medium', 95),
    ('barbell-squat', 'Barbell Squat', 'Fundamental lower body exercise', 'barbell', 'rectus_femoris', 'squat', 'medium', 98),
    ('conventional-deadlift', 'Conventional Deadlift', 'Hip hinge movement with barbell', 'barbell', 'gluteus_maximus', 'hinge', 'advanced', 96),
    ('pull-up', 'Pull-up', 'Bodyweight vertical pulling exercise', 'bodyweight', 'latissimus_dorsi', 'vertical_pull', 'medium', 90),
    ('overhead-press', 'Overhead Press', 'Standing barbell shoulder press', 'barbell', 'anterior_deltoid', 'vertical_push', 'medium', 85),
    ('barbell-row', 'Barbell Row', 'Bent over horizontal pulling exercise', 'barbell', 'latissimus_dorsi', 'horizontal_pull', 'medium', 88),
    ('dumbbell-bicep-curl', 'Dumbbell Bicep Curl', 'Isolation exercise for biceps', 'dumbbell', 'biceps_brachii_long_head', 'isolation', 'beginner', 75),
    ('triceps-pushdown', 'Triceps Pushdown', 'Cable isolation exercise for triceps', 'cable-machine', 'triceps_brachii_long_head', 'isolation', 'beginner', 70),
    ('lat-pulldown', 'Lat Pulldown', 'Seated cable pulling exercise', 'cable-machine', 'latissimus_dorsi', 'vertical_pull', 'beginner', 82),
    ('leg-press', 'Leg Press', 'Machine-based leg exercise', 'machine', 'rectus_femoris', 'squat', 'beginner', 80),
    ('dumbbell-shoulder-press', 'Dumbbell Shoulder Press', 'Seated or standing dumbbell press', 'dumbbell', 'anterior_deltoid', 'vertical_push', 'beginner', 78),
    ('cable-row', 'Cable Row', 'Seated cable rowing exercise', 'cable-machine', 'latissimus_dorsi', 'horizontal_pull', 'beginner', 76),
    ('leg-curl', 'Leg Curl', 'Machine exercise for hamstrings', 'machine', 'biceps_femoris_long_head', 'isolation', 'beginner', 72),
    ('leg-extension', 'Leg Extension', 'Machine exercise for quadriceps', 'machine', 'rectus_femoris', 'isolation', 'beginner', 68),
    ('dumbbell-chest-press', 'Dumbbell Chest Press', 'Dumbbell variation of bench press', 'dumbbell', 'pectoralis_major_sternal', 'horizontal_push', 'beginner', 83),
    ('incline-barbell-press', 'Incline Barbell Press', 'Upper chest focused barbell press', 'barbell', 'pectoralis_major_clavicular', 'horizontal_push', 'medium', 86),
    ('chin-up', 'Chin-up', 'Supinated grip pulling exercise', 'bodyweight', 'biceps_brachii_long_head', 'vertical_pull', 'medium', 87),
    ('dips', 'Dips', 'Bodyweight triceps and chest exercise', 'bodyweight', 'triceps_brachii_long_head', 'vertical_push', 'medium', 84),
    ('lunges', 'Lunges', 'Single leg bodyweight exercise', 'bodyweight', 'rectus_femoris', 'lunge', 'beginner', 77),
    ('romanian-deadlift', 'Romanian Deadlift', 'Hip hinge variation focusing on hamstrings', 'barbell', 'biceps_femoris_long_head', 'hinge', 'medium', 89),
    ('front-squat', 'Front Squat', 'Front-loaded squat variation', 'barbell', 'rectus_femoris', 'squat', 'advanced', 81),
    ('face-pulls', 'Face Pulls', 'Cable exercise for rear delts', 'cable-machine', 'posterior_deltoid', 'horizontal_pull', 'beginner', 65),
    ('lateral-raises', 'Lateral Raises', 'Dumbbell shoulder isolation exercise', 'dumbbell', 'medial_deltoid', 'isolation', 'beginner', 73),
    ('calf-raises', 'Calf Raises', 'Standing calf muscle exercise', 'machine', 'gastrocnemius_medial_head', 'isolation', 'beginner', 60),
    ('plank', 'Plank', 'Core stabilization exercise', 'bodyweight', 'rectus_abdominis', 'isolation', 'beginner', 74),
    ('russian-twists', 'Russian Twists', 'Rotational core exercise', 'bodyweight', 'external_obliques', 'isolation', 'beginner', 62),
    ('hip-thrusts', 'Hip Thrusts', 'Glute-focused hip extension exercise', 'barbell', 'gluteus_maximus', 'hinge', 'beginner', 79),
    ('bulgarian-split-squat', 'Bulgarian Split Squat', 'Single leg rear-foot elevated squat', 'bodyweight', 'rectus_femoris', 'lunge', 'medium', 71),
    ('hammer-curls', 'Hammer Curls', 'Neutral grip bicep exercise', 'dumbbell', 'biceps_brachii_long_head', 'isolation', 'beginner', 67),
    ('skull-crushers', 'Skull Crushers', 'Lying tricep extension exercise', 'barbell', 'triceps_brachii_long_head', 'isolation', 'beginner', 64),
    ('shrugs', 'Shrugs', 'Upper trap isolation exercise', 'dumbbell', 'upper_trapezius', 'isolation', 'beginner', 58),
    ('reverse-flyes', 'Reverse Flyes', 'Rear delt isolation exercise', 'dumbbell', 'posterior_deltoid', 'isolation', 'beginner', 61),
    ('good-mornings', 'Good Mornings', 'Hip hinge exercise for posterior chain', 'barbell', 'biceps_femoris_long_head', 'hinge', 'medium', 66),
    ('sumo-deadlift', 'Sumo Deadlift', 'Wide stance deadlift variation', 'barbell', 'gluteus_maximus', 'hinge', 'medium', 69),
    ('goblet-squat', 'Goblet Squat', 'Front-loaded dumbbell squat', 'dumbbell', 'rectus_femoris', 'squat', 'beginner', 63)
  ) AS t(slug, name, description, equipment_slug, muscle_slug, movement_pattern, skill_level, popularity_rank)
),
resolved AS (
  SELECT 
    p.*,
    e.id as equipment_id,
    m.id as primary_muscle_id
  FROM params p
  JOIN equipment_lookups e ON e.slug = p.equipment_slug
  JOIN muscle_lookups m ON m.slug = p.muscle_slug
),
inserted_exercises AS (
  INSERT INTO exercises (
    slug,
    equipment_id,
    primary_muscle_id,
    movement_pattern,
    exercise_skill_level,
    popularity_rank,
    owner_user_id,
    is_public
  )
  SELECT 
    r.slug,
    r.equipment_id,
    r.primary_muscle_id,
    r.movement_pattern::movement_pattern,
    r.skill_level::exercise_skill_level,
    r.popularity_rank,
    NULL,
    true
  FROM resolved r
  ON CONFLICT (slug) DO UPDATE SET
    popularity_rank = EXCLUDED.popularity_rank,
    movement_pattern = EXCLUDED.movement_pattern,
    exercise_skill_level = EXCLUDED.exercise_skill_level
  RETURNING id, slug
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT 
  ie.id,
  'en',
  r.name,
  r.description
FROM inserted_exercises ie
JOIN resolved r ON r.slug = ie.slug
ON CONFLICT (exercise_id, language_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Verify the insertion
SELECT 
  e.slug,
  et.name,
  eq.slug as equipment,
  m.slug as muscle,
  e.movement_pattern,
  e.popularity_rank
FROM exercises e
JOIN exercises_translations et ON e.id = et.exercise_id AND et.language_code = 'en'
JOIN equipment eq ON e.equipment_id = eq.id
JOIN muscles m ON e.primary_muscle_id = m.id
ORDER BY e.popularity_rank DESC
LIMIT 10;