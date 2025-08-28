-- Create direct mapping table for specific handle-equipment pairs
CREATE TABLE IF NOT EXISTS handle_equipment (
  handle_id   uuid REFERENCES handles(id) ON DELETE CASCADE,
  equipment_id uuid REFERENCES equipment(id) ON DELETE CASCADE,
  PRIMARY KEY (handle_id, equipment_id)
);

-- Create rule-based mapping table for equipment compatibility rules
CREATE TABLE IF NOT EXISTS handle_equipment_rules (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handle_id     uuid NOT NULL REFERENCES handles(id) ON DELETE CASCADE,
  equipment_type text,              -- e.g. 'machine', 'free_weight', 'support', 'cardio', 'bodyweight'
  kind          text,               -- e.g. 'cable', 'pulldown', 'row', 'press', 'bench', etc.
  load_type     load_type,          -- 'none' | 'single_load' | 'dual_load' | 'stack'
  load_medium   load_medium,        -- 'bar' | 'plates' | 'stack' | 'bodyweight' | 'band' | 'chain' | 'flywheel' | 'other'
  -- at least one filter must be set
  CHECK (equipment_type IS NOT NULL OR kind IS NOT NULL OR load_type IS NOT NULL OR load_medium IS NOT NULL)
);

-- Create convenience view that unions direct links with rule matches
CREATE OR REPLACE VIEW handle_equipment_effective AS
SELECT he.handle_id, he.equipment_id
FROM handle_equipment he
UNION
SELECT r.handle_id, e.id AS equipment_id
FROM handle_equipment_rules r
JOIN equipment e
  ON (r.equipment_type IS NULL OR e.equipment_type = r.equipment_type)
 AND (r.kind           IS NULL OR e.kind           = r.kind)
 AND (r.load_type      IS NULL OR e.load_type      = r.load_type)
 AND (r.load_medium    IS NULL OR e.load_medium    = r.load_medium);

-- Enable RLS on new tables
ALTER TABLE handle_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE handle_equipment_rules ENABLE ROW LEVEL SECURITY;

-- RLS policies for handle_equipment
CREATE POLICY "handle_equipment_select_all" ON handle_equipment FOR SELECT USING (true);
CREATE POLICY "handle_equipment_admin_manage" ON handle_equipment FOR ALL USING (is_admin(auth.uid()));

-- RLS policies for handle_equipment_rules  
CREATE POLICY "handle_equipment_rules_select_all" ON handle_equipment_rules FOR SELECT USING (true);
CREATE POLICY "handle_equipment_rules_admin_manage" ON handle_equipment_rules FOR ALL USING (is_admin(auth.uid()));

-- Example seeds with placeholder UUIDs (replace with real handle IDs)
-- Common cable attachments by RULE (apply to any cable stack)
INSERT INTO handle_equipment_rules (handle_id, equipment_type, kind, load_type, load_medium)
VALUES
  -- straight cable bar
  ('00000000-0000-0000-0000-000000000001', 'machine', 'cable', 'stack', 'stack'),
  -- lat pulldown wide bar
  ('00000000-0000-0000-0000-000000000002', 'machine', 'pulldown', 'stack', 'stack'),
  -- v-bar / close-grip for rows & pulldowns
  ('00000000-0000-0000-0000-000000000003', 'machine', NULL, 'stack', 'stack'),
  -- rope
  ('00000000-0000-0000-0000-000000000004', 'machine', 'cable', 'stack', 'stack'),
  -- single D-handle
  ('00000000-0000-0000-0000-000000000005', 'machine', 'cable', 'stack', 'stack'),
  -- ankle strap
  ('00000000-0000-0000-0000-000000000006', 'machine', 'cable', 'stack', 'stack');

-- Barbell "handles" (really bars) by RULE
INSERT INTO handle_equipment_rules (handle_id, equipment_type, kind, load_type, load_medium)
VALUES
  -- straight barbell
  ('00000000-0000-0000-0000-000000000011', 'free_weight', 'barbell', 'dual_load', 'bar'),
  -- EZ curl bar
  ('00000000-0000-0000-0000-000000000012', 'free_weight', 'barbell', 'dual_load', 'bar'),
  -- trap bar
  ('00000000-0000-0000-0000-000000000013', 'free_weight', 'barbell', 'dual_load', 'bar');

-- Example: direct link for a quirky plate-loaded machine
-- INSERT INTO handle_equipment (handle_id, equipment_id)
-- VALUES
--   ('00000000-0000-0000-0000-000000000003',  -- v-bar
--    (SELECT id FROM equipment WHERE slug='seated-row-machine' LIMIT 1));