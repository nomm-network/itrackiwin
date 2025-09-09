-- Add 16 Common Exercises for Hamstrings, Chest, Shoulders, and Triceps
-- Updated to use proper movement patterns and muscle group relationships

WITH exercise_data AS (
  SELECT * FROM (VALUES
    -- HAMSTRING EXERCISES (4 exercises)
    ('romanian-deadlift', 
     (SELECT id FROM equipment WHERE slug = 'barbell'),
     (SELECT id FROM muscle_groups WHERE slug = 'hamstrings'),
     (SELECT id FROM movements WHERE slug = 'rdl'),
     'medium', 92, 'Romanian Deadlift'),
    
    ('lying-leg-curl', 
     (SELECT id FROM equipment WHERE slug = 'leg-curl-machine'),
     (SELECT id FROM muscle_groups WHERE slug = 'hamstrings'),
     (SELECT id FROM movements WHERE slug = 'curl'),
     'low', 85, 'Lying Leg Curl'),
    
    ('nordic-hamstring-curl', 
     (SELECT id FROM equipment WHERE slug = 'assisted-pullup-dip-machine'),
     (SELECT id FROM muscle_groups WHERE slug = 'hamstrings'),
     (SELECT id FROM movements WHERE slug = 'curl'),
     'high', 88, 'Nordic Hamstring Curl'),
    
    ('stiff-leg-deadlift', 
     (SELECT id FROM equipment WHERE slug = 'dumbbell'),
     (SELECT id FROM muscle_groups WHERE slug = 'hamstrings'),
     (SELECT id FROM movements WHERE slug = 'deadlift'),
     'medium', 86, 'Stiff Leg Deadlift'),
    
    -- CHEST EXERCISES (4 exercises) 
    ('barbell-bench-press', 
     (SELECT id FROM equipment WHERE slug = 'barbell'),
     (SELECT id FROM muscle_groups WHERE slug = 'chest'),
     (SELECT id FROM movements WHERE slug = 'horizontal_push'),
     'medium', 95, 'Barbell Bench Press'),
    
    ('dumbbell-flyes', 
     (SELECT id FROM equipment WHERE slug = 'dumbbell'),
     (SELECT id FROM muscle_groups WHERE slug = 'chest'),
     (SELECT id FROM movements WHERE slug = 'fly'),
     'low', 82, 'Dumbbell Flyes'),
    
    ('incline-dumbbell-press', 
     (SELECT id FROM equipment WHERE slug = 'dumbbell'),
     (SELECT id FROM muscle_groups WHERE slug = 'chest'),
     (SELECT id FROM movements WHERE slug = 'vertical_push'),
     'medium', 89, 'Incline Dumbbell Press'),
    
    ('cable-crossover', 
     (SELECT id FROM equipment WHERE slug = 'cable-machine'),
     (SELECT id FROM muscle_groups WHERE slug = 'chest'),
     (SELECT id FROM movements WHERE slug = 'fly'),
     'low', 78, 'Cable Crossover'),
    
    -- SHOULDER EXERCISES (4 exercises)
    ('dumbbell-shoulder-press', 
     (SELECT id FROM equipment WHERE slug = 'dumbbell'),
     (SELECT id FROM muscle_groups WHERE slug = 'shoulders'),
     (SELECT id FROM movements WHERE slug = 'vertical_push'),
     'low', 87, 'Dumbbell Shoulder Press'),
    
    ('lateral-raises', 
     (SELECT id FROM equipment WHERE slug = 'dumbbell'),
     (SELECT id FROM muscle_groups WHERE slug = 'shoulders'),
     (SELECT id FROM movements WHERE slug = 'lateral_raise'),
     'low', 83, 'Lateral Raises'),
    
    ('rear-delt-flyes', 
     (SELECT id FROM equipment WHERE slug = 'dumbbell'),
     (SELECT id FROM muscle_groups WHERE slug = 'shoulders'),
     (SELECT id FROM movements WHERE slug = 'raise'),
     'low', 75, 'Rear Delt Flyes'),
    
    ('upright-rows', 
     (SELECT id FROM equipment WHERE slug = 'barbell'),
     (SELECT id FROM muscle_groups WHERE slug = 'shoulders'),
     (SELECT id FROM movements WHERE slug = 'row'),
     'medium', 79, 'Upright Rows'),
    
    -- TRICEPS EXERCISES (4 exercises)
    ('close-grip-bench-press', 
     (SELECT id FROM equipment WHERE slug = 'barbell'),
     (SELECT id FROM muscle_groups WHERE slug = 'triceps'),
     (SELECT id FROM movements WHERE slug = 'horizontal_push'),
     'medium', 84, 'Close-Grip Bench Press'),
    
    ('tricep-dips', 
     (SELECT id FROM equipment WHERE slug = 'assisted-pullup-dip-machine'),
     (SELECT id FROM muscle_groups WHERE slug = 'triceps'),
     (SELECT id FROM movements WHERE slug = 'dip'),
     'medium', 88, 'Tricep Dips'),
    
    ('overhead-tricep-extension', 
     (SELECT id FROM equipment WHERE slug = 'dumbbell'),
     (SELECT id FROM muscle_groups WHERE slug = 'triceps'),
     (SELECT id FROM movements WHERE slug = 'extension'),
     'low', 81, 'Overhead Tricep Extension'),
    
    ('tricep-pushdown', 
     (SELECT id FROM equipment WHERE slug = 'cable-machine'),
     (SELECT id FROM muscle_groups WHERE slug = 'triceps'),
     (SELECT id FROM movements WHERE slug = 'extension'),
     'low', 86, 'Tricep Pushdown')
  ) AS t(slug, equipment_id, primary_muscle_id, movement_id, skill_level, popularity_rank, display_name)
)
INSERT INTO exercises (
  slug,
  equipment_id,
  primary_muscle_id,
  movement_id,
  exercise_skill_level,
  popularity_rank,
  display_name,
  owner_user_id,
  is_public,
  configured,
  created_at
)
SELECT 
  ed.slug,
  ed.equipment_id,
  ed.primary_muscle_id,
  ed.movement_id,
  ed.skill_level::exercise_skill_level,
  ed.popularity_rank,
  ed.display_name,
  NULL,
  true,
  true,
  now()
FROM exercise_data ed
WHERE NOT EXISTS (
  SELECT 1 FROM exercises WHERE slug = ed.slug
)
ON CONFLICT (slug) DO UPDATE SET
  popularity_rank = EXCLUDED.popularity_rank,
  exercise_skill_level = EXCLUDED.exercise_skill_level,
  display_name = EXCLUDED.display_name,
  movement_id = EXCLUDED.movement_id;