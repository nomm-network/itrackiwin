# DATABASE SCHEMA DOCUMENTATION

## Overview
This document contains the complete database schema for the fitness tracking application.

## Tables Overview

Based on the Supabase configuration, the database contains the following main entities:

### Core Tables

#### Users & Authentication
- `users` - Extended user profiles beyond Supabase auth
- `user_roles` - User permission roles
- `admin_audit_log` - Admin action tracking
- `admin_check_rate_limit` - Rate limiting for admin checks

#### Exercise Management
- `exercises` - Core exercise definitions
- `exercises_translations` - Multi-language exercise names/descriptions
- `exercise_aliases` - Alternative names for exercises
- `exercise_equipment_variants` - Equipment variations for exercises
- `exercise_grips` - Grip configurations for exercises
- `exercise_grip_effects` - Muscle targeting effects by grip
- `exercise_default_grips` - Default grip assignments
- `exercise_handle_orientations` - Handle orientation options
- `exercise_metric_defs` - Metric definitions for exercises
- `exercise_similars` - Similar exercise relationships
- `exercise_images` - Exercise image storage

#### Body Taxonomy
- `body_parts` - Body part definitions (arms, legs, etc.)
- `body_parts_translations` - Multi-language body part names
- `muscle_groups` - Muscle group definitions
- `muscles` - Individual muscle definitions
- `muscle_groups_translations` - Multi-language muscle group names
- `muscles_translations` - Multi-language muscle names

#### Equipment & Grips
- `equipment` - Equipment definitions
- `equipment_translations` - Multi-language equipment names
- `equipments` - Alternative equipment table
- `grips` - Grip type definitions
- `grips_translations` - Multi-language grip names
- `handles` - Handle definitions
- `handle_orientations` - Handle orientation compatibility
- `equipment_grip_defaults` - Default grips per equipment
- `equipment_handle_orientations` - Equipment handle configurations

#### Gym Management
- `gyms` - Gym location data
- `gym_admins` - Gym administration roles
- `gym_aliases` - Alternative gym names
- `gym_equipment` - Equipment available at gyms
- `gym_equipment_availability` - Equipment status tracking
- `gym_equipment_overrides` - Custom equipment configurations
- `gym_plate_inventory` - Plate inventory per gym

#### Workout System
- `workouts` - Workout sessions
- `workout_exercises` - Exercises within workouts
- `workout_sets` - Individual sets within exercises
- `workout_set_metric_values` - Metric values for sets
- `workout_set_grips` - Grips used in sets
- `workout_templates` - Predefined workout templates
- `template_exercises` - Exercises in templates

#### User Data & Preferences
- `user_exercise_estimates` - User performance estimates
- `user_gym_plates` - User's available plates
- `user_gym_miniweights` - User's micro plates
- `user_pinned_subcategories` - User's pinned categories
- `user_profile_fitness` - Fitness profile data

#### Challenges & Social
- `challenges` - Fitness challenges
- `challenge_participants` - Challenge participation
- `friendships` - User friendship system
- `achievements` - Achievement definitions

#### Health Tracking
- `cycle_events` - Menstrual cycle tracking
- `auto_deload_triggers` - Automatic deload triggers

#### System & Configuration
- `attribute_schemas` - Dynamic attribute schemas
- `experience_level_configs` - Experience level parameters
- `bar_types` - Barbell type definitions
- `data_quality_reports` - Data quality monitoring
- `coach_logs` - AI coach interaction logs
- `text_translations` - System text translations

#### Views (Read-only)
- `v_exercises_with_translations` - Exercises with translation data
- `v_body_parts_with_translations` - Body parts with translations
- `v_muscle_groups_with_translations` - Muscle groups with translations
- `v_muscles_with_translations` - Muscles with translations
- `v_last_working_set` - User's last working set per exercise
- `mv_user_exercise_1rm` - 1RM estimates per user/exercise
- `mv_last_set_per_user_exercise` - Last set tracking
- `mv_pr_weight_per_user_exercise` - Personal record tracking

## Key Relationships

### Primary Foreign Key Relationships
Most tables with user-specific data reference `auth.users.id` or include `user_id` fields.

### Translation Pattern
Many core entities follow a translation pattern:
- Base table (e.g., `exercises`)
- Translation table (e.g., `exercises_translations`)
- Localized views (e.g., `v_exercises_with_translations`)

## Notes
- The system uses UUID primary keys throughout
- Row Level Security (RLS) is implemented on most tables
- Multi-language support through dedicated translation tables
- Extensive use of JSONB for flexible attribute storage