# Database Schema Documentation

## Exercise Management Tables

### exercises
Primary table for exercise definitions.

**Columns:**
- `id` (uuid, NOT NULL, default: gen_random_uuid())
- `owner_user_id` (uuid, nullable)
- `is_public` (boolean, NOT NULL, default: true)
- `created_at` (timestamp with time zone, NOT NULL, default: now())
- `image_url` (text, nullable)
- `thumbnail_url` (text, nullable)
- `source_url` (text, nullable)
- `popularity_rank` (integer, nullable)
- `body_part_id` (uuid, nullable)
- `primary_muscle_id` (uuid, nullable)
- `equipment_id` (uuid, NOT NULL)
- `secondary_muscle_group_ids` (uuid[], nullable)
- `default_grip_ids` (uuid[], nullable, default: '{}')
- `capability_schema` (jsonb, nullable, default: '{}')
- `exercise_skill_level` (exercise_skill_level, nullable, default: 'medium')
- `complexity_score` (smallint, nullable, default: 3)
- `contraindications` (jsonb, nullable, default: '[]')
- `loading_hint` (text, nullable)
- `default_bar_weight` (numeric, nullable)
- `default_handle_ids` (uuid[], nullable)
- `is_bar_loaded` (boolean, NOT NULL, default: false)
- `slug` (text, NOT NULL)
- `load_type` (load_type, nullable)
- `default_bar_type_id` (uuid, nullable)
- `requires_handle` (boolean, nullable, default: false)
- `allows_grips` (boolean, nullable, default: true)
- `is_unilateral` (boolean, nullable, default: false)
- `attribute_values_json` (jsonb, NOT NULL, default: '{}')
- **`movement_id` (uuid, nullable)** ⚠️ CRITICAL FIELD
- **`equipment_ref_id` (uuid, nullable)**
- `display_name` (text, nullable)
- `custom_display_name` (text, nullable)
- `name_locale` (text, nullable, default: 'en')
- **`movement_pattern_id` (uuid, nullable)** ⚠️ CRITICAL FIELD
- `name_version` (integer, nullable)
- `tags` (text[], nullable, default: '{}')
- `display_name_tsv` (tsvector, nullable)

### movements
Contains specific movement definitions within movement patterns.

**Columns:**
- `id` (uuid, NOT NULL, default: gen_random_uuid())
- `slug` (text, NOT NULL)
- `movement_pattern_id` (uuid, NOT NULL)
- `created_at` (timestamp with time zone, NOT NULL, default: now())

**Sample Data:**
```
d217303d-0dcb-4a79-a8ad-128573468aa0 | horizontal_push | 02024706-63ca-4f34-a4d6-7df57a6d6899
0c64f081-5cb8-4682-8395-315d5533362c | vertical_push   | 02024706-63ca-4f34-a4d6-7df57a6d6899
c13388d5-e568-4166-9081-8b5b4e8ebc53 | dip             | 02024706-63ca-4f34-a4d6-7df57a6d6899
ca668456-ce04-4627-bb30-73883705a252 | front_raise     | 02024706-63ca-4f34-a4d6-7df57a6d6899
2e21de7b-1f20-480f-b796-3bc8608ed8d6 | lateral_raise   | 02024706-63ca-4f34-a4d6-7df57a6d6899
```

### movement_patterns
High-level movement pattern categories.

**Columns:**
- `id` (uuid, NOT NULL, default: gen_random_uuid())
- `slug` (text, NOT NULL)
- `created_at` (timestamp with time zone, NOT NULL, default: now())

**Sample Data:**
```
02024706-63ca-4f34-a4d6-7df57a6d6899 | push
ac7157d7-4324-4a40-b98f-5183e47eed32 | pull
640e7fb0-6cc5-448a-b822-409f05ee68e9 | squat
5f6e3748-14e6-4537-b76b-4081e7c995f1 | hinge
e75c9e9a-55ef-4cc1-b0b5-dafbd9704a1b | lunge
```

### equipment
Equipment definitions and specifications.

**Columns:**
- `id` (uuid, NOT NULL, default: gen_random_uuid())
- `slug` (text, nullable)
- `created_at` (timestamp with time zone, NOT NULL, default: now())
- `equipment_type` (text, NOT NULL, default: 'machine')
- `default_stack` (jsonb, nullable, default: '[]')
- `weight_kg` (numeric, nullable)
- `kind` (text, nullable)
- `load_type` (load_type, nullable, default: 'none')
- `load_medium` (load_medium, nullable, default: 'other')
- `default_bar_weight_kg` (numeric, nullable)
- `default_single_min_increment_kg` (numeric, nullable)
- `default_side_min_plate_kg` (numeric, nullable)
- `notes` (text, nullable)

**Sample Data:**
```
33a8bf6b-5832-442e-964d-3f32070ea029 | olympic-barbell | free_weight | dual_load
243fdc06-9c04-4bc1-8773-d9da7f981bc1 | cable-machine   | machine     | stack
1328932a-54fe-42fc-8846-6ead942c2b98 | dumbbell        | free_weight | single_load
```

## Relationships

- `exercises.movement_id` → `movements.id`
- `exercises.movement_pattern_id` → `movement_patterns.id`
- `exercises.equipment_id` → `equipment.id`
- `movements.movement_pattern_id` → `movement_patterns.id`

## Critical Issue Notes

⚠️ **BUG**: The `movement_id` and `movement_pattern_id` fields in the exercises table are not being saved via the admin edit form.

**Expected Flow:**
1. User selects movement pattern (e.g., "push")
2. User selects specific movement (e.g., "horizontal_push")
3. Both `movement_pattern_id` and `movement_id` should be saved to exercises table

**Current Issue:**
- Form appears to submit but these fields remain NULL in database
- Save operation may be failing silently
- Debug information not displaying to troubleshoot