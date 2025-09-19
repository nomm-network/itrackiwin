# Complete Database Data Analysis

## User Data Tables

### users
```sql
-- Empty or minimal test data
-- Columns: id, is_pro, created_at, updated_at
-- RLS: Users can only see their own records
```

### user_profile_fitness
```sql
-- Empty - no user profiles configured
-- Columns: user_id, sex, bodyweight, height_cm, training_age_months, goal, injuries, prefer_short_rests
-- Issue: May still have bodyweight/height_cm columns that should be removed
```

### user_body_metrics
```sql
-- Empty - no body metrics recorded
-- Columns: id, user_id, weight_kg, height_cm, recorded_at, source, notes
-- This should be the ONLY source of weight/height data
```

## Exercise Data Tables

### exercises
```sql
-- Contains exercise definitions
-- Sample data shows exercises have:
-- - load_type: "single_load", "dual_load", etc.
-- - Missing: effort_mode, load_mode fields
-- - equipment_id: Present (e.g., "fb81ae58-bf4e-44e8-b45a-6026147bca8e" for dips)

-- Critical Issue: Application expects load_mode/effort_mode but table has load_type
```

### equipment
```sql
-- Contains equipment definitions
-- Sample equipment types:
-- - dip-bars (equipment_id: fb81ae58-bf4e-44e8-b45a-6026147bca8e)
-- - pull-up-bar
-- - barbell
-- - dumbbell
-- - machine types
```

### exercises_translations
```sql
-- Multi-language exercise names
-- Contains "Dips" and "Flotări la Paralele" (Romanian)
-- Properly populated for major exercises
```

## Workout Data Tables

### workouts
```sql
-- Empty - no workouts created yet
-- Columns: id, user_id, started_at, ended_at, template_id, readiness_score
```

### workout_exercises
```sql
-- Empty - no workout exercises
-- Columns: id, workout_id, exercise_id, order_index, target_sets, target_reps, target_weight_kg
```

### workout_sets
```sql
-- Empty - no sets logged
-- Columns: id, workout_exercise_id, set_index, weight_kg, reps, duration_seconds, is_completed
-- Critical: total_weight_kg column for bodyweight exercises
```

## Equipment & Loading Data

### plate_profiles
```sql
-- Contains standard plate configurations
-- Common plates: 25kg, 20kg, 15kg, 10kg, 5kg, 2.5kg, 1.25kg, 0.5kg
```

### stack_profiles
```sql
-- Contains machine stack configurations
-- Weight stacks from 5kg to 120kg in 5kg increments
```

### bar_types
```sql
-- Contains barbell types
-- Standard barbells: 20kg Olympic, 15kg women's, etc.
```

## Personal Records

### personal_records
```sql
-- Empty - no personal records set
-- Columns: user_id, exercise_id, kind ('heaviest', 'reps', '1RM'), value, unit, grip_key
```

## Key Data Issues

### Exercise Configuration
1. **Missing Load Mode Mapping**:
   ```sql
   -- Current: exercises.load_type = "single_load"
   -- Needed: exercises.load_mode = "bodyweight_plus_optional"
   -- Missing: exercises.effort_mode = "reps"
   ```

2. **Equipment Classification**:
   ```sql
   -- Dips equipment_id: "fb81ae58-bf4e-44e8-b45a-6026147bca8e"
   -- Should map to: bodyweight exercise type
   -- Currently: No clear mapping in application
   ```

### User Data Structure
1. **Weight/Height Storage**:
   ```sql
   -- Problem: user_profile_fitness may have bodyweight/height_cm columns
   -- Solution: Remove from profile table, use only user_body_metrics
   ```

2. **Empty User Data**:
   - No test users with actual data
   - No sample workouts or sets
   - No body metrics recorded

## Required Data Migrations

### Exercise Table Updates
```sql
-- Add missing columns:
ALTER TABLE exercises ADD COLUMN effort_mode TEXT;
ALTER TABLE exercises ADD COLUMN load_mode TEXT;

-- Update dips and similar exercises:
UPDATE exercises 
SET effort_mode = 'reps', load_mode = 'bodyweight_plus_optional'
WHERE equipment_id = 'fb81ae58-bf4e-44e8-b45a-6026147bca8e';
```

### User Profile Cleanup
```sql
-- Remove weight/height from fitness profiles:
ALTER TABLE user_profile_fitness DROP COLUMN IF EXISTS bodyweight;
ALTER TABLE user_profile_fitness DROP COLUMN IF EXISTS height_cm;
```

## Sample Data Needs

### Test User Data
```sql
-- Need test user with:
-- - Basic profile in user_profile_fitness
-- - Body metrics in user_body_metrics
-- - Sample workout with sets
-- - Personal records
```

### Exercise Categorization
```sql
-- Need proper categorization of:
-- - Bodyweight exercises (dips, pull-ups, push-ups)
-- - Barbell exercises (bench, squat, deadlift)
-- - Machine exercises (lat pulldown, leg press)
-- - Cardio exercises (treadmill, bike)
```

## Current Database State Summary

### Populated Tables
- ✅ exercises (partial - missing mode fields)
- ✅ equipment (complete)
- ✅ exercises_translations (complete)
- ✅ plate_profiles (complete)
- ✅ stack_profiles (complete)
- ✅ bar_types (complete)

### Empty Tables
- ❌ users (no test data)
- ❌ user_profile_fitness (empty)
- ❌ user_body_metrics (empty)
- ❌ workouts (empty)
- ❌ workout_exercises (empty)
- ❌ workout_sets (empty)
- ❌ personal_records (empty)

### Problematic Tables
- ⚠️ exercises (missing effort_mode/load_mode)
- ⚠️ user_profile_fitness (may have wrong columns)

## Critical Path to Fix

1. **Database Schema Update**: Add effort_mode/load_mode to exercises
2. **Data Population**: Update exercises with correct modes
3. **Profile Cleanup**: Remove weight/height from fitness profiles
4. **Test Data**: Create sample user with complete data
5. **Application Update**: Update form routing to use correct fields