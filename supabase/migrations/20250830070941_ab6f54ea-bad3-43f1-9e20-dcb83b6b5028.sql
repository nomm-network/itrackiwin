-- Comprehensive exercise insert with all important fields
DO $$
DECLARE
    -- Body parts
    chest_body_part_id uuid;
    arms_body_part_id uuid;
    
    -- Muscles
    mid_chest_muscle_id uuid;
    upper_chest_muscle_id uuid;
    front_delts_muscle_id uuid;
    triceps_muscle_id uuid;
    
    -- Equipment
    machine_equipment_id uuid;
    dumbbell_equipment_id uuid;
    bench_equipment_id uuid;
    
    -- Grips
    overhand_grip_id uuid;
    neutral_grip_id uuid;
    
    -- Exercise IDs for translations
    exercise_ids uuid[];
BEGIN
    -- Get body parts
    SELECT id INTO chest_body_part_id FROM body_parts WHERE slug = 'chest' LIMIT 1;
    SELECT id INTO arms_body_part_id FROM body_parts WHERE slug = 'arms' LIMIT 1;
    
    -- Get muscles
    SELECT id INTO mid_chest_muscle_id FROM muscles WHERE slug = 'mid_chest' LIMIT 1;
    SELECT id INTO upper_chest_muscle_id FROM muscles WHERE slug = 'upper_chest' LIMIT 1;
    SELECT id INTO front_delts_muscle_id FROM muscles WHERE slug = 'front_delts' LIMIT 1;
    SELECT id INTO triceps_muscle_id FROM muscles WHERE slug = 'triceps_lateral_head' LIMIT 1;
    
    -- Get equipment
    SELECT id INTO machine_equipment_id FROM equipment WHERE equipment_type = 'machine' LIMIT 1;
    SELECT id INTO dumbbell_equipment_id FROM equipment WHERE slug = 'dumbbell' LIMIT 1;
    SELECT id INTO bench_equipment_id FROM equipment WHERE slug = 'flat-bench' LIMIT 1;
    
    -- Get grips
    SELECT id INTO overhand_grip_id FROM grips WHERE slug = 'overhand' LIMIT 1;
    SELECT id INTO neutral_grip_id FROM grips WHERE slug = 'neutral' LIMIT 1;
    
    -- Insert comprehensive exercises
    WITH inserted_exercises AS (
        INSERT INTO exercises (
            slug,
            display_name,
            equipment_id,
            movement_pattern,
            primary_muscle_id,
            body_part_id,
            secondary_muscle_group_ids,
            default_grip_ids,
            load_type,
            exercise_skill_level,
            complexity_score,
            is_public,
            allows_grips,
            requires_handle,
            is_unilateral,
            tags,
            created_at
        ) VALUES 
        -- 1. Incline Chest Press Machine
        (
            'incline-chest-press-machine',
            'Incline Chest Press (Machine)',
            machine_equipment_id,
            'press'::movement_pattern,
            upper_chest_muscle_id,
            chest_body_part_id,
            ARRAY[front_delts_muscle_id, triceps_muscle_id],
            ARRAY[overhand_grip_id, neutral_grip_id],
            'stack'::load_type,
            'beginner'::exercise_skill_level,
            2,
            true,
            true,
            false,
            false,
            ARRAY['chest', 'upper_body', 'push', 'machine'],
            NOW()
        ),
        -- 2. Chest Press Machine  
        (
            'chest-press-machine',
            'Chest Press (Machine)',
            machine_equipment_id,
            'press'::movement_pattern,
            mid_chest_muscle_id,
            chest_body_part_id,
            ARRAY[front_delts_muscle_id, triceps_muscle_id],
            ARRAY[overhand_grip_id, neutral_grip_id],
            'stack'::load_type,
            'beginner'::exercise_skill_level,
            2,
            true,
            true,
            false,
            false,
            ARRAY['chest', 'upper_body', 'push', 'machine'],
            NOW()
        ),
        -- 3. Flat Bench Press
        (
            'flat-bench-press',
            'Flat Bench Press',
            COALESCE(bench_equipment_id, machine_equipment_id),
            'press'::movement_pattern,
            mid_chest_muscle_id,
            chest_body_part_id,
            ARRAY[front_delts_muscle_id, triceps_muscle_id],
            ARRAY[overhand_grip_id],
            'dual_load'::load_type,
            'intermediate'::exercise_skill_level,
            4,
            true,
            true,
            true,
            false,
            ARRAY['chest', 'upper_body', 'push', 'barbell', 'compound'],
            NOW()
        ),
        -- 4. Dumbbell Front Raise
        (
            'dumbbell-front-raise',
            'Dumbbell Front Raise',
            dumbbell_equipment_id,
            'front_raise'::movement_pattern,
            front_delts_muscle_id,
            arms_body_part_id,
            ARRAY[upper_chest_muscle_id],
            ARRAY[neutral_grip_id, overhand_grip_id],
            'single_load'::load_type,
            'beginner'::exercise_skill_level,
            2,
            true,
            true,
            false,
            true,
            ARRAY['shoulders', 'upper_body', 'isolation', 'dumbbell'],
            NOW()
        )
        RETURNING id, slug, display_name
    )
    SELECT array_agg(id) INTO exercise_ids FROM inserted_exercises;
    
    -- Add translations for each exercise
    INSERT INTO exercises_translations (exercise_id, language_code, name, description)
    SELECT 
        e.id,
        t.language_code,
        t.name,
        t.description
    FROM (SELECT id, slug FROM exercises WHERE slug IN (
        'incline-chest-press-machine', 
        'chest-press-machine', 
        'flat-bench-press', 
        'dumbbell-front-raise'
    )) e
    CROSS JOIN (
        VALUES 
        -- Incline Chest Press Machine
        ('incline-chest-press-machine', 'en', 'Incline Chest Press (Machine)', 'Machine-based incline chest press targeting upper pectorals with guided movement pattern.'),
        ('incline-chest-press-machine', 'ro', 'Presă Piept Înclinat (Aparat)', 'Presă pentru piept pe aparat înclinat, vizând pectoralii superiori cu traiectorie ghidată.'),
        
        -- Chest Press Machine
        ('chest-press-machine', 'en', 'Chest Press (Machine)', 'Seated chest press machine for developing middle chest strength with controlled movement.'),
        ('chest-press-machine', 'ro', 'Presă Piept (Aparat)', 'Aparat pentru presă piept din șezut, pentru dezvoltarea forței pieptului mijlociu.'),
        
        -- Flat Bench Press
        ('flat-bench-press', 'en', 'Flat Bench Press', 'Classic barbell bench press on flat bench for overall chest development and strength.'),
        ('flat-bench-press', 'ro', 'Presă Bancă Plată', 'Presă clasică cu haltera pe bancă plată pentru dezvoltarea generală a pieptului.'),
        
        -- Dumbbell Front Raise
        ('dumbbell-front-raise', 'en', 'Dumbbell Front Raise', 'Isolation exercise raising dumbbells forward to target anterior deltoids.'),
        ('dumbbell-front-raise', 'ro', 'Ridicări Frontale cu Gantere', 'Exercițiu de izolare ridicând ganterele în față pentru deltoizii anteriori.')
    ) t(exercise_slug, language_code, name, description)
    WHERE e.slug = t.exercise_slug;
    
    RAISE NOTICE 'Successfully inserted % exercises with full metadata and translations', array_length(exercise_ids, 1);
    
END $$;