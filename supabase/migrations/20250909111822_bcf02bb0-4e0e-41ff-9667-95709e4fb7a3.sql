-- First, drop the problematic trigger
DROP TRIGGER IF EXISTS exercises_autoname_tg ON exercises;

-- Replace hamstring exercises with quadriceps exercises
DELETE FROM exercises WHERE slug IN (
  'romanian-deadlift', 'leg-curl', 'good-mornings', 'stiff-leg-deadlift'
);

-- Insert quadriceps, chest, shoulders, and triceps exercises
WITH exercise_data AS (
  SELECT * FROM (VALUES
    -- QUADRICEPS EXERCISES (4)
    ('barbell-back-squat', 'Barbell Back Squat'),
    ('leg-press', 'Leg Press'),  
    ('bulgarian-split-squat', 'Bulgarian Split Squat'),
    ('front-squat', 'Front Squat'),
    
    -- CHEST EXERCISES (4) 
    ('barbell-bench-press', 'Barbell Bench Press'),
    ('dumbbell-bench-press', 'Dumbbell Bench Press'),
    ('incline-barbell-press', 'Incline Barbell Press'),
    ('dips', 'Dips'),
    
    -- SHOULDERS EXERCISES (4)
    ('overhead-press', 'Overhead Press'),
    ('dumbbell-shoulder-press', 'Dumbbell Shoulder Press'),
    ('lateral-raises', 'Lateral Raises'),
    ('face-pulls', 'Face Pulls'),
    
    -- TRICEPS EXERCISES (4)
    ('triceps-pushdown', 'Triceps Pushdown'),
    ('close-grip-bench-press', 'Close Grip Bench Press'),
    ('skull-crushers', 'Skull Crushers'),
    ('overhead-tricep-extension', 'Overhead Tricep Extension')
  ) AS t(slug, display_name)
)
INSERT INTO exercises (
  slug,
  display_name,
  is_public,
  owner_user_id,
  popularity_rank,
  exercise_skill_level,
  created_at
)
SELECT 
  ed.slug,
  ed.display_name,
  true,
  NULL,
  (50 + (ROW_NUMBER() OVER (ORDER BY ed.slug))),
  'medium'::exercise_skill_level,
  now()
FROM exercise_data ed
ON CONFLICT (slug) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  popularity_rank = EXCLUDED.popularity_rank;

-- Verify the exercises were inserted/updated
SELECT COUNT(*) as total_exercises FROM exercises;

SELECT slug, display_name, popularity_rank
FROM exercises
WHERE slug IN (
  'barbell-back-squat', 'leg-press', 'bulgarian-split-squat', 'front-squat',
  'barbell-bench-press', 'dumbbell-bench-press', 'incline-barbell-press', 'dips',
  'overhead-press', 'dumbbell-shoulder-press', 'lateral-raises', 'face-pulls',
  'triceps-pushdown', 'close-grip-bench-press', 'skull-crushers', 'overhead-tricep-extension'
)
ORDER BY slug;