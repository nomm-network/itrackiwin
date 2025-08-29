-- Delete the broken demo exercises since they don't actually work
DELETE FROM exercises WHERE slug IN ('cable-lat-pulldown', 'cable-chest-fly', 'cable-row');