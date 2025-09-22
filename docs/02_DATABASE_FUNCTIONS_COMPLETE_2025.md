# Complete Database Functions Documentation 2025

**Generated**: January 10, 2025  
**Database**: PostgreSQL (Supabase)  
**Schema**: public  

## Overview

This document catalogs all custom PostgreSQL functions in the fitness platform database. The functions are organized by functional area and provide comprehensive backend logic for the application.

## Core Workout Functions

### `start_workout(p_template_id uuid DEFAULT NULL)`
**Returns**: `uuid` (workout_id)  
**Security**: DEFINER  
**Purpose**: Initiates a new workout session with optional template copying

```sql
-- Handles:
-- - Workout creation with readiness assessment
-- - Template exercise copying
-- - Weight calculations with readiness multipliers
-- - Warmup generation
-- - Historical performance integration
```

### `end_workout(p_workout_id uuid)`
**Returns**: `uuid`  
**Security**: DEFINER  
**Purpose**: Completes a workout session

### `log_workout_set(p_workout_exercise_id uuid, p_set_index integer, p_metrics jsonb, p_grip_ids uuid[])`
**Returns**: `uuid` (set_id)  
**Security**: DEFINER  
**Purpose**: Records a completed exercise set with metrics and grips

### `get_next_set_index(p_workout_exercise_id uuid)`
**Returns**: `integer`  
**Security**: DEFINER  
**Purpose**: Calculates the next sequential set index

## Readiness & Health Functions

### `upsert_readiness_today(p_energy integer, p_sleep_quality integer, p_sleep_hours numeric, p_soreness integer, p_stress integer, p_mood integer, p_energizers boolean, p_illness boolean, p_alcohol boolean, p_workout_id uuid DEFAULT NULL)`
**Returns**: `numeric` (readiness score 0-100)  
**Security**: DEFINER  
**Purpose**: Records daily or workout-specific readiness with intelligent scoring

### `compute_readiness_for_user(p_user_id uuid)`
**Returns**: `numeric`  
**Security**: DEFINER  
**Purpose**: Calculates current readiness score for a user

### `readiness_multiplier(readiness_score numeric)`
**Returns**: `numeric`  
**Purpose**: Converts readiness score to training load multiplier (0.90-1.08)

## Exercise & Performance Functions

### `pick_base_load(p_user_id uuid, p_exercise_id uuid)`
**Returns**: `numeric`  
**Purpose**: Selects appropriate base weight from recent performance history

### `epley_1rm(weight numeric, reps integer)`
**Returns**: `numeric`  
**Immutable**: Yes  
**Purpose**: Calculates estimated 1RM using Epley formula

### `generate_warmup_steps(target_weight_kg numeric)`
**Returns**: `jsonb`  
**Purpose**: Creates progressive warmup protocol

### `recalc_warmup_from_last_set(workout_exercise_id uuid)`
**Returns**: `void`  
**Purpose**: Adjusts warmup recommendations based on completed sets

### `fn_suggest_warmup(p_exercise_id uuid, p_working_weight numeric, p_working_reps integer)`
**Returns**: `jsonb`  
**Security**: STABLE  
**Purpose**: Provides detailed warmup suggestions

### `fn_suggest_sets(p_exercise_id uuid, p_progression_type text, p_target_reps integer)`
**Returns**: `jsonb`  
**Security**: STABLE  
**Purpose**: Recommends sets, reps, and weight based on progression model

### `fn_suggest_rest_seconds(p_workout_set_id uuid, p_effort_level text)`
**Returns**: `integer`  
**Security**: STABLE  
**Purpose**: Calculates optimal rest periods between sets

### `fn_detect_stagnation(p_exercise_id uuid, p_lookback_sessions integer)`
**Returns**: `jsonb`  
**Security**: STABLE  
**Purpose**: Analyzes training patterns to identify plateaus

## Weight & Equipment Calculations

### `compute_total_weight(p_entry_mode text, p_value numeric, p_bar_weight numeric, p_is_symmetrical boolean)`
**Returns**: `numeric`  
**Immutable**: Yes  
**Purpose**: Calculates total weight for different loading configurations

### `next_weight_step_kg(p_load_type load_type, p_side_min_plate_kg numeric, p_single_min_increment_kg numeric)`
**Returns**: `numeric`  
**Immutable**: Yes  
**Purpose**: Determines minimum weight increment for equipment type

### `closest_machine_weight(desired numeric, stack numeric[], aux numeric[])`
**Returns**: `numeric`  
**Immutable**: Yes  
**Purpose**: Finds closest achievable weight on machine with given stacks

### `bar_min_increment(_gym_id uuid)`
**Returns**: `numeric`  
**Security**: DEFINER  
**Purpose**: Calculates minimum barbell increment based on available plates

## User Management & Authentication

### `handle_new_user()`
**Returns**: `trigger`  
**Security**: DEFINER  
**Purpose**: Automatically creates user profile on auth registration

### `ensure_user_record()`
**Returns**: `trigger`  
**Security**: DEFINER  
**Purpose**: Ensures user record exists in public schema

### `create_user_if_not_exists()`
**Returns**: `void`  
**Security**: DEFINER  
**Purpose**: Creates user record if missing

### `has_role(_user_id uuid, _role app_role)`
**Returns**: `boolean`  
**Security**: DEFINER, STABLE  
**Purpose**: Checks if user has specific role (prevents RLS recursion)

### `is_admin(user_id uuid)`
**Returns**: `boolean`  
**Security**: DEFINER  
**Purpose**: Checks admin privileges

### `is_gym_admin(_gym_id uuid)`
**Returns**: `boolean`  
**Security**: DEFINER  
**Purpose**: Checks gym-specific admin privileges

### `is_pro_user(user_id uuid)`
**Returns**: `boolean`  
**Security**: DEFINER, STABLE  
**Purpose**: Checks Pro subscription status

## Template & Programming Functions

### `create_demo_template_for_current_user()`
**Returns**: `uuid`  
**Purpose**: Creates sample workout template for new users

### `get_last_sets_for_exercises(p_exercise_ids uuid[])`
**Returns**: `TABLE`  
**Security**: DEFINER, STABLE  
**Purpose**: Retrieves recent performance data for multiple exercises

### `get_user_last_set_for_exercise(p_exercise_id uuid)`
**Returns**: `TABLE`  
**Security**: STABLE  
**Purpose**: Gets most recent set data for specific exercise

### `get_user_pr_for_exercise(p_exercise_id uuid)`
**Returns**: `TABLE`  
**Security**: STABLE  
**Purpose**: Retrieves personal record for exercise

### `get_user_coach_params(_user_id uuid)`
**Returns**: `TABLE`  
**Security**: DEFINER, STABLE  
**Purpose**: Gets coaching parameters based on user experience level

## Gym Management Functions

### `request_gym_role(p_gym uuid, p_role text, p_msg text)`
**Returns**: `uuid`  
**Security**: DEFINER  
**Purpose**: Submits request for gym role assignment

### `decide_gym_role_request(p_req uuid, p_action text)`
**Returns**: `void`  
**Security**: DEFINER  
**Purpose**: Approves or rejects gym role requests

## Social & Community Functions

### `are_friends(a uuid, b uuid)`
**Returns**: `boolean`  
**Security**: STABLE  
**Purpose**: Checks friendship status between users

### `are_friends_with_user(target_user_id uuid)`
**Returns**: `boolean`  
**Security**: DEFINER, STABLE  
**Purpose**: Checks if current user is friends with target user

### `bump_like_counter()`
**Returns**: `trigger`  
**Purpose**: Automatically updates like counts on social posts

## Text & Localization Functions

### `get_text(p_key text, p_language_code text)`
**Returns**: `text`  
**Security**: STABLE  
**Purpose**: Retrieves localized text with fallback to English

### `get_life_categories_i18n(lang_code text)`
**Returns**: `TABLE`  
**Security**: STABLE  
**Purpose**: Gets life categories with translations

### `slugify(txt text)`
**Returns**: `text`  
**Immutable**: Yes  
**Purpose**: Converts text to URL-friendly slug

### `short_hash_uuid(u uuid)`
**Returns**: `text`  
**Immutable**: Yes  
**Purpose**: Generates short hash from UUID for sharing

## Validation & Trigger Functions

### `validate_metric_value_type()`
**Returns**: `trigger`  
**Purpose**: Ensures metric values match their defined types

### `enforce_max_pins()`
**Returns**: `trigger`  
**Security**: DEFINER  
**Purpose**: Limits users to maximum 3 pinned subcategories

### `update_updated_at_column()`
**Returns**: `trigger`  
**Purpose**: Automatically updates timestamp fields

### `set_updated_at()`
**Returns**: `trigger`  
**Purpose**: Sets updated_at to current timestamp

### `assign_next_set_index()`
**Returns**: `trigger`  
**Security**: DEFINER  
**Purpose**: Auto-assigns sequential set indexes

### `populate_grip_key_from_workout_exercise()`
**Returns**: `trigger`  
**Purpose**: Populates grip keys based on workout exercise grips

### `trigger_initialize_warmup()`
**Returns**: `trigger`  
**Security**: DEFINER  
**Purpose**: Initializes warmup data for new workout exercises

### `trg_after_set_logged()`
**Returns**: `trigger`  
**Security**: DEFINER  
**Purpose**: Post-processing after set completion

### `trg_te_sync_weights()`
**Returns**: `trigger`  
**Purpose**: Synchronizes weight units in template exercises

## Security & Access Control

### `can_mutate_workout_set(_we_id uuid)`
**Returns**: `boolean`  
**Security**: DEFINER  
**Purpose**: Validates permission to modify workout sets

## Utility Functions

### `make_grip_key(_grip_ids uuid[])`
**Returns**: `text`  
**Immutable**: Yes  
**Purpose**: Creates stable grip combination identifier

## PostGIS Spatial Functions

The database includes comprehensive PostGIS spatial functions for geographic data handling, including distance calculations, geometry operations, and spatial indexing.

## Text Search Functions

Full-text search capabilities provided by pg_trgm extension:
- `similarity(text, text)` - Text similarity scoring
- `word_similarity(text, text)` - Word-level similarity
- `show_trgm(text)` - Trigram analysis
- `set_limit(real)` - Configure similarity thresholds

## Function Usage Patterns

### Workout Flow
1. `start_workout()` → `log_workout_set()` → `end_workout()`
2. Automatic warmup initialization and adjustment
3. Real-time performance tracking and PR detection

### Programming & Coaching
1. Historical analysis with stagnation detection
2. Intelligent weight and rep suggestions
3. Readiness-adjusted programming

### Security & Validation
1. RLS policy support functions
2. Data integrity triggers
3. Permission validation

All functions include comprehensive error handling, input validation, and security controls appropriate for a production fitness platform.