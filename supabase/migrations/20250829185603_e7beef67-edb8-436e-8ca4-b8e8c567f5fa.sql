-- Add 4 exercises with the new enum values
DO $$
DECLARE
    chest_muscle_id uuid;
    shoulders_muscle_id uuid;
    machine_equipment_id uuid;
    dumbbell_equipment_id uuid;
    bench_equipment_id uuid;
BEGIN
    -- Get muscle group IDs (correct table name)
    SELECT id INTO chest_muscle_id FROM muscles WHERE slug = 'chest' LIMIT 1;
    SELECT id INTO shoulders_muscle_id FROM muscles WHERE slug IN ('shoulders', 'delts', 'anterior-deltoid') LIMIT 1;
    
    -- Get equipment IDs
    SELECT id INTO machine_equipment_id FROM equipment WHERE equipment_type = 'machine' LIMIT 1;
    SELECT id INTO dumbbell_equipment_id FROM equipment WHERE slug = 'dumbbell' LIMIT 1;
    SELECT id INTO bench_equipment_id FROM equipment WHERE slug = 'flat-bench' LIMIT 1;
    
    -- Use fallbacks if specific equipment not found
    IF machine_equipment_id IS NULL THEN
        SELECT id INTO machine_equipment_id FROM equipment LIMIT 1;
    END IF;
    IF dumbbell_equipment_id IS NULL THEN
        SELECT id INTO dumbbell_equipment_id FROM equipment LIMIT 1;
    END IF;
    IF bench_equipment_id IS NULL THEN
        SELECT id INTO bench_equipment_id FROM equipment LIMIT 1;
    END IF;
    
    -- Add exercises
    IF chest_muscle_id IS NOT NULL AND machine_equipment_id IS NOT NULL THEN
        -- Press exercises
        INSERT INTO exercises (slug, equipment_id, movement_pattern, primary_muscle_id, is_public, created_at)
        VALUES 
            ('incline-chest-press-machine', machine_equipment_id, 'press'::movement_pattern, chest_muscle_id, true, NOW()),
            ('chest-press-machine', machine_equipment_id, 'press'::movement_pattern, chest_muscle_id, true, NOW()),
            ('flat-bench-press', bench_equipment_id, 'press'::movement_pattern, chest_muscle_id, true, NOW())
        ON CONFLICT (slug) DO NOTHING;
    END IF;
    
    -- Front raise exercise
    IF shoulders_muscle_id IS NOT NULL AND dumbbell_equipment_id IS NOT NULL THEN
        INSERT INTO exercises (slug, equipment_id, movement_pattern, primary_muscle_id, is_public, created_at)
        VALUES ('dumbbell-front-raise', dumbbell_equipment_id, 'front_raise'::movement_pattern, shoulders_muscle_id, true, NOW())
        ON CONFLICT (slug) DO NOTHING;
    END IF;
    
END $$;