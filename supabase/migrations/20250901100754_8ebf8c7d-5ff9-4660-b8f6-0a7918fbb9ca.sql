-- Step 3: Enable RLS on equipment_grip_defaults table
ALTER TABLE public.equipment_grip_defaults ENABLE ROW LEVEL SECURITY;

-- Create policies for equipment_grip_defaults
CREATE POLICY "equipment_grip_defaults_select_all" 
ON public.equipment_grip_defaults 
FOR SELECT 
USING (true);

CREATE POLICY "equipment_grip_defaults_admin_manage" 
ON public.equipment_grip_defaults 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));