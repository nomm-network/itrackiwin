# Exercise Seeding Script Guide

## Overview
This document outlines the improvements made to the exercise seeding script and provides guidance for future exercise additions.

## Issues Found and Fixed

### 1. **Movement Pattern Enum Values**
**Problem**: Script used invalid enum value `'anti_extension'`
**Solution**: Use only valid movement_pattern enum values:
- `horizontal_push` (Bench Press, Push-ups)
- `vertical_push` (Overhead Press, Shoulder Press)
- `horizontal_pull` (Rows, Face Pulls)
- `vertical_pull` (Pull-ups, Lat Pulldowns)
- `squat` (Squats, Front Squats)
- `hinge` (Deadlifts, Hip Hinges)
- `lunge` (Lunges, Step-ups)
- `isolation` (Bicep Curls, Tricep Extensions)

### 2. **Muscle Slug Mapping**
**Problem**: Script used simplified muscle names that didn't match database slugs
**Solution**: Use anatomical muscle names from the database:

#### Upper Body Muscles:
- **Chest**: `pectoralis_major_sternal`, `pectoralis_major_clavicular`
- **Back**: `latissimus_dorsi`, `rhomboids`, `middle_trapezius`, `lower_trapezius`
- **Shoulders**: `anterior_deltoid`, `medial_deltoid`, `posterior_deltoid`
- **Arms**: `biceps_brachii_long_head`, `triceps_brachii_long_head`

#### Lower Body Muscles:
- **Quads**: `rectus_femoris`, `vastus_lateralis`, `vastus_medialis`
- **Glutes**: `gluteus_maximus`, `gluteus_medius`
- **Hamstrings**: `biceps_femoris_long_head`, `semitendinosus`
- **Calves**: `gastrocnemius_medial_head`, `soleus`

#### Core:
- **Abs**: `rectus_abdominis`, `external_obliques`

### 3. **Equipment Slug Mapping**
**Fixed equipment slugs**:
- `barbell` ✅
- `dumbbell` ✅  
- `cable-machine` ✅
- `bodyweight` ✅
- `machine` ✅

### 4. **Data Structure Requirements**
**Required fields for each exercise**:
```sql
- slug (unique, no spaces, lowercase)
- popularity_rank (integer, 1-100)
- exercise_skill_level ('beginner', 'medium', 'advanced')
- movement_pattern (valid enum value)
- primary_muscle_id (must match existing muscle slug)
- equipment_id (must match existing equipment slug)
```

## Future Exercise Addition Checklist

### Before Adding New Exercises:
1. **Check existing muscle slugs**:
   ```sql
   SELECT slug FROM muscles ORDER BY slug;
   ```

2. **Check existing equipment slugs**:
   ```sql
   SELECT slug FROM equipment ORDER BY slug;
   ```

3. **Verify movement pattern enum values**:
   ```sql
   SELECT unnest(enum_range(NULL::movement_pattern));
   ```

### When Adding Exercises:
1. ✅ Use exact muscle slugs from database
2. ✅ Use valid movement_pattern enum values
3. ✅ Use existing equipment slugs
4. ✅ Assign unique popularity ranks
5. ✅ Include both exercise and translation entries
6. ✅ Use proper skill levels (beginner/medium/advanced)

### Script Template:
```sql
-- Always use this structure for new exercises
WITH muscle_lookups AS (
  SELECT id, slug FROM muscles
),
equipment_lookups AS (
  SELECT id, slug FROM equipment  
),
params AS (
  SELECT * FROM (VALUES
    ('exercise-slug', 'Exercise Name', 'Exercise description', 'equipment_slug', 'muscle_slug', 'movement_pattern', skill_level, popularity_rank)
  ) AS t(slug, name, description, equipment_slug, muscle_slug, movement_pattern, skill_level, popularity_rank)
),
resolved AS (
  SELECT 
    p.*,
    e.id as equipment_id,
    m.id as primary_muscle_id
  FROM params p
  JOIN equipment_lookups e ON e.slug = p.equipment_slug
  JOIN muscle_lookups m ON m.slug = p.muscle_slug
)
-- Insert exercises and translations...
```

## Working Script Location
The complete working script is saved in: `scripts/exercise-seed-working.sql`

## Common Mistakes to Avoid
1. ❌ Don't use spaces in slugs
2. ❌ Don't use invalid movement patterns
3. ❌ Don't use muscle names that don't exist in database
4. ❌ Don't forget to add translations
5. ❌ Don't duplicate popularity ranks
6. ❌ Don't use equipment that doesn't exist

## Testing New Exercises
After running the script:
```sql
-- Verify exercises were inserted
SELECT COUNT(*) FROM exercises;

-- Check for missing translations  
SELECT e.slug FROM exercises e 
LEFT JOIN exercises_translations et ON e.id = et.exercise_id 
WHERE et.id IS NULL;

-- Verify muscle mappings
SELECT e.slug, m.slug as muscle FROM exercises e
JOIN muscles m ON e.primary_muscle_id = m.id;
```