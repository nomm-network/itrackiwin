-- PHASE 1: Expand equipment table with metadata
ALTER TABLE equipment
ADD COLUMN IF NOT EXISTS equipment_type text NOT NULL DEFAULT 'machine',
ADD COLUMN IF NOT EXISTS default_stack jsonb DEFAULT '[]'::jsonb;

-- Seed minimal canonical equipment catalog
INSERT INTO equipment (id, slug, equipment_type) VALUES
(gen_random_uuid(), 'barbell', 'free_weight'),
(gen_random_uuid(), 'dumbbells_pair', 'free_weight'),
(gen_random_uuid(), 'smith_machine', 'machine'),
(gen_random_uuid(), 'cable_station', 'machine'),
(gen_random_uuid(), 'machine_lat_pulldown', 'machine'),
(gen_random_uuid(), 'machine_seated_row', 'machine'),
(gen_random_uuid(), 'machine_leg_press', 'machine'),
(gen_random_uuid(), 'machine_hack_squat', 'machine'),
(gen_random_uuid(), 'machine_chest_press', 'machine')
ON CONFLICT (slug) DO NOTHING;

-- Seed English translations automatically from slug
INSERT INTO equipment_translations (id, equipment_id, language_code, name)
SELECT gen_random_uuid(), e.id, 'en', initcap(replace(e.slug, '_', ' '))
FROM equipment e
WHERE NOT EXISTS (
  SELECT 1 FROM equipment_translations t
  WHERE t.equipment_id = e.id AND t.language_code = 'en'
);

-- PHASE 2: Exercise equipment variants support
CREATE TABLE IF NOT EXISTS exercise_equipment_variants (
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  equipment_id uuid NOT NULL REFERENCES equipment(id) ON DELETE RESTRICT,
  is_preferred boolean NOT NULL DEFAULT false,
  PRIMARY KEY (exercise_id, equipment_id)
);

-- Backfill equipment_id for common patterns (before making it NOT NULL)
UPDATE exercises
SET equipment_id = (SELECT id FROM equipment WHERE slug='barbell')
WHERE lower(name) LIKE '%barbell%' AND equipment_id IS NULL;

UPDATE exercises
SET equipment_id = (SELECT id FROM equipment WHERE slug='machine_lat_pulldown')
WHERE lower(name) LIKE '%lat pulldown%' AND equipment_id IS NULL;

UPDATE exercises
SET equipment_id = (SELECT id FROM equipment WHERE slug='cable_station')
WHERE (lower(name) LIKE '%cable%' OR lower(name) LIKE '%pulldown%') AND equipment_id IS NULL;

UPDATE exercises
SET equipment_id = (SELECT id FROM equipment WHERE slug='dumbbells_pair')
WHERE lower(name) LIKE '%dumbbell%' AND equipment_id IS NULL;

UPDATE exercises
SET equipment_id = (SELECT id FROM equipment WHERE slug='smith_machine')
WHERE lower(name) LIKE '%smith%' AND equipment_id IS NULL;

-- Set a default equipment for exercises that still don't have one
UPDATE exercises
SET equipment_id = (SELECT id FROM equipment WHERE slug='barbell' LIMIT 1)
WHERE equipment_id IS NULL;

-- Now make equipment_id required
ALTER TABLE exercises
ALTER COLUMN equipment_id SET NOT NULL;

-- PHASE 3: Unified gym equipment inventory
CREATE TABLE IF NOT EXISTS gym_equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  equipment_id uuid NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  custom_stack jsonb DEFAULT NULL, -- e.g. [{"kg": 36}, {"kg": 41}, {"kg": 46}, {"kg": 51, "aux": 2}]
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(gym_id, equipment_id)
);

-- PHASE 4: Resolver views and functions for exercise availability
-- Default gym per user (corrected based on actual schema)
CREATE OR REPLACE VIEW v_user_default_gym AS
SELECT ugm.user_id, ugm.gym_id, ug.id AS user_gym_id
FROM user_gym_memberships ugm
JOIN user_gyms ug ON ug.user_id = ugm.user_id
WHERE ugm.is_default = TRUE;

-- Resolve all equipment_ids present in the user's default gym
CREATE OR REPLACE VIEW v_user_gym_equipment AS
-- Machines (explicitly stored with equipment_id)
SELECT v.user_id, v.user_gym_id, e.id AS equipment_id
FROM v_user_default_gym v
JOIN user_gym_machines m ON m.user_gym_id = v.user_gym_id
LEFT JOIN equipment e ON e.id = m.equipment_id
WHERE e.id IS NOT NULL
UNION
-- Any bar set implies 'barbell' availability
SELECT v.user_id, v.user_gym_id, e2.id
FROM v_user_default_gym v
JOIN equipment e2 ON e2.slug = 'barbell'
JOIN user_gym_bars b ON b.user_gym_id = v.user_gym_id
UNION
-- Any dumbbell rack implies 'dumbbells_pair'
SELECT v.user_id, v.user_gym_id, e3.id
FROM v_user_default_gym v
JOIN equipment e3 ON e3.slug = 'dumbbells_pair'
JOIN user_gym_dumbbells d ON d.user_gym_id = v.user_gym_id
UNION
-- Equipment from unified gym_equipment table
SELECT v.user_id, v.user_gym_id, ge.equipment_id
FROM v_user_default_gym v
JOIN gym_equipment ge ON ge.gym_id = v.gym_id
GROUP BY 1,2,3;

-- Final: exercises available for a user (primary equipment OR listed variant)
CREATE OR REPLACE VIEW v_available_exercises AS
WITH ex_all AS (
  SELECT ex.id, ex.name, ex.body_part_id, ex.equipment_id
  FROM exercises ex
)
SELECT DISTINCT
  u.user_id,
  ex.id AS exercise_id
FROM v_user_gym_equipment u
JOIN ex_all ex ON (
  ex.equipment_id = u.equipment_id
  OR EXISTS (
    SELECT 1
    FROM exercise_equipment_variants v
    WHERE v.exercise_id = ex.id AND v.equipment_id = u.equipment_id
  )
);

-- Lightweight RPC for the app
CREATE OR REPLACE FUNCTION fn_available_exercises_for_user(_user uuid)
RETURNS TABLE (exercise_id uuid)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT exercise_id
  FROM v_available_exercises
  WHERE user_id = _user
$$;

-- PHASE 5: RLS guardrails
-- Policy for exercise equipment variants
ALTER TABLE exercise_equipment_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Exercise variants are viewable by everyone" 
ON exercise_equipment_variants 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage exercise variants" 
ON exercise_equipment_variants 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Policy for gym equipment
ALTER TABLE gym_equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gym equipment is viewable by everyone" 
ON gym_equipment 
FOR SELECT 
USING (true);

CREATE POLICY "Gym admins can manage equipment" 
ON gym_equipment 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM gym_admins ga 
    WHERE ga.user_id = auth.uid() AND ga.gym_id = gym_equipment.gym_id
  )
  OR is_admin(auth.uid())
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM gym_admins ga 
    WHERE ga.user_id = auth.uid() AND ga.gym_id = gym_equipment.gym_id
  )
  OR is_admin(auth.uid())
);

-- Add missing RLS policies for existing gym tables if they don't exist
DO $$
BEGIN
  -- Check if policy exists for user_gym_machines
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_gym_machines' AND policyname = 'own_gym_assets_all'
  ) THEN
    EXECUTE 'CREATE POLICY own_gym_assets_all ON user_gym_machines
    FOR ALL
    USING (EXISTS (SELECT 1 FROM user_gyms ug WHERE ug.id = user_gym_id AND ug.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM user_gyms ug WHERE ug.id = user_gym_id AND ug.user_id = auth.uid()))';
  END IF;

  -- Check if policy exists for user_gym_dumbbells
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_gym_dumbbells' AND policyname = 'own_gym_assets_all_dumbbells'
  ) THEN
    EXECUTE 'CREATE POLICY own_gym_assets_all_dumbbells ON user_gym_dumbbells
    FOR ALL
    USING (EXISTS (SELECT 1 FROM user_gyms ug WHERE ug.id = user_gym_id AND ug.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM user_gyms ug WHERE ug.id = user_gym_id AND ug.user_id = auth.uid()))';
  END IF;

  -- Similar for other gym asset tables
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_gym_bars' AND policyname = 'own_gym_assets_all_bars'
  ) THEN
    EXECUTE 'CREATE POLICY own_gym_assets_all_bars ON user_gym_bars
    FOR ALL
    USING (EXISTS (SELECT 1 FROM user_gyms ug WHERE ug.id = user_gym_id AND ug.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM user_gyms ug WHERE ug.id = user_gym_id AND ug.user_id = auth.uid()))';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_gym_plates' AND policyname = 'own_gym_assets_all_plates'
  ) THEN
    EXECUTE 'CREATE POLICY own_gym_assets_all_plates ON user_gym_plates
    FOR ALL
    USING (EXISTS (SELECT 1 FROM user_gyms ug WHERE ug.id = user_gym_id AND ug.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM user_gyms ug WHERE ug.id = user_gym_id AND ug.user_id = auth.uid()))';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_gym_miniweights' AND policyname = 'own_gym_assets_all_miniweights'
  ) THEN
    EXECUTE 'CREATE POLICY own_gym_assets_all_miniweights ON user_gym_miniweights
    FOR ALL
    USING (EXISTS (SELECT 1 FROM user_gyms ug WHERE ug.id = user_gym_id AND ug.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM user_gyms ug WHERE ug.id = user_gym_id AND ug.user_id = auth.uid()))';
  END IF;
END
$$;