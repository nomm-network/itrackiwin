-- Step 1: Weight Configuration Data Model & RPCs
-- Creates tables, views, and functions for flexible weight management

-- 1) Types & enums (create if missing)
DO $$ BEGIN
  CREATE TYPE weight_unit AS ENUM ('kg','lb');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE fixed_bar_kind AS ENUM ('straight','ez');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE load_type AS ENUM ('dual_load','single_load','stack','none');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Global catalogs (defaults) — profiles + components

-- Plate profile header (global or gym-specific via child table below)
CREATE TABLE IF NOT EXISTS plate_profiles (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  default_unit  weight_unit NOT NULL DEFAULT 'kg',
  notes         text,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Plates inside a plate profile (weights stored in kg)
CREATE TABLE IF NOT EXISTS plate_profile_plates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      uuid NOT NULL REFERENCES plate_profiles(id) ON DELETE CASCADE,
  weight_kg       numeric(6,3) NOT NULL CHECK (weight_kg > 0),
  count_per_side  integer,        -- optional for UIs; calculators care about weight_kg
  display_order   int NOT NULL DEFAULT 100
);

-- Dumbbell sets (global defaults)
CREATE TABLE IF NOT EXISTS dumbbell_sets (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  default_unit  weight_unit NOT NULL DEFAULT 'kg',
  -- store as kg; min .. max + step
  min_kg        numeric(6,3) NOT NULL,
  max_kg        numeric(6,3) NOT NULL,
  step_kg       numeric(6,3) NOT NULL,
  notes         text,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CHECK (min_kg > 0 AND max_kg >= min_kg AND step_kg > 0)
);

-- Fixed bars (global defaults): straight/EZ pre-weighted bars on racks
CREATE TABLE IF NOT EXISTS fixed_bars (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  kind          fixed_bar_kind NOT NULL,
  default_unit  weight_unit NOT NULL DEFAULT 'kg',
  -- Often they come in a range: min..max step
  min_kg        numeric(6,3) NOT NULL,
  max_kg        numeric(6,3) NOT NULL,
  step_kg       numeric(6,3) NOT NULL,
  is_active     boolean NOT NULL DEFAULT true,
  notes         text
);

-- Machine stacks and micro adders (global defaults)
CREATE TABLE IF NOT EXISTS stack_profiles (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  default_unit  weight_unit NOT NULL DEFAULT 'kg',
  -- store each plate step in kg for the main stack
  stack_steps_kg numeric[] NOT NULL,  -- e.g. {5,10,15,...}
  aux_adders_kg  numeric[] DEFAULT '{}',  -- e.g. {1.25, 2.5} for magnets/microplates
  is_active     boolean NOT NULL DEFAULT true,
  notes         text
);

-- Seed two global defaults (only if absent)

-- EU plates (kg)
INSERT INTO plate_profiles (id, name, default_unit)
SELECT gen_random_uuid(), 'EU Standard KG', 'kg'
WHERE NOT EXISTS (SELECT 1 FROM plate_profiles WHERE name='EU Standard KG');

INSERT INTO plate_profile_plates (profile_id, weight_kg, display_order)
SELECT pp.id, x.w, x.o
FROM plate_profiles pp
JOIN (VALUES (25,10),(20,20),(15,30),(10,40),(5,50),(2.5,60),(1.25,70),(0.5,80)) AS x(w,o) ON true
WHERE pp.name='EU Standard KG'
  AND NOT EXISTS (SELECT 1 FROM plate_profile_plates p WHERE p.profile_id=pp.id);

-- US plates (lb)
INSERT INTO plate_profiles (id, name, default_unit)
SELECT gen_random_uuid(), 'US Standard LB', 'lb'
WHERE NOT EXISTS (SELECT 1 FROM plate_profiles WHERE name='US Standard LB');

-- store as kg: 45,35,25,10,5,2.5 lb
INSERT INTO plate_profile_plates (profile_id, weight_kg, display_order)
SELECT pp.id, x.w_lb * 0.45359237, x.o
FROM plate_profiles pp
JOIN (VALUES (45,10),(35,20),(25,30),(10,40),(5,50),(2.5,60)) AS x(w_lb,o) ON true
WHERE pp.name='US Standard LB'
  AND NOT EXISTS (SELECT 1 FROM plate_profile_plates p WHERE p.profile_id=pp.id);

-- Default dumbbells (kg & lb ranges)
INSERT INTO dumbbell_sets (name, default_unit, min_kg, max_kg, step_kg, is_active)
SELECT 'DB Range 2.5–50 kg', 'kg', 2.5, 50, 2.5, true
WHERE NOT EXISTS (SELECT 1 FROM dumbbell_sets WHERE name='DB Range 2.5–50 kg');

INSERT INTO dumbbell_sets (name, default_unit, min_kg, max_kg, step_kg, is_active)
SELECT 'DB Range 5–120 lb', 'lb', 5*0.45359237, 120*0.45359237, 5*0.45359237, true
WHERE NOT EXISTS (SELECT 1 FROM dumbbell_sets WHERE name='DB Range 5–120 lb');

-- Fixed bars
INSERT INTO fixed_bars (name, kind, default_unit, min_kg, max_kg, step_kg, is_active)
SELECT 'Straight Bars 10–50 kg', 'straight', 'kg', 10, 50, 5, true
WHERE NOT EXISTS (SELECT 1 FROM fixed_bars WHERE name='Straight Bars 10–50 kg');

INSERT INTO fixed_bars (name, kind, default_unit, min_kg, max_kg, step_kg, is_active)
SELECT 'EZ Bars 20–110 lb', 'ez', 'lb', 20*0.45359237, 110*0.45359237, 10*0.45359237, true
WHERE NOT EXISTS (SELECT 1 FROM fixed_bars WHERE name='EZ Bars 20–110 lb');

-- Stack profiles
INSERT INTO stack_profiles (name, default_unit, stack_steps_kg, aux_adders_kg, is_active)
SELECT 'Stack 5 kg steps + micro 1.25 kg', 'kg', 
       ARRAY(SELECT generate_series(5, 200, 5)::numeric), ARRAY[1.25]::numeric[], true
WHERE NOT EXISTS (SELECT 1 FROM stack_profiles WHERE name='Stack 5 kg steps + micro 1.25 kg');

INSERT INTO stack_profiles (name, default_unit, stack_steps_kg, aux_adders_kg, is_active)
SELECT 'Stack 10 lb steps + micro 2.5 lb', 'lb', 
       ARRAY(SELECT (10*n*0.45359237)::numeric FROM generate_series(1, 40) n), 
       ARRAY[2.5*0.45359237]::numeric[], true
WHERE NOT EXISTS (SELECT 1 FROM stack_profiles WHERE name='Stack 10 lb steps + micro 2.5 lb');

-- 3) Gym overrides (link a gym to chosen profiles; allow dual-unit)

-- One row per gym to declare *which* profiles apply.
CREATE TABLE IF NOT EXISTS gym_weight_configs (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id              uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,

  -- Chosen defaults for racks / bars:
  plate_profile_id    uuid REFERENCES plate_profiles(id),
  dumbbell_set_id     uuid REFERENCES dumbbell_sets(id),
  fixed_straight_id   uuid REFERENCES fixed_bars(id),  -- should be kind='straight'
  fixed_ez_id         uuid REFERENCES fixed_bars(id),  -- should be kind='ez'
  stack_profile_id    uuid REFERENCES stack_profiles(id),

  -- Display preference per area; calculators still work in kg internally.
  racks_display_unit  weight_unit DEFAULT 'kg',
  db_display_unit     weight_unit DEFAULT 'kg',
  bars_display_unit   weight_unit DEFAULT 'kg',
  stack_display_unit  weight_unit DEFAULT 'kg',

  -- allow a gym to declare it uses both units where needed
  allows_mixed_units  boolean NOT NULL DEFAULT false,

  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE(gym_id)
);

-- Optional per-equipment override (e.g., one particular machine uses a different stack)
CREATE TABLE IF NOT EXISTS gym_equipment_overrides (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id             uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  equipment_id       uuid NOT NULL REFERENCES equipment(id) ON DELETE CASCADE, -- or your machines table
  override_kind      text NOT NULL CHECK (override_kind IN ('plates','dumbbells','fixed_straight','fixed_ez','stack')),
  plate_profile_id   uuid REFERENCES plate_profiles(id),
  dumbbell_set_id    uuid REFERENCES dumbbell_sets(id),
  fixed_bar_id       uuid REFERENCES fixed_bars(id),
  stack_profile_id   uuid REFERENCES stack_profiles(id),
  display_unit       weight_unit, -- override display unit on this equipment
  UNIQUE(gym_id, equipment_id, override_kind)
);

-- 4) Views that resolve "effective" configurations

-- v_effective_gym_weight_config: gym-level result after applying defaults
CREATE OR REPLACE VIEW v_effective_gym_weight_config AS
SELECT
  gwc.gym_id,
  gwc.plate_profile_id,
  gwc.dumbbell_set_id,
  gwc.fixed_straight_id,
  gwc.fixed_ez_id,
  gwc.stack_profile_id,
  gwc.racks_display_unit,
  gwc.db_display_unit,
  gwc.bars_display_unit,
  gwc.stack_display_unit,
  gwc.allows_mixed_units
FROM gym_weight_configs gwc;

-- 5) RPCs the app will call

-- Return the *effective* config for a gym + optional equipment_id (applies overrides if present)
CREATE OR REPLACE FUNCTION public.fn_effective_weight_config(
  p_gym_id uuid,
  p_equipment_id uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER
AS $$
DECLARE
  base record;
  over record;
  result jsonb;
BEGIN
  SELECT * INTO base FROM v_effective_gym_weight_config WHERE gym_id = p_gym_id;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  IF p_equipment_id IS NOT NULL THEN
    SELECT * INTO over FROM gym_equipment_overrides 
     WHERE gym_id = p_gym_id AND equipment_id = p_equipment_id
     ORDER BY id DESC LIMIT 1;
  END IF;

  result := jsonb_build_object(
    'gym_id', p_gym_id,
    'allows_mixed_units', base.allows_mixed_units,
    'plate_profile_id', COALESCE(over.plate_profile_id, base.plate_profile_id),
    'dumbbell_set_id',  COALESCE(over.dumbbell_set_id,  base.dumbbell_set_id),
    'fixed_straight_id',COALESCE(over.fixed_bar_id,     base.fixed_straight_id),
    'fixed_ez_id',      base.fixed_ez_id,
    'stack_profile_id', COALESCE(over.stack_profile_id, base.stack_profile_id),
    'racks_display_unit', COALESCE(over.display_unit, base.racks_display_unit)
  );
  RETURN result;
END $$;

-- Get discrete "next-step" list for the requested context (plates/dumbbells/fixed/stack)
-- Returns candidate steps in kg and display unit.
CREATE OR REPLACE FUNCTION public.fn_weight_steps(
  p_kind text,               -- 'plates'|'dumbbells'|'fixed_straight'|'fixed_ez'|'stack'
  p_gym_id uuid,
  p_equipment_id uuid DEFAULT NULL
) RETURNS TABLE(
  step_kg numeric,
  step_display numeric,
  display_unit weight_unit
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
AS $$
DECLARE
  cfg jsonb;
  unit weight_unit;
BEGIN
  cfg := public.fn_effective_weight_config(p_gym_id, p_equipment_id);
  IF cfg IS NULL THEN RETURN; END IF;

  -- Choose display unit by area; default racks for plates/fixed, db for dumbbells, stack for stack
  unit := CASE
    WHEN p_kind IN ('plates','fixed_straight','fixed_ez') THEN (cfg->>'racks_display_unit')::weight_unit
    WHEN p_kind = 'dumbbells' THEN 'kg'::weight_unit -- we could fetch db_display_unit similarly with more fields
    WHEN p_kind = 'stack' THEN 'kg'::weight_unit
    ELSE 'kg'::weight_unit
  END;

  IF p_kind='plates' THEN
    RETURN QUERY
    SELECT p.weight_kg,
           CASE WHEN unit='lb' THEN (p.weight_kg/0.45359237) ELSE p.weight_kg END,
           unit
    FROM plate_profile_plates p
    WHERE p.profile_id = (cfg->>'plate_profile_id')::uuid
    ORDER BY p.display_order;

  ELSIF p_kind='dumbbells' THEN
    RETURN QUERY
    SELECT g AS step_kg,
           CASE WHEN unit='lb' THEN (g/0.45359237) ELSE g END,
           unit
    FROM (
      SELECT generate_series(d.min_kg, d.max_kg, d.step_kg) g
      FROM dumbbell_sets d
      WHERE d.id = (cfg->>'dumbbell_set_id')::uuid
    ) s;

  ELSIF p_kind IN ('fixed_straight','fixed_ez') THEN
    RETURN QUERY
    SELECT g AS step_kg,
           CASE WHEN unit='lb' THEN (g/0.45359237) ELSE g END,
           unit
    FROM (
      SELECT generate_series(f.min_kg, f.max_kg, f.step_kg) g
      FROM fixed_bars f
      WHERE f.id = (
        CASE WHEN p_kind='fixed_straight' THEN (cfg->>'fixed_straight_id')::uuid
             ELSE (cfg->>'fixed_ez_id')::uuid END
      )
    ) s;

  ELSIF p_kind='stack' THEN
    RETURN QUERY
    SELECT s AS step_kg,
           CASE WHEN unit='lb' THEN (s/0.45359237) ELSE s END,
           unit
    FROM (
      SELECT unnest(sp.stack_steps_kg) s
      FROM stack_profiles sp
      WHERE sp.id = (cfg->>'stack_profile_id')::uuid
    ) t
    UNION ALL
    SELECT (s + a) AS step_kg,
           CASE WHEN unit='lb' THEN ((s+a)/0.45359237) ELSE (s+a) END,
           unit
    FROM (
      SELECT s, a
      FROM (
        SELECT unnest(sp.stack_steps_kg) s, unnest(COALESCE(sp.aux_adders_kg, '{}')) a
        FROM stack_profiles sp
        WHERE sp.id = (cfg->>'stack_profile_id')::uuid
      ) z
    ) q;

  END IF;
END $$;

-- Return the closest achievable weight to a desired number (kg input), given a context
CREATE OR REPLACE FUNCTION public.fn_closest_weight(
  p_kind text,               -- 'plates'|'dumbbells'|'fixed_straight'|'fixed_ez'|'stack'
  p_gym_id uuid,
  p_equipment_id uuid,
  p_desired_kg numeric
) RETURNS numeric
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  WITH steps AS (
    SELECT step_kg
    FROM public.fn_weight_steps(p_kind, p_gym_id, p_equipment_id)
  )
  SELECT step_kg
  FROM steps
  ORDER BY ABS(step_kg - p_desired_kg)
  LIMIT 1;
$$;

-- 6) Indexing & RLS

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_plate_profile_plates_profile ON plate_profile_plates(profile_id);
CREATE INDEX IF NOT EXISTS idx_gym_weight_configs_gym ON gym_weight_configs(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_equipment_overrides ON gym_equipment_overrides(gym_id, equipment_id);

-- RLS (tune to your roles)
ALTER TABLE gym_weight_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_equipment_overrides ENABLE ROW LEVEL SECURITY;

-- Example policies (adapt to your actual role funcs)
DO $$ BEGIN
  CREATE POLICY gym_w_cfg_select ON gym_weight_configs
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY gym_w_cfg_upsert ON gym_weight_configs
    FOR INSERT WITH CHECK (public.is_superadmin_simple() OR public.is_gym_admin(gym_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY gym_w_cfg_update ON gym_weight_configs
    FOR UPDATE USING (public.is_superadmin_simple() OR public.is_gym_admin(gym_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY gym_overrides_select ON gym_equipment_overrides
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY gym_overrides_write ON gym_equipment_overrides
    FOR ALL USING (public.is_superadmin_simple() OR public.is_gym_admin(gym_id))
                WITH CHECK (public.is_superadmin_simple() OR public.is_gym_admin(gym_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;