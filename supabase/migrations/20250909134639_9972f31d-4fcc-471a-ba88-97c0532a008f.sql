-- Insert all 5 exercises with corrected variable naming
DO $$
DECLARE
    machine_id uuid;
    barbell_id uuid;
    dumbbell_id uuid;
    cable_id uuid;
    mid_chest_id uuid;
    front_delts_id uuid;
    triceps_lateral_id uuid;
    upper_body_id uuid;
    shoulders_group_id uuid;
    arms_group_id uuid;
    core_group_id uuid;
    chest_group_id uuid;
    ex_id uuid;
BEGIN
    -- Get equipment IDs
    SELECT id INTO machine_id FROM equipment WHERE slug = 'machine';
    SELECT id INTO barbell_id FROM equipment WHERE slug = 'barbell';
    SELECT id INTO dumbbell_id FROM equipment WHERE slug = 'dumbbell';
    SELECT id INTO cable_id FROM equipment WHERE slug = 'cable-machine';
    
    -- Get muscle IDs
    SELECT id INTO mid_chest_id FROM muscles WHERE slug = 'mid_chest';
    SELECT id INTO front_delts_id FROM muscles WHERE slug = 'front_delts';
    SELECT id INTO triceps_lateral_id FROM muscles WHERE slug = 'triceps_lateral_head';
    
    -- Get body part ID
    SELECT id INTO upper_body_id FROM body_parts WHERE slug = 'upper_body';
    
    -- Get muscle group IDs
    SELECT id INTO shoulders_group_id FROM muscle_groups WHERE slug = 'shoulders';
    SELECT id INTO arms_group_id FROM muscle_groups WHERE slug = 'arms';
    SELECT id INTO core_group_id FROM muscle_groups WHERE slug = 'core';
    SELECT id INTO chest_group_id FROM muscle_groups WHERE slug = 'chest';
    
    -- 1. Middle Chest Press Machine
    INSERT INTO exercises (
        slug, equipment_id, primary_muscle_id, body_part_id, is_public, owner_user_id, 
        secondary_muscle_group_ids, configured
    ) VALUES (
        'middle-chest-press-machine', machine_id, mid_chest_id, upper_body_id, true, NULL,
        ARRAY[shoulders_group_id], true
    ) ON CONFLICT (slug) DO UPDATE SET configured = true
    RETURNING id INTO ex_id;
    
    INSERT INTO exercises_translations (exercise_id, language_code, name, description) 
    VALUES (ex_id, 'en', 'Middle Chest Press Machine', 'Machine chest press targeting the middle pectorals')
    ON CONFLICT (exercise_id, language_code) DO UPDATE SET name = EXCLUDED.name;
    
    -- 2. Barbell Shoulder Press
    INSERT INTO exercises (
        slug, equipment_id, primary_muscle_id, body_part_id, is_public, owner_user_id, 
        secondary_muscle_group_ids, configured
    ) VALUES (
        'barbell-shoulder-press', barbell_id, front_delts_id, upper_body_id, true, NULL,
        ARRAY[arms_group_id, core_group_id], true
    ) ON CONFLICT (slug) DO UPDATE SET configured = true
    RETURNING id INTO ex_id;
    
    INSERT INTO exercises_translations (exercise_id, language_code, name, description) 
    VALUES (ex_id, 'en', 'Barbell Shoulder Press', 'Standing or seated barbell press for shoulder development')
    ON CONFLICT (exercise_id, language_code) DO UPDATE SET name = EXCLUDED.name;
    
    -- 3. Chest Front Dumbbell Raises
    INSERT INTO exercises (
        slug, equipment_id, primary_muscle_id, body_part_id, is_public, owner_user_id, 
        secondary_muscle_group_ids, configured
    ) VALUES (
        'chest-front-dumbbell-raises', dumbbell_id, front_delts_id, upper_body_id, true, NULL,
        ARRAY[chest_group_id], true
    ) ON CONFLICT (slug) DO UPDATE SET configured = true
    RETURNING id INTO ex_id;
    
    INSERT INTO exercises_translations (exercise_id, language_code, name, description) 
    VALUES (ex_id, 'en', 'Chest Front Dumbbell Raises', 'Front raises targeting the upper chest and anterior deltoids')
    ON CONFLICT (exercise_id, language_code) DO UPDATE SET name = EXCLUDED.name;
    
    -- 4. Dips Machine Stack
    INSERT INTO exercises (
        slug, equipment_id, primary_muscle_id, body_part_id, is_public, owner_user_id, 
        secondary_muscle_group_ids, configured
    ) VALUES (
        'dips-machine-stack', machine_id, triceps_lateral_id, upper_body_id, true, NULL,
        ARRAY[chest_group_id], true
    ) ON CONFLICT (slug) DO UPDATE SET configured = true
    RETURNING id INTO ex_id;
    
    INSERT INTO exercises_translations (exercise_id, language_code, name, description) 
    VALUES (ex_id, 'en', 'Dips Machine', 'Stack loaded dips machine for triceps development')
    ON CONFLICT (exercise_id, language_code) DO UPDATE SET name = EXCLUDED.name;
    
    -- 5. Cable Rope Triceps Extensions
    INSERT INTO exercises (
        slug, equipment_id, primary_muscle_id, body_part_id, is_public, owner_user_id, 
        secondary_muscle_group_ids, configured
    ) VALUES (
        'cable-rope-triceps-extensions', cable_id, triceps_lateral_id, upper_body_id, true, NULL,
        ARRAY[shoulders_group_id], true
    ) ON CONFLICT (slug) DO UPDATE SET configured = true
    RETURNING id INTO ex_id;
    
    INSERT INTO exercises_translations (exercise_id, language_code, name, description) 
    VALUES (ex_id, 'en', 'Cable Rope Triceps Extensions', 'Cable triceps extensions using rope attachment')
    ON CONFLICT (exercise_id, language_code) DO UPDATE SET name = EXCLUDED.name;
    
    RAISE NOTICE 'All 5 exercises inserted successfully';
END $$;

-- Verify the results
SELECT e.slug, et.name FROM exercises e
JOIN exercises_translations et ON et.exercise_id = e.id AND et.language_code = 'en'
WHERE e.slug IN (
  'middle-chest-press-machine',
  'barbell-shoulder-press', 
  'chest-front-dumbbell-raises',
  'dips-machine-stack',
  'cable-rope-triceps-extensions'
)
ORDER BY e.slug;