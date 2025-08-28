-- Create handle-equipment direct mapping table
CREATE TABLE IF NOT EXISTS handle_equipment (
  handle_id   uuid REFERENCES handles(id) ON DELETE CASCADE,
  equipment_id uuid REFERENCES equipment(id) ON DELETE CASCADE,
  PRIMARY KEY (handle_id, equipment_id)
);

-- Create rule-based compatibility table
CREATE TABLE IF NOT EXISTS handle_equipment_rules (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handle_id     uuid NOT NULL REFERENCES handles(id) ON DELETE CASCADE,
  equipment_type text,              -- e.g. 'machine', 'free_weight', 'support', 'cardio', 'bodyweight'
  kind          text,               -- e.g. 'cable', 'pulldown', 'row', 'press', 'bench', etc.
  load_type     load_type,          -- 'none' | 'single_load' | 'dual_load' | 'stack'
  load_medium   load_medium,        -- 'bar' | 'plates' | 'stack' | 'bodyweight' | 'band' | 'chain' | 'flywheel' | 'other'
  created_at    timestamp with time zone NOT NULL DEFAULT now(),
  -- at least one filter must be set
  CHECK (equipment_type IS NOT NULL OR kind IS NOT NULL OR load_type IS NOT NULL OR load_medium IS NOT NULL)
);

-- Create effective view that combines direct and rule-based mappings
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

-- Add some common cable attachment handles first
INSERT INTO handles (id, slug, category, created_at) VALUES
  ('11111111-1111-1111-1111-111111111001', 'straight-bar', 'cable_attachment', now()),
  ('11111111-1111-1111-1111-111111111002', 'lat-pulldown-bar', 'cable_attachment', now()),
  ('11111111-1111-1111-1111-111111111003', 'v-bar', 'cable_attachment', now()),
  ('11111111-1111-1111-1111-111111111004', 'rope', 'cable_attachment', now()),
  ('11111111-1111-1111-1111-111111111005', 'd-handle', 'cable_attachment', now()),
  ('11111111-1111-1111-1111-111111111006', 'ankle-strap', 'cable_attachment', now()),
  ('11111111-1111-1111-1111-111111111011', 'straight-barbell', 'barbell', now()),
  ('11111111-1111-1111-1111-111111111012', 'ez-curl-bar', 'barbell', now()),
  ('11111111-1111-1111-1111-111111111013', 'trap-bar', 'barbell', now())
ON CONFLICT (slug) DO NOTHING;

-- Add handle translations
INSERT INTO handle_translations (handle_id, language_code, name, description) VALUES
  ('11111111-1111-1111-1111-111111111001', 'en', 'Straight Bar', 'Standard straight cable bar attachment'),
  ('11111111-1111-1111-1111-111111111002', 'en', 'Lat Pulldown Bar', 'Wide grip lat pulldown bar'),
  ('11111111-1111-1111-1111-111111111003', 'en', 'V-Bar', 'Close grip V-shaped bar'),
  ('11111111-1111-1111-1111-111111111004', 'en', 'Rope', 'Rope attachment for cables'),
  ('11111111-1111-1111-1111-111111111005', 'en', 'D-Handle', 'Single grip D-shaped handle'),
  ('11111111-1111-1111-1111-111111111006', 'en', 'Ankle Strap', 'Ankle strap for cable exercises'),
  ('11111111-1111-1111-1111-111111111011', 'en', 'Straight Barbell', 'Standard Olympic barbell'),
  ('11111111-1111-1111-1111-111111111012', 'en', 'EZ Curl Bar', 'Curved barbell for bicep exercises'),
  ('11111111-1111-1111-1111-111111111013', 'en', 'Trap Bar', 'Hexagonal trap/deadlift bar')
ON CONFLICT (handle_id, language_code) DO NOTHING;

-- Example rule-based mappings for cable attachments
INSERT INTO handle_equipment_rules (handle_id, equipment_type, kind, load_type, load_medium) VALUES
  -- Cable attachments work with any cable stack equipment
  ('11111111-1111-1111-1111-111111111001', 'machine', 'cable', 'stack', 'stack'),
  ('11111111-1111-1111-1111-111111111002', 'machine', 'pulldown', 'stack', 'stack'),
  ('11111111-1111-1111-1111-111111111003', 'machine', NULL, 'stack', 'stack'),
  ('11111111-1111-1111-1111-111111111004', 'machine', 'cable', 'stack', 'stack'),
  ('11111111-1111-1111-1111-111111111005', 'machine', 'cable', 'stack', 'stack'),
  ('11111111-1111-1111-1111-111111111006', 'machine', 'cable', 'stack', 'stack'),
  
  -- Barbells work with barbell equipment 
  ('11111111-1111-1111-1111-111111111011', 'free_weight', 'barbell', 'dual_load', 'bar'),
  ('11111111-1111-1111-1111-111111111012', 'free_weight', 'barbell', 'dual_load', 'bar'),
  ('11111111-1111-1111-1111-111111111013', 'free_weight', 'barbell', 'dual_load', 'bar');