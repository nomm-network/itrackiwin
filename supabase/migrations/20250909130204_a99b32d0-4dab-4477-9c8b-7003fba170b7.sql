-- Add secondary muscle groups for the three new exercises using muscle_groups

-- 1. Leg Extension Machine - Secondary: none needed (quads is already primary)
UPDATE exercises 
SET secondary_muscle_group_ids = ARRAY[]::uuid[]
WHERE slug = 'leg-extension-machine';

-- 2. Dumbbell Cuban Press - Secondary: shoulders (delts) + back (traps/rhomboids)
UPDATE exercises 
SET secondary_muscle_group_ids = ARRAY[
  (SELECT id FROM muscle_groups WHERE slug = 'shoulders'),
  (SELECT id FROM muscle_groups WHERE slug = 'back')
]
WHERE slug = 'dumbbell-cuban-press';

-- 3. Dumbbell Rear Delt Fly - Secondary: back (rhomboids/traps) 
UPDATE exercises 
SET secondary_muscle_group_ids = ARRAY[
  (SELECT id FROM muscle_groups WHERE slug = 'back')
]
WHERE slug = 'dumbbell-rear-delt-fly';