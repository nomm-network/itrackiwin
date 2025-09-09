-- Add secondary muscle groups for the three new exercises

-- 1. Leg Extension Machine - Secondary: other quadriceps muscles
UPDATE exercises 
SET secondary_muscle_group_ids = ARRAY[
  (SELECT id FROM muscles WHERE slug = 'vastus_lateralis'),
  (SELECT id FROM muscles WHERE slug = 'vastus_medialis'), 
  (SELECT id FROM muscles WHERE slug = 'vastus_intermedius')
]
WHERE slug = 'leg-extension-machine';

-- 2. Dumbbell Cuban Press - Secondary: deltoids (all heads) + upper traps
UPDATE exercises 
SET secondary_muscle_group_ids = ARRAY[
  (SELECT id FROM muscles WHERE slug = 'rear_delts'),
  (SELECT id FROM muscles WHERE slug = 'front_delts'),
  (SELECT id FROM muscles WHERE slug = 'side_delts'),
  (SELECT id FROM muscles WHERE slug = 'traps')
]
WHERE slug = 'dumbbell-cuban-press';

-- 3. Dumbbell Rear Delt Fly - Secondary: rhomboids, middle traps, rotator cuff
UPDATE exercises 
SET secondary_muscle_group_ids = ARRAY[
  (SELECT id FROM muscles WHERE slug = 'rhomboids'),
  (SELECT id FROM muscles WHERE slug = 'traps'),
  (SELECT id FROM muscles WHERE slug = 'rotator_cuff')
]
WHERE slug = 'dumbbell-rear-delt-fly';