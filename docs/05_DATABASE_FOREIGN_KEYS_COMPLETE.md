# Complete Database Foreign Keys Documentation

**Export Date:** 2025-01-08  
**Database:** PostgreSQL (Supabase)  
**Schema:** public  

## Overview

This document provides a comprehensive overview of all foreign key relationships within the database schema. The database primarily uses a **soft foreign key** approach with minimal enforced database constraints, relying instead on application logic and Row Level Security (RLS) policies for data integrity.

## Important Note on Foreign Key Implementation

**Current State:** The database schema uses **logical foreign key relationships** without explicit database constraints. This design choice provides:

1. **Flexibility:** Easier schema evolution and migrations
2. **Performance:** Reduced constraint checking overhead
3. **Application Control:** Business logic handles referential integrity
4. **RLS Integration:** Row Level Security provides access control

**Trade-offs:**
- Requires careful application-level validation
- No automatic cascade operations
- Potential for orphaned records without proper cleanup
- Database cannot enforce referential integrity automatically

## Logical Foreign Key Relationships

### Core User System Relationships

#### users table (auth.users)
Referenced by (user_id column):
- `achievements` → user achievements and progress
- `admin_audit_log` → administrative actions (target_user_id, performed_by)
- `admin_check_rate_limit` → rate limiting per user
- `ambassador_profiles` → ambassador user profiles
- `auto_deload_triggers` → user-specific deload triggers
- `challenge_participants` → challenge participation
- `challenges` → challenge creation (creator_id)
- `coach_client_links` → coaching relationships (coach_user_id, client_user_id)
- `coach_logs` → coaching activity logs
- `cycle_events` → menstrual cycle tracking
- `exercise_images` → user-uploaded exercise images
- `exercises` → user-created exercises (owner_user_id)
- `friendships` → user social connections
- `mentorships` → mentorship relationships (client_user_id)
- `personal_records` → personal record tracking
- `pre_workout_checkins` → pre-workout assessments
- `readiness_checkins` → daily readiness scores
- `user_achievements` → achievement progress
- `user_category_prefs` → life category preferences
- `user_exercise_estimates` → exercise performance estimates
- `user_exercise_warmup_prefs` → warmup preferences
- `user_gym_bars` → gym bar preferences
- `user_gym_memberships` → gym memberships
- `user_gym_miniweights` → micro-weight preferences
- `user_gym_plates` → plate preferences
- `user_gym_visits` → gym visit tracking
- `user_injuries` → injury tracking
- `user_muscle_priorities` → muscle priority settings
- `user_pinned_subcategories` → pinned life subcategories
- `user_program_state` → training program progress
- `user_roles` → user role assignments
- `workouts` → workout sessions
- `workout_templates` → workout template ownership

### Exercise Definition System

#### exercises table
Referenced by (exercise_id column):
- `exercise_aliases` → alternative exercise names
- `exercise_default_grips` → default grip configurations
- `exercise_equipment_profiles` → equipment compatibility
- `exercise_equipment_variants` → equipment variations
- `exercise_grip_effects` → grip effects on muscle targeting
- `exercise_grips` → available grips
- `exercise_handle_orientations` → handle orientations
- `exercise_images` → exercise visual references
- `exercise_metric_defs` → custom metrics per exercise
- `exercise_similars` → similar exercise relationships (both directions)
- `personal_records` → personal records per exercise
- `template_exercises` → exercises in workout templates
- `user_exercise_estimates` → performance estimates
- `user_exercise_warmup_prefs` → warmup preferences
- `workout_exercises` → exercises in workouts
- `auto_deload_triggers` → automatic deload triggers

### Equipment System

#### equipment table
Referenced by (equipment_id column):
- `exercises` → exercise equipment requirements
- `equipment_grip_defaults` → default grips per equipment
- `equipment_handle_orientations` → handle orientations
- `equipment_translations` → multi-language equipment names
- `exercise_equipment_variants` → exercise-equipment variations
- `exercise_grip_effects` → grip effects per equipment
- `exercise_metric_defs` → equipment-specific metrics
- `gym_equipment` → gym equipment inventory

### Workout & Training System

#### workouts table
Referenced by (workout_id column):
- `workout_exercises` → exercises within workouts
- `workout_checkins` → workout check-ins

#### workout_exercises table
Referenced by (workout_exercise_id column):
- `workout_sets` → individual sets within exercises
- `workout_exercise_feedback` → exercise-specific feedback

#### workout_sets table
Referenced by (workout_set_id column):
- `workout_set_grips` → grip selections per set
- `workout_set_metric_values` → custom metric values per set

#### workout_templates table
Referenced by (template_id column):
- `template_exercises` → exercises within templates
- `coach_assigned_templates` → coach-assigned templates
- `user_active_templates` → user's active templates
- `user_favorite_templates` → user's favorite templates
- `workouts` → workouts created from templates

### Gym Management System

#### gyms table
Referenced by (gym_id column):
- `ambassador_gym_deals` → ambassador gym partnerships
- `ambassador_gym_visits` → ambassador gym visits
- `battles` → ambassador battles per city/gym
- `coach_client_links` → gym-based coaching relationships
- `gym_admins` → gym administrative access
- `gym_aliases` → alternative gym names
- `gym_equipment` → gym equipment inventory
- `gym_equipment_availability` → equipment availability
- `gym_equipment_overrides` → custom equipment settings
- `gym_plate_inventory` → plate inventory per gym
- `gym_poster_checks` → poster verification tracking
- `user_gym_bars` → user bar preferences per gym
- `user_gym_memberships` → user gym memberships
- `user_gym_plates` → user plate preferences per gym
- `user_gym_miniweights` → user micro-weight preferences
- `user_gym_visits` → gym visit tracking

#### cities table
Referenced by (city_id column):
- `gyms` → gym locations
- `battles` → city-based ambassador battles

### Mentorship & Coaching System

#### mentor_profiles table
Referenced by (mentor_id column):
- `mentorships` → mentor-client relationships
- `coach_assigned_templates` → templates assigned by mentors

#### mentorships table
Referenced by (mentorship_id column):
- `coach_assigned_templates` → template assignments within mentorships

### Ambassador & Commission System

#### ambassador_profiles table
Referenced by (ambassador_id column):
- `ambassador_commission_agreements` → commission agreements
- `ambassador_gym_deals` → gym partnership deals
- `ambassador_gym_visits` → gym visits
- `battle_participants` → battle participation
- `battle_invitations` → battle invitations

#### battles table
Referenced by (battle_id column):
- `ambassador_commission_agreements` → commission agreements per battle
- `ambassador_gym_deals` → gym deals within battles
- `battle_participants` → battle participants
- `battle_invitations` → battle invitations

#### ambassador_commission_agreements table
Referenced by (agreement_id column):
- `ambassador_commission_accruals` → commission calculations

### Body Parts & Muscle System

#### body_parts table
Referenced by (body_part_id column):
- `body_parts_translations` → multi-language body part names
- `exercises` → exercise body part targeting

#### muscle_groups table
Referenced by (muscle_group_id column):
- `muscle_groups_translations` → multi-language muscle group names
- `exercises` → primary muscle targeting (primary_muscle_id)
- `exercises` → secondary muscle targeting (secondary_muscle_group_ids array)
- `user_muscle_priorities` → user muscle priorities

#### muscles table
Referenced by (muscle_id column):
- `muscles_translations` → multi-language muscle names
- `exercise_grip_effects` → muscle targeting effects

#### movement_patterns table
Referenced by (movement_pattern_id column):
- `exercises` → exercise movement patterns

#### movements table
Referenced by (movement_id column):
- `exercises` → basic movement classification

### Handles & Grips System

#### grips table
Referenced by (grip_id column):
- `equipment_grip_defaults` → default grips per equipment
- `exercise_default_grips` → default grips per exercise
- `exercise_grip_effects` → grip effects on targeting
- `exercise_grips` → available grips per exercise
- `grips_translations` → multi-language grip names
- `handle_grip_compatibility` → grip-handle compatibility
- `workout_set_grips` → grip selections per set

#### handles table
Referenced by (handle_id column):
- `equipment_handle_orientations` → handle orientations per equipment
- `exercise_handle_orientations` → handle orientations per exercise
- `handles_translations` → multi-language handle names
- `handle_grip_compatibility` → handle-grip compatibility

### Translation & Localization System

#### languages table
Referenced by (language_code column):
- `body_parts_translations` → body part translations
- `equipment_translations` → equipment translations
- `exercises_translations` → exercise translations
- `grips_translations` → grip translations
- `handles_translations` → handle translations
- `life_category_translations` → life category translations
- `muscle_groups_translations` → muscle group translations
- `muscles_translations` → muscle translations
- `text_translations` → general text translations

### Metric & Measurement System

#### metric_defs table
Referenced by (metric_id or metric_def_id column):
- `exercise_metric_defs` → metrics per exercise
- `workout_set_metric_values` → metric values per set

### Gamification & Social System

#### achievements table
Referenced by (achievement_id column):
- `user_achievements` → user achievement progress

#### challenges table
Referenced by (challenge_id column):
- `challenge_participants` → challenge participation

#### life_categories table
Referenced by (category_id column):
- `life_subcategories` → subcategory organization
- `life_category_translations` → category translations
- `user_category_prefs` → user category preferences

#### life_subcategories table
Referenced by (subcategory_id column):
- `user_pinned_subcategories` → user-pinned subcategories

### Training Program System

#### training_programs table
Referenced by (program_id column):
- `training_program_blocks` → program structure
- `user_program_state` → user program progress

#### training_program_blocks table
Referenced by (block_id column):
- `user_program_state` → block-specific progress

### Configuration & System Tables

#### bar_types table
Referenced by (bar_type_id or default_bar_type_id column):
- `exercises` → default bar type per exercise
- `user_gym_bars` → user bar selections per gym

#### attribute_schemas table
Referenced by (schema_id column):
- Various tables with `attribute_values_json` following schema definitions

#### progression_policies table
Referenced by (progression_policy_id column):
- `progressive_overload_plans` → progression rule applications

#### warmup_policies table
Referenced by (warmup_policy_id column):
- `user_exercise_warmup_prefs` → warmup rule preferences

## Data Integrity Strategy

### Application-Level Integrity
Since database foreign key constraints are not enforced, data integrity is maintained through:

1. **Application Logic:** Careful validation in application code
2. **RLS Policies:** Row Level Security ensures proper data access
3. **Business Logic Functions:** Database functions validate relationships
4. **Trigger Functions:** Automatic data validation and cleanup
5. **API Layer Validation:** Comprehensive validation at API boundaries

### Cleanup Strategies
Without automatic cascade operations:

1. **Soft Deletes:** Mark records as deleted rather than removing
2. **Cleanup Jobs:** Scheduled jobs to remove orphaned records
3. **Validation Queries:** Regular data integrity checks
4. **Application Cleanup:** Explicit cleanup in application logic

### Monitoring & Quality Assurance

1. **Data Quality Reports:** Regular integrity checking
2. **Orphaned Record Detection:** Automated orphan detection
3. **Referential Integrity Validation:** Custom validation functions
4. **Application Monitoring:** Track relationship violations

## Recommendations for Production

### Adding Critical Constraints
Consider adding foreign key constraints for critical relationships:
- User-related tables (user_id references)
- Core workout flow (workouts → workout_exercises → workout_sets)
- Template system (templates → template_exercises)

### Indexing Strategy
Ensure proper indexes on all reference columns:
- Single column indexes on foreign key columns
- Composite indexes for multi-column lookups
- Partial indexes for conditional relationships

### Validation Functions
Implement database functions for complex validation:
- Multi-table consistency checks
- Business rule validation
- Relationship integrity verification

### Audit Trail
Maintain detailed logs for reference changes:
- Track relationship creation/deletion
- Monitor data integrity violations
- Alert on suspicious relationship patterns

### Cleanup Automation
Implement automated cleanup processes:
- Scheduled orphan record removal
- Data archival strategies
- Integrity repair procedures

## Schema Evolution Strategy

### Phase 1: Documentation (Current)
- Document all logical relationships
- Identify critical vs. non-critical relationships
- Establish data integrity monitoring

### Phase 2: Critical Constraints
- Add foreign key constraints for core relationships
- Implement proper cascade rules
- Test constraint impact on performance

### Phase 3: Comprehensive Constraints
- Add constraints for remaining relationships
- Implement complex validation rules
- Optimize constraint checking

### Phase 4: Advanced Features
- Implement sophisticated referential integrity
- Add automatic cleanup mechanisms
- Enhance data quality monitoring

This approach provides flexibility for development while maintaining data integrity through application logic, with a clear path toward more traditional database constraints as the system matures.