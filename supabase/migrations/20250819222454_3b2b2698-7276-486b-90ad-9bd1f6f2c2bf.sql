-- Now remove the name columns from original tables
ALTER TABLE public.life_categories DROP COLUMN IF EXISTS name;
ALTER TABLE public.life_subcategories DROP COLUMN IF EXISTS name;