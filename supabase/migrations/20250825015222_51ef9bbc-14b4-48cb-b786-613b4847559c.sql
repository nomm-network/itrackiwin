-- Phase 7: Clean up old gym_machines infrastructure
-- Drop old gym_machines related tables (all empty, safe to drop)

DROP TABLE IF EXISTS gym_machine_grip_options CASCADE;
DROP TABLE IF EXISTS gym_machine_usage_stats CASCADE;
DROP TABLE IF EXISTS gym_machines CASCADE;

-- Update views to use the new simplified model
-- The v_user_gym_equipment view now works with the existing user_gym_* tables
-- but can be extended to work with gym_equipment when users migrate

-- Add some indexes for performance
CREATE INDEX IF NOT EXISTS idx_gym_equipment_gym_id ON gym_equipment(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_equipment_equipment_id ON gym_equipment(equipment_id);

-- Add a helper function to migrate user inventory to gym-level inventory
CREATE OR REPLACE FUNCTION migrate_user_gym_to_gym_equipment(_user_gym_id uuid, _gym_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Migrate machines
  INSERT INTO gym_equipment (gym_id, equipment_id, custom_stack)
  SELECT _gym_id, equipment_id, 
    CASE 
      WHEN stack_values IS NOT NULL THEN 
        jsonb_agg(jsonb_build_object('kg', unnest(stack_values)))
      ELSE NULL
    END
  FROM user_gym_machines
  WHERE user_gym_id = _user_gym_id AND equipment_id IS NOT NULL
  GROUP BY equipment_id
  ON CONFLICT (gym_id, equipment_id) DO NOTHING;

  -- For dumbbells, add generic dumbbell equipment
  INSERT INTO gym_equipment (gym_id, equipment_id, custom_stack)
  SELECT _gym_id, e.id,
    jsonb_agg(jsonb_build_object('kg', d.weight) ORDER BY d.weight)
  FROM user_gym_dumbbells d
  CROSS JOIN equipment e
  WHERE d.user_gym_id = _user_gym_id 
    AND e.slug = 'dumbbells_pair'
  GROUP BY e.id
  ON CONFLICT (gym_id, equipment_id) DO NOTHING;

  -- For barbells, add generic barbell equipment  
  INSERT INTO gym_equipment (gym_id, equipment_id)
  SELECT _gym_id, e.id
  FROM user_gym_bars b
  CROSS JOIN equipment e
  WHERE b.user_gym_id = _user_gym_id
    AND e.slug = 'barbell'
  LIMIT 1
  ON CONFLICT (gym_id, equipment_id) DO NOTHING;
END;
$$;