-- Database functions for effective profile resolution and upserts

-- Function to get effective plate profile for a gym and unit
CREATE OR REPLACE FUNCTION public.get_effective_plate_profile(
  _gym_id uuid,
  _unit weight_unit
) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  gym_config record;
  plate_profile record;
  plates numeric[];
  result jsonb;
BEGIN
  -- Get gym config
  SELECT * INTO gym_config FROM gym_weight_configs WHERE gym_id = _gym_id;
  
  -- If no gym config, use defaults
  IF NOT FOUND THEN
    SELECT id INTO gym_config FROM plate_profiles 
    WHERE (_unit = 'kg' AND name = 'EU Standard KG') OR (_unit = 'lb' AND name = 'US Standard LB')
    LIMIT 1;
  END IF;
  
  -- Get plate profile
  SELECT * INTO plate_profile FROM plate_profiles 
  WHERE id = COALESCE(gym_config.plate_profile_id, 
    (SELECT id FROM plate_profiles 
     WHERE (_unit = 'kg' AND name = 'EU Standard KG') OR (_unit = 'lb' AND name = 'US Standard LB')
     LIMIT 1)
  );
  
  -- Get plates in requested unit
  SELECT array_agg(
    CASE 
      WHEN _unit = 'kg' THEN weight_kg
      ELSE weight_kg / 0.45359237 -- convert to lb
    END ORDER BY display_order
  ) INTO plates
  FROM plate_profile_plates 
  WHERE profile_id = plate_profile.id;
  
  result := jsonb_build_object(
    'unit', _unit,
    'barbell_weight', CASE WHEN _unit = 'kg' THEN 20 ELSE 45 END,
    'ezbar_weight', CASE WHEN _unit = 'kg' THEN 7.5 ELSE 15 END,
    'fixedbar_weight', CASE WHEN _unit = 'kg' THEN 20 ELSE 45 END,
    'sides', COALESCE(plates, '{}'),
    'micro', CASE WHEN _unit = 'kg' THEN '[0.5, 1.25]' ELSE '[1, 2.5]' END::jsonb
  );
  
  RETURN result;
END $$;

-- Function to upsert gym plate profile
CREATE OR REPLACE FUNCTION public.upsert_gym_plate_profile(
  _gym_id uuid,
  _unit weight_unit,
  _bar numeric,
  _ez numeric, 
  _fixed numeric,
  _sides numeric[],
  _micro numeric[]
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_id uuid;
  config_id uuid;
BEGIN
  -- Create or get plate profile
  INSERT INTO plate_profiles (name, default_unit, notes)
  VALUES (format('Gym %s Profile %s', _gym_id, _unit), _unit, 'Custom gym profile')
  ON CONFLICT DO NOTHING
  RETURNING id INTO profile_id;
  
  IF profile_id IS NULL THEN
    SELECT id INTO profile_id FROM plate_profiles 
    WHERE name = format('Gym %s Profile %s', _gym_id, _unit);
  END IF;
  
  -- Clear existing plates
  DELETE FROM plate_profile_plates WHERE profile_id = profile_id;
  
  -- Insert new plates (convert to kg for storage)
  INSERT INTO plate_profile_plates (profile_id, weight_kg, display_order)
  SELECT profile_id, 
         CASE WHEN _unit = 'kg' THEN unnest ELSE unnest * 0.45359237 END,
         row_number() OVER () * 10
  FROM unnest(_sides);
  
  -- Upsert gym config
  INSERT INTO gym_weight_configs (gym_id, plate_profile_id, racks_display_unit)
  VALUES (_gym_id, profile_id, _unit)
  ON CONFLICT (gym_id) DO UPDATE SET
    plate_profile_id = EXCLUDED.plate_profile_id,
    racks_display_unit = EXCLUDED.racks_display_unit;
END $$;

-- Function to upsert gym dumbbell sets
CREATE OR REPLACE FUNCTION public.upsert_gym_dumbbell_sets(
  _gym_id uuid,
  _unit weight_unit,
  _pairs numeric[]
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  set_id uuid;
  min_weight numeric;
  max_weight numeric;
  step_weight numeric;
BEGIN
  IF array_length(_pairs, 1) = 0 THEN RETURN; END IF;
  
  min_weight := _pairs[1];
  max_weight := _pairs[array_length(_pairs, 1)];
  step_weight := CASE 
    WHEN array_length(_pairs, 1) > 1 THEN _pairs[2] - _pairs[1]
    ELSE 2.5
  END;
  
  -- Convert to kg for storage
  IF _unit = 'lb' THEN
    min_weight := min_weight * 0.45359237;
    max_weight := max_weight * 0.45359237;
    step_weight := step_weight * 0.45359237;
  END IF;
  
  -- Create dumbbell set
  INSERT INTO dumbbell_sets (name, default_unit, min_kg, max_kg, step_kg)
  VALUES (format('Gym %s Dumbbells %s', _gym_id, _unit), _unit, min_weight, max_weight, step_weight)
  RETURNING id INTO set_id;
  
  -- Update gym config
  INSERT INTO gym_weight_configs (gym_id, dumbbell_set_id, db_display_unit)
  VALUES (_gym_id, set_id, _unit)
  ON CONFLICT (gym_id) DO UPDATE SET
    dumbbell_set_id = EXCLUDED.dumbbell_set_id,
    db_display_unit = EXCLUDED.db_display_unit;
END $$;

-- Function to upsert gym stack steps
CREATE OR REPLACE FUNCTION public.upsert_gym_stack_steps(
  _gym_id uuid,
  _machine_id uuid,
  _unit weight_unit,
  _steps numeric[],
  _aux numeric[]
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_id uuid;
  steps_kg numeric[];
  aux_kg numeric[];
BEGIN
  -- Convert to kg for storage
  IF _unit = 'lb' THEN
    SELECT array_agg(s * 0.45359237) INTO steps_kg FROM unnest(_steps) s;
    SELECT array_agg(a * 0.45359237) INTO aux_kg FROM unnest(_aux) a;
  ELSE
    steps_kg := _steps;
    aux_kg := _aux;
  END IF;
  
  -- Create stack profile
  INSERT INTO stack_profiles (name, default_unit, stack_steps_kg, aux_adders_kg)
  VALUES (format('Gym %s Stack %s', _gym_id, _unit), _unit, steps_kg, aux_kg)
  RETURNING id INTO profile_id;
  
  -- Update gym config
  INSERT INTO gym_weight_configs (gym_id, stack_profile_id, stack_display_unit)
  VALUES (_gym_id, profile_id, _unit)
  ON CONFLICT (gym_id) DO UPDATE SET
    stack_profile_id = EXCLUDED.stack_profile_id,
    stack_display_unit = EXCLUDED.stack_display_unit;
END $$;

-- View for gym effective plates
CREATE OR REPLACE VIEW v_gym_effective_plates AS
SELECT 
  g.id as gym_id,
  'kg'::weight_unit as unit,
  public.get_effective_plate_profile(g.id, 'kg') as kg_profile,
  public.get_effective_plate_profile(g.id, 'lb') as lb_profile
FROM gyms g;