-- 1) Add missing columns to exercise_equipment_profiles table
ALTER TABLE public.exercise_equipment_profiles 
ADD COLUMN IF NOT EXISTS plate_profile_id UUID REFERENCES plate_profiles(id),
ADD COLUMN IF NOT EXISTS default_bar_weight_kg NUMERIC DEFAULT 20.0,
ADD COLUMN IF NOT EXISTS default_entry_mode TEXT DEFAULT 'per_side' CHECK (default_entry_mode IN ('per_side', 'total')),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2) Get the equipment slug for Olympic Barbell
-- First check what slug the Olympic Barbell uses
SELECT slug FROM equipment WHERE id = '33a8bf6b-5832-442e-964d-3f32070ea029';

-- 3) Create/update the equipment profile for Barbell Bench Press  
INSERT INTO public.exercise_equipment_profiles 
  (exercise_id, equipment_slug, plate_profile_id, default_bar_weight_kg, default_entry_mode, is_active, created_at, updated_at)
VALUES
  ('69ea4d5e-20c4-410c-a93a-17399a810251', -- Barbell Bench Press
   'olympic-barbell',                        -- Assuming this is the slug
   'bfc3fc82-0379-4535-be82-162409de150b',  -- EU Standard KG profile  
   20.0,
   'per_side',
   true,
   now(),
   now())
ON CONFLICT (exercise_id, equipment_slug) DO UPDATE
SET 
  plate_profile_id = EXCLUDED.plate_profile_id,
  default_bar_weight_kg = EXCLUDED.default_bar_weight_kg,
  default_entry_mode = EXCLUDED.default_entry_mode,
  is_active = true,
  updated_at = now();

-- 4) Update exercises.equipment_ref_id for quick lookup
UPDATE public.exercises
SET equipment_ref_id = '33a8bf6b-5832-442e-964d-3f32070ea029'
WHERE id = '69ea4d5e-20c4-410c-a93a-17399a810251';