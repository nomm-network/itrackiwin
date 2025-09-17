-- Clean up legacy string equipment data and convert to UUIDs where possible
UPDATE public.user_profile_fitness 
SET available_equipment = '{}' 
WHERE available_equipment IS NOT NULL 
AND cardinality(available_equipment) > 0
AND NOT (available_equipment[1] ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$');

-- Add comment explaining the cleanup
COMMENT ON COLUMN public.user_profile_fitness.available_equipment IS 'Array of equipment UUIDs available for home workouts. Legacy string values have been cleared.';