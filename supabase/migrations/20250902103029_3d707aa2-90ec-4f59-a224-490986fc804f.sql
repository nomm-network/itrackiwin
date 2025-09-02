-- Add country and city columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS city text;