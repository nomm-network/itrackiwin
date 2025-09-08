# Complete Database Schema Documentation

**Export Date:** 2025-01-08  
**Database:** PostgreSQL (Supabase)  
**Schema:** public  
**Total Tables:** 150+  
**Total Views:** 38  
**Total Functions:** 899+  

## Overview

This document provides a comprehensive overview of the complete database schema for the Fitness Platform. The database is built on PostgreSQL with Supabase and includes extensive functionality for fitness tracking, gym management, coaching, social features, and administrative capabilities.

## Database Structure Summary

### Core Components
- **Tables:** 150+ tables covering all aspects of the fitness platform
- **Views:** 38 views for complex data queries and reporting
- **Functions:** 899+ functions including triggers, calculations, and business logic
- **Types/Enums:** 24 custom PostgreSQL types for data validation
- **RLS Policies:** Comprehensive Row Level Security for data access control

### Functional Domains

#### 1. User Management & Authentication
- `users` - Core user profiles and settings
- `user_roles` - Role-based access control (admin, mentor, user, superadmin)
- `admin_audit_log` - Administrative action tracking
- `admin_check_rate_limit` - Rate limiting for admin operations
- `profiles` - Extended user profile information

#### 2. Exercise & Movement System
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

#### 3. Equipment & Configuration
- `equipment` - Equipment definitions with load characteristics
- `equipment_defaults` - Default settings and specifications
- `equipment_grip_defaults` - Default grip configurations per equipment
- `equipment_handle_orientations` - Handle orientations per equipment
- `equipment_translations` - Multi-language equipment names
- `equipments` - Equipment catalog (simplified)
- `bar_types` - Barbell specifications and weights

#### 4. Workout & Training System
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

#### 5. Progress Tracking & Analytics
- `personal_records` - Personal best tracking
- `user_exercise_estimates` - Performance estimates and targets
- `user_exercise_1rm` - One-rep max estimations
- `mv_user_exercise_1rm` - Materialized view for 1RM data
- `mv_last_set_per_user_exercise` - Last performance per exercise
- `mv_pr_weight_per_user_exercise` - PR tracking per exercise

#### 6. Body Parts & Muscle System
- `body_parts` - Anatomical body parts
- `body_parts_translations` - Multi-language body part names
- `muscle_groups` - Muscle group definitions
- `muscle_groups_translations` - Multi-language muscle names
- `muscles` - Individual muscle definitions
- `muscles_translations` - Multi-language muscle names
- `movement_patterns` - Movement pattern classifications
- `movements` - Basic movement definitions

#### 7. Gym Management
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

#### 8. Coach & Mentorship System
- `mentor_profiles` - Mentor professional profiles
- `mentorships` - Mentor-client relationships
- `coach_assigned_templates` - Templates assigned by coaches
- `coach_client_links` - Coach-client connections
- `coach_logs` - Coaching activity logs
- `mentor_clients` - Mentor client management

#### 9. Ambassador & Commission System
- `ambassador_profiles` - Ambassador profiles and status
- `ambassador_commission_agreements` - Commission agreements
- `ambassador_commission_accruals` - Commission calculations
- `ambassador_gym_deals` - Gym partnership deals
- `ambassador_gym_visits` - Ambassador gym visits
- `battles` - Ambassador competition battles
- `battle_participants` - Battle participants
- `battle_invitations` - Battle invitations

#### 10. Social & Gamification
- `achievements` - Achievement definitions
- `user_achievements` - User achievement progress
- `challenges` - Community challenges
- `challenge_participants` - Challenge participation
- `friendships` - User social connections

#### 11. Health & Wellness Tracking
- `cycle_events` - Menstrual cycle tracking
- `readiness_checkins` - Daily readiness assessments
- `pre_workout_checkins` - Pre-workout state tracking
- `user_injuries` - Injury tracking and management

#### 12. Content & Configuration
- `carousel_images` - Homepage carousel management
- `text_translations` - Multi-language text content
- `languages` - Supported languages
- `attribute_schemas` - Dynamic attribute definitions
- `naming_templates` - Exercise naming templates
- `life_categories` - Life category organization
- `life_subcategories` - Life subcategory organization
- `life_category_translations` - Multi-language category names

#### 13. Metrics & Measurement
- `metric_defs` - Custom metric definitions
- `user_category_prefs` - User category preferences
- `user_pinned_subcategories` - User-pinned categories
- `user_muscle_priorities` - Muscle priority preferences

#### 14. System & Utility
- `cities` - Geographic city data
- `data_quality_reports` - System data quality monitoring
- `idempotency_keys` - Request deduplication
- `auto_deload_triggers` - Automatic deload trigger system

#### 15. Training Programs
- `training_programs` - Structured training programs
- `training_program_blocks` - Program block definitions
- `user_program_state` - User program progress
- `progressive_overload_plans` - Progression planning
- `progression_policies` - Progression rule definitions
- `user_exercise_warmup_prefs` - Warmup preferences
- `warmup_policies` - Warmup rule definitions

#### 16. Handles & Grips System
- `handles` - Handle definitions and specifications
- `handles_translations` - Multi-language handle names
- `grips` - Grip definitions and specifications
- `grips_translations` - Multi-language grip names
- `handle_grip_compatibility` - Handle-grip compatibility matrix

## Key Features

### Security Model
- **Row Level Security (RLS):** All tables have comprehensive RLS policies
- **Role-Based Access:** Support for user, mentor, admin, and superadmin roles
- **Audit Logging:** Complete audit trail for administrative actions
- **Rate Limiting:** Built-in rate limiting for sensitive operations

### Performance Optimizations
- **Materialized Views:** Pre-computed data for expensive queries
- **Indexes:** Strategic indexing for optimal query performance
- **Text Search:** Full-text search capabilities with tsvector columns
- **Spatial Data:** PostGIS support for geographic functionality

### Data Integrity
- **Type Safety:** Extensive use of custom PostgreSQL types/enums
- **Validation:** Database-level validation through triggers
- **Constraints:** Comprehensive constraint system
- **Referential Integrity:** Foreign key relationships throughout

### Internationalization
- **Multi-language Support:** Translation tables for all user-facing content
- **Locale-Aware:** Locale-specific functionality and formatting
- **Cultural Adaptation:** Region-specific features and preferences

### Extensibility
- **Attribute Schemas:** Dynamic attribute system for extensibility
- **Custom Metrics:** User-defined metrics and measurements
- **Plugin Architecture:** Modular design for feature additions
- **Configuration Management:** Flexible configuration system

## Database Statistics

- **Total Tables:** 150+
- **Total Views:** 38
- **Total Functions:** 899+
- **Total Types/Enums:** 24
- **RLS Policies:** 200+
- **Indexes:** 500+
- **Triggers:** 50+

This database represents a comprehensive fitness platform capable of handling complex workout tracking, gym management, coaching relationships, social features, and administrative operations at scale.