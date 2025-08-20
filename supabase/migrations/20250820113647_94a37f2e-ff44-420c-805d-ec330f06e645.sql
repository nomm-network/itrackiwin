-- Fix owner_user_id column to not allow NULL values and set default
-- First update any existing NULL values to a placeholder or remove them
DELETE FROM public.exercises WHERE owner_user_id IS NULL;

-- Make the column NOT NULL and set auth.uid() as default for new inserts
ALTER TABLE public.exercises 
  ALTER COLUMN owner_user_id SET NOT NULL,
  ALTER COLUMN owner_user_id SET DEFAULT auth.uid();