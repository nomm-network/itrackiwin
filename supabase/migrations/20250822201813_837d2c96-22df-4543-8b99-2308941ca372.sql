-- Check if the table has the right constraints and fix upsert issues
-- First, let's see the current table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profile_fitness' 
ORDER BY ordinal_position;

-- Check constraints
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'user_profile_fitness'::regclass;

-- Fix the upsert by ensuring proper unique constraint
-- Drop existing constraint if it exists and recreate it properly
ALTER TABLE public.user_profile_fitness 
DROP CONSTRAINT IF EXISTS user_profile_fitness_user_id_key;

-- Add proper unique constraint
ALTER TABLE public.user_profile_fitness 
ADD CONSTRAINT user_profile_fitness_user_id_unique UNIQUE (user_id);

-- Ensure the table has the right structure for upsert operations
-- Add any missing columns if needed
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profile_fitness' AND column_name = 'bodyweight') THEN
        ALTER TABLE public.user_profile_fitness ADD COLUMN bodyweight numeric;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profile_fitness' AND column_name = 'height') THEN
        ALTER TABLE public.user_profile_fitness ADD COLUMN height numeric;
    END IF;
END $$;