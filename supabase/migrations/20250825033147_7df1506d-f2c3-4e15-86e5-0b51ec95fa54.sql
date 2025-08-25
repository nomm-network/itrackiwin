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

-- Drop the dependent view first
DROP VIEW IF EXISTS v_exercises_with_translations;

-- Now remove the body_part text column
ALTER TABLE exercises DROP COLUMN body_part;

-- Recreate the view without the body_part column
CREATE VIEW v_exercises_with_translations AS
SELECT 
    e.*,
    COALESCE(
        jsonb_object_agg(
            et.language_code, 
            jsonb_build_object('name', et.name, 'description', et.description)
        ) FILTER (WHERE et.language_code IS NOT NULL),
        '{}'::jsonb
    ) as translations
FROM exercises e
LEFT JOIN exercises_translations et ON et.exercise_id = e.id
GROUP BY e.id, e.created_at, e.is_public, e.movement_pattern, e.source_url, 
         e.thumbnail_url, e.image_url, e.exercise_skill_level, e.primary_muscle_id, 
         e.body_part_id, e.secondary_muscle_group_ids, e.default_grip_ids, 
         e.popularity_rank, e.contraindications, e.complexity_score, 
         e.equipment_id, e.capability_schema, e.owner_user_id, e.slug;