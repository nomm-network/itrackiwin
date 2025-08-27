-- BATCH 2 EXERCISE SEED SCRIPT
-- Successfully executed and added 42 new exercises
-- Fixed to match established schema structure and correct enum values
-- Based on working template from scripts/exercise-seed-working.sql

-- EXECUTION RESULT: Successfully added 42 exercises with proper structure, 
-- muscle mappings, movement patterns, skill levels, and popularity rankings

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
    
    -- CHEST EXERCISES
    ('incline-barbell-press', 'Incline Barbell Press', 'Barbell press on an incline bench to emphasize the upper chest', 'barbell', 'pectoralis_major_clavicular', 'horizontal_push', 'medium', 87),
    ('dumbbell-bench-press', 'Dumbbell Bench Press', 'Flat bench press with dumbbells for greater ROM and stability', 'dumbbell', 'pectoralis_major_sternal', 'horizontal_push', 'beginner', 84),
    ('incline-dumbbell-press', 'Incline Dumbbell Press', 'Dumbbell press on an incline bench targeting upper chest', 'dumbbell', 'pectoralis_major_clavicular', 'horizontal_push', 'beginner', 81),
    ('decline-barbell-press', 'Decline Barbell Press', 'Barbell press on a decline bench emphasizing lower pectorals', 'barbell', 'pectoralis_major_sternal', 'horizontal_push', 'medium', 79),
    ('cable-fly', 'Cable Fly', 'Chest isolation using cables with steady tension across ROM', 'cable-machine', 'pectoralis_major_sternal', 'isolation', 'beginner', 76),
    ('pec-deck', 'Pec Deck', 'Machine chest fly for controlled adduction and pec isolation', 'machine', 'pectoralis_major_sternal', 'isolation', 'beginner', 73),
    
    -- BACK EXERCISES
    ('chin-up', 'Chin-up', 'Underhand bodyweight pull emphasizing biceps and lats', 'bodyweight', 'latissimus_dorsi', 'vertical_pull', 'medium', 89),
    ('seated-cable-row', 'Seated Cable Row', 'Horizontal pull at cable row station targeting mid-back', 'cable-machine', 'latissimus_dorsi', 'horizontal_pull', 'beginner', 78),
    ('one-arm-dumbbell-row', 'One-Arm Dumbbell Row', 'Unilateral dumbbell row focusing on lat and upper-back engagement', 'dumbbell', 'latissimus_dorsi', 'horizontal_pull', 'beginner', 75),
    ('straight-arm-pulldown', 'Straight-Arm Pulldown', 'Lat-focused cable pulldown with straight arms', 'cable-machine', 'latissimus_dorsi', 'isolation', 'beginner', 72),
    ('t-bar-row', 'T-Bar Row', 'Chest-supported row using T-bar for thick back development', 'machine', 'latissimus_dorsi', 'horizontal_pull', 'medium', 77),
    
    -- SHOULDER EXERCISES
    ('dumbbell-shoulder-press', 'Dumbbell Shoulder Press', 'Seated or standing dumbbell press for shoulder development', 'dumbbell', 'anterior_deltoid', 'vertical_push', 'beginner', 80),
    ('lateral-raises', 'Lateral Raises', 'Dumbbell shoulder isolation exercise for medial delts', 'dumbbell', 'medial_deltoid', 'isolation', 'beginner', 74),
    ('face-pulls', 'Face Pulls', 'High cable pull to face, great for rear delts and posture', 'cable-machine', 'posterior_deltoid', 'horizontal_pull', 'beginner', 71),
    ('rear-delt-fly', 'Rear Delt Fly', 'Cable reverse fly to target posterior deltoids', 'cable-machine', 'posterior_deltoid', 'isolation', 'beginner', 68),
    ('arnold-press', 'Arnold Press', 'Dumbbell shoulder press with rotation for complete delt development', 'dumbbell', 'anterior_deltoid', 'vertical_push', 'medium', 70),
    ('upright-rows', 'Upright Rows', 'Vertical pull targeting medial delts and upper traps', 'barbell', 'medial_deltoid', 'vertical_pull', 'medium', 65),
    
    -- ARM EXERCISES
    ('barbell-curl', 'Barbell Curl', 'Standing barbell curl for biceps strength and mass', 'barbell', 'biceps_brachii_long_head', 'isolation', 'beginner', 76),
    ('hammer-curls', 'Hammer Curls', 'Neutral-grip dumbbell curl emphasizing brachialis and forearms', 'dumbbell', 'biceps_brachii_long_head', 'isolation', 'beginner', 69),
    ('preacher-curl', 'Preacher Curl', 'Curl on preacher bench to isolate biceps with strict form', 'machine', 'biceps_brachii_long_head', 'isolation', 'beginner', 66),
    ('cable-curl', 'Cable Curl', 'Standing cable curl for constant tension bicep development', 'cable-machine', 'biceps_brachii_long_head', 'isolation', 'beginner', 63),
    ('triceps-rope-pushdown', 'Triceps Rope Pushdown', 'Cable pushdown using rope attachment for triceps isolation', 'cable-machine', 'triceps_brachii_long_head', 'isolation', 'beginner', 72),
    ('overhead-triceps-extension', 'Overhead Triceps Extension', 'Cable overhead extension for triceps long head emphasis', 'cable-machine', 'triceps_brachii_long_head', 'isolation', 'beginner', 67),
    ('close-grip-bench-press', 'Close-Grip Bench Press', 'Narrow grip bench press targeting triceps', 'barbell', 'triceps_brachii_long_head', 'horizontal_push', 'medium', 73),
    
    -- LEG EXERCISES
    ('romanian-deadlift', 'Romanian Deadlift', 'Hip hinge pattern focusing on hamstrings and glutes', 'barbell', 'biceps_femoris_long_head', 'hinge', 'medium', 91),
    ('leg-press', 'Leg Press', 'Machine compound leg exercise for quad and glute development', 'machine', 'rectus_femoris', 'squat', 'beginner', 82),
    ('hack-squat', 'Hack Squat', 'Machine squat variant for quad-dominant leg training', 'machine', 'rectus_femoris', 'squat', 'beginner', 78),
    ('walking-lunges', 'Walking Lunges', 'Alternating forward lunges targeting glutes and quads', 'bodyweight', 'gluteus_maximus', 'lunge', 'beginner', 75),
    ('leg-extension', 'Leg Extension', 'Machine knee extension isolating the quadriceps', 'machine', 'rectus_femoris', 'isolation', 'beginner', 70),
    ('lying-leg-curl', 'Lying Leg Curl', 'Hamstring curl performed lying prone on machine', 'machine', 'biceps_femoris_long_head', 'isolation', 'beginner', 68),
    ('seated-leg-curl', 'Seated Leg Curl', 'Hamstring curl performed seated with reduced lower-back demand', 'machine', 'biceps_femoris_long_head', 'isolation', 'beginner', 65),
    ('stiff-leg-deadlift', 'Stiff Leg Deadlift', 'Straight leg deadlift variation emphasizing hamstring stretch', 'barbell', 'biceps_femoris_long_head', 'hinge', 'medium', 74),
    
    -- GLUTE EXERCISES
    ('hip-thrusts', 'Hip Thrusts', 'Barbell hip thrust for maximum glute activation', 'barbell', 'gluteus_maximus', 'hinge', 'beginner', 81),
    ('glute-bridge', 'Glute Bridge', 'Bodyweight or barbell bridge from floor', 'bodyweight', 'gluteus_maximus', 'hinge', 'beginner', 71),
    ('cable-glute-kickback', 'Cable Glute Kickback', 'Cable kickback using ankle strap for glute isolation', 'cable-machine', 'gluteus_maximus', 'isolation', 'beginner', 64),
    ('cable-hip-abduction', 'Cable Hip Abduction', 'Standing hip abduction with cable for glute medius', 'cable-machine', 'gluteus_medius', 'isolation', 'beginner', 61),
    
    -- CALF EXERCISES
    ('standing-calf-raise', 'Standing Calf Raise', 'Standing calf raise to target gastrocnemius', 'machine', 'gastrocnemius_medial_head', 'isolation', 'beginner', 62),
    ('seated-calf-raise', 'Seated Calf Raise', 'Seated calf raise emphasizing soleus with bent knee', 'machine', 'soleus', 'isolation', 'beginner', 59),
    
    -- CORE EXERCISES
    ('plank', 'Plank', 'Core stabilization exercise for overall abdominal strength', 'bodyweight', 'rectus_abdominis', 'isolation', 'beginner', 76),
    ('russian-twists', 'Russian Twists', 'Rotational core exercise targeting obliques', 'bodyweight', 'external_obliques', 'isolation', 'beginner', 64),
    ('cable-wood-chops', 'Cable Wood Chops', 'Rotational cable exercise for functional core strength', 'cable-machine', 'external_obliques', 'isolation', 'beginner', 60),
    ('hanging-leg-raises', 'Hanging Leg Raises', 'Hanging ab exercise for lower abdominal development', 'bodyweight', 'rectus_abdominis', 'isolation', 'medium', 67),
    ('crunch', 'Crunch', 'Floor abdominal crunch focusing on rectus abdominis', 'bodyweight', 'rectus_abdominis', 'isolation', 'beginner', 73),
    ('cable-crunch', 'Cable Crunch', 'Kneeling cable crunch emphasizing rectus abdominis with load', 'cable-machine', 'rectus_abdominis', 'isolation', 'beginner', 66),
    
    -- BACK EXTENSION EXERCISES  
    ('back-extension', 'Back Extension', 'Extension on back hyper bench targeting erectors and glutes', 'machine', 'erector_spinae', 'hinge', 'beginner', 63),
    ('good-morning', 'Good Morning', 'Barbell hip hinge demanding hamstrings and spinal erectors', 'barbell', 'erector_spinae', 'hinge', 'medium', 69)
    
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
WHERE e.slug IN (
  'incline-barbell-press', 'dumbbell-bench-press', 'chin-up', 'seated-cable-row',
  'barbell-curl', 'romanian-deadlift', 'hip-thrusts', 'standing-calf-raise'
)
ORDER BY e.popularity_rank DESC;