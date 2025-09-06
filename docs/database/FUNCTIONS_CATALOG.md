# Database Functions Catalog

*Generated on: 2025-01-03*

## Overview
- **Total Functions**: 824
- **User-Defined Functions**: ~50+ (excluding PostGIS and system functions)
- **Languages**: PL/pgSQL, SQL, C

## Function Categories

### Authentication & Security Functions

#### Core Auth Functions
```sql
-- User role management
has_role(_user_id uuid, _role app_role) → boolean
is_admin(_user_id uuid) → boolean
is_admin_with_rate_limit(_user_id uuid) → boolean

-- Admin management
create_admin_user(target_user_id uuid, requester_role text) → boolean
log_admin_action(action_type text, target_user_id uuid, details jsonb) → void

-- User creation
handle_new_user() → trigger
```

### Workout & Exercise Functions

#### Exercise Management
```sql
-- Exercise naming and generation
generate_exercise_name(movement_id uuid, equipment_id uuid, ...) → text
exercises_autoname_tg() → trigger
slugify(txt text) → text

-- Exercise data
get_user_last_set_for_exercise(p_exercise_id uuid) → table
get_user_pr_for_exercise(p_exercise_id uuid) → table
```

#### Workout Processing
```sql
-- Workout management
end_workout(p_workout_id uuid) → uuid
can_mutate_workout_set(_we_id uuid) → boolean

-- Set logging
log_workout_set(p_workout_exercise_id uuid, p_set_index integer, ...) → uuid
assign_next_set_index() → trigger
get_next_set_index(p_workout_exercise_id uuid) → integer

-- Warmup management
initialize_warmup_for_exercise(p_workout_exercise_id uuid) → void
recalc_warmup_from_last_set(p_workout_exercise_id uuid) → void
```

### Fitness Analysis Functions

#### Performance Analysis
```sql
-- 1RM calculations
epley_1rm(weight numeric, reps integer) → numeric

-- Readiness and suggestions
fn_suggest_sets(p_exercise_id uuid, p_progression_type text, ...) → jsonb
fn_suggest_warmup(p_exercise_id uuid, p_working_weight numeric, ...) → jsonb
fn_suggest_rest_seconds(p_workout_set_id uuid, p_effort_level text) → integer

-- Stagnation detection
fn_detect_stagnation(p_exercise_id uuid, p_lookback_sessions integer) → jsonb
```

#### Weight Calculations
```sql
-- Weight computation
compute_total_weight(p_entry_mode text, p_value numeric, ...) → numeric
next_weight_step_kg(p_load_type load_type, ...) → numeric
closest_machine_weight(desired numeric, stack numeric[], aux numeric[]) → numeric
bar_min_increment(_gym_id uuid) → numeric
```

### Gym & Equipment Functions

#### Gym Management
```sql
-- Gym operations
get_user_coach_params(_user_id uuid) → table(experience_slug text, ...)

-- Demo data
create_demo_template_for_current_user() → uuid
```

### Utility Functions

#### Text & Translation
```sql
-- Text processing
get_text(p_key text, p_language_code text) → text
get_life_categories_i18n(lang_code text) → table

-- String utilities
slugify(txt text) → text
short_hash_uuid(u uuid) → text
make_grip_key(_grip_ids uuid[]) → text
```

#### Database Maintenance
```sql
-- Triggers and maintenance
update_updated_at_column() → trigger
trg_after_set_logged() → trigger
trg_te_sync_weights() → trigger
populate_grip_key_from_workout_exercise() → trigger

-- Validation
validate_metric_value_type() → trigger
enforce_max_pins() → trigger
```

### PostGIS Spatial Functions (Advanced)

#### Geometric Operations
```sql
-- Spatial calculations
st_distance(geom1 geometry, geom2 geometry) → double precision
st_area(geometry) → double precision
st_length(geometry) → double precision
st_azimuth(geom1 geometry, geom2 geometry) → double precision

-- Spatial transformations
st_force2d(geometry) → geometry
st_force3d(geometry, zvalue double precision) → geometry
st_transform(geometry, srid integer) → geometry
```

#### Spatial Analysis
```sql
-- Point operations
st_x(geometry) → double precision
st_y(geometry) → double precision
st_z(geometry) → double precision
st_pointinsidecircle(geometry, x double precision, y double precision, radius double precision) → boolean

-- Validation and properties
st_isvalid(geometry) → boolean
st_npoints(geometry) → integer
st_ispolygonccw(geometry) → boolean
```

### Text Search Functions

#### Full-Text Search
```sql
-- Trigram similarity
similarity(text, text) → real
word_similarity(text, text) → real
show_trgm(text) → text[]

-- Search configuration
set_limit(real) → real
show_limit() → real
```

## Function Usage Patterns

### Common Triggers
1. **Auto-timestamping**: `update_updated_at_column()`
2. **Exercise naming**: `exercises_autoname_tg()`
3. **Set processing**: `trg_after_set_logged()`
4. **User creation**: `handle_new_user()`

### Security Functions
1. **Role checking**: `has_role()`, `is_admin()`
2. **Rate limiting**: `is_admin_with_rate_limit()`
3. **Audit logging**: `log_admin_action()`

### Fitness Calculations
1. **Performance metrics**: `epley_1rm()`, `fn_detect_stagnation()`
2. **Workout suggestions**: `fn_suggest_sets()`, `fn_suggest_warmup()`
3. **Weight calculations**: `compute_total_weight()`, `closest_machine_weight()`

### Data Processing
1. **Text utilities**: `slugify()`, `get_text()`
2. **Validation**: `validate_metric_value_type()`
3. **Maintenance**: Various trigger functions

## Performance Considerations

### Function Types by Volatility
- **IMMUTABLE**: Mathematical functions, text processing
- **STABLE**: Data lookups, translations
- **VOLATILE**: Functions with side effects, random data

### Security Classifications
- **SECURITY DEFINER**: Admin functions, role checks
- **SECURITY INVOKER**: Most user functions

### Language Performance
- **SQL**: Fastest for simple operations
- **PL/pgSQL**: Complex logic and control flow
- **C**: System functions and PostGIS operations

## Best Practices

### Function Design
1. Use appropriate volatility settings
2. Set security context correctly
3. Include proper error handling
4. Document function purposes

### Performance Optimization
1. Use indexes for function parameters
2. Consider function caching for stable functions
3. Avoid recursive function calls
4. Use appropriate data types

*This catalog represents the current state of database functions and their usage patterns.*