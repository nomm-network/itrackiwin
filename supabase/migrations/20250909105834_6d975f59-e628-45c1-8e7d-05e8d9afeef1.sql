-- Add 16 Common Exercises for Hamstrings, Chest, Shoulders, and Triceps
-- Based on research of most effective exercises for each muscle group

WITH exercise_data AS (
  SELECT * FROM (VALUES
    -- HAMSTRING EXERCISES (4 exercises)
    ('romanian-deadlift', (SELECT id FROM equipment WHERE slug = 'barbell'), (SELECT id FROM muscles WHERE slug = 'biceps_femoris'), 'medium', 92, 'Romanian Deadlift'),
    ('lying-leg-curl', (SELECT id FROM equipment WHERE slug = 'leg-curl-machine'), (SELECT id FROM muscles WHERE slug = 'biceps_femoris'), 'low', 85, 'Lying Leg Curl'),
    ('nordic-hamstring-curl', (SELECT id FROM equipment WHERE slug = 'assisted-pullup-dip-machine'), (SELECT id FROM muscles WHERE slug = 'biceps_femoris'), 'high', 88, 'Nordic Hamstring Curl'),
    ('stiff-leg-deadlift', (SELECT id FROM equipment WHERE slug = 'dumbbell'), (SELECT id FROM muscles WHERE slug = 'biceps_femoris'), 'medium', 86, 'Stiff Leg Deadlift'),
    
    -- CHEST EXERCISES (4 exercises)
    ('barbell-bench-press', (SELECT id FROM equipment WHERE slug = 'barbell'), (SELECT id FROM muscles WHERE slug = 'mid_chest'), 'medium', 95, 'Barbell Bench Press'),
    ('dumbbell-flyes', (SELECT id FROM equipment WHERE slug = 'dumbbell'), (SELECT id FROM muscles WHERE slug = 'mid_chest'), 'low', 82, 'Dumbbell Flyes'),
    ('incline-dumbbell-press', (SELECT id FROM equipment WHERE slug = 'dumbbell'), (SELECT id FROM muscles WHERE slug = 'upper_chest'), 'medium', 89, 'Incline Dumbbell Press'),
    ('cable-crossover', (SELECT id FROM equipment WHERE slug = 'cable-machine'), (SELECT id FROM muscles WHERE slug = 'mid_chest'), 'low', 78, 'Cable Crossover'),
    
    -- SHOULDER EXERCISES (4 exercises)
    ('dumbbell-shoulder-press', (SELECT id FROM equipment WHERE slug = 'dumbbell'), (SELECT id FROM muscles WHERE slug = 'front_delts'), 'low', 87, 'Dumbbell Shoulder Press'),
    ('lateral-raises', (SELECT id FROM equipment WHERE slug = 'dumbbell'), (SELECT id FROM muscles WHERE slug = 'side_delts'), 'low', 83, 'Lateral Raises'),
    ('rear-delt-flyes', (SELECT id FROM equipment WHERE slug = 'dumbbell'), (SELECT id FROM muscles WHERE slug = 'rear_delts'), 'low', 75, 'Rear Delt Flyes'),
    ('upright-rows', (SELECT id FROM equipment WHERE slug = 'barbell'), (SELECT id FROM muscles WHERE slug = 'side_delts'), 'medium', 79, 'Upright Rows'),
    
    -- TRICEPS EXERCISES (4 exercises)
    ('close-grip-bench-press', (SELECT id FROM equipment WHERE slug = 'barbell'), (SELECT id FROM muscles WHERE slug = 'triceps_long_head'), 'medium', 84, 'Close-Grip Bench Press'),
    ('tricep-dips', (SELECT id FROM equipment WHERE slug = 'assisted-pullup-dip-machine'), (SELECT id FROM muscles WHERE slug = 'triceps_long_head'), 'medium', 88, 'Tricep Dips'),
    ('overhead-tricep-extension', (SELECT id FROM equipment WHERE slug = 'dumbbell'), (SELECT id FROM muscles WHERE slug = 'triceps_long_head'), 'low', 81, 'Overhead Tricep Extension'),
    ('tricep-pushdown', (SELECT id FROM equipment WHERE slug = 'cable-machine'), (SELECT id FROM muscles WHERE slug = 'triceps_lateral_head'), 'low', 86, 'Tricep Pushdown')
  ) AS t(slug, equipment_id, primary_muscle_id, skill_level, popularity_rank, display_name)
)
INSERT INTO exercises (
  slug,
  equipment_id,
  primary_muscle_id,
  exercise_skill_level,
  popularity_rank,
  display_name,
  owner_user_id,
  is_public,
  configured
)
SELECT 
  ed.slug,
  ed.equipment_id,
  ed.primary_muscle_id,
  ed.skill_level::exercise_skill_level,
  ed.popularity_rank,
  ed.display_name,
  NULL,
  true,
  true
FROM exercise_data ed
ON CONFLICT (slug) DO UPDATE SET
  popularity_rank = EXCLUDED.popularity_rank,
  exercise_skill_level = EXCLUDED.exercise_skill_level,
  display_name = EXCLUDED.display_name;