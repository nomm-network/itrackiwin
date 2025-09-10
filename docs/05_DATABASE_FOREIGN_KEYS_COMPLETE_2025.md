# Complete Database Foreign Keys Documentation 2025

**Generated**: January 10, 2025  
**Database**: PostgreSQL (Supabase)  
**Schema**: public  

## Overview

This document details the foreign key relationships within the fitness platform database. The schema follows a "logical foreign key" approach where data integrity is primarily managed through application logic and Row Level Security (RLS) policies rather than strict database constraints.

**Note**: While physical foreign key constraints are minimal, logical relationships are well-defined and documented here for reference and development guidance.

## Implementation Strategy

### Logical vs Physical Foreign Keys
- **Logical Relationships**: Well-defined data relationships documented and enforced by application logic
- **Physical Constraints**: Minimal database-level foreign key constraints to maintain flexibility
- **RLS Enforcement**: Row Level Security policies provide access control and data integrity
- **Application Validation**: Business logic functions validate relationships and maintain consistency

### Benefits of This Approach
- **Flexibility**: Easier schema evolution and data migration
- **Performance**: Reduced constraint checking overhead
- **Application Control**: Business logic handles complex relationship rules
- **Soft Deletes**: Easier implementation of soft delete patterns

### Trade-offs
- **Manual Validation**: Requires careful application-level validation
- **No Automatic Cascades**: Deletion logic must be handled in application code
- **Development Responsibility**: Developers must understand and maintain logical relationships

## Logical Foreign Key Relationships

### Core User System

#### Authentication & Users
```
users.id → auth.users.id (Supabase Auth)
user_roles.user_id → users.id
user_preferences.user_id → users.id
user_achievements.user_id → users.id
user_pinned_subcategories.user_id → users.id
cycle_events.user_id → users.id
admin_audit_log.performed_by → users.id
admin_audit_log.target_user_id → users.id
admin_check_rate_limit.user_id → users.id
```

### Exercise Definition System

#### Exercise Core
```
exercises.equipment_id → equipment.id
exercises.primary_muscle_id → muscle_groups.id
exercises.movement_pattern_id → movement_patterns.id
exercises.movement_id → movements.id
exercises.body_part_id → body_parts.id
exercises.owner_user_id → users.id
exercises.default_bar_type_id → bar_types.id
exercises.equipment_ref_id → equipment.id
```

#### Exercise Relationships
```
exercise_grips.exercise_id → exercises.id
exercise_grips.grip_id → grips.id
exercise_default_grips.exercise_id → exercises.id
exercise_default_grips.grip_id → grips.id
exercise_equipment_variants.exercise_id → exercises.id
exercise_equipment_variants.equipment_id → equipment.id
exercise_similars.exercise_id → exercises.id
exercise_similars.similar_exercise_id → exercises.id
exercise_aliases.exercise_id → exercises.id
exercise_images.exercise_id → exercises.id
exercise_images.user_id → users.id
exercise_equipment_profiles.exercise_id → exercises.id
exercise_handle_orientations.exercise_id → exercises.id
exercise_handle_orientations.handle_id → handles.id
exercise_grip_effects.exercise_id → exercises.id
exercise_grip_effects.grip_id → grips.id
exercise_grip_effects.muscle_id → muscles.id
exercise_grip_effects.equipment_id → equipment.id
```

### Equipment System

#### Equipment Core
```
equipment_translations.equipment_id → equipment.id
equipment_grip_defaults.equipment_id → equipment.id
equipment_grip_defaults.grip_id → grips.id
equipment_grip_defaults.handle_id → handles.id
equipment_handle_orientations.equipment_id → equipment.id
equipment_handle_orientations.handle_id → handles.id
```

### Workout & Training System

#### Workout Core
```
workouts.user_id → users.id
workouts.template_id → workout_templates.id
workout_exercises.workout_id → workouts.id
workout_exercises.exercise_id → exercises.id
workout_exercises.grip_id → grips.id
workout_sets.workout_exercise_id → workout_exercises.id
workout_set_grips.workout_set_id → workout_sets.id
workout_set_grips.grip_id → grips.id
personal_records.user_id → users.id
personal_records.exercise_id → exercises.id
user_exercise_stats.user_id → users.id
user_exercise_stats.exercise_id → exercises.id
```

#### Workout Templates
```
workout_templates.user_id → users.id
template_exercises.template_id → workout_templates.id
template_exercises.exercise_id → exercises.id
template_exercise_handles.template_exercise_id → template_exercises.id
template_exercise_handles.handle_id → handles.id
template_exercise_grips.template_exercise_id → template_exercises.id
template_exercise_grips.grip_id → grips.id
```

#### Training Programs
```
training_programs.user_id → users.id
training_program_blocks.program_id → training_programs.id
training_program_exercises.block_id → training_program_blocks.id
training_program_exercises.exercise_id → exercises.id
```

### Gym Management System

#### Gym Core
```
gyms.city_id → cities.id
gym_equipment.gym_id → gyms.id
gym_equipment.equipment_id → equipment.id
gym_admins.gym_id → gyms.id
gym_admins.user_id → users.id
gym_memberships.gym_id → gyms.id
gym_memberships.user_id → users.id
gym_role_requests.gym_id → gyms.id
gym_role_requests.user_id → users.id
gym_role_requests.decided_by → users.id
user_gym_plates.user_gym_id → gym_memberships.id
user_gym_miniweights.user_gym_id → gym_memberships.id
gym_monthly_revenue.gym_id → gyms.id
```

### Mentorship & Coaching System

#### Mentor Core
```
mentor_profiles.user_id → users.id
mentor_profiles.gym_id → gyms.id
mentorships.mentor_id → mentor_profiles.id
mentorships.client_user_id → users.id
mentor_categories.mentor_id → mentor_profiles.id
coach_assigned_templates.mentorship_id → mentorships.id
coach_assigned_templates.template_id → workout_templates.id
coach_client_links.coach_user_id → users.id
coach_client_links.client_user_id → users.id
coach_client_links.gym_id → gyms.id
coach_client_links.requested_by → users.id
coach_client_links.decided_by → users.id
coach_logs.user_id → users.id
```

### Ambassador & Commission System

#### Ambassador Core
```
ambassador_profiles.user_id → users.id
battles.city_id → cities.id
battle_participants.battle_id → battles.id
battle_participants.ambassador_id → ambassador_profiles.id
battle_invitations.battle_id → battles.id
battle_invitations.ambassador_id → ambassador_profiles.id
ambassador_commission_agreements.ambassador_id → ambassador_profiles.id
ambassador_commission_agreements.gym_id → gyms.id
ambassador_commission_agreements.battle_id → battles.id
ambassador_commission_accruals.agreement_id → ambassador_commission_agreements.id
ambassador_gym_deals.ambassador_id → ambassador_profiles.id
ambassador_gym_deals.gym_id → gyms.id
ambassador_gym_deals.battle_id → battles.id
ambassador_gym_deals.verified_by → users.id
ambassador_gym_visits.ambassador_id → ambassador_profiles.id
ambassador_gym_visits.gym_id → gyms.id
```

### Body Parts & Muscle System

#### Muscle Hierarchy
```
muscle_groups.parent_id → muscle_groups.id (self-referencing)
muscles.muscle_group_id → muscle_groups.id
exercise_muscle_targets.exercise_id → exercises.id
exercise_muscle_targets.muscle_id → muscles.id
body_parts_translations.body_part_id → body_parts.id
muscle_groups_translations.muscle_group_id → muscle_groups.id
muscles_translations.muscle_id → muscles.id
```

#### Movement System
```
movements.movement_pattern_id → movement_patterns.id
movement_muscle_targets.movement_id → movements.id
movement_muscle_targets.muscle_id → muscles.id
movement_translations.movement_id → movements.id
movement_pattern_translations.movement_pattern_id → movement_patterns.id
```

### Handles & Grips System

#### Grip Core
```
grips.handle_id → handles.id
grip_translations.grip_id → grips.id
handle_translations.handle_id → handles.id
exercise_handle_grips.exercise_id → exercises.id
exercise_handle_grips.handle_id → handles.id
exercise_handle_grips.grip_id → grips.id
```

### Translation & Localization System

#### Translation Tables
```
equipment_translations.equipment_id → equipment.id
exercise_translations.exercise_id → exercises.id
body_parts_translations.body_part_id → body_parts.id
muscle_groups_translations.muscle_group_id → muscle_groups.id
muscles_translations.muscle_id → muscles.id
grip_translations.grip_id → grips.id
handle_translations.handle_id → handles.id
movement_translations.movement_id → movements.id
movement_pattern_translations.movement_pattern_id → movement_patterns.id
life_category_translations.category_id → life_categories.id
life_subcategory_translations.subcategory_id → life_subcategories.id
```

### Metric & Measurement System

#### Custom Metrics
```
exercise_metric_defs.exercise_id → exercises.id
exercise_metric_defs.metric_id → metric_defs.id
exercise_metric_defs.equipment_id → equipment.id
workout_set_metric_values.workout_set_id → workout_sets.id
workout_set_metric_values.metric_def_id → metric_defs.id
```

### Gamification & Social System

#### Achievements & Challenges
```
user_achievements.user_id → users.id
user_achievements.achievement_id → achievements.id
challenges.creator_id → users.id
challenge_participants.user_id → users.id
challenge_participants.challenge_id → challenges.id
leaderboards.user_id → users.id
leaderboards.exercise_id → exercises.id
```

#### Social Features
```
social_friendships.user_id → users.id
social_friendships.friend_id → users.id
social_posts.user_id → users.id
social_likes.user_id → users.id
social_likes.post_id → social_posts.id
```

### Life Categories System

#### Category Hierarchy
```
life_subcategories.category_id → life_categories.id
user_pinned_subcategories.user_id → users.id
user_pinned_subcategories.subcategory_id → life_subcategories.id
life_category_translations.category_id → life_categories.id
life_subcategory_translations.subcategory_id → life_subcategories.id
```

### Configuration & System Tables

#### System Configuration
```
attribute_schemas.scope_ref_id → (varies by scope)
progression_policies.experience_level_id → experience_levels.id
warmup_policies.experience_level_id → experience_levels.id
user_profile_fitness.user_id → users.id
user_profile_fitness.experience_level_id → experience_levels.id
experience_level_params.experience_level_id → experience_levels.id
auto_deload_triggers.user_id → users.id
auto_deload_triggers.exercise_id → exercises.id
```

#### Content Management
```
carousel_images.created_by → users.id
data_quality_reports (system table, no foreign keys)
naming_templates.scope_ref_id → (varies by scope)
```

### Health & Readiness System

#### Readiness Tracking
```
readiness_checkins.user_id → users.id
readiness_checkins.workout_id → workouts.id
```

## Key Relationship Patterns

### User-Centric Design
- Most tables have user_id columns linking to users
- RLS policies filter data by user ownership
- Multi-tenancy through user-based data isolation

### Hierarchical Relationships
- Self-referencing foreign keys (muscle_groups.parent_id)
- Category → Subcategory relationships
- Equipment → Exercise → Workout hierarchy

### Many-to-Many Relationships
- Implemented via junction tables (exercise_grips, workout_set_grips)
- Bridge tables with additional metadata
- Flexible relationship modeling

### Soft Delete Support
- Logical relationships support soft deletion patterns
- Data preservation for historical analysis
- Audit trail maintenance

## Data Integrity Strategy

### Application Logic
- Business logic functions enforce relationship rules
- Validation triggers ensure data consistency
- Custom validation for complex business rules

### Row Level Security (RLS)
- RLS policies enforce data access rules
- User-based data filtering
- Role-based access control

### Security Definer Functions
- Functions with elevated privileges for data access
- Prevent infinite recursion in RLS policies
- Centralized business logic implementation

## Recommendations for Production

### Adding Critical Constraints
Consider adding foreign key constraints for:
- Core user relationships (user_id columns)
- Essential system relationships (equipment, exercises)
- Referential integrity for critical business data

### Indexing Strategy
- Index all logical foreign key columns
- Composite indexes for common query patterns
- Partial indexes for conditional relationships

### Validation Functions
- Implement validation functions for relationship checking
- Trigger-based consistency enforcement
- Business rule validation at database level

### Audit Trails
- Track relationship changes in audit tables
- Maintain data lineage for troubleshooting
- Historical relationship analysis

### Cleanup Automation
- Scheduled cleanup jobs for orphaned records
- Data consistency checking procedures
- Automated relationship validation

## Schema Evolution Strategy

### Phase 1: Documentation
- Complete logical relationship documentation ✓
- Application logic mapping
- Data flow analysis

### Phase 2: Critical Constraints
- Add foreign keys for essential relationships
- Implement cascade behaviors where appropriate
- Monitor performance impact

### Phase 3: Comprehensive Constraints
- Full foreign key implementation
- Advanced cascade configurations
- Complete referential integrity

This logical foreign key approach provides flexibility while maintaining clear data relationships and integrity through application logic and RLS policies.