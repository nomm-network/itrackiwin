# Exercise Database Schema

## Tables Used
- `exercises` - Main exercise definitions
- `exercises_translations` - Localized exercise names/descriptions
- `muscle_groups` - Target muscle definitions
- `equipment` - Equipment types
- `grips` - Grip variations

## Foreign Keys
- `exercises.primary_muscle_id` → `muscle_groups.id`
- `exercises.equipment_id` → `equipment.id`

## RPCs Used
- `get_effective_muscles(exercise_id, grip_ids[], equipment_id)` - Calculate muscle activation