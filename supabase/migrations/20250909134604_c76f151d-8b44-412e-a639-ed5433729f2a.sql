-- Debug: Try inserting just one exercise with explicit IDs
DO $$
DECLARE
    machine_id uuid;
    mid_chest_id uuid;
    upper_body_id uuid;
    shoulders_group_id uuid;
    exercise_id uuid;
BEGIN
    -- Get the IDs we need
    SELECT id INTO machine_id FROM equipment WHERE slug = 'machine';
    SELECT id INTO mid_chest_id FROM muscles WHERE slug = 'mid_chest';
    SELECT id INTO upper_body_id FROM body_parts WHERE slug = 'upper_body';
    SELECT id INTO shoulders_group_id FROM muscle_groups WHERE slug = 'shoulders';
    
    -- Debug: Check if we found all IDs
    RAISE NOTICE 'machine_id: %, mid_chest_id: %, upper_body_id: %, shoulders_group_id: %', 
        machine_id, mid_chest_id, upper_body_id, shoulders_group_id;
    
    -- Insert the exercise
    INSERT INTO exercises (
        slug,
        equipment_id,
        primary_muscle_id,
        body_part_id,
        is_public,
        owner_user_id,
        secondary_muscle_group_ids,
        configured
    ) VALUES (
        'middle-chest-press-machine',
        machine_id,
        mid_chest_id,
        upper_body_id,
        true,
        NULL,
        ARRAY[shoulders_group_id],
        true
    ) ON CONFLICT (slug) DO UPDATE SET
        equipment_id = EXCLUDED.equipment_id,
        primary_muscle_id = EXCLUDED.primary_muscle_id,
        configured = EXCLUDED.configured
    RETURNING id INTO exercise_id;
    
    RAISE NOTICE 'Inserted exercise with ID: %', exercise_id;
    
    -- Insert translation
    INSERT INTO exercises_translations (
        exercise_id,
        language_code,
        name,
        description
    ) VALUES (
        exercise_id,
        'en',
        'Middle Chest Press Machine',
        'Machine chest press targeting the middle pectorals'
    ) ON CONFLICT (exercise_id, language_code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description;
    
    RAISE NOTICE 'Inserted translation for exercise ID: %', exercise_id;
END $$;