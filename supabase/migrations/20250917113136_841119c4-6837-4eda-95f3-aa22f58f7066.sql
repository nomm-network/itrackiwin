-- Simple cleanup: Reset all available_equipment arrays to empty for fresh start
-- This ensures no legacy string values remain
UPDATE public.user_profile_fitness 
SET available_equipment = '{}' 
WHERE available_equipment IS NOT NULL;

-- Add comment explaining the reset
COMMENT ON COLUMN public.user_profile_fitness.available_equipment IS 'Array of equipment UUIDs available for home workouts. Reset to ensure UUID format.';