-- Step 7: Mixed-Unit & Inventory Consistency (KG/LB + per-gym overrides)
-- Complete missing mixed-unit infrastructure

-- 7.1 Add native_unit to gym inventory tables (no destructive changes)
-- Ensure all gym inventory supports mixed units with native_unit tracking

-- Add native_unit to user_gym_plates if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_gym_plates' AND column_name = 'native_unit'
  ) THEN
    ALTER TABLE public.user_gym_plates ADD COLUMN native_unit weight_unit DEFAULT 'kg';
    -- Rename existing unit to native_unit for clarity
    UPDATE public.user_gym_plates SET native_unit = unit;
  END IF;
END $$;

-- Add native_unit to user_gym_dumbbells if not exists  
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_gym_dumbbells' AND column_name = 'native_unit'
  ) THEN
    ALTER TABLE public.user_gym_dumbbells ADD COLUMN native_unit weight_unit DEFAULT 'kg';
    UPDATE public.user_gym_dumbbells SET native_unit = unit;
  END IF;
END $$;

-- Add native_unit to user_gym_miniweights if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_gym_miniweights' AND column_name = 'native_unit'
  ) THEN
    ALTER TABLE public.user_gym_miniweights ADD COLUMN native_unit weight_unit DEFAULT 'kg';
    UPDATE public.user_gym_miniweights SET native_unit = unit;
  END IF;
END $$;

-- 7.2 Add label/color columns for uniqueness constraint support
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_gym_plates' AND column_name = 'label'
  ) THEN
    ALTER TABLE public.user_gym_plates ADD COLUMN label text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_gym_plates' AND column_name = 'color'
  ) THEN
    ALTER TABLE public.user_gym_plates ADD COLUMN color text;
  END IF;
END $$;

-- 7.3 Create unique constraint for mixed-unit inventories
-- Per gym, allow duplicates only when (equipment_kind, native_unit, weight_value, color/label) differs
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_gym_plates_unique_mixed_unit'
  ) THEN
    ALTER TABLE public.user_gym_plates 
    ADD CONSTRAINT user_gym_plates_unique_mixed_unit 
    UNIQUE (user_gym_id, native_unit, weight, COALESCE(label, ''), COALESCE(color, ''));
  END IF;
END $$;

-- 7.4 Mixed-unit conversion and sum functions
CREATE OR REPLACE FUNCTION public.sum_plates_mixed_units(
  plate_weights_kg numeric[],
  plate_units text[],
  display_unit weight_unit DEFAULT 'kg'
) RETURNS TABLE(total_kg numeric, total_display numeric, unit_display text)
LANGUAGE plpgsql IMMUTABLE
AS $$
DECLARE
  i integer;
  sum_kg numeric := 0;
  weight_kg numeric;
BEGIN
  -- Sum all plates converting to kg internally
  FOR i IN 1..array_length(plate_weights_kg, 1) LOOP
    weight_kg := CASE 
      WHEN plate_units[i] = 'lb' THEN plate_weights_kg[i] * 0.45359237
      ELSE plate_weights_kg[i]
    END;
    sum_kg := sum_kg + weight_kg;
  END LOOP;
  
  -- Return both kg and converted display value
  total_kg := sum_kg;
  total_display := CASE 
    WHEN display_unit = 'lb' THEN sum_kg / 0.45359237
    ELSE sum_kg
  END;
  unit_display := display_unit::text;
  
  RETURN NEXT;
END;
$$;

-- 7.5 Mixed-unit increment calculation
CREATE OR REPLACE FUNCTION public.calculate_mixed_unit_increment(
  gym_id uuid,
  load_type text,
  display_unit weight_unit DEFAULT 'kg'
) RETURNS numeric
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  min_kg_plate numeric;
  min_lb_plate numeric;
  min_single_kg numeric;
  min_single_lb numeric;
  result_kg numeric;
BEGIN
  IF load_type = 'dual_load' THEN
    -- Find smallest plate in kg inventory
    SELECT MIN(weight) INTO min_kg_plate
    FROM user_gym_plates ugp
    JOIN user_gym_profiles ugpf ON ugpf.id = ugp.user_gym_id
    WHERE ugpf.gym_id = gym_id AND ugp.native_unit = 'kg';
    
    -- Find smallest plate in lb inventory
    SELECT MIN(weight * 0.45359237) INTO min_lb_plate  -- Convert to kg
    FROM user_gym_plates ugp
    JOIN user_gym_profiles ugpf ON ugpf.id = ugp.user_gym_id
    WHERE ugpf.gym_id = gym_id AND ugp.native_unit = 'lb';
    
    -- Take smallest across both inventories, multiply by 2 (both sides)
    result_kg := 2 * LEAST(
      COALESCE(min_kg_plate, 999), 
      COALESCE(min_lb_plate, 999)
    );
    
  ELSE -- single_load or stack
    -- Find smallest increment across dumbbells/machines in both units
    SELECT MIN(CASE WHEN native_unit = 'kg' THEN weight ELSE weight * 0.45359237 END) 
    INTO min_single_kg
    FROM user_gym_dumbbells ugd
    JOIN user_gym_profiles ugpf ON ugpf.id = ugd.user_gym_id
    WHERE ugpf.gym_id = gym_id;
    
    result_kg := COALESCE(min_single_kg, 2.5);
  END IF;
  
  -- Convert to display unit
  RETURN CASE 
    WHEN display_unit = 'lb' THEN result_kg / 0.45359237
    ELSE result_kg
  END;
END;
$$;

-- 7.6 View for mixed-unit gym inventory display
CREATE OR REPLACE VIEW public.v_gym_inventory_mixed_units AS
SELECT 
  ugp.id,
  ugp.user_gym_id,
  ugpf.gym_id,
  'plate' as item_type,
  ugp.weight as native_weight,
  ugp.native_unit,
  CASE 
    WHEN ugp.native_unit = 'kg' THEN ugp.weight / 0.45359237
    ELSE ugp.weight * 0.45359237 
  END as converted_weight,
  CASE 
    WHEN ugp.native_unit = 'kg' THEN 'lb'::weight_unit
    ELSE 'kg'::weight_unit 
  END as converted_unit,
  ugp.count_per_side as quantity,
  ugp.label,
  ugp.color
FROM user_gym_plates ugp
JOIN user_gym_profiles ugpf ON ugpf.id = ugp.user_gym_id

UNION ALL

SELECT 
  ugd.id,
  ugd.user_gym_id,
  ugpf.gym_id,
  'dumbbell' as item_type,
  ugd.weight as native_weight,
  ugd.native_unit,
  CASE 
    WHEN ugd.native_unit = 'kg' THEN ugd.weight / 0.45359237
    ELSE ugd.weight * 0.45359237 
  END as converted_weight,
  CASE 
    WHEN ugd.native_unit = 'kg' THEN 'lb'::weight_unit
    ELSE 'kg'::weight_unit 
  END as converted_unit,
  ugd.count as quantity,
  NULL as label,
  NULL as color
FROM user_gym_dumbbells ugd
JOIN user_gym_profiles ugpf ON ugpf.id = ugd.user_gym_id;

-- 7.7 RLS for new view
ALTER VIEW public.v_gym_inventory_mixed_units OWNER TO postgres;
GRANT SELECT ON public.v_gym_inventory_mixed_units TO authenticated;