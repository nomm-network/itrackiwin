-- Replace hamstring exercises with quadriceps exercises
-- Keep chest, shoulders, and triceps as requested

-- Insert/update quadriceps exercises (replacing hamstrings)
WITH movement_lookup AS (
  SELECT id, slug FROM movements
),
muscle_lookup AS (
  SELECT id, slug FROM muscle_groups
),
equipment_lookup AS (
  SELECT id, slug FROM equipment
),
exercise_data AS (
  SELECT * FROM (VALUES
    -- QUADRICEPS EXERCISES (4)
    ('barbell-back-squat', 'squat', 'quadriceps', 'barbell', 'Barbell Back Squat'),
    ('leg-press', 'squat', 'quadriceps', 'machine', 'Leg Press'),
    ('bulgarian-split-squat', 'lunge', 'quadriceps', 'bodyweight', 'Bulgarian Split Squat'),
    ('front-squat', 'squat', 'quadriceps', 'barbell', 'Front Squat'),
    
    -- CHEST EXERCISES (4) 
    ('barbell-bench-press', 'horizontal_push', 'chest', 'barbell', 'Barbell Bench Press'),
    ('dumbbell-bench-press', 'horizontal_push', 'chest', 'dumbbell', 'Dumbbell Bench Press'),
    ('incline-barbell-press', 'horizontal_push', 'chest', 'barbell', 'Incline Barbell Press'),
    ('dips', 'vertical_push', 'chest', 'bodyweight', 'Dips'),
    
    -- SHOULDERS EXERCISES (4)
    ('overhead-press', 'vertical_push', 'shoulders', 'barbell', 'Overhead Press'),
    ('dumbbell-shoulder-press', 'vertical_push', 'shoulders', 'dumbbell', 'Dumbbell Shoulder Press'),
    ('lateral-raises', 'isolation', 'shoulders', 'dumbbell', 'Lateral Raises'),
    ('face-pulls', 'horizontal_pull', 'shoulders', 'cable-machine', 'Face Pulls'),
    
    -- TRICEPS EXERCISES (4)
    ('triceps-pushdown', 'isolation', 'triceps', 'cable-machine', 'Triceps Pushdown'),
    ('close-grip-bench-press', 'horizontal_push', 'triceps', 'barbell', 'Close Grip Bench Press'),
    ('skull-crushers', 'isolation', 'triceps', 'barbell', 'Skull Crushers'),
    ('overhead-tricep-extension', 'isolation', 'triceps', 'dumbbell', 'Overhead Tricep Extension')
  ) AS t(slug, movement_slug, muscle_slug, equipment_slug, display_name)
),
resolved_data AS (
  SELECT 
    ed.slug,
    ed.display_name,
    m.id as movement_id,
    mg.id as primary_muscle_id,
    eq.id as equipment_ref_id
  FROM exercise_data ed
  JOIN movement_lookup m ON m.slug = ed.movement_slug
  JOIN muscle_lookup mg ON mg.slug = ed.muscle_slug
  JOIN equipment_lookup eq ON eq.slug = ed.equipment_slug
)
INSERT INTO exercises (
  slug,
  display_name,
  movement_id,
  primary_muscle_id,
  equipment_ref_id,
  is_public,
  owner_user_id,
  popularity_rank,
  exercise_skill_level
)
SELECT 
  rd.slug,
  rd.display_name,
  rd.movement_id,
  rd.primary_muscle_id,
  rd.equipment_ref_id,
  true,
  NULL,
  (50 + (ROW_NUMBER() OVER (ORDER BY rd.slug))),
  'medium'::exercise_skill_level
FROM resolved_data rd
ON CONFLICT (slug) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  movement_id = EXCLUDED.movement_id,
  primary_muscle_id = EXCLUDED.primary_muscle_id,
  equipment_ref_id = EXCLUDED.equipment_ref_id,
  popularity_rank = EXCLUDED.popularity_rank;

-- Verify the exercises were inserted/updated
SELECT slug, display_name, 
       m.slug as movement, 
       mg.slug as muscle_group,
       eq.slug as equipment
FROM exercises e
LEFT JOIN movements m ON m.id = e.movement_id
LEFT JOIN muscle_groups mg ON mg.id = e.primary_muscle_id  
LEFT JOIN equipment eq ON eq.id = e.equipment_ref_id
WHERE e.slug IN (
  'barbell-back-squat', 'leg-press', 'bulgarian-split-squat', 'front-squat',
  'barbell-bench-press', 'dumbbell-bench-press', 'incline-barbell-press', 'dips',
  'overhead-press', 'dumbbell-shoulder-press', 'lateral-raises', 'face-pulls',
  'triceps-pushdown', 'close-grip-bench-press', 'skull-crushers', 'overhead-tricep-extension'
)
ORDER BY mg.slug, e.slug;