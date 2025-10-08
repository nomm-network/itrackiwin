-- Update life_categories with proper icons and colors
UPDATE life_categories SET 
  icon = '🏥',
  color = '142 76% 36%'  -- Medical green
WHERE slug = 'health';

UPDATE life_categories SET 
  icon = '💰',
  color = '45 93% 47%'  -- Gold
WHERE slug = 'wealth';

UPDATE life_categories SET 
  icon = '❤️',
  color = '0 84% 60%'  -- Red/pink
WHERE slug = 'relationships';

UPDATE life_categories SET 
  icon = '🧠',
  color = '271 91% 65%'  -- Purple
WHERE slug = 'mind';

UPDATE life_categories SET 
  icon = '🎯',
  color = '262 83% 58%'  -- Deep purple
WHERE slug = 'purpose';

UPDATE life_categories SET 
  icon = '🌟',
  color = '48 96% 53%'  -- Yellow/gold
WHERE slug = 'lifestyle';