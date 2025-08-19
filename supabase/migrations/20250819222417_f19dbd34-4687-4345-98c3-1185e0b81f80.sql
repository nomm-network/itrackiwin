-- Remove the name column from life_categories table
ALTER TABLE public.life_categories DROP COLUMN IF EXISTS name;

-- Remove the name column from life_subcategories table  
ALTER TABLE public.life_subcategories DROP COLUMN IF EXISTS name;