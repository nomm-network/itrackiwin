# Foreign Key Relationships

## Core Exercise System

### exercises table foreign keys:
- `exercises.body_part_id` → `body_parts.id`
- `exercises.primary_muscle_id` → `muscles.id`  
- `exercises.equipment_id` → `equipment.id`
- `exercises.movement_id` → `movements.id`
- `exercises.movement_pattern_id` → `movement_patterns.id`
- `exercises.equipment_ref_id` → `equipment.id`
- `exercises.default_bar_type_id` → `bar_types.id`
- `exercises.owner_user_id` → `auth.users.id`

### exercises_translations table foreign keys:
- `exercises_translations.exercise_id` → `exercises.id` (CASCADE DELETE)

## Movement System

### movement_translations table foreign keys:
- `movement_translations.movement_id` → `movements.id` (CASCADE DELETE)

## Equipment System

### equipment_translations table foreign keys:
- `equipment_translations.equipment_id` → `equipment.id` (CASCADE DELETE)

## Muscle System

### muscles_translations table foreign keys:
- `muscles_translations.muscle_id` → `muscles.id` (CASCADE DELETE)

### body_parts_translations table foreign keys:
- `body_parts_translations.body_part_id` → `body_parts.id` (CASCADE DELETE)

## Handle & Grip System

### handle_translations table foreign keys:
- `handle_translations.handle_id` → `handles.id` (CASCADE DELETE)

### grips_translations table foreign keys:
- `grips_translations.grip_id` → `grips.id` (CASCADE DELETE)

## Relationship Tables

### equipment_handle_grips table foreign keys:
- `equipment_handle_grips.equipment_id` → `equipment.id`
- `equipment_handle_grips.handle_id` → `handles.id`
- `equipment_handle_grips.grip_id` → `grips.id`

### exercise_handles table foreign keys:
- `exercise_handles.exercise_id` → `exercises.id`
- `exercise_handles.handle_id` → `handles.id`

### exercise_grips table foreign keys:
- `exercise_grips.exercise_id` → `exercises.id`
- `exercise_grips.grip_id` → `grips.id`

### exercise_handle_grips table foreign keys:
- `exercise_handle_grips.exercise_id` → `exercises.id`
- `exercise_handle_grips.handle_id` → `handles.id`
- `exercise_handle_grips.grip_id` → `grips.id`

### exercise_grip_effects table foreign keys:
- `exercise_grip_effects.exercise_id` → `exercises.id`
- `exercise_grip_effects.grip_id` → `grips.id`
- `exercise_grip_effects.muscle_id` → `muscles.id`
- `exercise_grip_effects.equipment_id` → `equipment.id`

### exercise_equipment_variants table foreign keys:
- `exercise_equipment_variants.exercise_id` → `exercises.id`
- `exercise_equipment_variants.equipment_id` → `equipment.id`

### exercise_similars table foreign keys:
- `exercise_similars.exercise_id` → `exercises.id`
- `exercise_similars.similar_exercise_id` → `exercises.id`

### exercise_images table foreign keys:
- `exercise_images.exercise_id` → `exercises.id`
- `exercise_images.user_id` → `auth.users.id`

### exercise_metric_defs table foreign keys:
- `exercise_metric_defs.exercise_id` → `exercises.id`
- `exercise_metric_defs.equipment_id` → `equipment.id`
- `exercise_metric_defs.metric_id` → `metric_defs.id`

### exercise_aliases table foreign keys:
- `exercise_aliases.exercise_id` → `exercises.id`

### exercise_default_grips table foreign keys:
- `exercise_default_grips.exercise_id` → `exercises.id`
- `exercise_default_grips.grip_id` → `grips.id`

### exercise_default_handles table foreign keys:
- `exercise_default_handles.exercise_id` → `exercises.id`
- `exercise_default_handles.handle_id` → `handles.id`

### exercise_handle_orientations table foreign keys:
- `exercise_handle_orientations.exercise_id` → `exercises.id`
- `exercise_handle_orientations.handle_id` → `handles.id`

## Key Constraints and Indexes

### Unique Constraints:
- `exercises.slug` (UNIQUE)
- `movements.slug` (UNIQUE)
- `movement_patterns.slug` (UNIQUE)
- `equipment.slug` (UNIQUE)
- `muscles.slug` (UNIQUE)
- `handles.slug` (UNIQUE)
- `grips.slug` (UNIQUE)
- `exercises_translations(exercise_id, language_code)` (UNIQUE)
- `movement_translations(movement_id, language_code)` (UNIQUE)
- `equipment_translations(equipment_id, language_code)` (UNIQUE)
- `muscles_translations(muscle_id, language_code)` (UNIQUE)
- `body_parts_translations(body_part_id, language_code)` (UNIQUE)
- `handle_translations(handle_id, language_code)` (UNIQUE)
- `grips_translations(grip_id, language_code)` (UNIQUE)
- `equipment_handle_grips(equipment_id, handle_id, grip_id)` (UNIQUE)
- `exercise_handles(exercise_id, handle_id)` (UNIQUE)
- `exercise_grips(exercise_id, grip_id)` (PRIMARY KEY)
- `exercise_handle_grips(exercise_id, handle_id, grip_id)` (UNIQUE)

### Important Indexes:
- `exercises.slug` (btree)
- `exercises.equipment_id` (btree)
- `exercises.primary_muscle_id` (btree)
- `exercises.movement_id` (btree)
- `exercises.display_name_tsv` (gin) - for full-text search
- `exercises_translations.exercise_id` (btree)
- `exercises_translations.language_code` (btree)

## Cascade Behaviors:

### ON DELETE CASCADE:
- All translation tables cascade delete when parent is deleted
- This ensures no orphaned translation records

### ON DELETE RESTRICT (default):
- Most relationship tables restrict deletion if references exist
- Prevents accidental data loss from broken relationships