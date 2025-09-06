-- Step 4: Equipment Intelligence - Tables and functions only

-- 1) Global defaults (brand-agnostic)
CREATE TABLE IF NOT EXISTS public.equipment_defaults (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  display_name text NOT NULL,
  loading_mode text NOT NULL CHECK (loading_mode IN ('plates','stack','fixed','bodyweight','band')),
  base_implement_kg numeric(6,2) DEFAULT 0,
  plate_denoms_kg numeric[] DEFAULT '{25,20,15,10,5,2.5,1.25,0.5}',
  stack_min_kg numeric(6,2) DEFAULT 5,
  stack_max_kg numeric(6,2) DEFAULT 120,
  stack_increment_kg numeric(5,2) DEFAULT 5,
  fixed_increment_kg numeric(5,2) DEFAULT 2.5,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2) Gym overrides (priority over defaults)
CREATE TABLE IF NOT EXISTS public.gym_equipment_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  equipment_slug text NOT NULL,
  base_implement_kg numeric(6,2),
  plate_denoms_kg numeric[],
  stack_min_kg numeric(6,2),
  stack_max_kg numeric(6,2),
  stack_increment_kg numeric(5,2),
  fixed_increment_kg numeric(5,2),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (gym_id, equipment_slug)
);

-- 3) Exercise → default mapping
CREATE TABLE IF NOT EXISTS public.exercise_equipment_profiles (
  exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  equipment_slug text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (exercise_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_geo_gym ON public.gym_equipment_overrides(gym_id);
CREATE INDEX IF NOT EXISTS idx_eep_exercise ON public.exercise_equipment_profiles(exercise_id);
CREATE INDEX IF NOT EXISTS idx_eep_slug ON public.exercise_equipment_profiles(equipment_slug);

-- Seed some defaults
INSERT INTO public.equipment_defaults (slug, display_name, loading_mode, base_implement_kg, plate_denoms_kg, stack_min_kg, stack_max_kg, stack_increment_kg, fixed_increment_kg, notes) VALUES
('barbell_std', 'Standard Barbell', 'plates', 20, '{25,20,15,10,5,2.5,1.25}', NULL, NULL, NULL, NULL, 'Standard Olympic barbell with common plate denominations'),
('barbell_technique', 'Technique Bar', 'plates', 15, '{10,5,2.5,1.25,0.5}', NULL, NULL, NULL, NULL, 'Lighter technique bar with micro-plates'),
('dbell_std', 'Standard Dumbbells', 'fixed', 0, NULL, NULL, NULL, NULL, 2.5, 'Standard dumbbell increments'),
('dbell_micro', 'Micro Dumbbells', 'fixed', 0, NULL, NULL, NULL, NULL, 1, 'Dumbbells with smaller increments'),
('stack_std', 'Standard Stack', 'stack', 0, NULL, 5, 120, 5, NULL, 'Standard weight stack machine'),
('stack_micro', 'Micro Stack', 'stack', 0, NULL, 2.5, 120, 2.5, NULL, 'Weight stack with micro increments'),
('kb_std', 'Standard Kettlebells', 'fixed', 0, NULL, NULL, NULL, NULL, 4, 'Standard kettlebell increments'),
('bodyweight', 'Bodyweight', 'bodyweight', 0, NULL, NULL, NULL, NULL, NULL, 'Bodyweight exercises'),
('band_std', 'Resistance Bands', 'band', 0, NULL, NULL, NULL, NULL, NULL, 'Resistance band exercises')
ON CONFLICT (slug) DO NOTHING;

-- Enable RLS
ALTER TABLE public.equipment_defaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_equipment_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_equipment_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Equipment defaults: readable by everyone
CREATE POLICY ed_read ON public.equipment_defaults 
FOR SELECT USING (true);

-- Gym overrides: read for all, write for gym admins
CREATE POLICY geo_read ON public.gym_equipment_overrides
FOR SELECT USING (true);

CREATE POLICY geo_write_admin ON public.gym_equipment_overrides
FOR INSERT WITH CHECK (public.is_gym_admin(gym_id));

CREATE POLICY geo_update_admin ON public.gym_equipment_overrides
FOR UPDATE USING (public.is_gym_admin(gym_id)) 
WITH CHECK (public.is_gym_admin(gym_id));

CREATE POLICY geo_delete_admin ON public.gym_equipment_overrides
FOR DELETE USING (public.is_gym_admin(gym_id));

-- Exercise equipment profiles: readable by all, writable by admins
CREATE POLICY eep_read ON public.exercise_equipment_profiles 
FOR SELECT USING (true);

CREATE POLICY eep_admin_manage ON public.exercise_equipment_profiles
FOR ALL USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));