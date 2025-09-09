-- Add three new exercises: Leg Extension, Dumbbell Cuban Press, and Dumbbell Rear Delt Fly

-- First, get equipment IDs for reference
-- Leg Extension Machine
INSERT INTO equipment (
  slug,
  equipment_type,
  kind,
  load_type,
  load_medium,
  configured,
  notes
) VALUES (
  'leg-extension-machine',
  'machine',
  'selectorized',
  'stack',
  'weight_stack',
  true,
  'Isolation machine for quadriceps training'
) ON CONFLICT (slug) DO NOTHING;

-- Insert the three new exercises
INSERT INTO exercises (
  slug,
  display_name,
  equipment_id,
  primary_muscle_id,
  body_part_id,
  is_public,
  owner_user_id,
  is_bar_loaded,
  load_type,
  loading_hint,
  default_bar_weight,
  default_bar_type_id,
  allows_grips,
  is_unilateral,
  exercise_skill_level,
  complexity_score,
  tags,
  attribute_values_json
) VALUES 
-- 1. Leg Extension Machine
(
  'leg-extension-machine',
  'Leg Extension',
  (SELECT id FROM equipment WHERE slug = 'leg-extension-machine'),
  (SELECT id FROM muscles WHERE slug = 'quadriceps' LIMIT 1),
  (SELECT id FROM body_parts WHERE slug = 'legs' LIMIT 1),
  true,
  NULL,
  false,
  'stack',
  'total',
  NULL,
  NULL,
  false,
  false,
  'beginner',
  2,
  ARRAY['isolation', 'quadriceps', 'legs', 'machine', 'knee_extension'],
  '{"movement_pattern": "knee_extension", "joint_actions": ["knee_extension"], "stabilizing_muscles": ["hip_flexors"]}'::jsonb
),

-- 2. Dumbbell Cuban Press (shoulders/rotator cuff)
(
  'dumbbell-cuban-press',
  'Dumbbell Cuban Press',
  (SELECT id FROM equipment WHERE slug = 'dumbbell'),
  (SELECT id FROM muscles WHERE slug = 'posterior-deltoid' LIMIT 1),
  (SELECT id FROM body_parts WHERE slug = 'shoulders' LIMIT 1),
  true,
  NULL,
  false,
  'single_load',
  'total',
  NULL,
  NULL,
  true,
  false,
  'advanced',
  4,
  ARRAY['compound', 'shoulders', 'rotator_cuff', 'external_rotation', 'overhead', 'stability'],
  '{"movement_pattern": "external_rotation", "joint_actions": ["shoulder_external_rotation", "shoulder_flexion"], "stabilizing_muscles": ["core", "scapular_stabilizers"]}'::jsonb
),

-- 3. Dumbbell Rear Delt Fly
(
  'dumbbell-rear-delt-fly',
  'Dumbbell Rear Delt Fly',
  (SELECT id FROM equipment WHERE slug = 'dumbbell'),
  (SELECT id FROM muscles WHERE slug = 'posterior-deltoid' LIMIT 1),
  (SELECT id FROM body_parts WHERE slug = 'shoulders' LIMIT 1),
  true,
  NULL,
  false,
  'single_load',
  'total',
  NULL,
  NULL,
  true,
  false,
  'intermediate',
  3,
  ARRAY['isolation', 'rear_delts', 'shoulders', 'horizontal_abduction', 'posture'],
  '{"movement_pattern": "horizontal_abduction", "joint_actions": ["shoulder_horizontal_abduction"], "stabilizing_muscles": ["rhomboids", "middle_trapezius"]}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- Add basic English translations for the new exercises
INSERT INTO exercises_translations (
  exercise_id,
  language_code,
  name,
  description
) VALUES 
(
  (SELECT id FROM exercises WHERE slug = 'leg-extension-machine'),
  'en',
  'Leg Extension',
  'Isolation exercise performed on a leg extension machine to target the quadriceps muscles. Sit on the machine with your back against the pad and extend your legs to lift the weight.'
),
(
  (SELECT id FROM exercises WHERE slug = 'dumbbell-cuban-press'),
  'en',
  'Dumbbell Cuban Press',
  'Advanced shoulder exercise that combines external rotation with overhead press. Excellent for rotator cuff strength and shoulder stability.'
),
(
  (SELECT id FROM exercises WHERE slug = 'dumbbell-rear-delt-fly'),
  'en',
  'Dumbbell Rear Delt Fly',
  'Isolation exercise targeting the posterior deltoids and upper back. Performed by bending forward and raising dumbbells to the sides with arms extended.'
)
ON CONFLICT (exercise_id, language_code) DO NOTHING;