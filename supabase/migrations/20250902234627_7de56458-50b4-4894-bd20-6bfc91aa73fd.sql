-- Create proper foreign key relationship between workout_shares and profiles
-- First check if the constraint exists
ALTER TABLE public.workout_shares 
DROP CONSTRAINT IF EXISTS workout_shares_user_id_fkey;

-- Add the correct foreign key constraint
ALTER TABLE public.workout_shares 
ADD CONSTRAINT workout_shares_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Make workout_id nullable to allow general posts
ALTER TABLE public.workout_shares 
ALTER COLUMN workout_id DROP NOT NULL;

-- Add share_type column for different types of posts
ALTER TABLE public.workout_shares 
ADD COLUMN IF NOT EXISTS share_type text DEFAULT 'workout';

-- Update existing records to have the workout type
UPDATE public.workout_shares 
SET share_type = 'workout' 
WHERE share_type IS NULL;