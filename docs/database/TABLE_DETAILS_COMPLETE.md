# Complete Table Schema Details

*Generated on: 2025-01-03*

## Table Schema Definitions

### System & Administrative Tables

#### achievements
```sql
CREATE TABLE achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  category text NOT NULL,
  points integer NOT NULL DEFAULT 0,
  criteria jsonb NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
```
**Purpose**: System achievements and gamification
**Records**: 7 active achievements

#### admin_audit_log
```sql
CREATE TABLE admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL,
  target_user_id uuid,
  performed_by uuid,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
```
**Purpose**: Administrative action tracking and security auditing
**Records**: 16,830 audit entries

#### admin_check_rate_limit
```sql
CREATE TABLE admin_check_rate_limit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  check_count integer DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
```
**Purpose**: Rate limiting for admin privilege checks
**Records**: 0 (empty - no rate limiting triggered)

### User Management

#### profiles
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  display_name text,
  bio text,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
```
**Purpose**: Extended user profile information
**Records**: 1 user profile

#### user_roles
```sql
CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
```
**Purpose**: Role-based access control
**Records**: 0 (no special roles assigned)

### Exercise System

#### exercises
```sql
CREATE TABLE exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  display_name text,
  custom_display_name text,
  name_locale text DEFAULT 'en',
  name_version integer DEFAULT 1,
  display_name_tsv tsvector,
  
  -- Core relationships
  primary_muscle_id uuid,
  equipment_id uuid NOT NULL,
  movement_id uuid,
  equipment_ref_id uuid,
  movement_pattern_id uuid,
  body_part_id uuid,
  
  -- Exercise properties
  exercise_skill_level exercise_skill_level DEFAULT 'medium',
  complexity_score smallint DEFAULT 3,
  popularity_rank integer,
  is_unilateral boolean DEFAULT false,
  allows_grips boolean DEFAULT true,
  
  -- Loading configuration
  load_type load_type,
  is_bar_loaded boolean NOT NULL DEFAULT false,
  default_bar_weight numeric,
  default_bar_type_id uuid,
  
  -- Data and configuration
  attribute_values_json jsonb NOT NULL DEFAULT '{}',
  capability_schema jsonb DEFAULT '{}',
  contraindications jsonb DEFAULT '[]',
  default_grip_ids uuid[] DEFAULT '{}',
  secondary_muscle_group_ids uuid[],
  tags text[] DEFAULT '{}',
  
  -- Media
  image_url text,
  thumbnail_url text,
  source_url text,
  
  -- Ownership and visibility
  owner_user_id uuid,
  is_public boolean NOT NULL DEFAULT true,
  configured boolean NOT NULL DEFAULT false,
  loading_hint text,
  
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
```
**Purpose**: Exercise definitions and metadata
**Records**: 8 exercises configured

#### equipment
```sql
CREATE TABLE equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  kind text,
  equipment_type text NOT NULL DEFAULT 'machine',
  
  -- Weight properties
  weight_kg numeric,
  load_type load_type DEFAULT 'none',
  load_medium load_medium DEFAULT 'other',
  
  -- Loading defaults
  default_bar_weight_kg numeric,
  default_side_min_plate_kg numeric,
  default_single_min_increment_kg numeric,
  default_stack jsonb DEFAULT '[]',
  
  notes text,
  configured boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
```
**Purpose**: Gym equipment catalog and specifications
**Records**: 48 equipment items

#### muscle_groups
```sql
CREATE TABLE muscle_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  parent_id uuid,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
```
**Purpose**: Hierarchical muscle group organization
**Records**: 14 muscle groups

### Workout System

#### workouts
```sql
CREATE TABLE workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text,
  template_id uuid,
  started_at timestamp with time zone,
  ended_at timestamp with time zone,
  completed_at timestamp with time zone,
  notes text,
  is_template boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
```
**Purpose**: Individual workout sessions
**Records**: 0 (no workouts logged yet)

#### workout_exercises
```sql
CREATE TABLE workout_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid NOT NULL,
  exercise_id uuid NOT NULL,
  order_index integer NOT NULL,
  
  -- Target parameters
  target_sets integer,
  target_reps integer,
  target_weight numeric,
  target_weight_kg numeric,
  weight_unit weight_unit DEFAULT 'kg',
  
  -- Grip configuration
  grip_id uuid,
  grip_ids uuid[],
  
  -- Equipment specifics
  equipment_id uuid,
  machine_settings jsonb,
  
  -- Notes and status
  notes text,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamp with time zone,
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
```
**Purpose**: Exercises within workout sessions
**Records**: 0 (no workout exercises logged)

#### workout_sets
```sql
CREATE TABLE workout_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_exercise_id uuid NOT NULL,
  set_index integer NOT NULL,
  set_kind set_type DEFAULT 'normal',
  
  -- Performance metrics
  weight numeric,
  reps integer,
  duration_seconds integer,
  distance_meters numeric,
  rpe integer,
  
  -- Completion tracking
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamp with time zone,
  rest_seconds integer,
  
  -- Grip and equipment
  grip_key text,
  equipment_config jsonb,
  
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
```
**Purpose**: Individual sets within exercises
**Records**: 0 (no sets logged)

### Health & Wellness

#### pre_workout_checkins
```sql
CREATE TABLE pre_workout_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  workout_id uuid,
  
  -- Readiness metrics
  answers jsonb,
  readiness_score numeric,
  energisers_taken boolean DEFAULT false,
  
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
```
**Purpose**: Pre-workout readiness assessments
**Records**: 0 (no checkins recorded)
**Note**: Recently added `energisers_taken` field for tracking supplement usage

#### readiness_checkins
```sql
CREATE TABLE readiness_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  
  -- Readiness factors
  energy_level integer,
  sleep_quality integer,
  sleep_hours numeric,
  soreness_level integer,
  stress_level integer,
  
  -- Health flags
  feeling_sick boolean DEFAULT false,
  alcohol_consumed boolean DEFAULT false,
  
  -- Additional data
  notes text,
  overall_score integer,
  
  checkin_date date NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
```
**Purpose**: Daily readiness and wellness tracking
**Records**: 0 (no daily checkins)

#### cycle_events
```sql
CREATE TABLE cycle_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL,
  event_date date NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
```
**Purpose**: Menstrual cycle tracking for female athletes
**Records**: 0 (no cycle data)

### Gym Management

#### gyms
```sql
CREATE TABLE gyms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  address text,
  city text,
  country text,
  postal_code text,
  
  -- Contact info
  phone text,
  email text,
  website text,
  
  -- Operating hours
  hours_data jsonb,
  
  -- Features
  amenities text[],
  equipment_list text[],
  
  -- Geolocation
  latitude numeric,
  longitude numeric,
  
  -- Management
  owner_id uuid,
  is_active boolean NOT NULL DEFAULT true,
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
```
**Purpose**: Gym location and facility information
**Records**: 1 gym configured

### Template System

#### workout_templates
```sql
CREATE TABLE workout_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  
  -- Template metadata
  category text,
  difficulty_level text,
  estimated_duration_minutes integer,
  
  -- Usage tracking
  times_used integer NOT NULL DEFAULT 0,
  last_used_at timestamp with time zone,
  
  -- Sharing
  is_public boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
```
**Purpose**: Reusable workout templates
**Records**: 1 template created

#### template_exercises
```sql
CREATE TABLE template_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL,
  exercise_id uuid NOT NULL,
  order_index integer NOT NULL,
  
  -- Default targets
  default_sets integer,
  target_reps integer,
  target_weight numeric,
  target_weight_kg numeric,
  weight_unit weight_unit DEFAULT 'kg',
  
  -- Configuration
  rest_seconds integer,
  notes text,
  
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
```
**Purpose**: Exercises within workout templates
**Records**: 0 (no template exercises)

### Life Categories System

#### life_categories
```sql
CREATE TABLE life_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
```
**Purpose**: Top-level life area categories
**Records**: 4 categories (Health, Work, etc.)

#### life_subcategories
```sql
CREATE TABLE life_subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL,
  slug text NOT NULL UNIQUE,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
```
**Purpose**: Subcategory organization within life areas
**Records**: 13 subcategories

### Configuration Tables

#### experience_level_configs
```sql
CREATE TABLE experience_level_configs (
  experience_level experience_level NOT NULL PRIMARY KEY,
  
  -- Intensity ranges
  start_intensity_low numeric NOT NULL,
  start_intensity_high numeric NOT NULL,
  
  -- Warmup parameters
  warmup_set_count_min smallint NOT NULL,
  warmup_set_count_max smallint NOT NULL,
  
  -- Rest periods
  main_rest_seconds_min smallint NOT NULL,
  main_rest_seconds_max smallint NOT NULL,
  
  -- Progression
  weekly_progress_pct numeric NOT NULL,
  allow_high_complexity boolean NOT NULL DEFAULT false,
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
```
**Purpose**: Training parameters by experience level
**Records**: 5 experience levels configured

#### metric_defs
```sql
CREATE TABLE metric_defs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  
  -- Value configuration
  value_type metric_value_type NOT NULL,
  unit text,
  enum_options text[],
  
  -- Display properties
  display_order integer DEFAULT 0,
  is_core boolean NOT NULL DEFAULT false,
  
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
```
**Purpose**: Custom metric definitions for tracking
**Records**: 17 metric types defined

## Key Patterns

### Timestamp Pattern
Most tables include:
```sql
created_at timestamp with time zone NOT NULL DEFAULT now(),
updated_at timestamp with time zone NOT NULL DEFAULT now()
```

### User Ownership Pattern
User-owned data includes:
```sql
user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
```

### Translation Pattern
Translatable content has companion `_translations` tables:
```sql
-- Parent table
exercises (id, slug, ...)

-- Translation table  
exercises_translations (id, exercise_id, language_code, name, description, ...)
```

### Configuration Pattern
Flexible configuration using JSONB:
```sql
attribute_values_json jsonb NOT NULL DEFAULT '{}',
capability_schema jsonb DEFAULT '{}',
machine_settings jsonb
```

### Enumerated Types
Custom enum types for consistency:
```sql
-- Weight units
weight_unit: 'kg', 'lbs'

-- Exercise difficulty
exercise_skill_level: 'beginner', 'intermediate', 'advanced'

-- Load types
load_type: 'none', 'dual_load', 'single_load', 'stack'
```

*This documentation represents the complete current database schema.*