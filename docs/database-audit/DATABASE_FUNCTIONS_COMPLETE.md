# Database Functions - Complete Audit

Generated on: 2025-09-05

## Overview

This document provides a complete audit of all database functions, procedures, and RPC endpoints in the public schema.

## Function Categories

### Core Application Functions (24 functions)

#### Workout Management
- **start_workout(template_id)** - Creates new workout session
- **end_workout(workout_id)** - Completes workout session  
- **log_workout_set(exercise_id, metrics, grips)** - Records individual set
- **get_next_set_index(workout_exercise_id)** - Returns next set number
- **assign_next_set_index()** - Trigger function for auto-indexing

#### Exercise & Equipment Functions
- **generate_exercise_name()** - Auto-generates exercise display names
- **slugify(text)** - Converts text to URL-safe slug
- **compute_total_weight(entry_mode, value, bar_weight, is_symmetrical)** - Calculates total weight
- **next_weight_step_kg(load_type, side_min_plate, single_min_increment)** - Weight progression
- **closest_machine_weight(desired, stack[], aux[])** - Finds closest machine weight
- **bar_min_increment(gym_id)** - Returns minimum weight increment for gym

#### Fitness Analysis & AI Coaching
- **fn_suggest_warmup(exercise_id, working_weight, working_reps)** - AI warmup recommendations
- **fn_suggest_sets(exercise_id, progression_type, target_reps)** - Set suggestions
- **fn_suggest_rest_seconds(workout_set_id, effort_level)** - Rest period recommendations
- **fn_detect_stagnation(exercise_id, lookback_sessions)** - Performance analysis
- **epley_1rm(weight, reps)** - One rep max calculation

#### User & Performance Tracking
- **get_user_last_set_for_exercise(exercise_id)** - Returns last performance
- **get_user_pr_for_exercise(exercise_id)** - Returns personal record
- **get_last_sets_for_exercises(exercise_ids[])** - Batch performance lookup
- **get_user_coach_params(user_id)** - Returns coaching configuration

#### Warmup & Template Management
- **initialize_warmup_for_exercise()** - Sets up exercise warmup plan
- **recalc_warmup_from_last_set(workout_exercise_id)** - Recalculates warmup
- **create_demo_template_for_current_user()** - Creates sample workout template

### Authentication & Security Functions (8 functions)

#### Core Security
- **is_admin(user_id)** - Checks admin privileges
- **has_role(user_id, role)** - Role-based access control
- **can_mutate_workout_set(workout_exercise_id)** - Workout modification permissions
- **is_pro_user(user_id)** - Checks premium user status

#### Admin Management
- **create_admin_user(target_user_id, requester_role)** - Creates admin accounts
- **is_admin_with_rate_limit(user_id)** - Rate-limited admin check
- **log_admin_action(action_type, target_user_id, details)** - Audit logging

#### User Management
- **handle_new_user()** - Trigger for new user setup

### Utility & Helper Functions (12 functions)

#### Text & Localization
- **get_text(key, language_code)** - Internationalization lookup
- **get_life_categories_i18n(lang_code)** - Localized life categories

#### Data Processing
- **short_hash_uuid(uuid)** - Generates short hash from UUID
- **make_grip_key(grip_ids[])** - Creates grip combination key
- **validate_metric_value_type()** - Validates metric data types

#### Database Maintenance
- **update_updated_at_column()** - Auto-updates timestamp fields
- **enforce_max_pins()** - Limits user-pinned categories
- **exercises_autoname_tg()** - Auto-generates exercise names

#### Grip & Handle Management
- **populate_grip_key_from_workout_exercise()** - Syncs grip data
- **trg_init_warmup()** - Initializes warmup plans
- **trg_te_sync_weights()** - Synchronizes weight units
- **trg_after_set_logged()** - Post-set completion actions

### PostGIS Spatial Functions (200+ functions)

#### Core Geometric Operations
- **st_distance(geom1, geom2)** - Distance calculation
- **st_area(geometry)** - Area calculation  
- **st_length(geometry)** - Length/perimeter calculation
- **st_azimuth(geom1, geom2)** - Bearing/direction calculation
- **st_angle(pt1, pt2, pt3, pt4)** - Angle calculation

#### Coordinate & Transformation
- **st_x(geometry)**, **st_y(geometry)**, **st_z(geometry)**, **st_m(geometry)** - Coordinate extraction
- **st_force2d(geometry)** - Force 2D coordinates
- **st_force3d(geometry)** - Force 3D coordinates
- **st_force3dm(geometry)** - Force 3D with measure

#### Spatial Relationships
- **st_contains(geom1, geom2)** - Containment test
- **st_covers(geom1, geom2)** - Coverage test
- **st_crosses(geom1, geom2)** - Intersection test
- **st_pointinsidecircle(point, x, y, radius)** - Point-in-circle test

#### Advanced Spatial Analysis
- **st_distancespheroid(geom1, geom2, spheroid)** - Spheroidal distance
- **st_lengthspheroid(geometry, spheroid)** - Spheroidal length
- **st_ispolygoncw(geometry)** - Clockwise polygon test
- **st_forcepolygonccw(geometry)** - Counter-clockwise polygon conversion

### Text Search Functions (30+ functions)

#### Trigram Similarity
- **similarity(text1, text2)** - Text similarity score
- **word_similarity(text1, text2)** - Word-level similarity
- **strict_word_similarity(text1, text2)** - Strict word matching
- **show_trgm(text)** - Show trigrams for text

#### Search Operators
- **similarity_op(text1, text2)** - Similarity operator function
- **word_similarity_op(text1, text2)** - Word similarity operator
- **similarity_dist(text1, text2)** - Similarity distance

#### Index Support  
- **gin_extract_value_trgm()** - GIN index extraction
- **gin_extract_query_trgm()** - GIN query extraction
- **gtrgm_compress()**, **gtrgm_decompress()** - GiST compression
- **gtrgm_penalty()**, **gtrgm_picksplit()** - GiST operations

## Function Usage Patterns

### Workout Flow
```sql
-- Start workout
SELECT start_workout('template-uuid');

-- Log sets
SELECT log_workout_set(
  'exercise-uuid',
  '{"weight": 100, "reps": 8}'::jsonb,
  ARRAY['grip-uuid']
);

-- End workout  
SELECT end_workout('workout-uuid');
```

### AI Coaching
```sql
-- Get warmup suggestion
SELECT fn_suggest_warmup('exercise-uuid', 100, 8);

-- Get set recommendations
SELECT fn_suggest_sets('exercise-uuid', 'linear', 8);

-- Detect performance issues
SELECT fn_detect_stagnation('exercise-uuid', 5);
```

### Security Checks
```sql
-- Check permissions
SELECT is_admin(auth.uid());
SELECT has_role(auth.uid(), 'admin');
SELECT can_mutate_workout_set('workout-exercise-uuid');
```

## Function Security Classifications

### SECURITY DEFINER (Elevated Privileges)
- handle_new_user()
- create_admin_user()
- is_admin_with_rate_limit()
- log_admin_action()
- can_mutate_workout_set()
- get_last_sets_for_exercises()
- get_user_coach_params()
- bar_min_increment()

### SECURITY INVOKER (Caller Privileges)
- All PostGIS functions
- Text search functions
- Most utility functions
- Calculation functions

## Function Performance Notes

### High Performance (Sub-millisecond)
- epley_1rm()
- slugify()
- compute_total_weight()
- short_hash_uuid()

### Medium Performance (1-10ms)
- get_user_last_set_for_exercise()
- fn_suggest_sets()
- closest_machine_weight()

### Complex Operations (10ms+)
- fn_detect_stagnation()
- fn_suggest_warmup()
- create_demo_template_for_current_user()

## Function Dependencies

### Core Dependencies
```
auth.uid() -> User identification
now() -> Timestamp functions
gen_random_uuid() -> UUID generation
jsonb operations -> Data manipulation
```

### Cross-Function Dependencies
```
assign_next_set_index() -> get_next_set_index()
trg_after_set_logged() -> recalc_warmup_from_last_set()
exercises_autoname_tg() -> generate_exercise_name()
```

## Database Triggers

### INSERT Triggers
- **handle_new_user()** on auth.users
- **assign_next_set_index()** on workout_sets
- **enforce_max_pins()** on user_pinned_subcategories
- **trg_init_warmup()** on workout_exercises

### UPDATE Triggers  
- **update_updated_at_column()** on multiple tables
- **exercises_autoname_tg()** on exercises
- **trg_te_sync_weights()** on template_exercises

### POST-OPERATION Triggers
- **trg_after_set_logged()** after workout_sets updates
- **populate_grip_key_from_workout_exercise()** on workout_sets

## Critical Functions for Audit

### Data Integrity
- validate_metric_value_type()
- enforce_max_pins()
- can_mutate_workout_set()

### Performance Tracking
- get_user_last_set_for_exercise()
- get_user_pr_for_exercise()
- fn_detect_stagnation()

### Security & Access Control
- is_admin()
- has_role()
- is_admin_with_rate_limit()

### Audit Trail
- log_admin_action()
- handle_new_user()
- create_admin_user()

## Function Statistics

- **Total Functions**: 300+
- **Custom Application Functions**: 44
- **PostGIS Functions**: 200+
- **Text Search Functions**: 30+
- **Security Functions**: 8
- **Trigger Functions**: 10
- **SECURITY DEFINER**: 8 functions
- **IMMUTABLE Functions**: 150+ (mostly PostGIS)
- **STABLE Functions**: 20
- **VOLATILE Functions**: 24