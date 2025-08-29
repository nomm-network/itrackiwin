-- Create the missing tables for the handle-orientation model

-- Handle orientation compatibility table
CREATE TABLE handle_orientation_compatibility (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  handle_id uuid NOT NULL REFERENCES handles(id) ON DELETE CASCADE,
  orientation grip_orientation NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(handle_id, orientation)
);

-- Equipment handle orientations table  
CREATE TABLE equipment_handle_orientations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id uuid NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  handle_id uuid NOT NULL REFERENCES handles(id) ON DELETE CASCADE,
  orientation grip_orientation NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(equipment_id, handle_id, orientation)
);

-- Exercise handle orientations table
CREATE TABLE exercise_handle_orientations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  handle_id uuid NOT NULL REFERENCES handles(id) ON DELETE CASCADE,
  orientation grip_orientation NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(exercise_id, handle_id, orientation)
);

-- Enable RLS
ALTER TABLE handle_orientation_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_handle_orientations ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_handle_orientations ENABLE ROW LEVEL SECURITY;

-- RLS policies for handle_orientation_compatibility
CREATE POLICY "handle_orientation_compatibility_select_all" 
ON handle_orientation_compatibility FOR SELECT USING (true);

CREATE POLICY "handle_orientation_compatibility_admin_manage" 
ON handle_orientation_compatibility FOR ALL 
USING (is_admin(auth.uid())) 
WITH CHECK (is_admin(auth.uid()));

-- RLS policies for equipment_handle_orientations
CREATE POLICY "equipment_handle_orientations_select_all" 
ON equipment_handle_orientations FOR SELECT USING (true);

CREATE POLICY "equipment_handle_orientations_admin_manage" 
ON equipment_handle_orientations FOR ALL 
USING (is_admin(auth.uid())) 
WITH CHECK (is_admin(auth.uid()));

-- RLS policies for exercise_handle_orientations
CREATE POLICY "exercise_handle_orientations_select_all" 
ON exercise_handle_orientations FOR SELECT USING (true);

CREATE POLICY "exercise_handle_orientations_admin_manage" 
ON exercise_handle_orientations FOR ALL 
USING (is_admin(auth.uid())) 
WITH CHECK (is_admin(auth.uid()));