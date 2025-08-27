# Foreign Key Relationships - Complete Export

*Generated on: 2025-08-27*

This document outlines all foreign key relationships based on the current database schema. Note: Many tables do not have explicit foreign key constraints defined in the schema, but logical relationships exist.

## Core Workout Flow

### Workouts Table
**Logical Foreign Keys** (no explicit constraints defined):
- `user_id` → auth.users.id
- `template_id` → workout_templates.id
- `gym_id` → gyms.id

### Workout Exercises Table
**Logical Foreign Keys**:
- `workout_id` → workouts.id
- `exercise_id` → exercises.id

### Workout Sets Table
**Logical Foreign Keys**:
- `workout_exercise_id` → workout_exercises.id

## Template System

### Workout Templates Table
**Logical Foreign Keys**:
- `user_id` → auth.users.id

### Template Exercises Table
**Logical Foreign Keys**:
- `template_id` → workout_templates.id
- `exercise_id` → exercises.id

### Template Exercise Handles Table
**Logical Foreign Keys**:
- `template_exercise_id` → template_exercises.id
- `handle_id` → handles.id

### Template Exercise Grips Table
**Logical Foreign Keys**:
- `template_exercise_id` → template_exercises.id
- `grip_id` → grips.id

## Exercise Definition System

### Exercises Table
**Logical Foreign Keys**:
- `owner_user_id` → auth.users.id
- `equipment_id` → equipment.id
- `body_part_id` → body_parts.id
- `primary_muscle_id` → muscle_groups.id (if exists)
- `default_bar_type_id` → bar_types.id

### Exercise Relationships

#### Exercise Default Grips Table
**Logical Foreign Keys**:
- `exercise_id` → exercises.id
- `grip_id` → grips.id

#### Exercise Default Handles Table
**Logical Foreign Keys**:
- `exercise_id` → exercises.id
- `handle_id` → handles.id

#### Exercise Equipment Variants Table
**Logical Foreign Keys**:
- `exercise_id` → exercises.id
- `equipment_id` → equipment.id

#### Exercise Grip Effects Table
**Logical Foreign Keys**:
- `exercise_id` → exercises.id
- `grip_id` → grips.id
- `muscle_id` → muscle_groups.id (if exists)
- `equipment_id` → equipment.id

#### Exercise Grips Table
**Logical Foreign Keys**:
- `exercise_id` → exercises.id
- `grip_id` → grips.id

#### Exercise Handle Grips Table
**Logical Foreign Keys**:
- `exercise_id` → exercises.id
- `handle_id` → handles.id
- `grip_id` → grips.id

#### Exercise Handles Table
**Logical Foreign Keys**:
- `exercise_id` → exercises.id
- `handle_id` → handles.id

#### Exercise Images Table
**Logical Foreign Keys**:
- `exercise_id` → exercises.id
- `user_id` → auth.users.id

#### Exercise Metric Defs Table
**Logical Foreign Keys**:
- `metric_id` → metric_defs.id (if exists)
- `exercise_id` → exercises.id
- `equipment_id` → equipment.id

#### Exercise Similars Table
**Logical Foreign Keys**:
- `exercise_id` → exercises.id
- `similar_exercise_id` → exercises.id

## Translation System

### Exercise Translations Table
**Logical Foreign Keys**:
- `exercise_id` → exercises.id

### Equipment Translations Table
**Logical Foreign Keys**:
- `equipment_id` → equipment.id

### Body Parts Translations Table
**Logical Foreign Keys**:
- `body_part_id` → body_parts.id

### Handle Translations Table
**Logical Foreign Keys**:
- `handle_id` → handles.id

### Handles Translations Table
**Logical Foreign Keys**:
- `handle_id` → handles.id

### Grips Translations Table
**Logical Foreign Keys**:
- `grip_id` → grips.id

## Handles & Grips System

### Handle Grip Compatibility Table
**Logical Foreign Keys**:
- `handle_id` → handles.id
- `grip_id` → grips.id

## Progress Tracking

### Personal Records Table
**Logical Foreign Keys**:
- `user_id` → auth.users.id
- `exercise_id` → exercises.id
- `workout_set_id` → workout_sets.id

## User Management & Administration

### User Roles Table
**Logical Foreign Keys**:
- `user_id` → auth.users.id

### Admin Audit Log Table
**Logical Foreign Keys**:
- `target_user_id` → auth.users.id
- `performed_by` → auth.users.id

### Admin Check Rate Limit Table
**Logical Foreign Keys**:
- `user_id` → auth.users.id

## Achievement System

### Challenge Participants Table
**Logical Foreign Keys**:
- `challenge_id` → challenges.id
- `user_id` → auth.users.id

### Challenges Table
**Logical Foreign Keys**:
- `creator_id` → auth.users.id

### Coach Logs Table
**Logical Foreign Keys**:
- `user_id` → auth.users.id

### Cycle Events Table
**Logical Foreign Keys**:
- `user_id` → auth.users.id

### Friendships Table
**Logical Foreign Keys**:
- `requester_id` → auth.users.id
- `addressee_id` → auth.users.id

## Gym Management

### Gym Admins Table
**Logical Foreign Keys**:
- `gym_id` → gyms.id
- `user_id` → auth.users.id

### Gym Aliases Table
**Logical Foreign Keys**:
- `gym_id` → gyms.id

### Gym Equipment Table
**Logical Foreign Keys**:
- `gym_id` → gyms.id
- `equipment_id` → equipment.id

### Gym Equipment Availability Table
**Logical Foreign Keys**:
- `gym_id` → gyms.id
- `equipment_id` → equipment.id

### Gym Equipment Overrides Table
**Logical Foreign Keys**:
- `gym_id` → gyms.id
- `equipment_id` → equipment.id

### Gym Plate Inventory Table
**Logical Foreign Keys**:
- `gym_id` → gyms.id

## Utility & System Tables

### Auto Deload Triggers Table
**Logical Foreign Keys**:
- `user_id` → auth.users.id
- `exercise_id` → exercises.id

### Idempotency Keys Table
**Logical Foreign Keys**:
- `user_id` → auth.users.id

### Readiness Checkins Table
**Logical Foreign Keys**:
- `user_id` → auth.users.id
- `workout_id` → workouts.id

## Important Notes

1. **No Explicit Constraints**: Most foreign key relationships are logical only - there are no database-level foreign key constraints enforcing these relationships.

2. **Data Integrity**: Without foreign key constraints, data integrity must be maintained at the application level.

3. **Cascade Behavior**: Since no FK constraints exist, cascade deletes must be handled in application code.

4. **Missing Tables**: Some referenced tables (like `muscle_groups`, `metric_defs`) may not exist in the current schema.

5. **Translation Pattern**: Most core entities follow a translation pattern with separate `_translations` tables for multi-language support.

## Recommendations for CG

1. **Add Foreign Key Constraints**: Consider adding proper foreign key constraints for data integrity.

2. **Verify References**: Some logical relationships reference tables that may not exist (`muscle_groups`, `metric_defs`).

3. **Cascade Rules**: Define appropriate cascade behavior (CASCADE, SET NULL, RESTRICT) for each relationship.

4. **Index Creation**: Add indexes on foreign key columns for better query performance.

5. **Data Validation**: Implement application-level validation to ensure referential integrity until constraints are added.