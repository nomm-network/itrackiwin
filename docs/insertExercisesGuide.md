# Exercise Insertion Guide

This guide documents the proper process for adding new exercises to the database, including constraints, required fields, and common pitfalls to avoid.

## Database Structure Overview

### Key Tables
- `exercises` - Main exercise records
- `muscle_groups` - Muscle group categories (shoulders, back, legs, etc.)
- `muscles` - Specific muscles (biceps, triceps, quadriceps, etc.)
- `equipment` - Equipment types (dumbbell, machine, barbell, etc.)
- `body_parts` - Body part categories (upper_body, lower_body, etc.)

### Critical Constraints

#### Secondary Muscle Groups Constraint
- `secondary_muscle_group_ids` must reference `muscle_groups.id`, NOT `muscles.id`
- Use muscle group slugs: 'shoulders', 'back', 'legs', 'chest', 'arms', 'core'
- DO NOT use specific muscle IDs like biceps, triceps, etc.

#### Required Fields for New Exercises
- `slug` - Unique identifier (kebab-case)
- `equipment_id` - Must reference existing equipment
- `primary_muscle_id` - Must reference existing muscle (specific muscle, not group)
- `body_part_id` - Must reference existing body part
- `is_public` - Set to true for system exercises
- `owner_user_id` - Set to NULL for system exercises

## Step-by-Step Insertion Process

### 1. Verify Equipment Exists
```sql
SELECT id, slug FROM equipment WHERE slug = 'your-equipment-slug';
```

### 2. Find Primary Muscle ID
```sql
SELECT id, slug FROM muscles WHERE slug = 'target-muscle-slug';
```

### 3. Find Body Part ID
```sql
SELECT id, slug FROM body_parts WHERE slug = 'body-part-slug';
```

### 4. Insert Exercise
```sql
INSERT INTO exercises (
  slug,
  equipment_id,
  primary_muscle_id,
  body_part_id,
  is_public,
  owner_user_id,
  secondary_muscle_group_ids
) VALUES (
  'exercise-name',
  (SELECT id FROM equipment WHERE slug = 'equipment-slug'),
  (SELECT id FROM muscles WHERE slug = 'primary-muscle-slug'),
  (SELECT id FROM body_parts WHERE slug = 'body-part-slug'),
  true,
  NULL,
  ARRAY[
    (SELECT id FROM muscle_groups WHERE slug = 'secondary-group-1'),
    (SELECT id FROM muscle_groups WHERE slug = 'secondary-group-2')
  ]
);
```

### 5. Add Translations (if needed)
```sql
INSERT INTO exercise_translations (
  exercise_id,
  language_code,
  name,
  description
) VALUES (
  (SELECT id FROM exercises WHERE slug = 'exercise-slug'),
  'en',
  'Exercise Display Name',
  'Exercise description'
);
```

## Common Equipment Mappings

| Exercise Type | Equipment Slug |
|---------------|----------------|
| Dumbbell exercises | `dumbbell` |
| Machine exercises | `machine` |
| Barbell exercises | `barbell` |
| Bodyweight exercises | `bodyweight` |
| Cable exercises | `cable-machine` |

## Common Muscle Group Mappings

### Primary Muscles (use specific muscles)
- Chest: `pectoralis-major`, `pectoralis-minor`
- Back: `latissimus-dorsi`, `rhomboids`, `trapezius`
- Shoulders: `anterior-deltoid`, `posterior-deltoid`, `medial-deltoid`
- Arms: `biceps-brachii`, `triceps-brachii`
- Legs: `quadriceps`, `hamstrings`, `glutes`, `calves`

### Secondary Muscle Groups (use muscle groups)
- `shoulders` - For shoulder involvement
- `back` - For back stabilization
- `arms` - For arm assistance
- `legs` - For leg involvement
- `chest` - For chest assistance
- `core` - For core stabilization

## Body Part Mappings

- Upper body exercises: `upper_body`
- Lower body exercises: `lower_body`
- Full body exercises: `full_body`

## Example: Complete Exercise Addition

```sql
-- Example: Adding "Dumbbell Hammer Curl"
INSERT INTO exercises (
  slug,
  equipment_id,
  primary_muscle_id,
  body_part_id,
  is_public,
  owner_user_id,
  secondary_muscle_group_ids,
  configured
) VALUES (
  'dumbbell-hammer-curl',
  (SELECT id FROM equipment WHERE slug = 'dumbbell'),
  (SELECT id FROM muscles WHERE slug = 'biceps-brachii'),
  (SELECT id FROM body_parts WHERE slug = 'upper_body'),
  true,
  NULL,
  ARRAY[(SELECT id FROM muscle_groups WHERE slug = 'arms')],
  true
);

-- Add translation
INSERT INTO exercise_translations (
  exercise_id,
  language_code,
  name,
  description
) VALUES (
  (SELECT id FROM exercises WHERE slug = 'dumbbell-hammer-curl'),
  'en',
  'Dumbbell Hammer Curl',
  'A bicep curl variation using a neutral grip to target the biceps and forearms'
);
```

## Common Pitfalls to Avoid

### ❌ Wrong - Using muscle IDs for secondary groups
```sql
-- This will fail constraint validation
secondary_muscle_group_ids = ARRAY[(SELECT id FROM muscles WHERE slug = 'triceps-brachii')]
```

### ✅ Correct - Using muscle group IDs
```sql
-- This works correctly
secondary_muscle_group_ids = ARRAY[(SELECT id FROM muscle_groups WHERE slug = 'arms')]
```

### ❌ Wrong - Missing required fields
```sql
-- This will fail due to missing required fields
INSERT INTO exercises (slug) VALUES ('new-exercise');
```

### ✅ Correct - All required fields provided
```sql
INSERT INTO exercises (
  slug,
  equipment_id,
  primary_muscle_id,
  body_part_id,
  is_public,
  owner_user_id
) VALUES (...);
```

## Verification Queries

After adding exercises, verify with these queries:

```sql
-- Check exercise was added correctly
SELECT e.slug, et.name, m.slug as primary_muscle, eq.slug as equipment
FROM exercises e
LEFT JOIN exercise_translations et ON et.exercise_id = e.id AND et.language_code = 'en'
LEFT JOIN muscles m ON m.id = e.primary_muscle_id
LEFT JOIN equipment eq ON eq.id = e.equipment_id
WHERE e.slug = 'your-exercise-slug';

-- Check secondary muscle groups
SELECT e.slug, array_agg(mg.slug) as secondary_groups
FROM exercises e
LEFT JOIN muscle_groups mg ON mg.id = ANY(e.secondary_muscle_group_ids)
WHERE e.slug = 'your-exercise-slug'
GROUP BY e.slug;
```

## Quick Reference Checklist

Before adding new exercises:
- [ ] Equipment exists in database
- [ ] Primary muscle exists in `muscles` table
- [ ] Body part exists in `body_parts` table
- [ ] Secondary muscle groups use `muscle_groups` IDs, not `muscles` IDs
- [ ] All required fields are provided
- [ ] `is_public = true` for system exercises
- [ ] `owner_user_id = NULL` for system exercises
- [ ] `configured = true` for complete exercises

## Common Mistakes and How to Avoid Them

### ❌ PL/pgSQL Variable Naming Conflicts
When writing PL/pgSQL blocks for bulk insertions, avoid using reserved words or table names as variable names:

```sql
-- ❌ WRONG - "exercise" conflicts with table name
DECLARE
  exercise RECORD;
BEGIN
  FOR exercise IN SELECT ... LOOP
```

```sql
-- ✅ CORRECT - Use prefixed or descriptive variable names
DECLARE
  ex_record RECORD;
  v_exercise RECORD;
BEGIN
  FOR ex_record IN SELECT ... LOOP
```

### ❌ Missing Essential Data After Insertion
Always verify and populate these critical fields after inserting exercises:

1. **Missing `body_part_id`**: Should be derived from the primary muscle's body part
2. **Missing `popularity_rank`**: Required for proper ordering in UI
3. **Missing translations**: At minimum need English (`en`) translations

```sql
-- ✅ Always update body_part_id after insertion
UPDATE exercises 
SET body_part_id = (
  SELECT mg.body_part_id 
  FROM muscle_groups mg 
  WHERE mg.id = exercises.primary_muscle_id
)
WHERE body_part_id IS NULL;

-- ✅ Always set popularity_rank for proper ordering
UPDATE exercises 
SET popularity_rank = 50  -- Or appropriate value
WHERE popularity_rank IS NULL;
```

### ❌ Incomplete Data Validation Checklist
After inserting exercises, always verify:

```sql
-- Verification query to check data completeness
SELECT 
  e.slug,
  e.body_part_id IS NOT NULL as has_body_part,
  e.primary_muscle_id IS NOT NULL as has_muscle,
  e.equipment_id IS NOT NULL as has_equipment,
  e.popularity_rank IS NOT NULL as has_rank,
  COUNT(et.id) > 0 as has_translations
FROM exercises e
LEFT JOIN exercises_translations et ON et.exercise_id = e.id
WHERE e.slug IN ('your-exercise-slugs')
GROUP BY e.id, e.slug, e.body_part_id, e.primary_muscle_id, e.equipment_id, e.popularity_rank;
```

### ❌ Forgetting to Check Existing Data
Before inserting, always check if exercises already exist:

```sql
-- ✅ Check for duplicates first
SELECT slug FROM exercises WHERE slug IN ('exercise-1', 'exercise-2');
```

## Recommended Insertion Process

1. **Validate Prerequisites**: Check equipment, muscle groups, and body parts exist
2. **Check for Duplicates**: Ensure exercise slugs don't already exist
3. **Use Safe Variable Names**: Avoid reserved words in PL/pgSQL
4. **Insert with Core Data**: Include all required fields in initial insert
5. **Add Translations**: Insert at minimum English translations
6. **Update Missing Fields**: Set body_part_id and popularity_rank
7. **Verify Completeness**: Run validation query to confirm all data is present

## Future Improvements

Consider adding these when inserting exercises:
- Exercise images (`exercise_images` table)
- Exercise grips (`exercise_grips` table)
- Movement patterns (`movement_pattern_id`)
- Exercise aliases (`exercise_aliases` table)
- Equipment variants (`exercise_equipment_variants` table)