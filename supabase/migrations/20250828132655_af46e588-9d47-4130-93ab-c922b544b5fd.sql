-- Add is_default column to handle_equipment table
ALTER TABLE public.handle_equipment 
ADD COLUMN is_default boolean NOT NULL DEFAULT false;

-- Create equipment_handle_grips table for grip configuration per handle
CREATE TABLE public.equipment_handle_grips (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id uuid NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  handle_id uuid NOT NULL REFERENCES public.handles(id) ON DELETE CASCADE,
  grip_id uuid NOT NULL REFERENCES public.grips(id) ON DELETE CASCADE,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Ensure one record per equipment-handle-grip combination
  UNIQUE(equipment_id, handle_id, grip_id)
);

-- Enable RLS
ALTER TABLE public.equipment_handle_grips ENABLE ROW LEVEL SECURITY;

-- Create policies for equipment_handle_grips
CREATE POLICY "equipment_handle_grips_select_all" 
ON public.equipment_handle_grips 
FOR SELECT 
USING (true);

CREATE POLICY "equipment_handle_grips_admin_manage" 
ON public.equipment_handle_grips 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_equipment_handle_grips_equipment ON public.equipment_handle_grips(equipment_id);
CREATE INDEX idx_equipment_handle_grips_handle ON public.equipment_handle_grips(handle_id);
CREATE INDEX idx_equipment_handle_grips_grip ON public.equipment_handle_grips(grip_id);