-- Update the three new exercises with proper mappings

-- 1. Leg Extension Machine
UPDATE exercises 
SET 
  movement_pattern_id = (SELECT id FROM movement_patterns WHERE slug = 'isolation'),
  body_part_id = (SELECT id FROM body_parts WHERE slug = 'legs'),
  primary_muscle_id = (SELECT id FROM muscles WHERE slug = 'rectus_femoris'),
  equipment_id = (SELECT id FROM equipment WHERE slug = 'leg-extension-machine'),
  load_type = 'single_load',
  complexity_score = 2,
  exercise_skill_level = 'low',
  popularity_rank = 25,
  configured = true,
  tags = ARRAY['isolation', 'machine', 'quadriceps', 'knee_extension'],
  contraindications = '["knee_injury", "recent_knee_surgery"]'::jsonb,
  loading_hint = 'Use controlled tempo, avoid locking out knees completely'
WHERE slug = 'leg-extension-machine';

-- 2. Dumbbell Cuban Press  
UPDATE exercises 
SET 
  movement_pattern_id = (SELECT id FROM movement_patterns WHERE slug = 'rotation'),
  body_part_id = (SELECT id FROM body_parts WHERE slug = 'arms'),
  primary_muscle_id = (SELECT id FROM muscles WHERE slug = 'rotator_cuff'),
  equipment_id = (SELECT id FROM equipment WHERE slug = 'dumbbell'),
  load_type = 'dual_load',
  complexity_score = 8,
  exercise_skill_level = 'high',
  popularity_rank = 85,
  configured = true,
  tags = ARRAY['complex', 'shoulders', 'external_rotation', 'stability'],
  contraindications = '["shoulder_impingement", "rotator_cuff_injury", "shoulder_instability"]'::jsonb,
  loading_hint = 'Start with very light weight, focus on control and form'
WHERE slug = 'dumbbell-cuban-press';

-- 3. Dumbbell Rear Delt Fly
UPDATE exercises 
SET 
  movement_pattern_id = (SELECT id FROM movement_patterns WHERE slug = 'pull'),
  body_part_id = (SELECT id FROM body_parts WHERE slug = 'arms'),
  primary_muscle_id = (SELECT id FROM muscles WHERE slug = 'rear_delts'),
  equipment_id = (SELECT id FROM equipment WHERE slug = 'dumbbell'), 
  load_type = 'dual_load',
  complexity_score = 4,
  exercise_skill_level = 'medium',
  popularity_rank = 45,
  configured = true,
  tags = ARRAY['isolation', 'rear_delts', 'horizontal_abduction', 'posture'],
  contraindications = '["shoulder_injury", "thoracic_spine_limitation"]'::jsonb,
  loading_hint = 'Focus on squeezing shoulder blades together, avoid using momentum'
WHERE slug = 'dumbbell-rear-delt-fly';