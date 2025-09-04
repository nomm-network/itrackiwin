# Complete Database Schema Documentation

**Generated**: 2025-09-04  
**Purpose**: Complete documentation of all database tables, columns, and relationships

## Overview

The fitness application database contains **118 tables** in the public schema with comprehensive Row-Level Security (RLS) policies, foreign key relationships, and advanced PostgreSQL features including PostGIS extensions for geospatial data.

## Database Statistics

- **Database Engine**: PostgreSQL 14+ with extensions
- **Total Tables**: 118 in public schema
- **Authentication**: Supabase Auth integration
- **Security**: Row-Level Security (RLS) enabled on all tables
- **Performance**: Materialized views, indexes, and optimized queries

## Core System Tables

### 1. User Management System

#### `users` Table
- **Purpose**: Core user profiles and subscription management
- **Key Columns**: 
  - `id` (uuid, Primary Key)
  - `is_pro` (boolean, default false)
  - `created_at`, `updated_at` (timestamps)

#### `user_roles` Table  
- **Purpose**: Role-based access control (admin, superadmin)
- **Key Columns**:
  - `user_id` (uuid) → users.id
  - `role` (app_role enum)
  - Composite primary key: (user_id, role)

#### `admin_audit_log` Table
- **Purpose**: Security audit trail for admin actions
- **Key Columns**:
  - `action_type` (text) - Action performed
  - `target_user_id` (uuid) - User affected
  - `performed_by` (uuid) - Admin who performed action
  - `details` (jsonb) - Action metadata
  - `ip_address` (inet), `user_agent` (text)

### 2. Exercise Management System

#### `exercises` Table
- **Purpose**: Core exercise definitions with equipment and muscle targeting
- **Key Columns**:
  - `id` (uuid, Primary Key)
  - `slug` (text, Unique) - URL-safe identifier
  - `display_name` (text) - Human-readable name
  - `equipment_id` (uuid) → equipment.id
  - `primary_muscle_id` (uuid) → muscle_groups.id
  - `secondary_muscle_group_ids` (uuid[]) - Array of muscle groups
  - `movement_id` (uuid) → movements.id
  - `owner_user_id` (uuid, nullable) - For custom exercises
  - `is_public` (boolean, default true)
  - `configured` (boolean, default false)
  - `popularity_rank` (integer)
  - `exercise_skill_level` (enum: beginner, medium, advanced)
  - `complexity_score` (smallint, 1-5)
  - `contraindications` (jsonb) - Medical/safety warnings
  - `attribute_values_json` (jsonb) - Flexible exercise attributes

#### `equipment` Table
- **Purpose**: Exercise equipment definitions with loading characteristics
- **Key Columns**:
  - `id` (uuid, Primary Key)
  - `slug` (text) - Equipment identifier
  - `equipment_type` (text, default 'machine')
  - `load_type` (load_type enum: dual_load, single_load, stack, none)
  - `load_medium` (load_medium enum: plates, stack, bodyweight, other)
  - `default_bar_weight_kg` (numeric)
  - `default_side_min_plate_kg` (numeric)
  - `default_single_min_increment_kg` (numeric)
  - `default_stack` (jsonb) - Stack weight configuration
  - `configured` (boolean, default false)

#### `muscle_groups` Table
- **Purpose**: Muscle group taxonomy with hierarchical structure
- **Key Columns**:
  - `id` (uuid, Primary Key)
  - `slug` (text) - Muscle group identifier
  - `parent_id` (uuid, nullable) → muscle_groups.id (self-reference)
  - `is_major` (boolean, default false)
  - `display_order` (integer)

### 3. Workout Execution System

#### `workouts` Table
- **Purpose**: Individual workout sessions
- **Key Columns**:
  - `id` (uuid, Primary Key)
  - `user_id` (uuid) → users.id
  - `title` (text)
  - `started_at` (timestamp, default now())
  - `ended_at` (timestamp, nullable)
  - `template_id` (uuid, nullable) → workout_templates.id
  - `notes` (text)
  - `workout_feel` (feel_rating enum)

#### `workout_exercises` Table
- **Purpose**: Exercises within a workout session
- **Key Columns**:
  - `id` (uuid, Primary Key)
  - `workout_id` (uuid) → workouts.id
  - `exercise_id` (uuid) → exercises.id
  - `order_index` (integer)
  - `target_weight_kg` (numeric)
  - `target_reps` (integer)
  - `weight_unit` (weight_unit enum: kg, lbs)
  - `rest_seconds` (integer)
  - `notes` (text)

#### `workout_sets` Table
- **Purpose**: Individual sets performed during workout
- **Key Columns**:
  - `id` (uuid, Primary Key)
  - `workout_exercise_id` (uuid) → workout_exercises.id
  - `set_index` (integer)
  - `set_kind` (set_type enum: warmup, normal, top_set, drop, amrap)
  - `reps` (integer)
  - `weight` (numeric)
  - `is_completed` (boolean, default false)
  - `completed_at` (timestamp)
  - `rest_seconds` (integer)
  - `notes` (text)

### 4. Template System

#### `workout_templates` Table
- **Purpose**: Reusable workout plans
- **Key Columns**:
  - `id` (uuid, Primary Key)
  - `user_id` (uuid) → users.id
  - `name` (text)
  - `description` (text)
  - `is_public` (boolean, default false)
  - `estimated_duration_minutes` (integer)
  - `difficulty_level` (difficulty enum)

#### `template_exercises` Table
- **Purpose**: Exercises within workout templates
- **Key Columns**:
  - `id` (uuid, Primary Key)
  - `template_id` (uuid) → workout_templates.id
  - `exercise_id` (uuid) → exercises.id
  - `order_index` (integer)
  - `default_sets` (integer)
  - `target_reps` (integer)
  - `target_weight_kg` (numeric)
  - `weight_unit` (weight_unit enum)
  - `rest_seconds` (integer)

#### `active_templates` Table
- **Purpose**: User's active template rotation management
- **Key Columns**:
  - `id` (uuid, Primary Key)
  - `user_id` (uuid) → users.id
  - `template_id` (uuid) → workout_templates.id
  - `order_index` (integer)
  - `is_active` (boolean, default true)
  - `last_done_at` (timestamp)
  - `notes` (text)

### 5. Handle & Grip System

#### `handles` Table
- **Purpose**: Equipment handle types (bars, attachments)
- **Key Columns**:
  - `id` (uuid, Primary Key)
  - `slug` (text, nullable)

#### `grips` Table
- **Purpose**: Hand grip variations for exercises
- **Key Columns**:
  - `id` (uuid, Primary Key)
  - `slug` (text, nullable)
  - `category` (text, nullable)
  - `is_compatible_with` (jsonb) - Compatibility matrix

#### `equipment_handle_grips` Table
- **Purpose**: Equipment-handle-grip compatibility mapping
- **Key Columns**:
  - `equipment_id` (uuid) → equipment.id
  - `handle_id` (uuid) → handles.id
  - `grip_id` (uuid) → grips.id
  - `is_default` (boolean, default false)

### 6. Fitness Profile & Analytics

#### `user_profile_fitness` Table
- **Purpose**: User fitness profiles and preferences
- **Key Columns**:
  - `user_id` (uuid, Primary Key) → users.id
  - `experience_level_id` (uuid) → experience_levels.id
  - `sex` (sex enum: male, female, other)
  - `age` (integer)
  - `weight_kg` (numeric)
  - `height_cm` (numeric)
  - `training_frequency_weekly` (integer)
  - `session_duration_minutes` (integer)

#### `user_exercise_estimates` Table
- **Purpose**: Performance estimates and 1RM calculations
- **Key Columns**:
  - `id` (uuid, Primary Key)
  - `user_id` (uuid) → users.id
  - `exercise_id` (uuid) → exercises.id
  - `type` (estimate_type enum: rm1, rm5, rm10)
  - `estimated_weight` (numeric)
  - `confidence_score` (numeric, 0.0-1.0)

### 7. Gym Management System

#### `gyms` Table
- **Purpose**: Gym/facility definitions
- **Key Columns**:
  - `id` (uuid, Primary Key)
  - `name` (text)
  - `address` (text)
  - `location` (geography, PostGIS)
  - `is_verified` (boolean, default false)

#### `gym_equipment` Table
- **Purpose**: Equipment available at specific gyms
- **Key Columns**:
  - `id` (uuid, Primary Key)
  - `gym_id` (uuid) → gyms.id
  - `equipment_id` (uuid) → equipment.id
  - `quantity` (integer, default 1)
  - `is_functional` (boolean, default true)
  - `loading_mode` (text)
  - `bar_weight_kg` (numeric)
  - `stack_increment_kg` (numeric)

### 8. Translation System

#### Translation Tables Pattern
All major entities have corresponding translation tables:
- `equipment_translations`
- `exercises_translations`
- `muscle_groups_translations`
- `movement_patterns_translations`
- `grips_translations`
- `handles_translations`

**Standard Translation Schema**:
- `id` (uuid, Primary Key)
- `{entity}_id` (uuid) → parent table
- `language_code` (text) - ISO language code
- `name` (text) - Translated name
- `description` (text, nullable) - Translated description

## Performance Features

### Materialized Views
- `mv_user_exercise_1rm` - Cached 1RM calculations
- `mv_last_set_per_user_exercise` - Latest performance data
- `mv_pr_weight_per_user_exercise` - Personal records

### Database Functions
- `start_workout(template_id)` - Workout initialization
- `end_workout(workout_id)` - Workout completion
- `log_workout_set()` - Set logging with metrics
- `epley_1rm(weight, reps)` - 1RM calculation
- `fn_suggest_warmup()` - Auto warmup generation
- `fn_suggest_sets()` - Set/rep suggestions

### Custom Data Types
- `load_type` enum: dual_load, single_load, stack, none
- `load_medium` enum: plates, stack, bodyweight, other
- `set_type` enum: warmup, normal, top_set, drop, amrap
- `weight_unit` enum: kg, lbs
- `feel_rating` enum: very_easy, easy, moderate, hard, very_hard
- `app_role` enum: admin, superadmin
- `sex` enum: male, female, other

## Security Model

### Row-Level Security (RLS)
All tables implement comprehensive RLS policies:

1. **User Data Isolation**: Users can only access their own data
2. **Admin Privileges**: Admins can manage system data
3. **Public Data**: Equipment, exercises, muscle groups readable by all
4. **Audit Logging**: All admin actions logged with full traceability

### Sample RLS Policies
```sql
-- User workouts are private
CREATE POLICY "Users can manage their own workouts" 
ON workouts FOR ALL 
USING (auth.uid() = user_id);

-- System exercises are public
CREATE POLICY "Public exercises viewable by all" 
ON exercises FOR SELECT 
USING (is_public = true OR owner_user_id = auth.uid());

-- Admin management
CREATE POLICY "Admins can manage all data" 
ON equipment FOR ALL 
USING (is_admin(auth.uid()));
```

## Data Relationships

### Key Foreign Key Relationships
- `exercises.equipment_id` → `equipment.id`
- `exercises.primary_muscle_id` → `muscle_groups.id`
- `workout_exercises.workout_id` → `workouts.id`
- `workout_exercises.exercise_id` → `exercises.id`
- `workout_sets.workout_exercise_id` → `workout_exercises.id`
- `template_exercises.template_id` → `workout_templates.id`
- `user_profile_fitness.user_id` → `users.id`

### Logical Relationships (Application-Enforced)
- User authentication through Supabase Auth
- Exercise-muscle targeting through arrays
- Equipment compatibility through JSON configurations
- Grip/handle relationships through mapping tables

## Schema Evolution

The database supports schema evolution through:
1. **Versioned Migrations**: All changes tracked through Supabase migrations
2. **Attribute System**: Flexible JSON attributes for future extensions
3. **Translation System**: Multi-language support built-in
4. **Capability Schema**: Exercise capability definitions in JSON

## Data Quality

### Constraints & Validation
- UUID primary keys throughout
- NOT NULL constraints on critical fields
- Check constraints on enums and ranges
- Unique constraints on slugs and identifiers

### Data Integrity
- Referential integrity through foreign keys
- Application-level validation in RLS policies
- Trigger-based data consistency
- Automated timestamp management

This schema represents a mature, production-ready fitness application database with comprehensive features for workout tracking, template management, user profiles, and administrative control.