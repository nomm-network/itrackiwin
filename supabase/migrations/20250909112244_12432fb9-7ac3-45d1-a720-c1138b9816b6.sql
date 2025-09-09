-- Drop all triggers and functions with CASCADE
DROP TRIGGER IF EXISTS exercises_autoname_tg ON exercises CASCADE;
DROP TRIGGER IF EXISTS trg_exercises_autoname ON exercises CASCADE;
DROP FUNCTION IF EXISTS public.exercises_autoname_tg() CASCADE;
DROP FUNCTION IF EXISTS public.generate_exercise_name(uuid,uuid,text,jsonb,text,text,text) CASCADE;

-- Insert exercises directly
INSERT INTO exercises (
  slug,
  display_name,
  equipment_id,
  is_public,
  owner_user_id,
  popularity_rank,
  exercise_skill_level,
  created_at
) VALUES 
  -- QUADRICEPS EXERCISES (4)
  ('barbell-back-squat', 'Barbell Back Squat', (SELECT id FROM equipment WHERE slug = 'olympic-barbell' LIMIT 1), true, NULL, 51, 'medium', now()),
  ('leg-press', 'Leg Press', (SELECT id FROM equipment WHERE slug = 'olympic-barbell' LIMIT 1), true, NULL, 52, 'medium', now()),
  ('bulgarian-split-squat', 'Bulgarian Split Squat', (SELECT id FROM equipment WHERE slug = 'dumbbell' LIMIT 1), true, NULL, 53, 'medium', now()),
  ('front-squat', 'Front Squat', (SELECT id FROM equipment WHERE slug = 'olympic-barbell' LIMIT 1), true, NULL, 54, 'medium', now()),
  
  -- CHEST EXERCISES (4) 
  ('barbell-bench-press', 'Barbell Bench Press', (SELECT id FROM equipment WHERE slug = 'olympic-barbell' LIMIT 1), true, NULL, 55, 'medium', now()),
  ('dumbbell-bench-press', 'Dumbbell Bench Press', (SELECT id FROM equipment WHERE slug = 'dumbbell' LIMIT 1), true, NULL, 56, 'medium', now()),
  ('incline-barbell-press', 'Incline Barbell Press', (SELECT id FROM equipment WHERE slug = 'olympic-barbell' LIMIT 1), true, NULL, 57, 'medium', now()),
  ('dips', 'Dips', (SELECT id FROM equipment WHERE slug = 'dumbbell' LIMIT 1), true, NULL, 58, 'medium', now()),
  
  -- SHOULDERS EXERCISES (4)
  ('overhead-press', 'Overhead Press', (SELECT id FROM equipment WHERE slug = 'olympic-barbell' LIMIT 1), true, NULL, 59, 'medium', now()),
  ('dumbbell-shoulder-press', 'Dumbbell Shoulder Press', (SELECT id FROM equipment WHERE slug = 'dumbbell' LIMIT 1), true, NULL, 60, 'medium', now()),
  ('lateral-raises', 'Lateral Raises', (SELECT id FROM equipment WHERE slug = 'dumbbell' LIMIT 1), true, NULL, 61, 'medium', now()),
  ('face-pulls', 'Face Pulls', (SELECT id FROM equipment WHERE slug = 'dumbbell' LIMIT 1), true, NULL, 62, 'medium', now()),
  
  -- TRICEPS EXERCISES (4)
  ('triceps-pushdown', 'Triceps Pushdown', (SELECT id FROM equipment WHERE slug = 'dumbbell' LIMIT 1), true, NULL, 63, 'medium', now()),
  ('close-grip-bench-press', 'Close Grip Bench Press', (SELECT id FROM equipment WHERE slug = 'olympic-barbell' LIMIT 1), true, NULL, 64, 'medium', now()),
  ('skull-crushers', 'Skull Crushers', (SELECT id FROM equipment WHERE slug = 'olympic-barbell' LIMIT 1), true, NULL, 65, 'medium', now()),
  ('overhead-tricep-extension', 'Overhead Tricep Extension', (SELECT id FROM equipment WHERE slug = 'dumbbell' LIMIT 1), true, NULL, 66, 'medium', now())
ON CONFLICT (slug) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  equipment_id = EXCLUDED.equipment_id,
  popularity_rank = EXCLUDED.popularity_rank;

-- Verify the exercises were inserted
SELECT COUNT(*) as total_exercises FROM exercises
WHERE slug IN (
  'barbell-back-squat', 'leg-press', 'bulgarian-split-squat', 'front-squat',
  'barbell-bench-press', 'dumbbell-bench-press', 'incline-barbell-press', 'dips',
  'overhead-press', 'dumbbell-shoulder-press', 'lateral-raises', 'face-pulls',
  'triceps-pushdown', 'close-grip-bench-press', 'skull-crushers', 'overhead-tricep-extension'
);