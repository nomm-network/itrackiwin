# Complete Database Schema Export

**Export Date:** 2025-01-06  
**Database:** PostgreSQL (Supabase)  
**Schema:** public  
**Total Tables:** 150  
**Total Views:** 38  
**Total Functions:** 899  

## Summary

This is a comprehensive export of the complete database schema for the fitness platform. The database contains 150 tables, 38 views, and 899 functions, covering all aspects of the fitness tracking application including user management, workouts, exercises, gym operations, coaching, social features, and administrative functions.

## Table Schema Overview

The database consists of 150 tables organized into functional domains:

### User Management & Authentication
- `users` - Core user records
- `user_roles` - Role-based permissions 
- `profiles` - Extended user profile information
- `user_settings` - User preferences and configurations

### Exercise & Movement System
- `exercises` - Core exercise definitions
- `exercises_translations` - Multi-language exercise names
- `exercise_aliases` - Alternative exercise names
- `equipment` - Exercise equipment definitions
- `body_parts` - Body part classifications
- `muscle_groups` - Muscle group definitions
- `movement_patterns` - Movement pattern classifications
- `grips` - Grip types and variations

### Workout & Training System
- `workouts` - Workout sessions
- `workout_exercises` - Exercises within workouts
- `workout_sets` - Individual sets performed
- `workout_templates` - Reusable workout templates
- `template_exercises` - Exercises within templates
- `training_programs` - Structured training programs

### Gym & Location Management
- `gyms` - Gym/facility definitions
- `gym_equipment` - Equipment available at gyms
- `gym_admins` - Gym administrative permissions
- `user_gym_memberships` - User-gym relationships
- `cities` - Location data for gyms

### Coach & Mentorship System
- `mentor_profiles` - Coach/mentor information
- `mentorships` - Active coaching relationships
- `coach_assigned_templates` - Templates assigned by coaches
- `coach_logs` - Coaching activity tracking

### Ambassador & Commission System
- `ambassador_profiles` - Ambassador user profiles
- `battles` - Ambassador competition events
- `ambassador_gym_deals` - Gym partnership deals
- `ambassador_commission_agreements` - Commission structures
- `ambassador_commission_accruals` - Monthly commission calculations

### Social & Gamification
- `friendships` - User social connections
- `challenges` - User challenges and competitions
- `achievements` - Achievement definitions
- `user_achievements` - User achievement unlocks
- `streaks` - User activity streaks

### Health & Wellness Tracking
- `cycle_events` - Menstrual cycle tracking
- `pain_events` - Injury/pain tracking
- `user_injuries` - Current user injuries
- `readiness_checkins` - Daily readiness assessments

### Content & Configuration
- `carousel_images` - App carousel content
- `text_translations` - Multi-language text strings
- `attribute_schemas` - Dynamic attribute definitions
- `naming_templates` - Exercise naming templates

### System & Utility Tables
- `idempotency_keys` - Request deduplication
- `admin_audit_log` - Administrative action logging
- `data_quality_reports` - System health monitoring
- `join_codes` - Invitation/joining codes

## Views (38 Total)

The database includes comprehensive views for data access and reporting:

### Analytics & Reporting Views
- `v_ambassador_summary` - Ambassador KPI dashboard
- `v_ambassador_statements` - Commission statements  
- `v_gym_activity` - Gym usage analytics
- `v_gym_top_exercises` - Popular exercises per gym
- `v_marketplace_gyms` - Public gym directory
- `v_marketplace_mentors` - Public mentor directory

### Exercise & Equipment Views
- `v_exercises_with_translations` - Exercises with localized names
- `v_gym_equipment_completeness` - Equipment configuration status
- `v_user_exercise_estimates` - User exercise performance estimates

### User & Progress Views
- `v_last_working_set` - Latest workout performance
- `mv_user_exercise_1rm` - One-rep max estimates
- `v_user_gym_overview` - User gym membership summary

## Functions (899 Total)

The database contains extensive function libraries:

### Core System Functions
- User management: `create_admin_user()`, `has_role()`, `is_admin()`
- Workout system: `start_workout()`, `end_workout()`, `log_workout_set()`
- AI coaching: `compute_readiness_for_user()`, `pick_base_load()`

### Exercise Analysis Functions
- Stagnation detection: `fn_detect_stagnation()`
- Warmup suggestions: `fn_suggest_warmup()`
- Set recommendations: `fn_suggest_sets()`
- Rest period calculations: `fn_suggest_rest_seconds()`

### Equipment & Weight Functions
- Weight calculations: `compute_total_weight()`, `next_weight_step_kg()`
- Machine weight matching: `closest_machine_weight()`
- Barbell increment calculations: `bar_min_increment()`

### Strength & Performance Functions
- 1RM estimation: `epley_1rm()`
- Performance tracking: `get_user_pr_for_exercise()`
- Progress analysis: `get_last_sets_for_exercises()`

### Utility Functions
- Text processing: `slugify()`, `unaccent()`
- UUID handling: `short_hash_uuid()`
- Internationalization: `get_text()`

### Trigger Functions
- Automatic updates: `set_updated_at()`, `update_updated_at_column()`
- Data validation: `validate_metric_value_type()`
- User onboarding: `handle_new_user()`

### PostGIS Spatial Functions
- Geometric calculations and spatial indexing
- Location-based queries for gym discovery

### Text Search Functions
- PostgreSQL full-text search capabilities
- Trigram similarity matching for exercise search

## Security Model

### Row Level Security (RLS)
- All user-specific tables have RLS policies enabled
- Data isolation between users enforced at database level
- Role-based access control for administrative functions

### Authentication Integration
- Seamless integration with Supabase Auth
- Automatic user profile creation on signup
- Session management and token validation

### Function Security
- Security definer functions for elevated operations
- Controlled access to sensitive operations
- Audit logging for administrative actions

## Performance Considerations

### Indexing Strategy
- Comprehensive indexes on foreign keys
- Full-text search indexes for exercise discovery
- Spatial indexes for location-based queries

### Materialized Views
- Pre-computed aggregations for analytics
- Periodic refresh for performance optimization
- Complex join elimination for frequent queries

### Query Optimization
- Function-based computed columns
- Partial indexes for conditional queries
- Trigger-maintained denormalized data

## Data Integrity

### Foreign Key Relationships
- Referential integrity maintained through foreign keys
- Cascade rules for data cleanup
- Constraint validation for data quality

### Check Constraints
- Enum validation for controlled vocabularies
- Range validation for numeric fields
- Format validation for structured data

### Trigger Validation
- Complex business rule enforcement
- Cross-table consistency checks
- Automatic data derivation and calculation

## Maintenance & Monitoring

### Health Monitoring
- Data quality report generation
- Performance metric tracking
- Error rate monitoring and alerting

### Backup & Recovery
- Point-in-time recovery capabilities
- Regular automated backups
- Data export and migration tools

### Version Control
- Database migration system
- Schema change tracking
- Rollback capabilities for safe deployments

This schema represents a comprehensive fitness platform database designed for scalability, performance, and maintainability while supporting complex business requirements across multiple domains.