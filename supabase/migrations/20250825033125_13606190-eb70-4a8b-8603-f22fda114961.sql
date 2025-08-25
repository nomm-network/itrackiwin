-- Update body_part_id for all exercises based on body_part text column

-- Arms exercises
UPDATE exercises 
SET body_part_id = '903924e8-cbb4-4b23-82b4-813703148f69'
WHERE body_part = 'arms';

-- Back exercises  
UPDATE exercises 
SET body_part_id = '82e99076-7711-4f76-b0cd-61391c36aefa'
WHERE body_part = 'back';

-- Chest exercises
UPDATE exercises 
SET body_part_id = '1643dca9-5784-46ad-a3c1-bd67d2a125b4'
WHERE body_part = 'chest';

-- Core exercises
UPDATE exercises 
SET body_part_id = 'f34bb30b-336b-4507-a458-ca2a11fe56d6'
WHERE body_part = 'core';

-- Legs exercises
UPDATE exercises 
SET body_part_id = '72a125c2-e2fa-49c6-b129-d1a946996d3c'
WHERE body_part = 'legs';

-- Shoulders exercises
UPDATE exercises 
SET body_part_id = '5fb5cc84-7bf1-48d9-8296-3eef485e3654'
WHERE body_part = 'shoulders';

-- Handle calves exercises (map to legs since there's no separate calves body part)
UPDATE exercises 
SET body_part_id = '72a125c2-e2fa-49c6-b129-d1a946996d3c'
WHERE body_part = 'calves';

-- Handle glutes exercises (map to legs since there's no separate glutes body part)
UPDATE exercises 
SET body_part_id = '72a125c2-e2fa-49c6-b129-d1a946996d3c'
WHERE body_part = 'glutes';

-- Verify all exercises now have body_part_id assigned
DO $$
DECLARE
    unassigned_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO unassigned_count 
    FROM exercises 
    WHERE body_part_id IS NULL;
    
    IF unassigned_count > 0 THEN
        RAISE EXCEPTION 'Still have % exercises without body_part_id assigned', unassigned_count;
    END IF;
    
    RAISE NOTICE 'Successfully updated body_part_id for all exercises';
END $$;

-- Now remove the body_part text column
ALTER TABLE exercises DROP COLUMN body_part;