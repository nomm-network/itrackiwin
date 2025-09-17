-- Update available_equipment to use proper equipment foreign key references
-- First, let's rename the current column and create a new one with UUID references

-- Drop the current text array column
ALTER TABLE public.user_profile_fitness 
DROP COLUMN IF EXISTS available_equipment;

-- Add new column with UUID array for equipment references
ALTER TABLE public.user_profile_fitness 
ADD COLUMN available_equipment UUID[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN public.user_profile_fitness.available_equipment IS 'Array of equipment UUIDs available for home workouts';