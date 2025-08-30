# Database Schema Documentation

## Core Exercise System Tables

### exercises
Main table storing exercise definitions with foreign key relationships to other entities.

**Columns:**
- `id` (uuid, PK) - Unique identifier
- `slug` (text, NOT NULL, UNIQUE) - URL-friendly identifier
- `display_name` (text) - Auto-generated or custom display name
- `custom_display_name` (text) - User-provided display name
- `movement_pattern_id` (uuid, FK) → movement_patterns(id)
- `movement_id` (uuid, FK) → movements(id)
- `equipment_id` (uuid, NOT NULL, FK) → equipment(id)
- `primary_muscle_id` (uuid, FK) → muscles(id)
- `body_part_id` (uuid, FK) → body_parts(id)
- `load_type` (load_type_enum) - How weight is loaded
- `exercise_skill_level` (exercise_skill_level) - Difficulty level
- `complexity_score` (smallint) - Numerical complexity rating
- `is_bar_loaded` (boolean) - Whether exercise uses a barbell
- `default_bar_weight` (numeric) - Default bar weight in kg
- `loading_hint` (text) - How to enter weight (per_side, total, etc.)
- `popularity_rank` (integer) - Ranking for sorting
- `tags` (text[]) - Array of tags
- `secondary_muscle_group_ids` (uuid[]) - Array of secondary muscle group IDs
- `is_public` (boolean) - Visibility flag
- `owner_user_id` (uuid) - User who created exercise
- `created_at` (timestamptz) - Creation timestamp

### movements
Table storing movement patterns with slug-based identification.

**Columns:**
- `id` (uuid, PK) - Unique identifier
- `slug` (text, NOT NULL, UNIQUE) - URL-friendly identifier
- `created_at` (timestamptz) - Creation timestamp

### movement_translations
Translation table for movement names.

**Columns:**
- `id` (uuid, PK) - Unique identifier
- `movement_id` (uuid, NOT NULL, FK) → movements(id)
- `language_code` (text, NOT NULL) - Language code (en, ro, etc.)
- `name` (text, NOT NULL) - Translated name
- `description` (text) - Translated description
- `created_at` (timestamptz) - Creation timestamp
- `updated_at` (timestamptz) - Last update timestamp
- **UNIQUE:** (movement_id, language_code)

### movement_patterns
Table storing movement pattern definitions.

**Columns:**
- `id` (uuid, PK) - Unique identifier
- `slug` (text, UNIQUE) - URL-friendly identifier
- `created_at` (timestamptz) - Creation timestamp

### movement_patterns_translations
Translation table for movement pattern names.

**Columns:**
- `id` (uuid, PK) - Unique identifier
- `movement_pattern_id` (uuid, NOT NULL, FK) → movement_patterns(id)
- `language_code` (text, NOT NULL) - Language code
- `name` (text, NOT NULL) - Translated name
- `description` (text) - Translated description
- `created_at` (timestamptz) - Creation timestamp
- `updated_at` (timestamptz) - Last update timestamp
- **UNIQUE:** (movement_pattern_id, language_code)

### equipment
Table storing equipment definitions.

**Columns:**
- `id` (uuid, PK) - Unique identifier
- `slug` (text) - URL-friendly identifier
- `equipment_type` (text) - Type of equipment
- `load_type` (load_type) - How weight is loaded
- `load_medium` (load_medium) - Medium of load application
- `weight_kg` (numeric) - Equipment weight
- `default_stack` (jsonb) - Default weight stack
- `default_bar_weight_kg` (numeric) - Default bar weight
- `default_side_min_plate_kg` (numeric) - Minimum plate weight per side
- `default_single_min_increment_kg` (numeric) - Minimum increment
- `notes` (text) - Additional notes
- `created_at` (timestamptz) - Creation timestamp

### muscles
Table storing individual muscle definitions.

**Columns:**
- `id` (uuid, PK) - Unique identifier
- `slug` (text) - URL-friendly identifier
- `created_at` (timestamptz) - Creation timestamp

### muscle_groups
Table storing muscle group definitions.

**Columns:**
- `id` (uuid, PK) - Unique identifier
- `slug` (text) - URL-friendly identifier
- `created_at` (timestamptz) - Creation timestamp

### body_parts
Table storing body part definitions.

**Columns:**
- `id` (uuid, PK) - Unique identifier
- `slug` (text) - URL-friendly identifier
- `created_at` (timestamptz) - Creation timestamp

## Key Relationships

1. **exercises → movement_patterns**: Each exercise belongs to a movement pattern
2. **exercises → movements**: Each exercise belongs to a movement type
3. **exercises → equipment**: Each exercise requires specific equipment
4. **exercises → muscles**: Each exercise targets a primary muscle
5. **exercises → body_parts**: Each exercise targets a body part
6. **exercises → muscle_groups[]**: Each exercise can target multiple secondary muscle groups

## Enums

### load_type_enum
- `dual_load` - Weight loaded on both sides (barbells)
- `single_load` - Weight loaded as single unit
- `stack` - Machine stack loading
- `none` - No additional load

### exercise_skill_level
- `low` - Beginner level
- `medium` - Intermediate level
- `high` - Advanced level

### load_medium
- `weight_plates` - Free weight plates
- `machine_stack` - Machine weight stack
- `bodyweight` - Body weight only
- `other` - Other loading method