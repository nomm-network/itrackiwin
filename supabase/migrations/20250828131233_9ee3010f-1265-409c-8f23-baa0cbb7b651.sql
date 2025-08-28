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