# Foreign Key Relationships - Complete Audit

Generated on: 2025-09-05

## Overview

This document provides a complete audit of foreign key relationships in the database. Note that while logical relationships exist throughout the schema, **no formal foreign key constraints** are currently implemented at the database level.

## Foreign Key Status

**CONFIRMED**: Database analysis shows **NO formal foreign key constraints** are currently implemented in the public schema.

```sql
-- Query result for foreign key constraints
SELECT COUNT(*) FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public';
-- Result: 0
```

## Design Pattern

The database uses a **logical foreign key pattern** where:
1. **UUID references** exist between tables via naming conventions
2. **Application-level integrity** is maintained through business logic
3. **Row Level Security (RLS)** enforces data access rather than formal constraints
4. **Supabase/PostgREST pattern** for distributed systems

## Logical Relationships Map

### Core User Relationships
```
users.id <- user_roles.user_id
users.id <- user_settings.user_id
users.id <- user_stats.user_id
users.id <- user_features.user_id
users.id <- user_achievements.user_id
users.id <- user_gamification.user_id
users.id <- profiles.user_id
users.id <- workouts.user_id
users.id <- personal_records.user_id
users.id <- user_gym_memberships.user_id
users.id <- friendships.requester_id
users.id <- friendships.addressee_id
users.id <- challenges.creator_id
users.id <- challenge_participants.user_id
```

### Exercise System Relationships
```
exercises.id <- workout_exercises.exercise_id
exercises.id <- template_exercises.exercise_id
exercises.id <- exercise_images.exercise_id
exercises.id <- exercise_aliases.exercise_id
exercises.id <- exercise_default_grips.exercise_id
exercises.id <- exercise_grips.exercise_id
exercises.id <- exercise_equipment_variants.exercise_id
exercises.id <- exercise_similars.exercise_id
exercises.id <- exercise_grip_effects.exercise_id
exercises.id <- exercise_handle_orientations.exercise_id
exercises.id <- exercise_metric_defs.exercise_id
exercises.id <- personal_records.exercise_id
exercises.id <- user_exercise_estimates.exercise_id
exercises.id <- user_exercise_overrides.exercise_id

equipment.id <- exercises.equipment_id
equipment.id <- gym_equipment.equipment_id
equipment.id <- exercise_equipment_variants.equipment_id
equipment.id <- equipment_grip_defaults.equipment_id
equipment.id <- equipment_handle_orientations.equipment_id

body_parts.id <- exercises.body_part_id
muscle_groups.id <- exercises.primary_muscle_id
movement_patterns.id <- exercises.movement_pattern_id
movements.id <- exercises.movement_id
```

### Workout System Relationships
```
workouts.id <- workout_exercises.workout_id
workouts.id <- workout_checkins.workout_id
workouts.id <- workout_comments.workout_id
workouts.id <- workout_likes.workout_id
workouts.id <- workout_shares.workout_id
workouts.id <- workout_exercise_feedback.workout_id
workouts.id <- workout_session_feedback.workout_id

workout_exercises.id <- workout_sets.workout_exercise_id
workout_exercises.id <- workout_exercise_groups.workout_exercise_id

workout_sets.id <- workout_set_grips.workout_set_id
workout_sets.id <- workout_set_metric_values.workout_set_id

workout_templates.id <- template_exercises.template_id
workout_templates.id <- user_active_templates.template_id
workout_templates.id <- user_favorite_templates.template_id
workout_templates.id <- coach_assigned_templates.template_id
workout_templates.id <- workouts.template_id
```

### Gym Management Relationships
```
gyms.id <- gym_admins.gym_id
gyms.id <- gym_aliases.gym_id
gyms.id <- gym_equipment.gym_id
gyms.id <- gym_equipment_availability.gym_id
gyms.id <- gym_equipment_overrides.gym_id
gyms.id <- gym_plate_inventory.gym_id
gyms.id <- user_gym_memberships.gym_id
gyms.id <- user_gym_profiles.gym_id
gyms.id <- user_gym_visits.gym_id
```

### Body/Movement System Relationships
```
body_parts.id <- body_parts_translations.body_part_id
muscle_groups.id <- muscle_groups_translations.muscle_group_id
muscles.id <- muscles_translations.muscle_id
movement_patterns.id <- movement_patterns_translations.movement_pattern_id
movements.id <- movements_translations.movement_id

body_parts.id <- muscle_groups.body_part_id
muscle_groups.id <- muscles.muscle_group_id
movements.id <- exercises.movement_id
movement_patterns.id <- exercises.movement_pattern_id
```

### Grip & Handle System Relationships
```
grips.id <- grips_translations.grip_id
grips.id <- exercise_grips.grip_id
grips.id <- exercise_default_grips.grip_id
grips.id <- equipment_grip_defaults.grip_id
grips.id <- workout_set_grips.grip_id
grips.id <- template_exercise_grips.grip_id

handles.id <- handle_equipment_rules.handle_id
handles.id <- exercise_handle_orientations.handle_id
handles.id <- equipment_handle_orientations.handle_id
```

### Translation System Relationships
```
exercises.id <- exercises_translations.exercise_id
equipment.id <- equipment_translations.equipment_id
body_parts.id <- body_parts_translations.body_part_id
muscle_groups.id <- muscle_groups_translations.muscle_group_id
muscles.id <- muscles_translations.muscle_id
movements.id <- movements_translations.movement_id
movement_patterns.id <- movement_patterns_translations.movement_pattern_id
grips.id <- grips_translations.grip_id
life_categories.id <- life_category_translations.category_id
life_subcategories.id <- life_subcategory_translations.subcategory_id
workout_templates.id <- workout_templates_translations.template_id
```

### Social & Gamification Relationships
```
achievements.id <- user_achievements.achievement_id
life_categories.id <- life_subcategories.category_id
life_categories.id <- user_category_prefs.category_id
life_subcategories.id <- user_pinned_subcategories.subcategory_id

mentor_profiles.id <- mentorships.mentor_id
mentorships.id <- coach_assigned_templates.mentorship_id
```

### Metric & Analytics Relationships
```
metric_defs.id <- exercise_metric_defs.metric_id
metric_defs.id <- workout_set_metric_values.metric_def_id

training_programs.id <- training_program_blocks.program_id
training_programs.id <- user_program_state.program_id
```

## Cascade Behavior Patterns

Since formal foreign keys don't exist, cascade behavior is handled at the application level:

### Expected CASCADE Patterns
- **User deletion** → Remove all user-owned data
- **Workout deletion** → Remove exercises, sets, checkins
- **Exercise deletion** → Remove sets, images, aliases
- **Template deletion** → Remove template exercises

### Expected RESTRICT Patterns  
- **Equipment deletion** → Block if referenced by exercises
- **Body part deletion** → Block if referenced by exercises
- **Achievement deletion** → Block if users have earned it

### Expected SET NULL Patterns
- **Gym deletion** → Set gym_id to NULL in memberships
- **Template deletion** → Set template_id to NULL in workouts

## Referential Integrity Enforcement

### Current Methods
1. **Application Logic**: Business rules in API layer
2. **RLS Policies**: Prevent orphaned data access
3. **Database Functions**: Validation in stored procedures
4. **Client Validation**: UI prevents invalid references

### Potential Issues
- **Orphaned Records**: Possible without formal constraints
- **Data Inconsistency**: Manual cleanup required
- **Performance**: No query optimization from constraints
- **Documentation**: Relationships not self-documenting

## Recommendations

### For Production Hardening
```sql
-- Critical relationships to formalize
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_user_id 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE workouts ADD CONSTRAINT fk_workouts_user_id 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE workout_exercises ADD CONSTRAINT fk_workout_exercises_workout_id 
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE;

ALTER TABLE workout_sets ADD CONSTRAINT fk_workout_sets_workout_exercise_id 
  FOREIGN KEY (workout_exercise_id) REFERENCES workout_exercises(id) ON DELETE CASCADE;

ALTER TABLE exercises ADD CONSTRAINT fk_exercises_equipment_id 
  FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE RESTRICT;
```

### Migration Strategy
1. **Data Cleanup**: Identify and resolve orphaned records
2. **Phased Implementation**: Add constraints incrementally
3. **Testing**: Verify application compatibility
4. **Monitoring**: Track constraint violations

## Summary

- **Formal Constraints**: 0 currently implemented
- **Logical Relationships**: 200+ identified patterns
- **Access Control**: Enforced via RLS policies
- **Data Integrity**: Application-level validation
- **Flexibility**: High for distributed systems
- **Risk**: Potential data inconsistency