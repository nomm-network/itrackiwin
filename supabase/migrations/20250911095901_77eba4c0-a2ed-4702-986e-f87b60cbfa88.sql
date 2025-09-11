-- RPC: Resolve achievable load for exercise with implement detection
CREATE OR REPLACE FUNCTION fn_resolve_achievable_load(
  exercise_id uuid,
  gym_id uuid DEFAULT NULL,
  desired_kg numeric DEFAULT 20,
  allow_mix_units boolean DEFAULT true
) RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_result jsonb;
  v_best_total numeric := 0;
  v_best_implement text := 'barbell';
  v_best_details jsonb := '{}';
  v_exercise_load_type load_type;
  v_bar_weight numeric;
  v_plates numeric[];
  v_dumbbells numeric[];
  v_stack_steps numeric[];
  v_temp_total numeric;
  v_temp_details jsonb;
BEGIN
  -- Get exercise load type
  SELECT load_type INTO v_exercise_load_type
  FROM exercises 
  WHERE id = exercise_id;

  IF v_exercise_load_type IS NULL THEN
    v_exercise_load_type := 'dual_load'; -- Default fallback
  END IF;

  -- Try barbell/dual_load if supported
  IF v_exercise_load_type IN ('dual_load') THEN
    -- Get bar weight (default 20kg)
    v_bar_weight := 20;
    
    -- Get available plates (simplified - use defaults for now)
    v_plates := ARRAY[25, 20, 15, 10, 5, 2.5, 1.25, 0.5];
    
    -- Calculate closest barbell weight
    v_temp_total := closest_barbell_weight_kg(desired_kg, v_bar_weight, v_plates);
    
    IF ABS(v_temp_total - desired_kg) < ABS(v_best_total - desired_kg) OR v_best_total = 0 THEN
      v_best_total := v_temp_total;
      v_best_implement := 'barbell';
      v_best_details := jsonb_build_object(
        'bar_weight', v_bar_weight,
        'per_side_plates', ARRAY[]::numeric[], -- Simplified for now
        'unit', 'kg'
      );
    END IF;
  END IF;

  -- Try dumbbell/single_load if supported
  IF v_exercise_load_type IN ('single_load', 'dual_load') THEN
    -- Get available dumbbells (simplified defaults)
    v_dumbbells := ARRAY[2.5, 5, 7.5, 10, 12.5, 15, 17.5, 20, 22.5, 25, 27.5, 30, 32.5, 35, 37.5, 40, 42.5, 45, 47.5, 50];
    
    -- Find closest dumbbell
    SELECT weight INTO v_temp_total
    FROM unnest(v_dumbbells) AS weight
    ORDER BY ABS(weight - desired_kg)
    LIMIT 1;
    
    IF v_temp_total IS NOT NULL AND (ABS(v_temp_total - desired_kg) < ABS(v_best_total - desired_kg) OR v_best_total = 0) THEN
      v_best_total := v_temp_total;
      v_best_implement := 'dumbbell';
      v_best_details := jsonb_build_object(
        'dumbbell_weight', v_temp_total,
        'unit', 'kg'
      );
    END IF;
  END IF;

  -- Try stack/machine if supported
  IF v_exercise_load_type IN ('stack') THEN
    -- Get stack steps (simplified defaults)
    v_stack_steps := ARRAY[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];
    
    -- Find closest stack weight
    SELECT step INTO v_temp_total
    FROM unnest(v_stack_steps) AS step
    ORDER BY ABS(step - desired_kg)
    LIMIT 1;
    
    IF v_temp_total IS NOT NULL AND (ABS(v_temp_total - desired_kg) < ABS(v_best_total - desired_kg) OR v_best_total = 0) THEN
      v_best_total := v_temp_total;
      v_best_implement := 'machine';
      v_best_details := jsonb_build_object(
        'stack_weight', v_temp_total,
        'unit', 'kg'
      );
    END IF;
  END IF;

  -- Build final result
  v_result := jsonb_build_object(
    'implement', v_best_implement,
    'total_kg', v_best_total,
    'details', v_best_details,
    'source', CASE WHEN gym_id IS NOT NULL THEN 'gym' ELSE 'default' END,
    'achievable', true,
    'residual_kg', v_best_total - desired_kg
  );

  RETURN v_result;
END;
$$;

-- Helper function for barbell calculations (simplified)
CREATE OR REPLACE FUNCTION closest_barbell_weight_kg(
  desired_kg numeric,
  bar_kg numeric,
  available_plates numeric[]
) RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  per_side_target numeric;
  per_side_actual numeric := 0;
  plate_weight numeric;
BEGIN
  per_side_target := (desired_kg - bar_kg) / 2;
  
  IF per_side_target <= 0 THEN
    RETURN bar_kg;
  END IF;
  
  -- Simple greedy algorithm
  FOREACH plate_weight IN ARRAY available_plates
  LOOP
    WHILE per_side_actual + plate_weight <= per_side_target + 0.01 LOOP
      per_side_actual := per_side_actual + plate_weight;
    END LOOP;
  END LOOP;
  
  RETURN bar_kg + (per_side_actual * 2);
END;
$$;