-- Create demo exercises and populate grip relationships to unblock the "Add Exercise" dialog

-- First, let's create a few demo exercises to test the system using existing equipment
INSERT INTO exercises (
  id,
  slug,
  display_name,
  equipment_id,
  is_public,
  owner_user_id,
  allows_grips,
  movement_pattern,
  exercise_skill_level
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440001',
  'cable-lat-pulldown',
  'Cable Lat Pulldown',
  '243fdc06-9c04-4bc1-8773-d9da7f981bc1',
  true,
  null,
  true,
  'vertical_pull',
  'medium'
),
(
  '550e8400-e29b-41d4-a716-446655440002', 
  'cable-chest-fly',
  'Cable Chest Fly',
  '243fdc06-9c04-4bc1-8773-d9da7f981bc1',
  true,
  null,
  true,
  'horizontal_push',
  'medium'
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  'cable-row',
  'Cable Row', 
  '243fdc06-9c04-4bc1-8773-d9da7f981bc1',
  true,
  null,
  true,
  'horizontal_pull',
  'medium'
)
ON CONFLICT (slug) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  equipment_id = EXCLUDED.equipment_id,
  allows_grips = EXCLUDED.allows_grips;

-- Now populate exercise_grips with the 4 orientation grips for each exercise
INSERT INTO exercise_grips (exercise_id, grip_id, is_default, order_index)
SELECT 
  e.id as exercise_id,
  g.id as grip_id,
  CASE WHEN g.slug = 'overhand' THEN true ELSE false END as is_default,
  CASE 
    WHEN g.slug = 'overhand' THEN 1
    WHEN g.slug = 'underhand' THEN 2  
    WHEN g.slug = 'neutral' THEN 3
    WHEN g.slug = 'mixed' THEN 4
  END as order_index
FROM exercises e
CROSS JOIN grips g 
WHERE g.slug IN ('overhand', 'underhand', 'neutral', 'mixed')
  AND e.allows_grips = true
ON CONFLICT (exercise_id, grip_id) DO UPDATE SET
  is_default = EXCLUDED.is_default,
  order_index = EXCLUDED.order_index;

-- Get default handles for equipment and populate exercise_handles
INSERT INTO exercise_handles (exercise_id, handle_id, is_default)
SELECT DISTINCT
  e.id as exercise_id,
  ehg.handle_id,
  true as is_default
FROM exercises e
JOIN equipment_handle_grips ehg ON ehg.equipment_id = e.equipment_id
WHERE ehg.is_default = true
ON CONFLICT (exercise_id, handle_id) DO UPDATE SET
  is_default = EXCLUDED.is_default;

-- Populate exercise_handle_grips for more specific grip-handle combinations
INSERT INTO exercise_handle_grips (exercise_id, handle_id, grip_id)
SELECT DISTINCT
  e.id as exercise_id,
  eh.handle_id,
  eg.grip_id
FROM exercises e
JOIN exercise_handles eh ON eh.exercise_id = e.id  
JOIN exercise_grips eg ON eg.exercise_id = e.id
JOIN equipment_handle_grips ehg ON ehg.equipment_id = e.equipment_id 
  AND ehg.handle_id = eh.handle_id 
  AND ehg.grip_id = eg.grip_id
ON CONFLICT (exercise_id, handle_id, grip_id) DO NOTHING;