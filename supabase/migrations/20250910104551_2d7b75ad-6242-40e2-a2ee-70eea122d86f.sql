-- Add icon column to life_subcategories table
ALTER TABLE public.life_subcategories 
ADD COLUMN icon text;

-- Update health subcategories with appropriate icons
UPDATE public.life_subcategories 
SET icon = CASE slug
  WHEN 'fitness-exercise' THEN '🏋️'
  WHEN 'nutrition-hydration' THEN '🍎'
  WHEN 'sleep-quality' THEN '🛏️'
  WHEN 'medical-checkups' THEN '💎'
  WHEN 'energy-levels' THEN '⚡'
  ELSE '📋' -- Default icon for other subcategories
END
WHERE category_id = 'b54c368d-cd4f-4276-aa82-668da614e50d'; -- Health category

-- Add default icons for other categories' subcategories
UPDATE public.life_subcategories 
SET icon = '🧠' 
WHERE category_id = '22a22f7c-8f58-4441-973b-0eccc0385142' -- Mind category
  AND icon IS NULL;

UPDATE public.life_subcategories 
SET icon = '❤️' 
WHERE category_id = '13774202-2b88-478d-ad07-7e149333882f' -- Relationships category
  AND icon IS NULL;

UPDATE public.life_subcategories 
SET icon = '💰' 
WHERE category_id IN (
  SELECT id FROM public.life_categories WHERE slug = 'wealth'
) AND icon IS NULL;

UPDATE public.life_subcategories 
SET icon = '🎯' 
WHERE category_id IN (
  SELECT id FROM public.life_categories WHERE slug = 'purpose'
) AND icon IS NULL;

UPDATE public.life_subcategories 
SET icon = '🌟' 
WHERE category_id IN (
  SELECT id FROM public.life_categories WHERE slug = 'lifestyle'
) AND icon IS NULL;

-- Set default icon for any remaining null values
UPDATE public.life_subcategories 
SET icon = '📋' 
WHERE icon IS NULL;