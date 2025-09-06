# COMPLETE FUNCTION REFERENCE - DATABASE AND EDGE FUNCTIONS

**Total Database Functions**: 366 functions including PostGIS, trigram, and custom RPC functions

## Error Report
**Current Issue**: `start_workout` function fails with:
- **Error**: `function round(numeric, numeric) does not exist`  
- **Location**: `ROUND(v_base_weight * v_multiplier, 1)` in start_workout
- **PostgreSQL Limitation**: Only `ROUND(numeric)` exists (rounds to integer)

## Database RPC Functions (Critical for Workout Flow)

### Workout Management Functions

#### `start_workout(p_template_id uuid)`
**Purpose**: Creates new workout session, optionally from template
**Returns**: uuid (workout_id)
**Critical Dependencies**: 
- User authentication via `auth.uid()`
- Template validation if template_id provided
- RLS policies on workouts table

#### `end_workout(p_workout_id uuid)`
**Purpose**: Marks workout as completed
**Returns**: uuid (workout_id)
**Logic**: Updates `ended_at` timestamp, validates user ownership

#### `log_workout_set(p_workout_exercise_id uuid, p_set_index integer, p_metrics jsonb, p_grip_ids uuid[])`
**Purpose**: Records individual set performance
**Returns**: uuid (set_id)
**Features**: 
- Inserts workout set record
- Saves metric values from JSONB
- Records grip variations used
- Triggers warmup recalculation

#### `get_next_set_index(p_workout_exercise_id uuid)`
**Purpose**: Gets next available set index for exercise
**Returns**: integer
**Logic**: MAX(set_index) + 1 for given workout exercise

### Readiness System Functions (CRITICAL FOR CURRENT ISSUE)

#### `compute_readiness_for_user(p_user_id uuid, p_workout_started_at timestamp with time zone)`
**Purpose**: Calculates user readiness score based on latest check-in
**Returns**: numeric (readiness score 0-100)
**Dependencies**: 
- `get_latest_readiness()` function
- `compute_readiness_score()` function
- `v_latest_readiness` view (RECENTLY MODIFIED)

**Critical Logic**:
```sql
-- Gets latest readiness data from pre_workout_checkins.answers JSONB
SELECT * FROM public.get_latest_readiness(p_user_id, p_workout_started_at)

-- Calculates score from extracted values
v_score := public.compute_readiness_score(
  COALESCE(r.energy, 5),
  COALESCE(r.sleep_quality, 5), 
  COALESCE(r.sleep_hours, 8), 
  COALESCE(r.soreness, 1),
  COALESCE(r.stress, 1), 
  COALESCE(r.illness, 0), 
  COALESCE(r.alcohol, 0), 
  CASE WHEN COALESCE(r.supplements, 0) > 0 THEN '["supplements"]'::jsonb ELSE '[]'::jsonb END
);
```

**Default Behavior**: Returns 65 if no readiness data found

### Warmup System Functions

#### `initialize_warmup_for_exercise(p_workout_exercise_id uuid)`
**Purpose**: Sets up initial warmup plan for exercise
**Logic**:
- Gets target weight from workout_exercises or user estimates
- Creates/updates workout_exercise_feedback record
- Calls `recalc_warmup_from_last_set()` to generate warmup steps

#### `recalc_warmup_from_last_set(p_workout_exercise_id uuid)`
**Purpose**: Recalculates warmup progression based on target weight
**Trigger**: Called after each completed set

### User and Authentication Functions

#### `create_admin_user(target_user_id uuid, requester_role text)`
**Purpose**: Creates admin user with proper authorization
**Returns**: boolean
**Security**: Requires superadmin role or system initialization

#### `is_admin_with_rate_limit(_user_id uuid)`
**Purpose**: Checks admin status with rate limiting protection
**Returns**: boolean
**Features**: 
- Rate limits admin checks (10 per minute)
- Logs suspicious activity
- Auto-cleanup of old rate limit records

#### `handle_new_user()`
**Purpose**: Trigger function for new user creation
**Logic**: Inserts into profiles table when new auth user created

### Utility and Helper Functions

#### `slugify(txt text)`
**Purpose**: Converts text to URL-friendly slug
**Returns**: text
**Logic**: Lowercase, remove accents, replace non-alphanumeric with hyphens

#### `short_hash_uuid(u uuid)`
**Purpose**: Creates short hash from UUID for display
**Returns**: text (6 characters)
**Logic**: SHA256 hash of UUID, truncated to 6 chars

#### `epley_1rm(weight numeric, reps integer)`
**Purpose**: Calculates 1RM using Epley formula
**Returns**: numeric
**Formula**: weight * (1 + reps/30.0)

#### `generate_warmup_steps(p_top_kg numeric)`
**Purpose**: Creates warmup progression steps
**Returns**: jsonb array
**Logic**: 40%, 60%, 80% of working weight with descending reps

### Equipment and Weight Functions

#### `compute_total_weight(p_entry_mode text, p_value numeric, p_bar_weight numeric, p_is_symmetrical boolean)`
**Purpose**: Calculates total weight from entry mode
**Returns**: numeric
**Modes**: 'total' (direct value) or 'one_side' (bar + plates)

#### `next_weight_step_kg(p_load_type load_type, p_side_min_plate_kg numeric, p_single_min_increment_kg numeric)`
**Purpose**: Gets minimum weight increment for equipment
**Returns**: numeric
**Logic**: 2x side plate for dual_load, single increment for others

#### `closest_machine_weight(desired numeric, stack numeric[], aux numeric[])`
**Purpose**: Finds closest available weight on machine
**Returns**: numeric
**Logic**: Checks stack steps and stack+aux combinations

#### `bar_min_increment(_gym_id uuid)`
**Purpose**: Gets minimum plate increment for gym
**Returns**: numeric
**Logic**: 2x smallest available plate/miniweight

### Analysis and Suggestion Functions

#### `fn_detect_stagnation(p_exercise_id uuid, p_lookback_sessions integer)`
**Purpose**: Detects training plateaus and declining performance
**Returns**: jsonb with analysis
**Features**:
- Analyzes weight variance over sessions
- Detects plateaus (low variance over 3+ sessions)
- Identifies declining trends
- Provides specific recommendations

#### `fn_suggest_warmup(p_exercise_id uuid, p_working_weight numeric, p_working_reps integer)`
**Purpose**: Suggests warmup progression for exercise
**Returns**: jsonb with warmup sets
**Logic**: 40%, 60%, 80% progression with appropriate reps

#### `fn_suggest_sets(p_exercise_id uuid, p_progression_type text, p_target_reps integer)`
**Purpose**: Suggests set/rep/weight scheme
**Returns**: jsonb with recommendations
**Progression Types**: 'linear', 'percentage', 'pyramid'

#### `fn_suggest_rest_seconds(p_workout_set_id uuid, p_effort_level text)`
**Purpose**: Recommends rest period based on set type and effort
**Returns**: integer (seconds)
**Factors**: Set type, effort level, superset status

### Performance Tracking Functions

#### `get_user_last_set_for_exercise(p_exercise_id uuid)`
**Purpose**: Gets user's most recent set for exercise
**Returns**: table with weight, reps, completed_at
**Source**: `mv_last_set_per_user_exercise` materialized view

#### `get_user_pr_for_exercise(p_exercise_id uuid)`
**Purpose**: Gets user's personal record for exercise
**Returns**: table with best_weight
**Source**: `mv_pr_weight_per_user_exercise` materialized view

### Text and Localization Functions

#### `get_text(p_key text, p_language_code text)`
**Purpose**: Gets localized text with fallbacks
**Returns**: text
**Logic**: Requested language → English → key as fallback

#### `get_life_categories_i18n(lang_code text)`
**Purpose**: Gets life categories with translations
**Returns**: table with localized names/descriptions
**Logic**: Joins categories with translation tables

### Demo and Development Functions

#### `create_demo_template_for_current_user()`
**Purpose**: Creates sample workout template
**Returns**: uuid (template_id)
**Exercises**: Bench Press, Overhead Press, Triceps Pushdown

### Configuration and Coach Functions

#### `get_user_coach_params(_user_id uuid)`
**Purpose**: Gets user's coaching parameters
**Returns**: table with experience-based settings
**Logic**: Joins user profile with experience level configs

## Database Views (Critical for Data Access)

### `v_latest_readiness` (RECENTLY MODIFIED - CRITICAL)
**Purpose**: Extracts latest readiness data from JSONB
**Recent Changes**: Updated to handle `pre_workout_checkins.answers` column
**Potential Issues**: May not extract JSONB values correctly

### Performance Views
- `v_last_working_set` - Latest working set per user/exercise
- `mv_user_exercise_1rm` - 1RM estimates (materialized)
- `mv_last_set_per_user_exercise` - Last set tracking (materialized)
- `mv_pr_weight_per_user_exercise` - Personal records (materialized)

### Translation Views
- `v_exercises_with_translations` - Exercises with localized names
- `v_body_parts_with_translations` - Body parts with translations
- `v_muscle_groups_with_translations` - Muscle groups with translations
- `v_muscles_with_translations` - Muscles with translations

## Edge Functions (Supabase Functions)

### AI Coach Function (`ai-coach`)
**Purpose**: Provides AI-powered workout analysis and recommendations
**Dependencies**: OpenAI API key
**Features**:
- Analyzes workout history patterns
- Provides personalized recommendations
- Integrates with user goals and preferences

**Key Types**:
```typescript
interface WorkoutAnalysisRequest {
  userId: string;
  workoutHistory: any[];
  userGoals?: string[];
  preferences?: {
    difficulty?: string;
    duration?: number;
    equipment?: string[];
  };
}
```

### Shared Schemas (`_shared/schemas.ts`)
**Purpose**: Type definitions for edge functions
**Key Types**:
- `FitnessProfile` - User fitness configuration
- `WorkoutTemplate` - Template structure
- `ExerciseAlternative` - Exercise substitutions
- `EquipmentCapability` - Equipment specifications
- `RecalibrationTrigger` - System recalibration

## Database Triggers (Automatic Functions)

### `trg_after_set_logged()`
**Purpose**: Recalculates warmup after set completion
**Trigger**: AFTER INSERT/UPDATE on workout_sets
**Logic**: Calls `recalc_warmup_from_last_set()` when set completed

### `assign_next_set_index()`
**Purpose**: Auto-assigns set index if not provided
**Trigger**: BEFORE INSERT on workout_sets
**Logic**: Sets set_index to MAX + 1 if null or 0

### `populate_grip_key_from_workout_exercise()`
**Purpose**: Syncs grip information to sets
**Trigger**: BEFORE INSERT/UPDATE on workout_sets
**Logic**: Copies grip slug from workout_exercises to set

### `trg_te_sync_weights()`
**Purpose**: Ensures weight unit consistency
**Trigger**: BEFORE INSERT/UPDATE on template_exercises
**Logic**: Defaults weight_unit to 'kg' if null

### `exercises_autoname_tg()`
**Purpose**: Auto-generates exercise display names
**Trigger**: BEFORE INSERT/UPDATE on exercises
**Logic**: Uses custom name or generates from movement/equipment/muscle

### `update_updated_at_column()`
**Purpose**: Maintains updated_at timestamps
**Trigger**: BEFORE UPDATE on multiple tables
**Logic**: Sets updated_at = now()

### `handle_new_user()`
**Purpose**: Creates profile for new auth users
**Trigger**: AFTER INSERT on auth.users
**Logic**: Inserts into public.users table

### `enforce_max_pins()`
**Purpose**: Limits pinned subcategories per user
**Trigger**: BEFORE INSERT on user_pinned_subcategories
**Logic**: Raises exception if user already has 3 pins

### `validate_metric_value_type()`
**Purpose**: Validates metric values match expected types
**Trigger**: BEFORE INSERT/UPDATE on workout_set_metric_values
**Logic**: Checks JSONB value matches metric definition type

## PostGIS Functions (Geographic Support)

### Core PostGIS Functions
- `st_distance()` - Calculate distance between geometries
- `st_area()` - Calculate area of polygons
- `st_length()` - Calculate length of linestrings
- `st_azimuth()` - Calculate bearing between points
- Various geometry input/output functions

## Security Functions

### RLS Helper Functions
- `is_admin(user_id)` - Admin status check
- `has_role(user_id, role)` - Role verification
- `can_mutate_workout_set(workout_exercise_id)` - Set mutation permission

### Rate Limiting
- `is_admin_with_rate_limit()` - Rate-limited admin checks
- `log_admin_action()` - Audit logging for admin actions

## Critical Function Dependencies for Workout Flow

### Start Workout Flow:
1. `start_workout()` → Creates workout record
2. `compute_readiness_for_user()` → Calculates readiness (USES MODIFIED VIEW)
3. `initialize_warmup_for_exercise()` → Sets up warmups
4. `log_workout_set()` → Records performance

### Readiness System (CRITICAL ISSUE AREA):
1. `v_latest_readiness` view → Extracts from JSONB (RECENTLY MODIFIED)
2. `get_latest_readiness()` → Uses the view
3. `compute_readiness_for_user()` → Depends on extraction working

## Recent Changes That May Cause Issues

### Database Migration: `20250904090213`
1. **Dropped and recreated `v_latest_readiness` view**
2. **Modified to extract from `pre_workout_checkins.answers` JSONB**
3. **Updated `compute_readiness_for_user` error handling**

**Potential Issues**:
- JSONB extraction may not work correctly
- View may return null values
- Function may not handle null gracefully
- RPC dependencies may be broken