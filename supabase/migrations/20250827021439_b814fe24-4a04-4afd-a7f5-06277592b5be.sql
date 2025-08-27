-- Enable RLS on new tables
ALTER TABLE gym_plate_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_equipment_overrides ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for gym_plate_inventory
CREATE POLICY "Gym plate inventory is viewable by everyone" 
ON gym_plate_inventory 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage gym plate inventory" 
ON gym_plate_inventory 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Create RLS policies for gym_equipment_overrides  
CREATE POLICY "Gym equipment overrides are viewable by everyone" 
ON gym_equipment_overrides 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage gym equipment overrides" 
ON gym_equipment_overrides 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Add update trigger for gym_equipment_overrides
CREATE TRIGGER update_gym_equipment_overrides_updated_at
  BEFORE UPDATE ON gym_equipment_overrides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();