# Complete Database Export - iTrackiWin Fitness Application

Generated: 2025-01-09

## Overview

This document provides a comprehensive export of the iTrackiWin fitness tracking application database. The system contains 116 tables in the public schema, covering all aspects of workout tracking, user management, exercise definitions, gym management, and social features.

## Database Summary

- **Total Tables**: 116 tables in public schema
- **Owner**: postgres (managed by Supabase)
- **Special Tables**: spatial_ref_sys (owned by supabase_admin for PostGIS)

## Core System Tables (116 Total)

### User & Profile Management (16 tables)
- `users` - Core user records
- `profiles` - Extended user profile information  
- `user_roles` - User permissions and roles
- `user_settings` - User preferences and configuration
- `user_stats` - User statistics and metrics
- `user_features` - Feature flags per user
- `user_profile_fitness` - Fitness-specific profile data
- `user_fitness_profile` - Additional fitness metrics
- `user_gamification` - Gamification data (points, levels)
- `user_goals` - User-defined fitness goals
- `user_achievements` - Achievement progress tracking
- `user_injuries` - Injury history and restrictions
- `user_lifting_prefs` - Lifting preferences and settings
- `user_muscle_priorities` - Muscle group priority settings
- `user_prioritized_muscle_groups` - Enhanced muscle targeting
- `user_category_prefs` - Life category preferences

### Achievement & Gamification System (4 tables)
- `achievements` - Available achievements definition
- `challenges` - Community challenges
- `challenge_participants` - Challenge participation tracking
- `streaks` - Workout streak tracking

### Exercise Database (22 tables)
- `exercises` - Core exercise definitions
- `exercises_translations` - Multi-language exercise names
- `exercise_aliases` - Alternative exercise names
- `exercise_images` - Exercise demonstration media
- `exercise_similars` - Similar exercise relationships
- `exercise_equipment_variants` - Equipment variant mappings
- `exercise_grips` - Available grips per exercise
- `exercise_default_grips` - Default grip selections
- `exercise_grip_effects` - Grip impact on muscle activation
- `exercise_handle_orientations` - Handle position options
- `exercise_metric_defs` - Trackable metrics per exercise
- `movements` - Movement pattern definitions
- `movements_translations` - Movement pattern translations
- `movement_patterns` - High-level movement categories
- `movement_patterns_translations` - Pattern translations
- `muscles` - Individual muscle definitions
- `muscles_translations` - Muscle name translations
- `muscle_groups` - Muscle group definitions
- `muscle_groups_translations` - Muscle group translations
- `body_parts` - Body part categorization
- `body_parts_translations` - Body part translations
- `personal_records` - User PRs and best performances

### Equipment System (13 tables)
- `equipment` - Equipment definitions and specifications
- `equipment_translations` - Equipment name translations
- `equipments` - Additional equipment table
- `equipment_grip_defaults` - Default grips per equipment
- `equipment_handle_orientations` - Handle configuration per equipment
- `grips` - Grip type definitions
- `grips_translations` - Grip name translations
- `handle_equipment_rules` - Handle compatibility rules
- `handle_orientation_compatibility` - Handle orientation rules
- `bar_types` - Barbell type specifications
- `metric_defs` - Trackable metric definitions
- `user_equipment_preferences` - User equipment preferences
- `naming_templates` - Exercise naming pattern templates

### Workout System (19 tables)
- `workouts` - Individual workout sessions
- `workout_exercises` - Exercises within workouts
- `workout_sets` - Individual sets logged
- `workout_set_grips` - Grips used per set
- `workout_set_metric_values` - Metric values per set
- `workout_exercise_groups` - Exercise grouping (supersets, etc.)
- `workout_exercise_feedback` - Exercise-specific feedback
- `workout_session_feedback` - Overall workout feedback
- `workout_comments` - Workout comments and notes
- `workout_likes` - Social workout likes
- `workout_shares` - Workout sharing records
- `workout_checkins` - Pre/post workout check-ins
- `workout_templates` - Reusable workout templates
- `workout_templates_translations` - Template translations
- `template_exercises` - Exercises within templates
- `template_exercise_grips` - Template grip specifications
- `template_exercise_preferences` - Template exercise settings
- `template_exercise_machine_pref` - Machine preferences in templates
- `user_active_templates` - Currently active user templates

### Gym Management (15 tables)
- `gyms` - Gym/location definitions
- `gym_admins` - Gym administrator roles
- `gym_aliases` - Alternative gym names
- `gym_equipment` - Equipment available at gyms
- `gym_equipment_availability` - Equipment quantity and status
- `gym_equipment_overrides` - Gym-specific equipment settings
- `gym_plate_inventory` - Available plates at gyms
- `user_gyms` - User's gym associations
- `user_gym_memberships` - Membership tracking
- `user_gym_profiles` - Gym-specific user settings
- `user_gym_visits` - Gym visit history
- `user_gym_bars` - User's barbell inventory
- `user_gym_plates` - User's plate inventory
- `user_gym_dumbbells` - User's dumbbell inventory
- `user_gym_machines` - User's machine access
- `user_gym_miniweights` - User's microplate inventory

### AI Coaching & Analytics (9 tables)
- `coach_logs` - AI coaching operation logs
- `coach_assigned_templates` - Coach-assigned workout templates
- `data_quality_reports` - Database quality analysis
- `user_exercise_estimates` - AI performance estimates
- `user_exercise_overrides` - User overrides to AI suggestions
- `user_exercise_warmups` - Generated warmup routines
- `user_exercise_warmup_prefs` - Warmup preferences
- `auto_deload_triggers` - Automatic deload detection
- `progression_policies` - Progression rule definitions

### Health & Wellness (8 tables)
- `readiness_checkins` - Daily readiness assessments
- `pre_workout_checkins` - Pre-workout state checks
- `pain_events` - Pain and discomfort tracking
- `cycle_events` - Menstrual cycle tracking
- `rest_timer_sessions` - Rest timer usage
- `warmup_policies` - Warmup generation rules
- `progressive_overload_plans` - Systematic progression plans
- `training_programs` - Structured training programs
- `training_program_blocks` - Program periodization blocks
- `user_program_state` - User progress in programs

### Social Features (4 tables)
- `friendships` - User friendship connections
- `mentor_profiles` - Mentor/coach profiles
- `mentor_roles` - Mentor role definitions
- `mentor_specialties` - Mentor expertise areas
- `mentorships` - Mentor-client relationships

### System & Configuration (10 tables)
- `languages` - Supported languages
- `text_translations` - System text translations
- `experience_level_configs` - Experience level parameters
- `life_categories` - Life category definitions
- `life_category_translations` - Category translations
- `life_subcategories` - Life subcategory definitions
- `life_subcategory_translations` - Subcategory translations
- `user_pinned_subcategories` - User pinned categories
- `carousel_images` - App carousel content
- `attribute_schemas` - Dynamic attribute definitions
- `idempotency_keys` - Request deduplication

### Administrative (3 tables)
- `admin_audit_log` - Administrative action logging
- `admin_check_rate_limit` - Admin check rate limiting
- `user_roles` - User permission management

### PostGIS Spatial (1 table)
- `spatial_ref_sys` - Spatial reference systems (PostGIS)

## Sample Data Overview

### Achievements System
The system includes 7 predefined achievements:
- **First Workout** (50 points) - Complete your first workout
- **Workout Warrior** (100 points) - Complete 10 workouts  
- **Century Club** (500 points) - Complete 100 workouts
- **Consistent Champion** (200 points) - Maintain 7-day streak
- **Streak Master** (1000 points) - Maintain 30-day streak
- **Social Butterfly** (75 points) - Make your first friend
- **Level Up** (150 points) - Reach level 5

All achievements are currently active and use various criteria types (count, streak, friends, level).

## Key Features Supported

1. **Comprehensive Exercise Database** - Multi-language exercise definitions with equipment variants
2. **Advanced Workout Tracking** - Detailed set logging with grips, metrics, and feedback
3. **AI-Powered Coaching** - Automated suggestions, warmups, and progression tracking
4. **Multi-Gym Support** - Equipment tracking across multiple gym locations
5. **Social Features** - Friends, mentoring, workout sharing, and challenges
6. **Health Integration** - Readiness tracking, pain monitoring, cycle tracking
7. **Gamification** - Achievements, streaks, levels, and challenges
8. **Internationalization** - Full multi-language support throughout
9. **Template System** - Reusable workout templates with customization
10. **Equipment Management** - Detailed equipment specifications and user preferences

## Database Design Notes

- **No Formal Foreign Keys**: The database uses logical relationships without enforced foreign key constraints
- **Heavy JSONB Usage**: Flexible data storage for metrics, criteria, and configurations
- **UUID Primary Keys**: All tables use UUID primary keys for scalability
- **Audit Trails**: Comprehensive logging for administrative actions
- **Multi-language**: Extensive translation tables for global support
- **PostGIS Integration**: Spatial capabilities for location-based features

This export represents a sophisticated fitness tracking platform with enterprise-level features for workout management, AI coaching, social interaction, and comprehensive health monitoring.