# Database Schema Report - iTrack.iWin

## Database Tables Overview

### Core Fitness Tables

#### `user_fitness_profile`
- **Purpose**: Stores user fitness goals, experience, and preferences
- **Key Columns**:
  - `user_id` (uuid) - References authenticated user
  - `sex` (text) - User's biological sex
  - `training_age_months` (integer) - Experience in months
  - `goal` (text) - Primary fitness goal (hypertrophy, strength, fat_loss, general)
  - `injuries` (jsonb) - Current injuries/limitations
  - `prefer_short_rests` (boolean) - Rest preference
  - `created_at`, `updated_at` (timestamp)

#### `user_body_metrics`
- **Purpose**: Historical tracking of user's body measurements
- **Key Columns**:
  - `user_id` (uuid) - References authenticated user
  - `weight_kg` (numeric) - Body weight in kilograms
  - `height_cm` (numeric) - Height in centimeters
  - `source` (text) - How data was entered (manual, scale, etc.)
  - `recorded_at` (timestamp) - When measurement was taken
  - `created_at` (timestamp)

### Exercise System Tables

#### `exercises`
- **Purpose**: Master exercise database
- **Key Columns**:
  - `id` (uuid) - Primary key
  - `slug` (text) - URL-friendly identifier
  - `display_name` (text) - Human-readable name
  - `effort_mode` (text) - How effort is measured (reps, time, distance, calories)
  - `load_mode` (text) - How load is applied (bodyweight_plus_optional, external_assist, external_added)
  - `equipment_id` (uuid) - Required equipment
  - `primary_muscle_id` (uuid) - Primary muscle worked
  - `body_part_id` (uuid) - Body part category
  - `movement_pattern_id` (uuid) - Movement pattern classification

#### `equipment`
- **Purpose**: Available exercise equipment
- **Key Columns**:
  - `id` (uuid) - Primary key
  - `slug` (text) - Equipment identifier
  - `equipment_type` (text) - Type classification
  - `load_type` (enum) - How weight is loaded
  - `configured` (boolean) - Setup completion status

### Workout Tracking Tables

#### `workouts`
- **Purpose**: Individual workout sessions
- **Key Columns**:
  - `id` (uuid) - Primary key
  - `user_id` (uuid) - Owner
  - `template_id` (uuid) - Source template (optional)
  - `started_at` (timestamp) - Session start
  - `ended_at` (timestamp) - Session end (null if active)
  - `readiness_score` (numeric) - Pre-workout readiness assessment

#### `workout_exercises`
- **Purpose**: Exercises within a workout
- **Key Columns**:
  - `id` (uuid) - Primary key
  - `workout_id` (uuid) - Parent workout
  - `exercise_id` (uuid) - Exercise reference
  - `order_index` (integer) - Exercise order
  - `target_sets` (integer) - Planned sets
  - `target_reps` (integer) - Planned reps
  - `target_weight_kg` (numeric) - Planned weight

#### `workout_sets`
- **Purpose**: Individual sets performed
- **Key Columns**:
  - `id` (uuid) - Primary key
  - `workout_exercise_id` (uuid) - Parent exercise
  - `set_index` (integer) - Set number
  - `set_kind` (enum) - Type (warmup, normal, top_set, drop, amrap)
  - `reps` (integer) - Repetitions completed
  - `weight` (numeric) - Weight used
  - `weight_unit` (text) - Unit (kg, lbs)
  - `duration_seconds` (integer) - Time-based exercises
  - `distance` (numeric) - Distance-based exercises
  - `rpe` (numeric) - Rate of Perceived Exertion (1-10)
  - `completed_at` (timestamp)
  - `is_completed` (boolean)

## Database Views

### `v_last_working_set`
- **Purpose**: Get the most recent working set for each user/exercise combination
- **Usage**: Progression tracking, load suggestions

### `v_exercises_with_translations`
- **Purpose**: Exercises with localized names/descriptions
- **Usage**: Multi-language exercise display

### `v_user_default_gym`
- **Purpose**: Get user's primary gym configuration
- **Usage**: Equipment availability, gym-specific settings

## Database Functions

### Core Functions
- `start_workout(template_id)` - Initialize new workout from template
- `end_workout(workout_id)` - Complete and finalize workout
- `log_workout_set()` - Record set performance
- `compute_readiness_for_user()` - Calculate pre-workout readiness
- `generate_warmup_steps()` - Create warmup progression

### Utility Functions
- `slugify(text)` - Create URL-safe identifiers
- `epley_1rm(weight, reps)` - Estimate 1-rep max
- `closest_machine_weight()` - Find nearest available machine weight
- `pick_base_load()` - Suggest starting weight

## Current Data Sample

### User Fitness Profiles
```
Currently no user fitness profiles in database
```

### User Body Metrics
```
Currently no body metrics records in database
```

### Exercise Data (Dips Example)
```
Exercise: Dips
- ID: 6da86374-b133-4bf1-a159-fd9bbb715316
- Slug: dips
- Load Mode: bodyweight_plus_optional
- Equipment ID: fb81ae58-bf4e-44e8-b45a-6026147bca8e (dip-bars)
- Effort Mode: reps
- Bodyweight Involvement: 100%
```

## Critical Issues Identified

### Issue 1: Weight/Height Display in Fitness Profile
**Problem**: The fitness profile form shows "Body Metrics Tracking has been moved to dedicated section" instead of actual input fields.

**Root Cause**: Code logic redirects users away from inline weight/height inputs instead of providing them directly in the form.

**Expected Behavior**: Weight and height should be editable directly in the fitness profile form, with data saved to `user_body_metrics` table.

### Issue 2: Exercise Form Selection for Bodyweight Exercises
**Problem**: Dips exercise (and other bodyweight exercises) show weight/reps form instead of bodyweight-specific form.

**Analysis**:
- Dips exercise has `load_mode: "bodyweight_plus_optional"`
- Equipment has slug: "dip-bars" 
- Equipment type should trigger bodyweight form selection
- Form selection logic in `SmartSetForm` may not be properly detecting bodyweight exercises

**Expected Behavior**: Bodyweight exercises should show:
- Reps input
- Optional additional weight input
- Bodyweight indicators
- Quick weight buttons (0kg, 5kg, 10kg, etc.)
- Current bodyweight display

## Recommendations

1. **Fix Form Selection Logic**: Review `SmartSetForm.tsx` detection logic for bodyweight exercises
2. **Restore Direct Weight/Height Inputs**: Add weight/height fields directly to fitness profile form
3. **Verify Exercise Data**: Ensure all bodyweight exercises have correct `load_mode` values
4. **Test Equipment Detection**: Verify equipment-based form selection works correctly