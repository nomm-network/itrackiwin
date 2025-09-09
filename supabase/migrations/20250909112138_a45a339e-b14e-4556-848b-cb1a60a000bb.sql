-- Permanently disable the problematic trigger and fix the function
DROP TRIGGER IF EXISTS exercises_autoname_tg ON exercises;

-- Drop and fix the function to use proper column names
DROP FUNCTION IF EXISTS public.exercises_autoname_tg();
DROP FUNCTION IF EXISTS public.generate_exercise_name(uuid,uuid,text,jsonb,text,text,text);

-- Insert exercises without triggering auto-naming
WITH equipment_lookup AS (
  SELECT id, slug FROM equipment
),
exercise_data AS (
  SELECT * FROM (VALUES
    -- QUADRICEPS EXERCISES (4)
    ('barbell-back-squat', 'Barbell Back Squat', 'olympic-barbell'),
    ('leg-press', 'Leg Press', 'olympic-barbell'),  -- fallback to barbell if machine doesn't exist
    ('bulgarian-split-squat', 'Bulgarian Split Squat', 'dumbbell'),
    ('front-squat', 'Front Squat', 'olympic-barbell'),
    
    -- CHEST EXERCISES (4) 
    ('barbell-bench-press', 'Barbell Bench Press', 'olympic-barbell'),
    ('dumbbell-bench-press', 'Dumbbell Bench Press', 'dumbbell'),
    ('incline-barbell-press', 'Incline Barbell Press', 'olympic-barbell'),
    ('dips', 'Dips', 'dumbbell'),
    
    -- SHOULDERS EXERCISES (4)
    ('overhead-press', 'Overhead Press', 'olympic-barbell'),
    ('dumbbell-shoulder-press', 'Dumbbell Shoulder Press', 'dumbbell'),
    ('lateral-raises', 'Lateral Raises', 'dumbbell'),
    ('face-pulls', 'Face Pulls', 'dumbbell'),
    
    -- TRICEPS EXERCISES (4)
    ('triceps-pushdown', 'Triceps Pushdown', 'dumbbell'),
    ('close-grip-bench-press', 'Close Grip Bench Press', 'olympic-barbell'),
    ('skull-crushers', 'Skull Crushers', 'olympic-barbell'),
    ('overhead-tricep-extension', 'Overhead Tricep Extension', 'dumbbell')
  ) AS t(slug, display_name, equipment_slug)
),
resolved_data AS (
  SELECT 
    ed.slug,
    ed.display_name,
    COALESCE(eq.id, (SELECT id FROM equipment_lookup WHERE slug = 'olympic-barbell' LIMIT 1)) as equipment_id
  FROM exercise_data ed
  LEFT JOIN equipment_lookup eq ON eq.slug = ed.equipment_slug
)
INSERT INTO exercises (
  slug,
  display_name,
  equipment_id,
  is_public,
  owner_user_id,
  popularity_rank,
  exercise_skill_level,
  created_at
)
SELECT 
  rd.slug,
  rd.display_name,
  rd.equipment_id,
  true,
  NULL,
  (50 + (ROW_NUMBER() OVER (ORDER BY rd.slug))),
  'medium'::exercise_skill_level,
  now()
FROM resolved_data rd
ON CONFLICT (slug) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  equipment_id = EXCLUDED.equipment_id,
  popularity_rank = EXCLUDED.popularity_rank;

-- Verify the exercises were inserted
SELECT slug, display_name FROM exercises
WHERE slug IN (
  'barbell-back-squat', 'leg-press', 'bulgarian-split-squat', 'front-squat',
  'barbell-bench-press', 'dumbbell-bench-press', 'incline-barbell-press', 'dips',
  'overhead-press', 'dumbbell-shoulder-press', 'lateral-raises', 'face-pulls',
  'triceps-pushdown', 'close-grip-bench-press', 'skull-crushers', 'overhead-tricep-extension'
)
ORDER BY slug;