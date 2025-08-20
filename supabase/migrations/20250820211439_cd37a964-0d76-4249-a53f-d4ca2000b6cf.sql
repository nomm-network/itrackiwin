-- Remove duplicate columns from grips table since we now use translations
ALTER TABLE public.grips 
DROP COLUMN IF EXISTS name,
DROP COLUMN IF EXISTS description;