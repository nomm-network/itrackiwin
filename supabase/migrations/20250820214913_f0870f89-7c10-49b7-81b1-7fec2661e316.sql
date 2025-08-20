-- Drop the duplicate name column from equipment table
ALTER TABLE public.equipment DROP COLUMN IF EXISTS name;