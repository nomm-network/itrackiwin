# Complete Database Table Relationships

*Generated: 2025-01-29*

## Primary Data Flow Relationships

### Exercise Creation & Configuration Flow
```
movement_patterns → exercises ← equipment
      ↓                ↓           ↓
movement_patterns_  exercises_   equipment_
translations       translations translations
      ↓                ↓           ↓
   movements     →  exercises  ←  handles
                       ↓           ↓
                 exercise_handles  handle_translations
                       ↓           ↓
                 exercise_grips ← grips
                       ↓           ↓
               exercise_handle_  grips_translations
                     grips
```

### Workout Execution Flow
```
workout_templates → template_exercises
       ↓                    ↓
   workouts    ←    workout_exercises
       ↓                    ↓
readiness_checkins     workout_sets
       ↓                    ↓
  (user tracking)    personal_records
```

### User & Permission Flow
```
auth.users → profiles → user_profile_fitness
     ↓           ↓            ↓
user_roles  friendships  experience_level_configs
     ↓           ↓            ↓
admin_audit_log challenges  auto_deload_triggers
```

### Gym & Equipment Management Flow
```
gyms → gym_admins
  ↓         ↓
gym_equipment → gym_equipment_availability
  ↓                    ↓
gym_plate_inventory  user_gyms
  ↓                    ↓
user_gym_plates    user_gym_bars
```

## Core Table Dependency Matrix

### exercises (Master Entity)
**Dependencies:**
- `equipment` (required) - Equipment type for exercise
- `movement_patterns` (optional) - Movement classification
- `body_parts` (optional) - Primary body part targeted
- `muscle_groups` (optional) - Primary muscle group
- `bar_types` (optional) - Default barbell type
- `profiles` (owner) - Exercise creator/owner

**Dependents:**
- `exercises_translations` - Multi-language names
- `exercise_handles` - Compatible handles
- `exercise_grips` - Available grips
- `exercise_handle_grips` - Handle-grip combinations
- `exercise_grip_effects` - Muscle activation effects
- `exercise_similars` - Similar exercises
- `exercise_equipment_variants` - Equipment alternatives
- `exercise_aliases` - Alternative names
- `exercise_images` - Media content
- `exercise_metric_defs` - Custom metrics
- `workout_exercises` - Workout usage
- `template_exercises` - Template usage
- `personal_records` - Performance tracking

### equipment (Foundation Entity)
**Dependencies:**
- None (standalone)

**Dependents:**
- `equipment_translations` - Multi-language names
- `equipment_handle_grips` - Compatibility matrix
- `equipment_grip_defaults` - Default grips
- `equipment_handle_orientations` - Handle orientations
- `exercises` - Exercise equipment requirements
- `gym_equipment` - Gym inventory
- `handle_equipment` - Handle compatibility

### handles (Attachment System)
**Dependencies:**
- None (standalone)

**Dependents:**
- `handles_translations` - Multi-language names
- `handle_translations` - Alternative translations
- `handle_equipment` - Equipment compatibility
- `handle_grip_compatibility` - Grip compatibility
- `handle_orientation_compatibility` - Orientation rules
- `equipment_handle_grips` - Equipment compatibility
- `exercise_handles` - Exercise associations
- `exercise_handle_grips` - Exercise combinations
- `workout_exercises` - Workout selections

### grips (Hand Position System)
**Dependencies:**
- None (standalone)

**Dependents:**
- `grips_translations` - Multi-language descriptions
- `handle_grip_compatibility` - Handle compatibility
- `equipment_handle_grips` - Equipment combinations
- `exercise_grips` - Exercise availability
- `exercise_handle_grips` - Exercise combinations
- `exercise_grip_effects` - Muscle effects
- `workout_exercises` - Workout selections

### workouts (Session Management)
**Dependencies:**
- `profiles` (required) - User/owner
- `workout_templates` (optional) - Template source

**Dependents:**
- `workout_exercises` - Exercise list
- `readiness_checkins` - Pre-workout assessment
- `rest_timer_sessions` - Timing data

### workout_exercises (Exercise Configuration)
**Dependencies:**
- `workouts` (required) - Parent workout
- `exercises` (required) - Exercise performed
- `handles` (optional) - Selected handle
- `grips` (optional) - Selected grips
- `bar_types` (optional) - Selected barbell

**Dependents:**
- `workout_sets` - Individual sets
- `workout_exercise_groups` - Grouping (supersets)

### workout_sets (Performance Data)
**Dependencies:**
- `workout_exercises` (required) - Parent exercise
- `bar_types` (optional) - Barbell used

**Dependents:**
- `personal_records` - PR tracking

## Translation System Relationships

All major entities support internationalization through translation tables:

| Core Table | Translation Table | Languages Supported |
|------------|-------------------|-------------------|
| `exercises` | `exercises_translations` | Multi-language |
| `equipment` | `equipment_translations` | Multi-language |
| `handles` | `handles_translations` + `handle_translations` | Multi-language |
| `grips` | `grips_translations` | Multi-language |
| `movement_patterns` | `movement_patterns_translations` | Multi-language |
| `body_parts` | `body_parts_translations` | Multi-language |
| `muscle_groups` | `muscle_groups_translations` | Multi-language |
| `muscles` | `muscles_translations` | Multi-language |
| `life_categories` | `life_category_translations` | Multi-language |
| `life_subcategories` | `life_subcategory_translations` | Multi-language |

## User Data Relationships

### User-Owned Data
All user-specific data links to `auth.users.id` through `profiles` table:

- `workouts` → User's workout sessions
- `workout_templates` → User's saved templates
- `personal_records` → User's performance records
- `user_achievements` → User's earned achievements
- `readiness_checkins` → User's daily assessments
- `cycle_events` → User's health tracking
- `friendships` → User's social connections
- `challenge_participants` → User's challenge participation
- `user_gyms` → User's gym memberships
- `exercise_images` → User's uploaded content

### User Configuration Data
- `user_profile_fitness` → Training experience and goals
- `user_roles` → Permission levels
- `user_gym_plates` → Personal plate inventory
- `user_gym_bars` → Personal barbell preferences
- `user_gym_miniweights` → Personal accessory weights

## Administrative Relationships

### Security & Audit
- `admin_audit_log` → Administrative actions
- `user_roles` → Permission assignments
- `admin_check_rate_limit` → API protection

### System Monitoring
- `coach_logs` → AI system interactions
- `data_quality_reports` → Data integrity monitoring
- `idempotency_keys` → Request deduplication

## Backup & Migration Relationships

All major data tables have corresponding backup tables for safe migrations:

| Primary Table | Backup Table | Purpose |
|---------------|--------------|---------|
| `exercises` | `bak_exercises` | Schema migration safety |
| `exercises_translations` | `bak_exercises_translations` | Translation backup |
| `exercise_handles` | `bak_exercise_handles` | Relationship backup |
| `exercise_grips` | `bak_exercise_grips` | Relationship backup |
| `exercise_handle_grips` | `bak_exercise_handle_grips` | Complex relationship backup |
| `workouts` | `bak_workouts` | Workout data backup |
| `workout_exercises` | `bak_workout_exercises` | Exercise data backup |
| `workout_sets` | `bak_workout_sets` | Performance data backup |
| `workout_templates` | `bak_workout_templates` | Template backup |
| `template_exercises` | `bak_template_exercises` | Template exercise backup |

## Key Constraint Patterns

### Primary Keys
- All tables use UUID primary keys (`gen_random_uuid()`)
- Consistent naming: `id` column

### Foreign Key Patterns
- Most relationships are logical (not enforced by database constraints)
- User ownership: `user_id` → `auth.users.id` (via profiles)
- Exercise relationships: `exercise_id` → `exercises.id`
- Equipment relationships: `equipment_id` → `equipment.id`
- Handle relationships: `handle_id` → `handles.id`
- Grip relationships: `grip_id` → `grips.id`

### Unique Constraints
- User ownership: `(user_id, name)` for templates
- Compatibility: `(equipment_id, handle_id, grip_id)` for compatibility tables
- Translations: `(entity_id, language_code)` for translation tables
- Relationships: `(exercise_id, handle_id)` for exercise-handle mappings

### Cascade Behaviors
- Most deletes are `RESTRICT` or `SET NULL` to preserve data integrity
- User data uses `CASCADE` for complete user deletion
- Translation tables use `CASCADE` for entity deletion

## Performance Considerations

### Indexing Strategy
- Primary keys (UUID) are automatically indexed
- Foreign key columns should be indexed for joins
- Translation lookups require composite indexes on `(entity_id, language_code)`
- User-scoped queries require indexes on `user_id`
- Exercise searches require full-text search indexes

### Query Patterns
- Exercise discovery: Equipment → Handles → Grips → Exercises
- Workout execution: Template → Workout → Exercises → Sets
- Progress tracking: Sets → Personal Records → Progress Analysis
- User experience: Profile → Preferences → Customized Experience