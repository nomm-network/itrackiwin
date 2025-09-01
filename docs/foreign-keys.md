# Foreign Key Relationships Documentation

## Overview

This document details all foreign key relationships in the fitness application database. Note that the recent database query indicates no explicit foreign key constraints are currently defined in the `public` schema, but logical relationships exist based on the table structure.

## Logical Relationships (Application Level)

While formal foreign key constraints may not be defined at the database level, the application maintains these logical relationships:

### Exercise System Relationships

#### exercises table
- `equipment_id` → `equipment.id`
- `primary_muscle_id` → `muscle_groups.id`
- `body_part_id` → `body_parts.id`
- `movement_id` → `movements.id`
- `movement_pattern_id` → `movement_patterns.id`
- `default_bar_type_id` → `bar_types.id`
- `equipment_ref_id` → `equipment.id`
- `owner_user_id` → `auth.users.id`

#### exercises_translations table
- `exercise_id` → `exercises.id`

#### exercise_equipment_variants table
- `exercise_id` → `exercises.id`
- `equipment_id` → `equipment.id`

#### exercise_grips table
- `exercise_id` → `exercises.id`
- `grip_id` → `grips.id`

#### exercise_grip_effects table
- `exercise_id` → `exercises.id`
- `grip_id` → `grips.id`
- `muscle_id` → `muscle_groups.id`
- `equipment_id` → `equipment.id`

### Equipment System Relationships

#### equipment_translations table
- `equipment_id` → `equipment.id`

#### equipment_grip_defaults table
- `equipment_id` → `equipment.id`
- `grip_id` → `grips.id`

#### gym_equipment table
- `gym_id` → `gyms.id`
- `equipment_id` → `equipment.id`

#### gym_equipment_availability table
- `gym_id` → `gyms.id`
- `equipment_id` → `equipment.id`

### Body Part Hierarchy

#### muscle_groups table
- `body_part_id` → `body_parts.id`

#### muscle_groups_translations table
- `muscle_group_id` → `muscle_groups.id`

#### muscles table
- `muscle_group_id` → `muscle_groups.id`

#### muscles_translations table
- `muscle_id` → `muscles.id`

#### body_parts_translations table
- `body_part_id` → `body_parts.id`

### Movement System

#### movements table
- `movement_pattern_id` → `movement_patterns.id`

#### movements_translations table
- `movement_id` → `movements.id`

#### movement_patterns_translations table
- `movement_pattern_id` → `movement_patterns.id`

### Workout System Relationships

#### workouts table
- `user_id` → `auth.users.id`

#### workout_exercises table
- `workout_id` → `workouts.id`
- `exercise_id` → `exercises.id`

#### workout_sets table
- `workout_exercise_id` → `workout_exercises.id`

#### workout_set_grips table
- `workout_set_id` → `workout_sets.id`
- `grip_id` → `grips.id`

#### workout_set_metric_values table
- `workout_set_id` → `workout_sets.id`
- `metric_def_id` → `metric_defs.id`

### User System Relationships

#### users table
- `id` → `auth.users.id` (Supabase auth)

#### profiles table
- `user_id` → `auth.users.id`

#### user_roles table
- `user_id` → `auth.users.id`

#### user_gym_memberships table
- `user_id` → `auth.users.id`
- `gym_id` → `gyms.id`

### Gym System Relationships

#### gym_admins table
- `user_id` → `auth.users.id`
- `gym_id` → `gyms.id`

#### gym_aliases table
- `gym_id` → `gyms.id`

### Template System Relationships

#### workout_templates table
- `user_id` → `auth.users.id`

#### template_exercises table
- `template_id` → `workout_templates.id`
- `exercise_id` → `exercises.id`

### Translation System Relationships

#### grips_translations table
- `grip_id` → `grips.id`

## Constraint Status

### Current State
- **Formal FK Constraints**: None detected in public schema
- **RLS Policies**: Enforcing data access security
- **Application Logic**: Maintaining referential integrity
- **UUID References**: All relationships use UUID foreign keys

### Advantages of Current Approach
1. **Flexibility**: Easier schema migrations
2. **Performance**: Reduced constraint checking overhead
3. **Supabase Integration**: Works well with RLS policies

### Considerations
1. **Data Integrity**: Relies on application-level validation
2. **Cascading**: Manual handling of related record updates/deletes
3. **Documentation**: Requires clear relationship documentation (this file)

## Recommendations

### For Production
1. Consider adding formal FK constraints for critical relationships
2. Implement application-level validation for all relationships
3. Regular data integrity checks via database functions
4. Monitor for orphaned records

### Critical Relationships to Formalize
1. `exercises.equipment_id` → `equipment.id`
2. `workout_exercises.workout_id` → `workouts.id`
3. `workout_sets.workout_exercise_id` → `workout_exercises.id`
4. All translation table relationships

## Migration Notes

The removal of the handle system eliminated several foreign key relationships:
- Handle-related equipment constraints
- Exercise handle requirements
- Handle orientation dependencies

This simplification reduced the complexity of the relationship graph while maintaining core functionality.