-- Add load metadata and side tracking to workout_sets
ALTER TABLE public.workout_sets
ADD COLUMN load_meta jsonb NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN side text CHECK (side IN ('left','right','both'));

-- Add loading hints to exercises
ALTER TABLE public.exercises
ADD COLUMN loading_hint text CHECK (loading_hint IN ('total','per_side')),
ADD COLUMN default_bar_weight numeric;

-- Create comprehensive gym_equipment table for loading characteristics
CREATE TABLE IF NOT EXISTS public.gym_equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  equipment_id uuid NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Loading characteristics
  loading_mode text NOT NULL CHECK (loading_mode IN ('plates_per_side','single_stack','fixed_pair','fixed_single','cable_stack')),
  is_symmetrical boolean NOT NULL DEFAULT true,
  bar_weight_kg numeric,
  min_plate_kg numeric,
  has_micro_plates boolean NOT NULL DEFAULT false,
  micro_plate_min_kg numeric,
  stack_increment_kg numeric,
  stack_has_magnet boolean NOT NULL DEFAULT false,
  stack_micro_kg numeric,
  fixed_increment_kg numeric,
  notes text,
  
  UNIQUE(gym_id, equipment_id)
);

-- RLS policies for gym_equipment
ALTER TABLE public.gym_equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gym equipment is viewable by everyone" 
ON public.gym_equipment FOR SELECT 
USING (true);

CREATE POLICY "Gym admins can manage equipment" 
ON public.gym_equipment FOR ALL 
USING (
  (EXISTS (
    SELECT 1 FROM public.gym_admins ga 
    WHERE ga.user_id = auth.uid() AND ga.gym_id = gym_equipment.gym_id
  )) OR is_admin(auth.uid())
)
WITH CHECK (
  (EXISTS (
    SELECT 1 FROM public.gym_admins ga 
    WHERE ga.user_id = auth.uid() AND ga.gym_id = gym_equipment.gym_id
  )) OR is_admin(auth.uid())
);

-- Add user preference for weight entry style
ALTER TABLE public.user_profile_fitness
ADD COLUMN weight_entry_style text NOT NULL DEFAULT 'total' 
CHECK (weight_entry_style IN ('per_side','total'));

-- Update the workout sets display view to include load metadata
DROP VIEW IF EXISTS public.v_workout_sets_display;
CREATE OR REPLACE VIEW public.v_workout_sets_display AS
SELECT
  ws.*,
  (ws.load_meta->>'entry_mode') AS entry_mode,
  (ws.load_meta->>'bar_weight')::numeric AS bar_weight,
  (ws.load_meta->>'per_side')::numeric AS per_side_weight,
  ws.weight AS total_weight
FROM public.workout_sets ws;

-- Add trigger for updated_at on gym_equipment
CREATE TRIGGER update_gym_equipment_updated_at
  BEFORE UPDATE ON public.gym_equipment
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();