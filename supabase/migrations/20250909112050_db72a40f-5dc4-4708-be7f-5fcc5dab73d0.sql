-- First, create missing equipment entries and then add exercises
INSERT INTO equipment (slug, equipment_type) 
VALUES 
  ('machine', 'machine'),
  ('bodyweight', 'bodyweight')
ON CONFLICT (slug) DO NOTHING;

-- Get a basic equipment ID for fallback
WITH fallback_equipment AS (
  SELECT id FROM equipment WHERE slug = 'olympic-barbell' LIMIT 1
),
exercise_inserts AS (
  SELECT * FROM (VALUES
    ('barbell-back-squat', 'Barbell Back Squat'),
    ('leg-press', 'Leg Press'),  
    ('bulgarian-split-squat', 'Bulgarian Split Squat'),
    ('front-squat', 'Front Squat'),
    ('barbell-bench-press', 'Barbell Bench Press'),
    ('dumbbell-bench-press', 'Dumbbell Bench Press'),
    ('incline-barbell-press', 'Incline Barbell Press'),
    ('dips', 'Dips'),
    ('overhead-press', 'Overhead Press'),
    ('dumbbell-shoulder-press', 'Dumbbell Shoulder Press'),
    ('lateral-raises', 'Lateral Raises'),
    ('face-pulls', 'Face Pulls'),
    ('triceps-pushdown', 'Triceps Pushdown'),
    ('close-grip-bench-press', 'Close Grip Bench Press'),
    ('skull-crushers', 'Skull Crushers'),
    ('overhead-tricep-extension', 'Overhead Tricep Extension')
  ) AS t(slug, display_name)
)
INSERT INTO exercises (
  slug,
  display_name,
  equipment_id,
  is_public,
  owner_user_id,
  popularity_rank,
  exercise_skill_level,
  created_at,
  custom_display_name
)
SELECT 
  ei.slug,
  ei.display_name,
  fe.id,
  true,
  NULL,
  50,
  'medium'::exercise_skill_level,
  now(),
  ei.display_name
FROM exercise_inserts ei, fallback_equipment fe
ON CONFLICT (slug) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  custom_display_name = EXCLUDED.custom_display_name;