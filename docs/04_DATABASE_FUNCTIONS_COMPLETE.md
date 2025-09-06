# Complete Database Functions Export

## Database Functions Overview
- **Database Type**: PostgreSQL with custom functions
- **Schema**: Public schema custom function definitions  
- **Total Functions**: 200+ custom functions (excluding PostGIS)
- **Export Date**: 2025-01-06

## Core Workout Functions

### start_workout(p_template_id uuid DEFAULT NULL)
**Purpose**: Creates a new workout session with optional template
**Returns**: UUID of created workout
**Security**: SECURITY DEFINER, requires authentication
```sql
-- Creates workout shell
-- If template provided: copies exercises with readiness adjustments
-- Calculates target weights using base load + readiness multiplier
-- Generates warmup steps for exercises with target weights
-- Returns workout ID for session continuation
```

### end_workout(p_workout_id uuid)
**Purpose**: Marks a workout as completed
**Returns**: UUID of ended workout
**Security**: SECURITY DEFINER, user must own workout
```sql
-- Sets ended_at timestamp
-- Validates user ownership
-- Returns workout ID on success
```

### log_workout_set(p_workout_exercise_id uuid, p_set_index integer, p_metrics jsonb, p_grip_ids uuid[])
**Purpose**: Logs a completed exercise set with metrics and grips
**Returns**: UUID of created workout set
**Security**: SECURITY DEFINER
```sql
-- Creates workout_sets record
-- Inserts metric values based on exercise metric definitions
-- Associates grip selections if provided
-- Triggers PR detection and materialized view updates
```

### get_next_set_index(p_workout_exercise_id uuid)
**Purpose**: Gets the next set index for an exercise
**Returns**: Integer set index
**Security**: SECURITY DEFINER
```sql
-- Finds max set_index for exercise
-- Returns incremented value for next set
```

## Exercise & Template Functions

### create_demo_template_for_current_user()
**Purpose**: Creates a demo workout template with common exercises
**Returns**: UUID of created template
**Security**: Requires authentication
```sql
-- Creates "Push Day" template
-- Adds bench press, overhead press, triceps pushdown
-- Uses system exercises with default parameters
-- Handles conflicts with existing template names
```

### generate_exercise_name(movement_id uuid, equipment_ref_id uuid, muscle_name text, attributes jsonb, handle_key text, grip_type_key text, locale text)
**Purpose**: Generates automatic exercise names based on components
**Returns**: Generated exercise name text
**Usage**: Called by exercise naming trigger
```sql
-- Combines movement, equipment, muscle, and modifier components
-- Creates human-readable exercise names
-- Supports internationalization via locale parameter
```

## Weight & Load Calculation Functions

### compute_total_weight(p_entry_mode text, p_value numeric, p_bar_weight numeric, p_is_symmetrical boolean)
**Purpose**: Calculates total weight from different entry modes
**Returns**: Total weight in kg
**Usage**: Used for load calculations across the system
```sql
-- 'total' mode: returns value as-is
-- 'one_side' mode: bar + (value * multiplier)
-- Handles symmetrical vs asymmetrical loading
```

### next_weight_step_kg(p_load_type load_type, p_side_min_plate_kg numeric, p_single_min_increment_kg numeric)
**Purpose**: Calculates minimum weight increment for equipment
**Returns**: Minimum increment in kg
**Usage**: Weight progression and loading calculations
```sql
-- dual_load: 2 * side_min_plate_kg
-- single_load/stack: single_min_increment_kg
-- Used for proper weight progression steps
```

### closest_machine_weight(desired numeric, stack numeric[], aux numeric[])
**Purpose**: Finds closest achievable weight on stack machine
**Returns**: Closest weight in kg
**Usage**: Stack machine weight selection
```sql
-- Checks all stack positions
-- Considers auxiliary plates
-- Returns weight closest to desired target
```

### epley_1rm(weight numeric, reps integer)
**Purpose**: Calculates estimated 1RM using Epley formula
**Returns**: Estimated 1RM weight
**Usage**: Strength analysis and programming
```sql
-- Formula: weight * (1 + reps/30)
-- Standard 1RM estimation method
-- Used for strength tracking and programming
```

## Readiness & Programming Functions

### compute_readiness_for_user(user_id uuid)
**Purpose**: Calculates user readiness score (0-100)
**Returns**: Readiness percentage
**Security**: SECURITY DEFINER
```sql
-- Analyzes recent checkin data
-- Factors sleep, stress, energy, motivation
-- Returns composite readiness score
```

### readiness_multiplier(readiness_score numeric)
**Purpose**: Converts readiness score to training load multiplier
**Returns**: Multiplier (typically 0.85-1.15)
**Usage**: Automatic load adjustments
```sql
-- Maps readiness score to training intensity
-- Higher readiness = higher multiplier
-- Used for auto-regulation of training loads
```

### pick_base_load(user_id uuid, exercise_id uuid)
**Purpose**: Selects base training load for exercise
**Returns**: Base weight in kg
**Security**: SECURITY DEFINER
```sql
-- Analyzes recent performance history
-- Considers successful sets from last 3 workouts
-- Returns conservative base for progression
```

## Warmup & Set Management Functions

### generate_warmup_steps(target_weight_kg numeric)
**Purpose**: Generates warmup progression for target weight
**Returns**: JSONB array of warmup steps
**Usage**: Automatic warmup generation
```sql
-- Creates 3-4 warmup steps
-- Progressive loading: 40%, 60%, 80% of target
-- Includes rep recommendations and rest periods
```

### recalc_warmup_from_last_set(workout_exercise_id uuid)
**Purpose**: Recalculates warmup based on completed sets
**Returns**: void
**Usage**: Dynamic warmup adjustment
```sql
-- Updates warmup suggestions mid-workout
-- Based on actual performance vs planned
-- Adjusts remaining warmup sets
```

### fn_suggest_warmup(p_exercise_id uuid, p_working_weight numeric, p_working_reps integer)
**Purpose**: Suggests warmup protocol for exercise
**Returns**: JSONB warmup plan
**Security**: STABLE function
```sql
-- Analyzes user's last performance for exercise
-- Generates progressive warmup sequence
-- Returns complete warmup protocol with timing
```

## Analysis & Suggestion Functions

### fn_detect_stagnation(p_exercise_id uuid, p_lookback_sessions integer)
**Purpose**: Detects training stagnation patterns
**Returns**: JSONB analysis report
**Security**: STABLE function
```sql
-- Analyzes recent performance trends
-- Detects plateaus and declining performance
-- Provides specific recommendations for progression
```

### fn_suggest_sets(p_exercise_id uuid, p_progression_type text, p_target_reps integer)
**Purpose**: Suggests set/rep/weight parameters
**Returns**: JSONB suggestion
**Security**: STABLE function
```sql
-- Analyzes training history and 1RM estimates
-- Supports multiple progression models
-- Returns specific workout recommendations
```

### fn_suggest_rest_seconds(p_workout_set_id uuid, p_effort_level text)
**Purpose**: Suggests rest period between sets
**Returns**: Rest seconds as integer
**Security**: STABLE function
```sql
-- Considers set type, effort level, and exercise type
-- Adjusts for supersets and circuit training
-- Returns optimized rest recommendations
```

## User Management Functions

### handle_new_user()
**Purpose**: Trigger function for new user setup
**Returns**: Trigger record
**Security**: SECURITY DEFINER
```sql
-- Creates users table record for new auth user
-- Sets up default user preferences
-- Called automatically on auth.users insert
```

### create_admin_user(target_user_id uuid, requester_role text)
**Purpose**: Creates admin user with proper authorization
**Returns**: Boolean success status
**Security**: SECURITY DEFINER
```sql
-- Validates requester permissions
-- Creates admin role assignment
-- Logs admin creation in audit trail
```

### is_pro_user(user_id uuid)
**Purpose**: Checks if user has pro subscription
**Returns**: Boolean pro status
**Security**: SECURITY DEFINER
```sql
-- Queries users table for pro status
-- Used for feature access control
-- Handles null cases gracefully
```

## Access Control Functions

### can_mutate_workout_set(workout_exercise_id uuid)
**Purpose**: Validates user permission to modify workout set
**Returns**: Boolean permission status
**Security**: SECURITY DEFINER
```sql
-- Checks workout ownership through exercise relationship
-- Used by RLS policies and application logic
-- Ensures data isolation between users
```

### has_role(user_id uuid, role_name app_role)
**Purpose**: Checks if user has specific role
**Returns**: Boolean role status
**Security**: Used in RLS policies
```sql
-- Queries user_roles table
-- Supports hierarchical role checking
-- Used throughout RLS policy definitions
```

### is_admin(user_id uuid)
**Purpose**: Checks if user has admin privileges
**Returns**: Boolean admin status
**Security**: Used in RLS policies
```sql
-- Checks for admin or superadmin roles
-- Used for administrative access control
-- Simplified admin check for common use
```

## Data Processing Functions

### slugify(txt text)
**Purpose**: Converts text to URL-safe slug format
**Returns**: Slugified text
**Usage**: Automatic slug generation
```sql
-- Converts to lowercase
-- Removes accents and special characters
-- Replaces non-alphanumeric with hyphens
-- Handles null and empty inputs
```

### short_hash_uuid(u uuid)
**Purpose**: Creates short hash from UUID
**Returns**: 6-character hash string
**Usage**: User-friendly ID display
```sql
-- SHA256 hash of UUID
-- Truncated to 6 characters
-- Used for workout codes and sharing
```

### set_updated_at()
**Purpose**: Trigger function to update timestamps
**Returns**: Modified record
**Usage**: Automatic timestamp management
```sql
-- Sets updated_at to current timestamp
-- Used across many tables for audit trail
-- Maintains data modification history
```

## Translation & Internationalization Functions

### get_text(p_key text, p_language_code text)
**Purpose**: Retrieves translated text for key
**Returns**: Translated text or fallback
**Security**: STABLE function
```sql
-- Looks up translation in specified language
-- Falls back to English if not found
-- Returns key if no translation exists
```

### get_life_categories_i18n(lang_code text)
**Purpose**: Gets life categories with translations
**Returns**: Table of translated categories
**Security**: STABLE function
```sql
-- Joins categories with translations
-- Falls back to English translations
-- Returns complete translated category list
```

## Performance Optimization Functions

### update_updated_at_column()
**Purpose**: Generic trigger function for timestamp updates
**Returns**: Modified NEW record
**Usage**: Attached to multiple tables
```sql
-- Sets NEW.updated_at = now()
-- Standard trigger for timestamp maintenance
-- Ensures consistent timestamp behavior
```

### assign_next_set_index()
**Purpose**: Trigger function for automatic set indexing
**Returns**: Modified NEW record
**Security**: SECURITY DEFINER
```sql
-- Auto-assigns set_index if null or 0
-- Finds max existing index and increments
-- Ensures proper set ordering
```

### populate_grip_key_from_workout_exercise()
**Purpose**: Trigger function for grip key population
**Returns**: Modified NEW record
**Usage**: Maintains grip references
```sql
-- Sets grip_key from workout_exercises.grip_id
-- Ensures data consistency
-- Handles grip slug resolution
```

## Validation & Constraint Functions

### validate_metric_value_type()
**Purpose**: Validates metric values match their definitions
**Returns**: Validated NEW record
**Security**: Trigger function
```sql
-- Checks value JSON structure against metric type
-- Validates enum values against allowed options
-- Ensures data type consistency
```

### enforce_max_pins()
**Purpose**: Enforces maximum pinned subcategories limit
**Returns**: NEW record or raises exception
**Security**: SECURITY DEFINER
```sql
-- Limits users to 3 pinned subcategories maximum
-- Prevents excessive pinning
-- Maintains UI performance constraints
```

## Integration Functions

### trigger_initialize_warmup()
**Purpose**: Initializes warmup data for new exercises
**Returns**: Modified NEW record
**Security**: SECURITY DEFINER
```sql
-- Generates warmup steps when target_weight_kg is set
-- Updates attribute_values_json with warmup data
-- Ensures workout exercises have proper warmup
```

### trg_after_set_logged()
**Purpose**: Post-processing after set completion
**Returns**: NEW record
**Security**: SECURITY DEFINER
```sql
-- Recalculates warmup recommendations
-- Triggers materialized view refreshes
-- Maintains data consistency after set logging
```

### trg_te_sync_weights()
**Purpose**: Synchronizes weight units in template exercises
**Returns**: Modified NEW record
**Usage**: Data consistency maintenance
```sql
-- Ensures weight_unit defaults to 'kg'
-- Maintains data normalization
-- Handles weight unit standardization
```

## System Maintenance Functions

### set_limit(real) / show_limit()
**Purpose**: PostgreSQL trigram search configuration
**Returns**: Search similarity threshold
**Usage**: Full-text search optimization
```sql
-- Configures pg_trgm similarity thresholds
-- Used for exercise name searching
-- Optimizes search performance
```

### similarity(text, text) / word_similarity(text, text)
**Purpose**: Text similarity scoring for search
**Returns**: Similarity score (0.0-1.0)
**Usage**: Exercise and equipment search
```sql
-- Calculates text similarity scores
-- Powers fuzzy search functionality
-- Enables typo-tolerant searching
```

## Function Usage Patterns

### Workout Flow Functions
1. `start_workout()` - Begin session
2. `log_workout_set()` - Record each set
3. `end_workout()` - Complete session

### Programming Functions
1. `fn_suggest_sets()` - Get exercise parameters
2. `generate_warmup_steps()` - Create warmup plan
3. `fn_suggest_rest_seconds()` - Optimize rest periods

### Analysis Functions
1. `compute_readiness_for_user()` - Assess readiness
2. `fn_detect_stagnation()` - Identify plateaus
3. `epley_1rm()` - Estimate strength levels

### Security Functions
1. `can_mutate_workout_set()` - Validate permissions
2. `has_role()` - Check user roles
3. `is_admin()` - Verify admin access

All functions include comprehensive error handling, input validation, and security controls appropriate to their usage context.