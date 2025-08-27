-- BATCH 2 EXERCISE SEED SCRIPT - FINAL CORRECTED VERSION
-- Fixed equipment slugs to match database

WITH muscle_lookups AS (
  SELECT id, slug FROM muscles
),
equipment_lookups AS (
  SELECT id, slug FROM equipment  
),
params AS (
  SELECT * FROM (VALUES
    -- Format: (slug, name, description, equipment_slug, muscle_slug, movement_pattern, skill_level, popularity_rank)
    
    -- CABLE EXERCISES (using 'cable' instead of 'cable-machine')
    ('cable-fly', 'Cable Fly', 'Chest isolation using cables with steady tension across ROM', 'cable', 'pectoralis_major_sternal', 'isolation', 'low', 76),
    ('seated-cable-row', 'Seated Cable Row', 'Horizontal pull at cable row station targeting mid-back', 'cable', 'latissimus_dorsi', 'horizontal_pull', 'low', 78),
    ('straight-arm-pulldown', 'Straight-Arm Pulldown', 'Lat-focused cable pulldown with straight arms', 'cable', 'latissimus_dorsi', 'isolation', 'low', 72),
    ('face-pulls', 'Face Pulls', 'High cable pull to face, great for rear delts and posture', 'cable', 'posterior_deltoid', 'horizontal_pull', 'low', 71),
    ('rear-delt-fly', 'Rear Delt Fly', 'Cable reverse fly to target posterior deltoids', 'cable', 'posterior_deltoid', 'isolation', 'low', 68),
    ('cable-curl', 'Cable Curl', 'Standing cable curl for constant tension bicep development', 'cable', 'biceps_brachii_long_head', 'isolation', 'low', 63),
    ('triceps-rope-pushdown', 'Triceps Rope Pushdown', 'Cable pushdown using rope attachment for triceps isolation', 'cable', 'triceps_long_head', 'isolation', 'low', 72),
    ('overhead-triceps-extension', 'Overhead Triceps Extension', 'Cable overhead extension for triceps long head emphasis', 'cable', 'triceps_long_head', 'isolation', 'low', 67),
    ('cable-glute-kickback', 'Cable Glute Kickback', 'Cable kickback using ankle strap for glute isolation', 'cable', 'gluteus_maximus', 'isolation', 'low', 64),
    ('cable-hip-abduction', 'Cable Hip Abduction', 'Standing hip abduction with cable for glute medius', 'cable', 'gluteus_medius', 'isolation', 'low', 61),
    ('cable-wood-chops', 'Cable Wood Chops', 'Rotational cable exercise for functional core strength', 'cable', 'external_obliques', 'isolation', 'low', 60),
    ('cable-crunch', 'Cable Crunch', 'Kneeling cable crunch emphasizing rectus abdominis with load', 'cable', 'rectus_abdominis', 'isolation', 'low', 66)
    
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
  ON CONFLICT (slug) DO NOTHING
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