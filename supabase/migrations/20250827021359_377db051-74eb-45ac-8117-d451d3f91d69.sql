-- Add load semantics enums and equipment columns
DO $$ BEGIN
  CREATE TYPE load_type AS ENUM ('none', 'single_load', 'dual_load', 'stack');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE load_medium AS ENUM ('bar', 'plates', 'stack', 'bodyweight', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE equipment
  ADD COLUMN IF NOT EXISTS load_type load_type DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS load_medium load_medium DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS default_bar_weight_kg numeric,
  ADD COLUMN IF NOT EXISTS default_single_min_increment_kg numeric,
  ADD COLUMN IF NOT EXISTS default_side_min_plate_kg numeric,
  ADD COLUMN IF NOT EXISTS notes text;

-- Add indexes for load type queries
CREATE INDEX IF NOT EXISTS equipment_load_type_idx ON equipment(load_type);
CREATE INDEX IF NOT EXISTS equipment_load_medium_idx ON equipment(load_medium);

-- Gym plate inventory table
CREATE TABLE IF NOT EXISTS gym_plate_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  plate_kg numeric NOT NULL CHECK (plate_kg > 0),
  count integer NOT NULL CHECK (count >= 0),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (gym_id, plate_kg)
);

-- Gym equipment overrides table
CREATE TABLE IF NOT EXISTS gym_equipment_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  equipment_id uuid NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  bar_weight_kg numeric,
  side_min_plate_kg numeric,
  single_min_increment_kg numeric,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (gym_id, equipment_id)
);

-- Helper view for effective equipment settings
CREATE OR REPLACE VIEW v_equipment_effective AS
SELECT
  e.id AS equipment_id,
  e.load_type,
  e.load_medium,
  e.default_bar_weight_kg,
  e.default_side_min_plate_kg,
  e.default_single_min_increment_kg,
  geo.gym_id,
  COALESCE(geo.bar_weight_kg, e.default_bar_weight_kg) AS bar_weight_kg,
  COALESCE(geo.side_min_plate_kg, e.default_side_min_plate_kg) AS side_min_plate_kg,
  COALESCE(geo.single_min_increment_kg, e.default_single_min_increment_kg) AS single_min_increment_kg
FROM equipment e
LEFT JOIN gym_equipment_overrides geo ON geo.equipment_id = e.id;

-- Weight step calculation function
CREATE OR REPLACE FUNCTION next_weight_step_kg(
  p_load_type load_type,
  p_side_min_plate_kg numeric,
  p_single_min_increment_kg numeric
) RETURNS numeric 
LANGUAGE sql 
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_load_type = 'dual_load' THEN 2 * COALESCE(p_side_min_plate_kg, 1.25)
    WHEN p_load_type IN ('single_load','stack') THEN COALESCE(p_single_min_increment_kg, 2.5)
    ELSE 0
  END;
$$;