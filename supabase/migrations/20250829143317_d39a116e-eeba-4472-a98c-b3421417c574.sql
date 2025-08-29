-- Create equipment_grip_defaults table for storing default grip configurations
CREATE TABLE IF NOT EXISTS equipment_grip_defaults (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id uuid NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  handle_id uuid REFERENCES handles(id) ON DELETE CASCADE,
  grip_id uuid NOT NULL REFERENCES grips(id) ON DELETE CASCADE,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  
  -- Ensure unique combinations
  UNIQUE(equipment_id, handle_id, grip_id)
);

-- Enable RLS
ALTER TABLE equipment_grip_defaults ENABLE ROW LEVEL SECURITY;

-- Create policies for equipment_grip_defaults
CREATE POLICY "equipment_grip_defaults_select_all" 
ON equipment_grip_defaults FOR SELECT 
USING (true);

CREATE POLICY "equipment_grip_defaults_admin_manage" 
ON equipment_grip_defaults FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_equipment_grip_defaults_equipment_id ON equipment_grip_defaults(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_grip_defaults_handle_id ON equipment_grip_defaults(handle_id);
CREATE INDEX IF NOT EXISTS idx_equipment_grip_defaults_grip_id ON equipment_grip_defaults(grip_id);

-- Now insert the lower-body equipment grip defaults

-- Olympic Barbell for squats, deadlifts, hip thrusts
INSERT INTO equipment_grip_defaults (equipment_id, handle_id, grip_id, is_default) VALUES
  ((SELECT id FROM equipment WHERE slug='olympic-barbell'),
   (SELECT id FROM handles  WHERE slug='straight-bar'),
   (SELECT id FROM grips    WHERE slug='overhand'),
   true);

-- Smith Machine for squats and hip thrusts
INSERT INTO equipment_grip_defaults (equipment_id, handle_id, grip_id, is_default) VALUES
  ((SELECT id FROM equipment WHERE slug='smith-machine'),
   (SELECT id FROM handles  WHERE slug='straight-bar'),
   (SELECT id FROM grips    WHERE slug='overhand'),
   true);

-- Trap-Bar for deadlifts (neutral grip)
INSERT INTO equipment_grip_defaults (equipment_id, handle_id, grip_id, is_default) VALUES
  ((SELECT id FROM equipment WHERE slug='trap-bar'),
   (SELECT id FROM handles  WHERE slug='trap-bar'),
   (SELECT id FROM grips    WHERE slug='neutral'),
   true);

-- Cable Machine with rope for hip thrusts and pull-throughs
INSERT INTO equipment_grip_defaults (equipment_id, handle_id, grip_id, is_default) VALUES
  ((SELECT id FROM equipment WHERE slug='cable-machine'),
   (SELECT id FROM handles  WHERE slug='tricep-rope'),
   (SELECT id FROM grips    WHERE slug='neutral'),
   true);

-- Cable Machine with single handle for lunges
INSERT INTO equipment_grip_defaults (equipment_id, handle_id, grip_id, is_default) VALUES
  ((SELECT id FROM equipment WHERE slug='cable-machine'),
   (SELECT id FROM handles  WHERE slug='single-handle'),
   (SELECT id FROM grips    WHERE slug='neutral'),
   true);

-- Leg Press Machine (no handle, neutral grip for hand position)
INSERT INTO equipment_grip_defaults (equipment_id, handle_id, grip_id, is_default) VALUES
  ((SELECT id FROM equipment WHERE slug='leg-press-machine'),
   NULL,
   (SELECT id FROM grips WHERE slug='neutral'),
   true);

-- Hack Squat Machine (no handle, neutral grip for hand position)
INSERT INTO equipment_grip_defaults (equipment_id, handle_id, grip_id, is_default) VALUES
  ((SELECT id FROM equipment WHERE slug='hack-squat-machine'),
   NULL,
   (SELECT id FROM grips WHERE slug='neutral'),
   true)

ON CONFLICT (equipment_id, handle_id, grip_id) DO NOTHING;