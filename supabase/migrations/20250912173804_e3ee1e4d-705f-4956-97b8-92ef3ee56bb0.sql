-- 1) Add missing columns to exercise_equipment_profiles table
ALTER TABLE public.exercise_equipment_profiles 
ADD COLUMN IF NOT EXISTS plate_profile_id UUID REFERENCES plate_profiles(id),
ADD COLUMN IF NOT EXISTS default_bar_weight_kg NUMERIC DEFAULT 20.0,
ADD COLUMN IF NOT EXISTS default_entry_mode TEXT DEFAULT 'per_side',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2) Add constraint for default_entry_mode if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'exercise_equipment_profiles_default_entry_mode_check'
  ) THEN
    ALTER TABLE public.exercise_equipment_profiles 
    ADD CONSTRAINT exercise_equipment_profiles_default_entry_mode_check 
    CHECK (default_entry_mode IN ('per_side', 'total'));
  END IF;
END $$;

-- 3) Insert the equipment profile for Barbell Bench Press (simple INSERT, not ON CONFLICT)
INSERT INTO public.exercise_equipment_profiles 
  (exercise_id, equipment_slug, plate_profile_id, default_bar_weight_kg, default_entry_mode, is_active, created_at, updated_at)
VALUES
  ('69ea4d5e-20c4-410c-a93a-17399a810251', -- Barbell Bench Press
   'olympic-barbell',                        -- Olympic barbell slug  
   'bfc3fc82-0379-4535-be82-162409de150b',  -- EU Standard KG profile  
   20.0,
   'per_side',
   true,
   now(),
   now());

-- 4) Update exercises.equipment_ref_id for quick lookup
UPDATE public.exercises
SET equipment_ref_id = '33a8bf6b-5832-442e-964d-3f32070ea029'
WHERE id = '69ea4d5e-20c4-410c-a93a-17399a810251';