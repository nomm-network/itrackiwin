-- Update the missing body_part_id and other important columns for the recently inserted exercises

-- Update body_part_id based on muscle groups
UPDATE exercises 
SET body_part_id = (
  SELECT mg.body_part_id 
  FROM muscle_groups mg 
  WHERE mg.id = exercises.primary_muscle_id
)
WHERE slug IN (
  'barbell-shoulder-press',
  'cable-rope-triceps-extensions', 
  'chest-front-dumbbell-raises',
  'dips-machine-stack',
  'middle-chest-press-machine'
) AND body_part_id IS NULL;

-- Set reasonable popularity ranks for these exercises
UPDATE exercises 
SET popularity_rank = CASE slug
  WHEN 'barbell-shoulder-press' THEN 25
  WHEN 'middle-chest-press-machine' THEN 30  
  WHEN 'dips-machine-stack' THEN 35
  WHEN 'cable-rope-triceps-extensions' THEN 40
  WHEN 'chest-front-dumbbell-raises' THEN 45
END
WHERE slug IN (
  'barbell-shoulder-press',
  'cable-rope-triceps-extensions', 
  'chest-front-dumbbell-raises',
  'dips-machine-stack',
  'middle-chest-press-machine'
) AND popularity_rank IS NULL;