-- Update medical icon to be more suggestive
UPDATE public.life_subcategories 
SET icon = '🩺'
WHERE slug = 'medical-checkups';