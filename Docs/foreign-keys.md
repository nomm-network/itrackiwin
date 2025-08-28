# Database Foreign Key Relationships

This document outlines all foreign key relationships in the fitness tracking database.

## Handle System Foreign Keys

### handle_translations
- `handle_translations.handle_id` → `handles.id`
  - **Cascade**: ON DELETE CASCADE
  - **Description**: Each translation belongs to a specific handle

### handle_equipment  
- `handle_equipment.handle_id` → `handles.id`
  - **Cascade**: ON DELETE CASCADE
  - **Description**: Direct handle-to-equipment mappings
- `handle_equipment.equipment_id` → `equipment.id`
  - **Cascade**: ON DELETE CASCADE
  - **Description**: Equipment that can use this handle

### handle_equipment_rules
- `handle_equipment_rules.handle_id` → `handles.id`
  - **Cascade**: ON DELETE CASCADE  
  - **Description**: Rule-based equipment compatibility for handles

### handle_grip_compatibility
- `handle_grip_compatibility.handle_id` → `handles.id`
  - **Cascade**: ON DELETE CASCADE
  - **Description**: Which grips are compatible with each handle
- `handle_grip_compatibility.grip_id` → `grips.id`
  - **Cascade**: ON DELETE CASCADE
  - **Description**: Specific grip that works with the handle

## Grip System Foreign Keys

### grips_translations
- `grips_translations.grip_id` → `grips.id`
  - **Cascade**: ON DELETE CASCADE
  - **Description**: Localized grip names and descriptions

## Equipment System Foreign Keys

### equipment_translations
- `equipment_translations.equipment_id` → `equipment.id`
  - **Cascade**: ON DELETE CASCADE
  - **Description**: Localized equipment names and descriptions

### equipment_handle_grips
- `equipment_handle_grips.equipment_id` → `equipment.id`
  - **Cascade**: ON DELETE CASCADE
  - **Description**: Equipment that supports this handle-grip combination
- `equipment_handle_grips.handle_id` → `handles.id`
  - **Cascade**: ON DELETE CASCADE
  - **Description**: Handle used with this equipment
- `equipment_handle_grips.grip_id` → `grips.id`
  - **Cascade**: ON DELETE CASCADE
  - **Description**: Grip used with this handle-equipment combination

## Exercise System Foreign Keys

### exercises
- `exercises.equipment_id` → `equipment.id`
  - **Cascade**: ON DELETE RESTRICT
  - **Description**: Primary equipment required for exercise
- `exercises.primary_muscle_id` → `muscles.id`
  - **Cascade**: ON DELETE SET NULL
  - **Description**: Primary muscle worked by exercise
- `exercises.body_part_id` → `body_parts.id`
  - **Cascade**: ON DELETE SET NULL
  - **Description**: Body part category
- `exercises.default_bar_type_id` → `bar_types.id`
  - **Cascade**: ON DELETE SET NULL
  - **Description**: Default bar type for barbell exercises
- `exercises.owner_user_id` → `auth.users.id`
  - **Cascade**: ON DELETE CASCADE
  - **Description**: User who created custom exercise (NULL for system exercises)

### exercises_translations
- `exercises_translations.exercise_id` → `exercises.id`
  - **Cascade**: ON DELETE CASCADE
  - **Description**: Localized exercise names and descriptions

### exercise_handles
- `exercise_handles.exercise_id` → `exercises.id`
  - **Cascade**: ON DELETE CASCADE
  - **Description**: Exercise that can use this handle
- `exercise_handles.handle_id` → `handles.id`
  - **Cascade**: ON DELETE CASCADE
  - **Description**: Handle that can be used with this exercise

### exercise_default_handles
- `exercise_default_handles.exercise_id` → `exercises.id`
  - **Cascade**: ON DELETE CASCADE
  - **Description**: Exercise with default handle
- `exercise_default_handles.handle_id` → `handles.id`
  - **Cascade**: ON DELETE CASCADE
  - **Description**: Default handle for this exercise

### exercise_grips
- `exercise_grips.exercise_id` → `exercises.id`
  - **Cascade**: ON DELETE CASCADE
  - **Description**: Exercise that supports this grip
- `exercise_grips.grip_id` → `grips.id`
  - **Cascade**: ON DELETE CASCADE
  - **Description**: Grip that can be used with this exercise

### exercise_default_grips
- `exercise_default_grips.exercise_id` → `exercises.id`
  - **Cascade**: ON DELETE CASCADE
  - **Description**: Exercise with default grip
- `exercise_default_grips.grip_id` → `grips.id`
  - **Cascade**: ON DELETE CASCADE
  - **Description**: Default grip for this exercise

### exercise_handle_grips
- `exercise_handle_grips.exercise_id` → `exercises.id`
  - **Cascade**: ON DELETE CASCADE
  - **Description**: Exercise in this handle-grip combination
- `exercise_handle_grips.handle_id` → `handles.id`
  - **Cascade**: ON DELETE CASCADE
  - **Description**: Handle in this combination
- `exercise_handle_grips.grip_id` → `grips.id`
  - **Cascade**: ON DELETE CASCADE
  - **Description**: Grip in this combination

## Workout System Foreign Keys

### workout_exercises
- `workout_exercises.workout_id` → `workouts.id`
  - **Cascade**: ON DELETE CASCADE
  - **Description**: Workout containing this exercise
- `workout_exercises.exercise_id` → `exercises.id`
  - **Cascade**: ON DELETE RESTRICT
  - **Description**: Exercise being performed
- `workout_exercises.handle_id` → `handles.id`
  - **Cascade**: ON DELETE SET NULL
  - **Description**: Handle used for this exercise instance
- `workout_exercises.bar_type_id` → `bar_types.id`
  - **Cascade**: ON DELETE SET NULL
  - **Description**: Bar type used for this exercise

### template_exercises
- `template_exercises.template_id` → `workout_templates.id`
  - **Cascade**: ON DELETE CASCADE
  - **Description**: Template containing this exercise
- `template_exercises.exercise_id` → `exercises.id`
  - **Cascade**: ON DELETE CASCADE
  - **Description**: Exercise in the template
- `template_exercises.handle_id` → `handles.id`
  - **Cascade**: ON DELETE SET NULL
  - **Description**: Default handle for this template exercise

## Relationship Patterns

### User Ownership Pattern
Most user-specific data follows this pattern:
- `table.user_id` → `auth.users.id` (ON DELETE CASCADE)

### Translation Pattern
All translatable entities follow this pattern:
- `entity_translations.entity_id` → `entity.id` (ON DELETE CASCADE)
- Unique constraint on `(entity_id, language_code)`

### Exercise Configuration Pattern
Exercise-related configurations use:
- RESTRICT for core dependencies (equipment, exercise references)
- SET NULL for optional configurations (handles, grips, bar types)
- CASCADE for owned relationships (translations, user exercises)

### Handle-Equipment-Grip Triangle
The handle system creates a three-way relationship:
- Equipment defines what handles it can use
- Handles define what grips they support  
- Exercises specify preferred handle-grip combinations
- All connected through junction tables with CASCADE deletes