-- Drop the old bodyweight and height_cm columns from user_profile_fitness table
-- These are now stored exclusively in user_body_metrics table

ALTER TABLE public.user_profile_fitness 
DROP COLUMN IF EXISTS bodyweight,
DROP COLUMN IF EXISTS height_cm;