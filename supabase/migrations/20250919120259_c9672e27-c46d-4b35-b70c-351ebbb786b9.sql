-- Fix exercise equipment assignments based on research
-- Key findings:
-- 1. Dips should use dip-bars or parallel-bars, not dumbbells
-- 2. Face pulls require cable machine with rope attachment
-- 3. Leg press should use leg-press-machine, not barbell
-- 4. Front delt raises (chest-front-dumbbell-raises) is correct with dumbbells
-- 5. Pull-ups need pull-up-bar equipment

-- Get equipment IDs for updates
WITH equipment_ids AS (
  SELECT 
    id as dip_bars_id
  FROM equipment 
  WHERE slug = 'dip-bars'
  UNION ALL
  SELECT 
    id as cable_machine_id
  FROM equipment 
  WHERE slug = 'cable-machine'
  UNION ALL
  SELECT 
    id as leg_press_machine_id
  FROM equipment 
  WHERE slug = 'leg-press-machine'
  UNION ALL
  SELECT 
    id as pullup_bar_id
  FROM equipment 
  WHERE slug = 'pull-up-bar'
  UNION ALL
  SELECT 
    id as bodyweight_id
  FROM equipment 
  WHERE slug = 'bodyweight'
),
exercise_updates AS (
  -- Fix Dips - should use dip-bars instead of dumbbells
  UPDATE exercises 
  SET equipment_id = (SELECT id FROM equipment WHERE slug = 'dip-bars')
  WHERE slug = 'dips'
  RETURNING id, slug, 'dips' as exercise_type
  
  UNION ALL
  
  -- Fix Face Pulls - should use cable machine (already correct but confirm)
  UPDATE exercises 
  SET equipment_id = (SELECT id FROM equipment WHERE slug = 'cable-machine')
  WHERE slug = 'face-pulls'
  RETURNING id, slug, 'face-pulls' as exercise_type
  
  UNION ALL
  
  -- Fix Leg Press - should use leg-press-machine instead of barbell
  UPDATE exercises 
  SET equipment_id = (SELECT id FROM equipment WHERE slug = 'leg-press-machine')
  WHERE slug = 'leg-press'
  RETURNING id, slug, 'leg-press' as exercise_type
  
  UNION ALL
  
  -- Fix Pull-ups - should use pull-up-bar instead of dumbbells (if any)
  UPDATE exercises 
  SET equipment_id = (SELECT id FROM equipment WHERE slug = 'pull-up-bar')
  WHERE slug LIKE '%pull-up%' OR slug LIKE '%pullup%' OR slug LIKE '%chin-up%'
  RETURNING id, slug, 'pullups' as exercise_type
  
  UNION ALL
  
  -- Fix Push-ups - should use bodyweight
  UPDATE exercises 
  SET equipment_id = (SELECT id FROM equipment WHERE slug = 'bodyweight')
  WHERE slug LIKE '%push-up%' OR slug LIKE '%pushup%' OR display_name ILIKE '%push up%'
  RETURNING id, slug, 'pushups' as exercise_type
)

-- Update specific exercise equipment based on research:

-- 1. Dips - use dip bars, not dumbbells
UPDATE exercises 
SET equipment_id = (SELECT id FROM equipment WHERE slug = 'dip-bars')
WHERE slug = 'dips';

-- 2. Face pulls - should use cable machine (already cable, but ensure it's correct)
UPDATE exercises 
SET equipment_id = (SELECT id FROM equipment WHERE slug = 'cable-machine')
WHERE slug = 'face-pulls';

-- 3. Leg press - should use leg press machine, not barbell
UPDATE exercises 
SET equipment_id = (SELECT id FROM equipment WHERE slug = 'leg-press-machine')
WHERE slug = 'leg-press';

-- 4. Any pull-up variations should use pull-up bar
UPDATE exercises 
SET equipment_id = (SELECT id FROM equipment WHERE slug = 'pull-up-bar')
WHERE slug IN ('pull-ups', 'pullups', 'chin-ups', 'lat-pulldown') 
   OR display_name ILIKE '%pull up%' 
   OR display_name ILIKE '%chin up%';

-- 5. Push-up variations should use bodyweight
UPDATE exercises 
SET equipment_id = (SELECT id FROM equipment WHERE slug = 'bodyweight')
WHERE slug LIKE '%push-up%' 
   OR slug LIKE '%pushup%' 
   OR display_name ILIKE '%push up%';

-- 6. Chest front dumbbell raises - this is actually "front deltoid raises" and dumbbell is correct
-- But let's update the display name to be more accurate
UPDATE exercises 
SET display_name = 'Front Deltoid Raises'
WHERE slug = 'chest-front-dumbbell-raises';

-- Verify updates with a summary
SELECT 
  e.slug,
  e.display_name,
  eq.slug as equipment_slug,
  CASE 
    WHEN e.slug = 'dips' AND eq.slug = 'dip-bars' THEN '✓ FIXED'
    WHEN e.slug = 'face-pulls' AND eq.slug = 'cable-machine' THEN '✓ CORRECT'
    WHEN e.slug = 'leg-press' AND eq.slug = 'leg-press-machine' THEN '✓ FIXED'
    WHEN e.slug = 'chest-front-dumbbell-raises' AND eq.slug = 'dumbbell' THEN '✓ CORRECT'
    ELSE 'Check'
  END as status
FROM exercises e
JOIN equipment eq ON eq.id = e.equipment_id
WHERE e.slug IN ('dips', 'face-pulls', 'leg-press', 'chest-front-dumbbell-raises')
ORDER BY e.slug;