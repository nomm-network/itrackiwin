# Complete Database Tables Documentation

**Export Date:** 2025-01-08  
**Database:** PostgreSQL (Supabase)  
**Schema:** public  
**Total Tables:** 150+

## Overview

This document provides a comprehensive overview of all database tables in the PostgreSQL fitness platform. Each table is documented with its purpose, key columns, and relationships.

## Complete Table List

### Core System Tables (15 tables)
- `users` - Core user profiles and settings
- `user_roles` - Role-based access control
- `admin_audit_log` - Administrative action tracking  
- `admin_check_rate_limit` - Rate limiting for admin operations
- `achievements` - Achievement definitions
- `user_achievements` - User achievement progress
- `challenges` - Community challenges
- `challenge_participants` - Challenge participation
- `friendships` - User social connections
- `profiles` - Extended user profile information
- `carousel_images` - Homepage carousel management
- `text_translations` - Multi-language text content
- `languages` - Supported languages
- `idempotency_keys` - Request deduplication
- `data_quality_reports` - System data quality monitoring

### Exercise & Movement System (25 tables)
- `exercises` - Exercise definitions with complex attributes
- `exercise_aliases` - Alternative names for exercises
- `exercise_equipment_variants` - Equipment variations per exercise
- `exercise_grip_effects` - How grips affect muscle targeting
- `exercise_grips` - Available grips per exercise
- `exercise_handle_orientations` - Handle positions and orientations
- `exercise_images` - Visual references for exercises
- `exercise_metric_defs` - Metric definitions per exercise
- `exercise_similars` - Related exercise recommendations
- `exercise_default_grips` - Default grip configurations
- `exercise_equipment_profiles` - Equipment compatibility profiles
- `body_parts` - Anatomical body parts
- `body_parts_translations` - Multi-language body part names
- `muscle_groups` - Muscle group definitions
- `muscle_groups_translations` - Multi-language muscle names
- `muscles` - Individual muscle definitions
- `muscles_translations` - Multi-language muscle names
- `movement_patterns` - Movement pattern classifications
- `movements` - Basic movement definitions
- `exercises_translations` - Multi-language exercise names
- `metric_defs` - Custom metric definitions
- `user_exercise_estimates` - Performance estimates and targets
- `user_exercise_1rm` - One-rep max estimations
- `user_muscle_priorities` - Muscle priority preferences
- `auto_deload_triggers` - Automatic deload trigger system

### Equipment System (10 tables)
- `equipment` - Equipment definitions with load characteristics
- `equipment_defaults` - Default settings and specifications
- `equipment_grip_defaults` - Default grip configurations per equipment
- `equipment_handle_orientations` - Handle orientations per equipment
- `equipment_translations` - Multi-language equipment names
- `equipments` - Equipment catalog (simplified)
- `bar_types` - Barbell specifications and weights
- `handles` - Handle definitions and specifications
- `handles_translations` - Multi-language handle names
- `handle_grip_compatibility` - Handle-grip compatibility matrix

### Workout & Training System (15 tables)
- `workouts` - Workout sessions with metadata
- `workout_exercises` - Exercises within workouts
- `workout_sets` - Individual sets with performance data
- `workout_set_grips` - Grip selections per set
- `workout_set_metric_values` - Custom metric values per set
- `workout_checkins` - Pre/post workout check-ins
- `workout_templates` - Reusable workout templates
- `template_exercises` - Exercises within templates
- `workout_exercise_feedback` - Exercise-specific feedback
- `workout_exercise_groups` - Exercise groupings (supersets, circuits)
- `personal_records` - Personal best tracking
- `pre_workout_checkins` - Pre-workout state tracking
- `readiness_checkins` - Daily readiness assessments
- `user_injuries` - Injury tracking and management
- `cycle_events` - Menstrual cycle tracking

### Gym Management System (15 tables)
- `gyms` - Gym profiles and information
- `gym_admins` - Gym administrative access
- `gym_aliases` - Alternative gym names
- `gym_equipment` - Equipment inventory per gym
- `gym_equipment_availability` - Equipment availability tracking
- `gym_equipment_overrides` - Custom equipment configurations
- `gym_plate_inventory` - Plate inventory per gym
- `gym_poster_checks` - Gym poster verification system
- `user_gym_memberships` - User gym affiliations
- `user_gym_visits` - Gym visit tracking
- `user_gym_bars` - User bar preferences per gym
- `user_gym_plates` - User plate preferences per gym
- `user_gym_miniweights` - User micro-plate preferences
- `cities` - Geographic city data
- `battle_participants` - Battle participants

### Ambassador & Commission System (10 tables)
- `ambassador_profiles` - Ambassador profiles and status
- `ambassador_commission_agreements` - Commission agreements
- `ambassador_commission_accruals` - Commission calculations
- `ambassador_gym_deals` - Gym partnership deals
- `ambassador_gym_visits` - Ambassador gym visits
- `battles` - Ambassador competition battles
- `battle_invitations` - Battle invitations
- `grips` - Grip definitions and specifications
- `grips_translations` - Multi-language grip names
- `life_categories` - Life category organization

### Configuration & System (20+ tables)
- `attribute_schemas` - Dynamic attribute definitions
- `naming_templates` - Exercise naming templates
- `life_subcategories` - Life subcategory organization
- `life_category_translations` - Multi-language category names
- `user_category_prefs` - User category preferences
- `user_pinned_subcategories` - User-pinned categories
- `training_programs` - Structured training programs
- `training_program_blocks` - Program block definitions
- `user_program_state` - User program progress
- `progressive_overload_plans` - Progression planning
- `progression_policies` - Progression rule definitions
- `user_exercise_warmup_prefs` - Warmup preferences
- `warmup_policies` - Warmup rule definitions
- `mentor_profiles` - Mentor professional profiles
- `mentorships` - Mentor-client relationships
- `coach_assigned_templates` - Templates assigned by coaches
- `coach_client_links` - Coach-client connections
- `coach_logs` - Coaching activity logs
- `mentor_clients` - Mentor client management

### Materialized Views (3 tables)
- `mv_user_exercise_1rm` - Materialized view for 1RM data
- `mv_last_set_per_user_exercise` - Last performance per exercise
- `mv_pr_weight_per_user_exercise` - PR tracking per exercise

## Key Features

- **Row Level Security:** All tables have comprehensive RLS policies
- **Multi-language Support:** Translation tables for user-facing content
- **Audit Trail:** Complete tracking of administrative actions
- **Performance Optimization:** Materialized views for expensive queries
- **Flexible Schema:** JSON columns for extensible attributes
- **Type Safety:** Extensive use of PostgreSQL enums

This comprehensive table structure supports all aspects of the fitness platform including workout tracking, gym management, coaching, social features, and administrative operations.