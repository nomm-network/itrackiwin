-- Add readiness_data column to user_profile_fitness table
ALTER TABLE public.user_profile_fitness
  ADD COLUMN IF NOT EXISTS readiness_data jsonb;