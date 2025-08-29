-- Add 4 exercises with proper error handling and verification
DO $$
DECLARE
    chest_muscle_id uuid;
    shoulders_muscle_id uuid;
    press_pattern_id uuid;
    raise_pattern_id uuid;
    machine_equipment_id uuid;
    dumbbell_equipment_id uuid;
    bench_equipment_id uuid;
BEGIN
    -- Get muscle group IDs
    SELECT id INTO chest_muscle_id FROM muscle_groups WHERE slug = 'chest' LIMIT 1;
    SELECT id INTO shoulders_muscle_id FROM muscle_groups WHERE slug IN ('shoulders', 'delts') LIMIT 1;
    
    -- Get movement pattern IDs  
    SELECT id INTO press_pattern_id FROM movement_patterns WHERE slug = 'press' LIMIT 1;
    SELECT id INTO raise_pattern_id FROM movement_patterns WHERE slug = 'raise' LIMIT 1;
    
    -- Get equipment IDs (use generic equipment if specific ones don't exist)
    SELECT id INTO machine_equipment_id FROM equipment WHERE equipment_type = 'machine' LIMIT 1;
    SELECT id INTO dumbbell_equipment_id FROM equipment WHERE slug ILIKE '%dumbbell%' OR equipment_type ILIKE '%dumbbell%' LIMIT 1;
    SELECT id INTO bench_equipment_id FROM equipment WHERE slug ILIKE '%bench%' OR equipment_type ILIKE '%bench%' LIMIT 1;
    
    -- If no specific equipment found, get any equipment
    IF machine_equipment_id IS NULL THEN
        SELECT id INTO machine_equipment_id FROM equipment LIMIT 1;
    END IF;
    IF dumbbell_equipment_id IS NULL THEN
        SELECT id INTO dumbbell_equipment_id FROM equipment LIMIT 1;
    END IF;
    IF bench_equipment_id IS NULL THEN
        SELECT id INTO bench_equipment_id FROM equipment LIMIT 1;
    END IF;
    
    -- Log what we found
    RAISE NOTICE 'Found chest_muscle_id: %, shoulders_muscle_id: %', chest_muscle_id, shoulders_muscle_id;
    RAISE NOTICE 'Found press_pattern_id: %, raise_pattern_id: %', press_pattern_id, raise_pattern_id;
    RAISE NOTICE 'Found machine_equipment_id: %, dumbbell_equipment_id: %, bench_equipment_id: %', machine_equipment_id, dumbbell_equipment_id, bench_equipment_id;
    
    -- Only proceed if we have required data
    IF chest_muscle_id IS NOT NULL AND press_pattern_id IS NOT NULL AND machine_equipment_id IS NOT NULL THEN
        -- 1) Incline Chest Press Machine
        INSERT INTO exercises (slug, equipment_id, movement_pattern, primary_muscle_id, is_public, created_at)
        VALUES ('incline-chest-press-machine', machine_equipment_id, press_pattern_id, chest_muscle_id, true, NOW())
        ON CONFLICT (slug) DO NOTHING;
        
        -- 2) Chest Press Machine  
        INSERT INTO exercises (slug, equipment_id, movement_pattern, primary_muscle_id, is_public, created_at)
        VALUES ('chest-press-machine', machine_equipment_id, press_pattern_id, chest_muscle_id, true, NOW())
        ON CONFLICT (slug) DO NOTHING;
        
        -- 3) Flat Bench Press
        INSERT INTO exercises (slug, equipment_id, movement_pattern, primary_muscle_id, is_public, created_at)
        VALUES ('flat-bench-press', bench_equipment_id, press_pattern_id, chest_muscle_id, true, NOW())
        ON CONFLICT (slug) DO NOTHING;
    ELSE
        RAISE EXCEPTION 'Missing required data: chest_muscle_id=%, press_pattern_id=%, machine_equipment_id=%', chest_muscle_id, press_pattern_id, machine_equipment_id;
    END IF;
    
    -- 4) Dumbbell Front Raise (only if we have shoulders and raise pattern)
    IF shoulders_muscle_id IS NOT NULL AND raise_pattern_id IS NOT NULL AND dumbbell_equipment_id IS NOT NULL THEN
        INSERT INTO exercises (slug, equipment_id, movement_pattern, primary_muscle_id, is_public, created_at)
        VALUES ('dumbbell-front-raise', dumbbell_equipment_id, raise_pattern_id, shoulders_muscle_id, true, NOW())
        ON CONFLICT (slug) DO NOTHING;
    ELSE
        RAISE NOTICE 'Skipping dumbbell front raise - missing: shoulders_muscle_id=%, raise_pattern_id=%, dumbbell_equipment_id=%', shoulders_muscle_id, raise_pattern_id, dumbbell_equipment_id;
    END IF;
    
END $$;