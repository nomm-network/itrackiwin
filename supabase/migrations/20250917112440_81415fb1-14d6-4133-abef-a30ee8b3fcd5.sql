-- Add new columns to user_profile_fitness table for AI coach functionality

-- Add location_type column (home or gym)
ALTER TABLE public.user_profile_fitness 
ADD COLUMN IF NOT EXISTS location_type TEXT CHECK (location_type IN ('home', 'gym'));

-- Add available_equipment column (array of equipment types)
ALTER TABLE public.user_profile_fitness 
ADD COLUMN IF NOT EXISTS available_equipment TEXT[] DEFAULT '{}';

-- Add priority_muscle_groups column (array of muscle groups)
ALTER TABLE public.user_profile_fitness 
ADD COLUMN IF NOT EXISTS priority_muscle_groups TEXT[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN public.user_profile_fitness.location_type IS 'Training location: home or gym';
COMMENT ON COLUMN public.user_profile_fitness.available_equipment IS 'Array of available equipment for home workouts';
COMMENT ON COLUMN public.user_profile_fitness.priority_muscle_groups IS 'Array of muscle groups user wants to prioritize';