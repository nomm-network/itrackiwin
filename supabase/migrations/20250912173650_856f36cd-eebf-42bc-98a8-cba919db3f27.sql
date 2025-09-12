-- 1) Ensure exercise_equipment_profiles table exists with proper columns
CREATE TABLE IF NOT EXISTS public.exercise_equipment_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID NOT NULL REFERENCES exercises(id),
  equipment_id UUID NOT NULL REFERENCES equipment(id),
  plate_profile_id UUID REFERENCES plate_profiles(id),
  default_bar_weight_kg NUMERIC DEFAULT 20.0,
  default_entry_mode TEXT DEFAULT 'per_side' CHECK (default_entry_mode IN ('per_side', 'total')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(exercise_id, equipment_id)
);

-- 2) Create the equipment profile for Barbell Bench Press
INSERT INTO public.exercise_equipment_profiles 
  (exercise_id, equipment_id, plate_profile_id, default_bar_weight_kg, default_entry_mode, is_active)
VALUES
  ('69ea4d5e-20c4-410c-a93a-17399a810251', -- Barbell Bench Press
   '33a8bf6b-5832-442e-964d-3f32070ea029', -- Olympic Barbell
   'bfc3fc82-0379-4535-be82-162409de150b', -- EU Standard KG profile
   20.0,
   'per_side',
   true)
ON CONFLICT (exercise_id, equipment_id) DO UPDATE
SET 
  plate_profile_id = EXCLUDED.plate_profile_id,
  default_bar_weight_kg = EXCLUDED.default_bar_weight_kg,
  default_entry_mode = EXCLUDED.default_entry_mode,
  is_active = true;

-- 3) Update exercises.equipment_ref_id for quick lookup
UPDATE public.exercises
SET equipment_ref_id = '33a8bf6b-5832-442e-964d-3f32070ea029'
WHERE id = '69ea4d5e-20c4-410c-a93a-17399a810251';

-- 4) Enable RLS and policies
ALTER TABLE public.exercise_equipment_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exercise_equipment_profiles_select_all" ON public.exercise_equipment_profiles
  FOR SELECT USING (true);

CREATE POLICY "exercise_equipment_profiles_admin_manage" ON public.exercise_equipment_profiles
  FOR ALL USING (is_admin(auth.uid()));