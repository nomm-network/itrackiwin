# Database Structure Overview - Updated

## Core Exercise Tables

### `exercises`
**Purpose**: Main exercise definitions
**Key Columns**: 
- `id`, `slug`, `display_name`, `custom_display_name`
- `equipment_id` (FK to equipment)
- `primary_muscle_id` (FK to muscle_groups)  
- `movement_id` (FK to movement_patterns)
- `owner_user_id` (NULL for public exercises)
- `is_public`, `popularity_rank`
- `load_type`, `requires_handle`, `allows_grips`
- `default_handle_ids[]`, `default_grip_ids[]`

### `exercises_translations`
**Purpose**: Multilingual exercise names/descriptions
**Key Columns**: `exercise_id`, `language_code`, `name`, `description`

## Equipment & Tools

### `equipment`
**Purpose**: Exercise equipment definitions (barbells, machines, etc.)
**Key Columns**: `id`, `slug`, `load_type`, `equipment_type`, `default_stack`, `weight_kg`

### `equipment_translations`
**Purpose**: Multilingual equipment names
**Key Columns**: `equipment_id`, `language_code`, `name`, `description`

### `handles`
**Purpose**: Handle types for equipment (straight bar, EZ bar, etc.)
**Key Columns**: `id`, `slug`

### `handle_translations`
**Purpose**: Multilingual handle names
**Key Columns**: `handle_id`, `language_code`, `name`, `description`

### `grips`
**Purpose**: Grip orientations (overhand, underhand, neutral, mixed)
**Key Columns**: `id`, `slug`, `category`

### `grips_translations`
**Purpose**: Multilingual grip names
**Key Columns**: `grip_id`, `language_code`, `name`

## Compatibility & Relationships

### `handle_equipment`
**Purpose**: Which handles work with which equipment
**Key Columns**: `handle_id`, `equipment_id`, `is_default`

### `handle_grip_compatibility`
**Purpose**: Which grips work with which handles
**Key Columns**: `handle_id`, `grip_id`

### `equipment_handle_grips`
**Purpose**: Three-way mapping with defaults
**Key Columns**: `equipment_id`, `handle_id`, `grip_id`, `is_default`

### `exercise_handles`
**Purpose**: Available handles per exercise
**Key Columns**: `exercise_id`, `handle_id`, `is_default`

### `exercise_grips`
**Purpose**: Available grips per exercise
**Key Columns**: `exercise_id`, `grip_id`, `is_default`, `order_index`

### `exercise_default_grips`
**Purpose**: Default grip selections per exercise
**Key Columns**: `exercise_id`, `grip_id`, `order_index`

## Body Taxonomy

### `body_parts`
**Purpose**: Major body regions (Upper Body, Lower Body, etc.)
**Key Columns**: `id`, `slug`

### `muscle_groups`
**Purpose**: Muscle group definitions (Chest, Back, Legs, etc.)
**Key Columns**: `id`, `slug`, `body_part_id`

### `movement_patterns`
**Purpose**: Movement classifications (Press, Pull, Hinge, Squat, etc.)
**Key Columns**: `id`, `slug`, `category`

## Workout Implementation

### `workout_templates`
**Purpose**: Saved workout templates
**Key Columns**: `id`, `user_id`, `name`, `notes`

### `template_exercises`
**Purpose**: Exercises within templates
**Key Columns**: `template_id`, `exercise_id`, `handle_id`, `grip_ids[]`, `order_index`, `default_sets`, `target_reps`

### `workouts`
**Purpose**: Active workout sessions
**Key Columns**: `id`, `user_id`, `started_at`, `ended_at`, `title`

### `workout_exercises`
**Purpose**: Exercises within workout sessions
**Key Columns**: `workout_id`, `exercise_id`, `handle_id`, `grip_ids[]`, `grip_key`, `order_index`

### `workout_sets`
**Purpose**: Individual sets within exercises
**Key Columns**: `workout_exercise_id`, `set_index`, `weight`, `reps`, `set_kind`, `is_completed`

## User Data

### `users`
**Purpose**: User profiles and settings
**Key Columns**: `id`, `is_pro`

### `personal_records`
**Purpose**: User PRs per exercise/grip combination
**Key Columns**: `user_id`, `exercise_id`, `kind`, `value`, `grip_key`, `achieved_at`

## Security & Access

- All tables have Row Level Security (RLS) enabled
- Public exercises: `owner_user_id IS NULL`
- User exercises: `owner_user_id = auth.uid()`
- Admin-only tables: `is_admin(auth.uid())` policies
- Public read access for reference data (equipment, grips, etc.)

## Key Design Principles

1. **Grip Simplification**: Only 4 orientation-based grips
2. **Compatibility-Driven**: Equipment determines available handles/grips
3. **Multilingual**: All user-facing content translatable
4. **User-Owned**: Users can create custom exercises
5. **Backward Compatible**: Existing workout data preserved