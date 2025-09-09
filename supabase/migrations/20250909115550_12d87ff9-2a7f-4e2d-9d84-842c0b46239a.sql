-- Update exercise loading characteristics, bar requirements, and tags based on exercise science

-- First, let's get the Olympic bar ID for 20kg
-- Update barbell exercises that require Olympic bar (20kg) and use dual_load (per side loading)
UPDATE exercises SET 
  is_bar_loaded = true,
  load_type = 'dual_load',
  loading_hint = 'per_side',
  default_bar_weight = 20,
  default_bar_type_id = (SELECT id FROM bar_types WHERE name = 'Olympic Bar' AND default_weight = 20 LIMIT 1),
  tags = CASE 
    WHEN slug = 'barbell-back-squat' THEN ARRAY['compound', 'strength', 'squat', 'legs', 'glutes', 'quads']
    WHEN slug = 'barbell-bench-press' THEN ARRAY['compound', 'strength', 'push', 'chest', 'triceps', 'shoulders']
    WHEN slug = 'overhead-press' THEN ARRAY['compound', 'strength', 'push', 'shoulders', 'triceps', 'standing']
    WHEN slug = 'front-squat' THEN ARRAY['compound', 'strength', 'squat', 'legs', 'quads', 'glutes', 'core']
    WHEN slug = 'incline-barbell-press' THEN ARRAY['compound', 'strength', 'push', 'chest', 'upper_chest', 'triceps']
    WHEN slug = 'close-grip-bench-press' THEN ARRAY['compound', 'strength', 'push', 'triceps', 'chest']
    ELSE tags
  END
WHERE slug IN ('barbell-back-squat', 'barbell-bench-press', 'overhead-press', 'front-squat', 'incline-barbell-press', 'close-grip-bench-press');

-- EZ-Bar exercises - already correctly set, just update tags
UPDATE exercises SET 
  tags = CASE 
    WHEN slug = 'ez-bar-curl' THEN ARRAY['isolation', 'biceps', 'arms', 'curl']
    WHEN slug = 'overhead-tricep-extension' THEN ARRAY['isolation', 'triceps', 'arms', 'extension', 'overhead']
    ELSE tags
  END
WHERE slug IN ('ez-bar-curl', 'overhead-tricep-extension');

-- Dumbbell exercises - single_load per dumbbell, loading_hint = 'per_hand'
UPDATE exercises SET 
  is_bar_loaded = false,
  load_type = 'single_load',
  loading_hint = 'per_hand',
  default_bar_weight = NULL,
  default_bar_type_id = NULL,
  tags = CASE 
    WHEN slug = 'dumbbell-bench-press' THEN ARRAY['compound', 'strength', 'push', 'chest', 'triceps', 'shoulders', 'unilateral']
    WHEN slug = 'dumbbell-shoulder-press' THEN ARRAY['compound', 'strength', 'push', 'shoulders', 'triceps', 'seated_or_standing']
    WHEN slug = 'lateral-raises' THEN ARRAY['isolation', 'shoulders', 'lateral_delts', 'raises']
    WHEN slug = 'bulgarian-split-squat' THEN ARRAY['compound', 'unilateral', 'legs', 'quads', 'glutes', 'balance']
    ELSE tags
  END
WHERE equipment_id = (SELECT id FROM equipment WHERE slug = 'dumbbell');

-- Cable/Machine exercises with stack loading
UPDATE exercises SET 
  is_bar_loaded = false,
  load_type = 'stack',
  loading_hint = 'total',
  default_bar_weight = NULL,
  default_bar_type_id = NULL,
  tags = CASE 
    WHEN slug = 'lat-pulldown-cable' THEN ARRAY['compound', 'back', 'lats', 'pulldown', 'cable', 'vertical_pull']
    WHEN slug = 'face-pulls' THEN ARRAY['isolation', 'rear_delts', 'shoulders', 'cable', 'posture']
    WHEN slug = 'triceps-pushdown' THEN ARRAY['isolation', 'triceps', 'arms', 'cable', 'pushdown']
    WHEN slug = 'machine-leg-curl' THEN ARRAY['isolation', 'hamstrings', 'legs', 'machine']
    WHEN slug = 'seated-cable-row' THEN ARRAY['compound', 'back', 'rhomboids', 'cable', 'horizontal_pull']
    ELSE tags
  END
WHERE equipment_id IN (SELECT id FROM equipment WHERE load_type = 'stack');

-- Machine exercises with dual_load (leg press, etc.)
UPDATE exercises SET 
  is_bar_loaded = false,
  load_type = 'dual_load',
  loading_hint = 'per_side',
  default_bar_weight = NULL,
  default_bar_type_id = NULL,
  tags = CASE 
    WHEN slug = 'leg-press' THEN ARRAY['compound', 'legs', 'quads', 'glutes', 'machine', 'press']
    ELSE tags
  END
WHERE slug = 'leg-press';

-- Bodyweight exercises
UPDATE exercises SET 
  is_bar_loaded = false,
  load_type = 'bodyweight',
  loading_hint = 'total',
  default_bar_weight = NULL,
  default_bar_type_id = NULL,
  tags = CASE 
    WHEN slug = 'dips' THEN ARRAY['compound', 'bodyweight', 'push', 'triceps', 'chest', 'parallel_bars']
    WHEN slug = 'back-extension' THEN ARRAY['isolation', 'bodyweight', 'lower_back', 'hinge', 'posterior_chain']
    WHEN slug = 'pull-ups' THEN ARRAY['compound', 'bodyweight', 'back', 'lats', 'biceps', 'vertical_pull']
    WHEN slug = 'push-ups' THEN ARRAY['compound', 'bodyweight', 'push', 'chest', 'triceps', 'shoulders']
    ELSE tags
  END
WHERE equipment_id IN (SELECT id FROM equipment WHERE load_type = 'none' AND equipment_type = 'bodyweight');

-- Special case: Deadlift - already correctly configured, just ensure tags are right
UPDATE exercises SET 
  tags = ARRAY['compound', 'strength', 'hinge', 'posterior_chain', 'glutes', 'hamstrings', 'back']
WHERE slug = 'barbell-deadlift';