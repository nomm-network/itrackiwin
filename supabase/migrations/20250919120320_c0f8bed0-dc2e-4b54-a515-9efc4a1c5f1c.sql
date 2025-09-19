-- Fix exercise equipment assignments based on research
-- 1. Dips should use dip-bars, not dumbbells
UPDATE exercises 
SET equipment_id = (SELECT id FROM equipment WHERE slug = 'dip-bars')
WHERE slug = 'dips';

-- 2. Face pulls should use cable machine (verify it's correct)
UPDATE exercises 
SET equipment_id = (SELECT id FROM equipment WHERE slug = 'cable-machine')
WHERE slug = 'face-pulls';

-- 3. Leg press should use leg-press-machine, not barbell
UPDATE exercises 
SET equipment_id = (SELECT id FROM equipment WHERE slug = 'leg-press-machine')
WHERE slug = 'leg-press';

-- 4. Update display name for chest-front-dumbbell-raises to be more accurate
UPDATE exercises 
SET display_name = 'Front Deltoid Raises'
WHERE slug = 'chest-front-dumbbell-raises';

-- Verify the key fixes
SELECT 
  e.slug,
  e.display_name,
  eq.slug as equipment_slug
FROM exercises e
JOIN equipment eq ON eq.id = e.equipment_id
WHERE e.slug IN ('dips', 'face-pulls', 'leg-press', 'chest-front-dumbbell-raises')
ORDER BY e.slug;