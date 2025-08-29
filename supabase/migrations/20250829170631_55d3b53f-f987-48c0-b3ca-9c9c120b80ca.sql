-- Fix RLS policies for compatibility tables

BEGIN;

-- Enable RLS on compatibility tables
ALTER TABLE public.handle_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handle_grip_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_handle_grips ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "handle_equipment_select_all" ON public.handle_equipment;
DROP POLICY IF EXISTS "handle_equipment_admin_manage" ON public.handle_equipment;
DROP POLICY IF EXISTS "handle_grip_compatibility_select_all" ON public.handle_grip_compatibility;
DROP POLICY IF EXISTS "handle_grip_compatibility_admin_manage" ON public.handle_grip_compatibility;
DROP POLICY IF EXISTS "equipment_handle_grips_select_all" ON public.equipment_handle_grips;
DROP POLICY IF EXISTS "equipment_handle_grips_admin_manage" ON public.equipment_handle_grips;

-- Create policies for handle_equipment
CREATE POLICY "handle_equipment_select_all" ON public.handle_equipment FOR SELECT USING (true);
CREATE POLICY "handle_equipment_admin_manage" ON public.handle_equipment FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Create policies for handle_grip_compatibility  
CREATE POLICY "handle_grip_compatibility_select_all" ON public.handle_grip_compatibility FOR SELECT USING (true);
CREATE POLICY "handle_grip_compatibility_admin_manage" ON public.handle_grip_compatibility FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Create policies for equipment_handle_grips
CREATE POLICY "equipment_handle_grips_select_all" ON public.equipment_handle_grips FOR SELECT USING (true);
CREATE POLICY "equipment_handle_grips_admin_manage" ON public.equipment_handle_grips FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

COMMIT;