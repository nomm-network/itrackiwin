# Foreign Key Relationships

## Core Exercise System Foreign Keys

### exercises table
- `movement_pattern_id` → `movement_patterns(id)`
- `movement_id` → `movements(id)`  
- `equipment_id` → `equipment(id)`
- `primary_muscle_id` → `muscles(id)`
- `body_part_id` → `body_parts(id)`
- `owner_user_id` → `auth.users(id)` (implicit)

### Translation Tables
- `movement_translations.movement_id` → `movements(id)`
- `movement_patterns_translations.movement_pattern_id` → `movement_patterns(id)`
- `exercises_translations.exercise_id` → `exercises(id)`
- `equipment_translations.equipment_id` → `equipment(id)`
- `muscle_groups_translations.muscle_group_id` → `muscle_groups(id)`
- `body_parts_translations.body_part_id` → `body_parts(id)`

### Exercise Enhancement Tables
- `exercise_grips.exercise_id` → `exercises(id)`
- `exercise_grips.grip_id` → `grips(id)`
- `exercise_handles.exercise_id` → `exercises(id)`
- `exercise_handles.handle_id` → `handles(id)`
- `exercise_default_grips.exercise_id` → `exercises(id)`
- `exercise_default_grips.grip_id` → `grips(id)`
- `exercise_default_handles.exercise_id` → `exercises(id)`
- `exercise_default_handles.handle_id` → `handles(id)`

### Equipment Enhancement Tables
- `equipment_translations.equipment_id` → `equipment(id)`
- `equipment_grip_defaults.equipment_id` → `equipment(id)`
- `equipment_grip_defaults.grip_id` → `grips(id)`
- `equipment_handle_grips.equipment_id` → `equipment(id)`
- `equipment_handle_grips.handle_id` → `handles(id)`
- `equipment_handle_grips.grip_id` → `grips(id)`

## Cascade Behaviors

When deleting records, the following cascade behaviors apply:

- **movements** → CASCADE to `movement_translations`
- **movement_patterns** → CASCADE to `movement_patterns_translations`
- **exercises** → CASCADE to `exercises_translations`, `exercise_grips`, `exercise_handles`
- **equipment** → CASCADE to `equipment_translations`
- **muscle_groups** → CASCADE to `muscle_groups_translations`
- **body_parts** → CASCADE to `body_parts_translations`