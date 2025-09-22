# Database Functions Documentation

## Core Utility Functions

### User and Authentication Functions

#### `handle_new_user()`
**Purpose**: Automatically creates user profile when new user signs up
**Trigger**: AFTER INSERT on auth.users
**Returns**: TRIGGER
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, is_pro)
  VALUES (NEW.id, false);
  RETURN NEW;
END;
$$;
```

#### `ensure_user_record()`
**Purpose**: Ensures user record exists, creates if missing
**Returns**: TRIGGER
**Usage**: Fallback for user creation

#### `create_user_if_not_exists()`
**Purpose**: Creates user record if it doesn't exist
**Returns**: void
**Security**: DEFINER

#### `is_pro_user(user_id uuid)`
**Purpose**: Checks if user has pro subscription
**Returns**: boolean
**Security**: DEFINER

### Text and Localization Functions

#### `get_text(p_key text, p_language_code text DEFAULT 'en')`
**Purpose**: Retrieves localized text with fallback to English
**Returns**: text
**Usage**: UI text localization

#### `slugify(txt text)`
**Purpose**: Converts text to URL-friendly slug
**Returns**: text
**Usage**: Generating slugs for exercises, equipment, etc.

## Workout Management Functions

### Workout Operations

#### `start_workout(p_template_id uuid DEFAULT NULL)`
**Purpose**: Creates new workout, optionally from template with readiness adjustments
**Returns**: uuid (workout_id)
**Security**: DEFINER
**Features**:
- Copies exercises from template
- Applies readiness-based weight adjustments
- Generates warmup suggestions
- Records readiness score

#### `end_workout(p_workout_id uuid)`
**Purpose**: Marks workout as completed
**Returns**: uuid
**Security**: Standard (user ownership check)

#### `log_workout_set(p_workout_exercise_id uuid, p_set_index integer, p_metrics jsonb, p_grip_ids uuid[])`
**Purpose**: Records a completed workout set with metrics
**Returns**: uuid (set_id)
**Security**: DEFINER
**Features**:
- Validates user ownership
- Records metric values
- Associates grip selections

### Set Management

#### `assign_next_set_index()`
**Purpose**: Auto-assigns sequential set numbers
**Trigger**: BEFORE INSERT on workout_sets
**Returns**: TRIGGER

#### `get_next_set_index(p_workout_exercise_id uuid)`
**Purpose**: Gets next available set index
**Returns**: integer
**Security**: DEFINER

### Template Functions

#### `create_demo_template_for_current_user()`
**Purpose**: Creates sample workout template
**Returns**: uuid (template_id)
**Usage**: Onboarding new users

## Weight and Equipment Calculations

### Weight Calculation Functions

#### `compute_total_weight(p_entry_mode text, p_value numeric, p_bar_weight numeric, p_is_symmetrical boolean)`
**Purpose**: Calculates total weight based on entry mode
**Returns**: numeric
**Usage**: Converting between per-side and total weight entry

#### `next_weight_step_kg(p_load_type load_type, p_side_min_plate_kg numeric, p_single_min_increment_kg numeric)`
**Purpose**: Calculates minimum weight increment
**Returns**: numeric
**Usage**: Progressive overload suggestions

#### `closest_machine_weight(desired numeric, stack numeric[], aux numeric[])`
**Purpose**: Finds closest achievable weight on cable machine
**Returns**: numeric
**Usage**: Weight selection for cable exercises

#### `bar_min_increment(_gym_id uuid)`
**Purpose**: Gets minimum weight increment for barbell exercises
**Returns**: numeric
**Security**: DEFINER

### Equipment Profile Functions

#### `equipment_profiles_enforce_fk()`
**Purpose**: Validates equipment profile references
**Trigger**: BEFORE INSERT/UPDATE on equipment_profiles
**Returns**: TRIGGER

## AI and Coaching Functions

### Readiness and Recovery

#### `compute_readiness_for_user(_user_id uuid)`
**Purpose**: Calculates user readiness score (0-100)
**Returns**: numeric
**Usage**: AI program adjustments

#### `readiness_multiplier(readiness_score numeric)`
**Purpose**: Converts readiness score to weight multiplier
**Returns**: numeric
**Usage**: Training load adjustments

### Program Generation Support

#### `pick_base_load(user_id uuid, exercise_id uuid)`
**Purpose**: Selects appropriate base weight for exercise
**Returns**: numeric
**Usage**: AI program weight selection

#### `generate_warmup_steps(target_weight_kg numeric)`
**Purpose**: Creates warmup progression
**Returns**: jsonb
**Usage**: Automatic warmup generation

### AI Suggestion Functions

#### `fn_suggest_warmup(p_exercise_id uuid, p_working_weight numeric, p_target_reps integer)`
**Purpose**: Suggests warmup protocol for exercise
**Returns**: jsonb
**Features**: Personalized warmup based on recent performance

#### `fn_suggest_rest_seconds(p_workout_set_id uuid, p_effort_level text)`
**Purpose**: Recommends rest period between sets
**Returns**: integer
**Usage**: Adaptive rest period suggestions

#### `fn_suggest_sets(p_exercise_id uuid, p_progression_type text, p_target_reps integer)`
**Purpose**: Suggests set/rep/weight scheme
**Returns**: jsonb
**Features**: Multiple progression strategies

#### `fn_detect_stagnation(p_exercise_id uuid, p_lookback_sessions integer)`
**Purpose**: Analyzes performance trends for plateaus
**Returns**: jsonb
**Features**: Provides recommendations for breaking plateaus

### Training Program Functions

#### `get_next_program_template(p_program_id uuid, p_user_id uuid)`
**Purpose**: Gets next workout in program rotation
**Returns**: TABLE(template_id uuid, order_position integer)
**Security**: DEFINER

#### `get_user_coach_params(_user_id uuid)`
**Purpose**: Gets coaching parameters based on experience level
**Returns**: TABLE with coaching parameters
**Security**: DEFINER

## Exercise and Movement Analysis

### Exercise Data Functions

#### `get_last_sets_for_exercises(p_exercise_ids uuid[])`
**Purpose**: Retrieves recent performance for multiple exercises
**Returns**: TABLE with performance metrics
**Security**: DEFINER

#### `epley_1rm(weight numeric, reps integer)`
**Purpose**: Estimates one-rep max using Epley formula
**Returns**: numeric
**Usage**: Strength assessments

## Social and Administrative Functions

### Social Functions

#### `are_friends(a uuid, b uuid)`
**Purpose**: Checks if two users are friends
**Returns**: boolean
**Usage**: Access control for social features

#### `are_friends_with_user(target_user_id uuid)`
**Purpose**: Checks if current user is friends with target
**Returns**: boolean
**Security**: DEFINER

#### `bump_like_counter()`
**Purpose**: Updates post like counts
**Trigger**: AFTER INSERT/DELETE on social_post_likes
**Returns**: TRIGGER

### Administrative Functions

#### `request_gym_role(p_gym uuid, p_role text, p_msg text)`
**Purpose**: Submits request for gym administrative role
**Returns**: uuid (request_id)
**Security**: DEFINER

#### `decide_gym_role_request(p_req uuid, p_action text)`
**Purpose**: Approves or rejects gym role requests
**Returns**: void
**Security**: DEFINER
**Authorization**: Gym admins and superadmins only

### Validation and Constraints

#### `enforce_max_pins()`
**Purpose**: Limits users to 3 pinned subcategories
**Trigger**: BEFORE INSERT on user_pinned_subcategories
**Returns**: TRIGGER

#### `validate_metric_value_type()`
**Purpose**: Validates workout metric data types
**Trigger**: BEFORE INSERT/UPDATE on workout_set_metric_values
**Returns**: TRIGGER

### Data Quality Functions

#### `make_grip_key(_grip_ids uuid[])`
**Purpose**: Creates stable key for grip combinations
**Returns**: text
**Usage**: Grip pattern tracking

#### `populate_grip_key_from_workout_exercise()`
**Purpose**: Auto-populates grip keys in workout sets
**Trigger**: BEFORE INSERT on workout_sets
**Returns**: TRIGGER

## Trigger Functions

### Automatic Timestamp Updates

#### `set_updated_at()`
**Purpose**: Updates updated_at column on row changes
**Trigger**: BEFORE UPDATE on multiple tables
**Returns**: TRIGGER

#### `update_updated_at_column()`
**Purpose**: Alternative timestamp update function
**Returns**: TRIGGER

### Warmup Management

#### `trigger_initialize_warmup()`
**Purpose**: Generates warmup when target weight is set
**Trigger**: BEFORE INSERT/UPDATE on workout_exercises
**Returns**: TRIGGER
**Security**: DEFINER

#### `trg_after_set_logged()`
**Purpose**: Recalculates warmup after set completion
**Trigger**: AFTER INSERT/UPDATE on workout_sets
**Returns**: TRIGGER
**Security**: DEFINER

#### `recalc_warmup_from_last_set(workout_exercise_id uuid)`
**Purpose**: Updates warmup based on completed sets
**Usage**: Called by triggers after set logging

### Template Exercise Sync

#### `trg_te_sync_weights()`
**Purpose**: Ensures weight unit consistency in templates
**Trigger**: BEFORE INSERT/UPDATE on template_exercises
**Returns**: TRIGGER

## Security and Permission Functions

### Authorization Helpers

#### `can_mutate_workout_set(_we_id uuid)`
**Purpose**: Checks if user can modify workout set
**Returns**: boolean
**Security**: DEFINER
**Usage**: RLS policy helper

#### `is_gym_admin(gym_id uuid)`
**Purpose**: Checks if user is gym administrator
**Returns**: boolean
**Usage**: Administrative access control

#### `is_admin(user_id uuid)`
**Purpose**: Checks if user has admin privileges
**Returns**: boolean
**Usage**: System administration access

#### `is_superadmin_simple()`
**Purpose**: Checks if current user is superadmin
**Returns**: boolean
**Usage**: Highest level access control

#### `has_role(user_id uuid, role_name app_role)`
**Purpose**: Checks if user has specific role
**Returns**: boolean
**Usage**: Role-based access control

## Internationalization Functions

### Translation Helpers

#### `get_life_categories_i18n(lang_code text)`
**Purpose**: Gets localized life category data
**Returns**: TABLE with translated names/descriptions
**Usage**: Multi-language category display

### Geographic Functions

#### PostGIS Functions
Multiple spatial functions available for location-based features:
- Distance calculations
- Geographic queries
- Spatial indexing support

## Hash and Utility Functions

#### `short_hash_uuid(u uuid)`
**Purpose**: Creates short hash from UUID
**Returns**: text (6 characters)
**Usage**: User-friendly ID generation

## Text Search Functions

#### PostgreSQL Full Text Search
- `similarity()` - Text similarity scoring
- `word_similarity()` - Word-based similarity
- Trigram matching for fuzzy search
- Search ranking and highlighting

These functions support the exercise search and discovery features throughout the application.