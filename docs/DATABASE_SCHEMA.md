# Database Schema Documentation

## Overview
This document contains the complete database schema for the iTrackiWin fitness tracking application, including all tables, columns, foreign keys, and Row Level Security (RLS) policies.

**Database Stats**: 113 public tables with comprehensive RLS policies

## Error Report
**Current Issue**: PostgreSQL function `start_workout` has error:
- **Error**: `function round(numeric, numeric) does not exist`
- **Location**: Line calling `ROUND(v_base_weight * v_multiplier, 1)`
- **Fix Needed**: Use `ROUND(v_base_weight * v_multiplier)` (integer rounding only)

## Table Structure

### achievements
**Description**: Achievement system for tracking user milestones and goals

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| title | text | No | None | Achievement title |
| description | text | No | None | Achievement description |
| category | text | No | None | Achievement category |
| icon | text | No | None | Achievement icon identifier |
| points | integer | No | 0 | Points awarded for achievement |
| criteria | jsonb | No | None | Criteria for earning achievement |
| is_active | boolean | No | true | Whether achievement is active |
| created_at | timestamp with time zone | No | now() | Creation timestamp |

**RLS Policies:**
- `Achievements are viewable by everyone` (SELECT): `true`
- `Admins can manage achievements` (ALL): `is_admin(auth.uid())`

**Foreign Keys:** None

---

### admin_audit_log
**Description**: Audit trail for administrative actions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| action_type | text | No | None | Type of action performed |
| performed_by | uuid | Yes | None | User who performed action |
| target_user_id | uuid | Yes | None | Target user (if applicable) |
| details | jsonb | Yes | '{}' | Additional action details |
| ip_address | inet | Yes | None | IP address of performer |
| user_agent | text | Yes | None | User agent string |
| created_at | timestamp with time zone | No | now() | Action timestamp |

**RLS Policies:**
- `Superadmins can view audit logs` (SELECT): `has_role(auth.uid(), 'superadmin'::app_role)`
- `System can insert audit logs` (INSERT): `true`

**Foreign Keys:** None

---

### admin_check_rate_limit
**Description**: Rate limiting for admin privilege checks

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| user_id | uuid | No | None | User being rate limited |
| check_count | integer | Yes | 1 | Number of checks in window |
| window_start | timestamp with time zone | No | now() | Rate limit window start |
| created_at | timestamp with time zone | No | now() | Creation timestamp |

**RLS Policies:**
- `Users can view own rate limits` (SELECT): `(auth.uid() = user_id)`
- `Users can insert own rate limits` (INSERT): `(auth.uid() = user_id)`
- `Users can update own rate limits` (UPDATE): `(auth.uid() = user_id)`

**Foreign Keys:** None

---

### workouts
**Description**: Main workout sessions table

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| user_id | uuid | No | None | User who owns the workout |
| template_id | uuid | Yes | None | Template used (if any) |
| title | text | Yes | None | Workout title |
| started_at | timestamp with time zone | No | now() | When workout started |
| ended_at | timestamp with time zone | Yes | None | When workout ended |
| notes | text | Yes | None | Workout notes |
| created_at | timestamp with time zone | No | now() | Creation timestamp |
| updated_at | timestamp with time zone | No | now() | Last update timestamp |

**RLS Policies:**
- `Users can manage their own workouts` (ALL): `(auth.uid() = user_id)`

**Foreign Keys:**
- `user_id` references `auth.users(id)` ON DELETE CASCADE
- `template_id` references `workout_templates(id)` ON DELETE SET NULL

---

### workout_exercises
**Description**: Exercises within a workout session

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| workout_id | uuid | No | None | Parent workout |
| exercise_id | uuid | No | None | Exercise being performed |
| order_index | integer | No | 1 | Order in workout |
| target_sets | integer | Yes | 3 | Target number of sets |
| target_reps | integer | Yes | 8 | Target reps per set |
| target_weight_kg | numeric | Yes | None | Target weight in kg |
| weight_unit | text | Yes | 'kg' | Weight unit |
| notes | text | Yes | None | Exercise-specific notes |
| grip_id | uuid | Yes | None | Grip used |
| warmup_plan | jsonb | Yes | None | Warmup plan for exercise |
| created_at | timestamp with time zone | No | now() | Creation timestamp |
| updated_at | timestamp with time zone | No | now() | Last update timestamp |

**RLS Policies:**
- `Users can manage exercises in their workouts` (ALL): `EXISTS (SELECT 1 FROM workouts w WHERE w.id = workout_id AND w.user_id = auth.uid())`

**Foreign Keys:**
- `workout_id` references `workouts(id)` ON DELETE CASCADE
- `exercise_id` references `exercises(id)` ON DELETE CASCADE
- `grip_id` references `grips(id)` ON DELETE SET NULL

---

### workout_sets
**Description**: Individual sets within workout exercises

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| workout_exercise_id | uuid | No | None | Parent workout exercise |
| set_index | integer | No | 1 | Set number |
| set_kind | set_type | Yes | 'normal' | Type of set (normal, warmup, drop, amrap) |
| target_weight_kg | numeric | Yes | None | Target weight |
| target_reps | integer | Yes | None | Target reps |
| weight_kg | numeric | Yes | None | Actual weight performed |
| reps | integer | Yes | None | Actual reps performed |
| is_completed | boolean | No | false | Whether set is completed |
| completed_at | timestamp with time zone | Yes | None | When set was completed |
| rest_seconds | integer | Yes | None | Rest time after set |
| grip_key | text | Yes | None | Grip identifier |
| created_at | timestamp with time zone | No | now() | Creation timestamp |
| updated_at | timestamp with time zone | No | now() | Last update timestamp |

**RLS Policies:**
- `Users can manage sets in their workouts` (ALL): `can_mutate_workout_set(workout_exercise_id)`

**Foreign Keys:**
- `workout_exercise_id` references `workout_exercises(id)` ON DELETE CASCADE

---

### exercises
**Description**: Exercise database with all available exercises

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| slug | text | No | None | URL-friendly identifier |
| display_name | text | Yes | None | Human-readable name |
| custom_display_name | text | Yes | None | User-customized name |
| name_locale | text | Yes | 'en' | Language for name |
| name_version | integer | Yes | 1 | Name version number |
| owner_user_id | uuid | Yes | None | User who created (null = system) |
| is_public | boolean | No | true | Whether exercise is public |
| equipment_id | uuid | No | None | Primary equipment required |
| equipment_ref_id | uuid | Yes | None | Equipment reference |
| movement_id | uuid | Yes | None | Movement pattern |
| movement_pattern_id | uuid | Yes | None | Movement pattern category |
| body_part_id | uuid | Yes | None | Primary body part |
| primary_muscle_id | uuid | Yes | None | Primary muscle worked |
| secondary_muscle_group_ids | uuid[] | Yes | None | Secondary muscles |
| exercise_skill_level | exercise_skill_level | Yes | 'medium' | Difficulty level |
| complexity_score | smallint | Yes | 3 | Complexity rating (1-5) |
| popularity_rank | integer | Yes | None | Popularity ranking |
| is_unilateral | boolean | Yes | false | Whether exercise is single-limb |
| is_bar_loaded | boolean | No | false | Whether uses loaded barbell |
| default_bar_weight | numeric | Yes | None | Default bar weight |
| default_bar_type_id | uuid | Yes | None | Default bar type |
| load_type | load_type | Yes | None | How weight is loaded |
| loading_hint | text | Yes | None | Loading instructions |
| allows_grips | boolean | Yes | true | Whether grips can be varied |
| default_grip_ids | uuid[] | Yes | '{}' | Default grip options |
| tags | text[] | Yes | '{}' | Exercise tags |
| contraindications | jsonb | Yes | '[]' | Medical contraindications |
| capability_schema | jsonb | Yes | '{}' | Exercise capabilities |
| attribute_values_json | jsonb | No | '{}' | Exercise attributes |
| configured | boolean | No | false | Whether fully configured |
| source_url | text | Yes | None | Original source URL |
| image_url | text | Yes | None | Exercise image URL |
| thumbnail_url | text | Yes | None | Thumbnail image URL |
| display_name_tsv | tsvector | Yes | None | Text search vector |
| created_at | timestamp with time zone | No | now() | Creation timestamp |

**RLS Policies:**
- `exercises_select_public_or_owned` (SELECT): `((is_public = true) OR (owner_user_id = auth.uid()))`
- `exercises_insert_authenticated` (INSERT): `((auth.uid() IS NOT NULL) AND ((owner_user_id = auth.uid()) OR (owner_user_id IS NULL)))`
- `exercises_update_own_or_system` (UPDATE): `((owner_user_id = auth.uid()) OR ((owner_user_id IS NULL) AND (auth.uid() IS NOT NULL)))`
- `exercises_delete_own` (DELETE): `(owner_user_id = auth.uid())`

**Foreign Keys:**
- `equipment_id` references `equipment(id)`
- `primary_muscle_id` references `muscle_groups(id)`
- `body_part_id` references `body_parts(id)`

---

## Enums

### app_role
Values: `'admin'`, `'moderator'`, `'user'`

### exercise_skill_level  
Values: `'beginner'`, `'easy'`, `'medium'`, `'hard'`, `'expert'`

### load_type
Values: `'dual_load'`, `'single_load'`, `'stack'`, `'none'`

### load_medium
Values: `'plate'`, `'stack'`, `'body'`, `'other'`

### set_type
Values: `'warmup'`, `'normal'`, `'drop'`, `'amrap'`, `'top_set'`, `'backoff'`

### weight_unit
Values: `'kg'`, `'lbs'`

---

## Key Database Features

### Row Level Security (RLS)
All user-related tables implement RLS to ensure data isolation:
- Users can only access their own workouts, sets, and user-created exercises
- System exercises are public but user exercises are private
- Admin functions are protected by role checks

### Triggers and Functions
- Automatic timestamp updates via `update_updated_at_column()`
- Set index auto-assignment via `assign_next_set_index()`
- Warmup calculation after set completion via `trg_after_set_logged()`
- Exercise name generation via `exercises_autoname_tg()`

### Full-Text Search
- Exercise names are indexed with `tsvector` for fast text search
- Supports multiple languages and custom names

### Data Integrity
- Comprehensive foreign key relationships maintain referential integrity
- Enum types ensure valid values for categorical data
- NOT NULL constraints prevent incomplete records