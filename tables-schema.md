# Database Tables Schema

This document outlines the complete schema for all tables in the fitness tracking database.

## Handle-Related Tables

### handles
- **id** (uuid, PRIMARY KEY) - Unique identifier
- **slug** (text, UNIQUE, NOT NULL) - URL-friendly identifier  
- **created_at** (timestamp, NOT NULL) - Creation timestamp

### handle_translations
- **id** (uuid, PRIMARY KEY) - Unique identifier
- **handle_id** (uuid, NOT NULL) - Foreign key to handles.id
- **language_code** (text, NOT NULL) - Language code (e.g., 'en', 'ro')
- **name** (text, NOT NULL) - Localized handle name
- **description** (text) - Localized description
- **created_at** (timestamp, NOT NULL) - Creation timestamp
- **updated_at** (timestamp, NOT NULL) - Last update timestamp
- **UNIQUE(handle_id, language_code)**

### handle_equipment
- **id** (uuid, PRIMARY KEY) - Unique identifier
- **handle_id** (uuid, NOT NULL) - Foreign key to handles.id
- **equipment_id** (uuid, NOT NULL) - Foreign key to equipment.id
- **is_preferred** (boolean, DEFAULT false) - Whether this is the preferred handle for this equipment
- **created_at** (timestamp, NOT NULL) - Creation timestamp
- **UNIQUE(handle_id, equipment_id)**

### handle_equipment_rules
- **id** (uuid, PRIMARY KEY) - Unique identifier
- **handle_id** (uuid, NOT NULL) - Foreign key to handles.id
- **equipment_type** (text) - Equipment type filter
- **equipment_kind** (text) - Equipment kind filter
- **load_type** (load_type enum) - Load type filter
- **load_medium** (load_medium enum) - Load medium filter
- **created_at** (timestamp, NOT NULL) - Creation timestamp

### handle_grip_compatibility
- **id** (uuid, PRIMARY KEY) - Unique identifier
- **handle_id** (uuid, NOT NULL) - Foreign key to handles.id
- **grip_id** (uuid, NOT NULL) - Foreign key to grips.id
- **is_default** (boolean, DEFAULT false) - Whether this is the default grip for this handle
- **created_at** (timestamp, NOT NULL) - Creation timestamp
- **UNIQUE(handle_id, grip_id)**

## Grip Tables

### grips
- **id** (uuid, PRIMARY KEY) - Unique identifier
- **slug** (text, UNIQUE, NOT NULL) - URL-friendly identifier
- **category** (text, NOT NULL) - Grip category (e.g., 'width', 'hand_position')
- **is_compatible_with** (jsonb, DEFAULT '[]') - Compatibility data
- **created_at** (timestamp, NOT NULL) - Creation timestamp

### grips_translations
- **id** (uuid, PRIMARY KEY) - Unique identifier
- **grip_id** (uuid, NOT NULL) - Foreign key to grips.id
- **language_code** (text, NOT NULL) - Language code
- **name** (text, NOT NULL) - Localized grip name
- **description** (text) - Localized description
- **created_at** (timestamp, NOT NULL) - Creation timestamp
- **updated_at** (timestamp, NOT NULL) - Last update timestamp
- **UNIQUE(grip_id, language_code)**

## Equipment Tables

### equipment
- **id** (uuid, PRIMARY KEY) - Unique identifier
- **slug** (text, UNIQUE) - URL-friendly identifier
- **equipment_type** (text, NOT NULL, DEFAULT 'machine') - Type of equipment
- **kind** (text) - Equipment subcategory
- **load_type** (load_type enum) - How weight is loaded
- **load_medium** (load_medium enum) - What provides the resistance
- **weight_kg** (numeric) - Fixed weight if applicable
- **default_bar_weight_kg** (numeric) - Default bar weight
- **default_side_min_plate_kg** (numeric) - Minimum plate weight per side
- **default_single_min_increment_kg** (numeric) - Minimum weight increment
- **default_stack** (jsonb, DEFAULT '[]') - Default weight stack
- **notes** (text) - Additional notes
- **created_at** (timestamp, NOT NULL) - Creation timestamp

### equipment_translations
- **id** (uuid, PRIMARY KEY) - Unique identifier
- **equipment_id** (uuid, NOT NULL) - Foreign key to equipment.id
- **language_code** (text, NOT NULL) - Language code
- **name** (text, NOT NULL) - Localized equipment name
- **description** (text) - Localized description
- **created_at** (timestamp, NOT NULL) - Creation timestamp
- **updated_at** (timestamp, NOT NULL) - Last update timestamp
- **UNIQUE(equipment_id, language_code)**

## Exercise Tables

### exercises
- **id** (uuid, PRIMARY KEY) - Unique identifier
- **slug** (text, UNIQUE, NOT NULL) - URL-friendly identifier
- **owner_user_id** (uuid) - User who created the exercise (NULL for system exercises)
- **is_public** (boolean, DEFAULT true) - Whether exercise is publicly visible
- **equipment_id** (uuid, NOT NULL) - Foreign key to equipment.id
- **primary_muscle_id** (uuid) - Primary muscle worked
- **body_part_id** (uuid) - Body part category
- **secondary_muscle_group_ids** (uuid[]) - Secondary muscles worked
- **movement_pattern** (movement_pattern enum) - Movement classification
- **load_type** (load_type enum) - How weight is loaded
- **exercise_skill_level** (exercise_skill_level enum, DEFAULT 'medium') - Difficulty level
- **complexity_score** (smallint, DEFAULT 3) - Complexity rating (1-10)
- **is_unilateral** (boolean, DEFAULT false) - Single-limb exercise
- **is_bar_loaded** (boolean, DEFAULT false) - Uses loaded barbell
- **requires_handle** (boolean, DEFAULT false) - Requires specific handle
- **allows_grips** (boolean, DEFAULT true) - Supports different grips
- **default_bar_weight** (numeric) - Default bar weight
- **default_bar_type_id** (uuid) - Default bar type
- **default_handle_ids** (uuid[]) - Default handles
- **default_grip_ids** (uuid[], DEFAULT '{}') - Default grips
- **contraindications** (jsonb, DEFAULT '[]') - Medical contraindications
- **capability_schema** (jsonb, DEFAULT '{}') - Equipment capability requirements
- **image_url** (text) - Exercise image URL
- **thumbnail_url** (text) - Thumbnail image URL
- **source_url** (text) - Source reference URL
- **loading_hint** (text) - Loading instructions
- **popularity_rank** (integer) - Popularity ranking
- **created_at** (timestamp, NOT NULL) - Creation timestamp

## Enums

### load_type
- `none` - No external load
- `single_load` - Single weight (dumbbells, kettlebells)
- `dual_load` - Bilateral loading (barbells with plates)
- `stack` - Weight stack machines

### load_medium
- `bodyweight` - Body weight only
- `plates` - Weight plates
- `stack` - Weight stack
- `bar` - Barbell/bar weight
- `chain` - Chains
- `band` - Resistance bands
- `flywheel` - Flywheel resistance
- `other` - Other resistance types

### movement_pattern
- `push` - Pushing movements
- `pull` - Pulling movements
- `squat` - Squatting patterns
- `hinge` - Hip hinge movements
- `carry` - Carrying/loaded carries
- `unilateral` - Single-limb movements
- `rotation` - Rotational movements
- `anti_extension` - Anti-extension (core)
- `anti_lateral` - Anti-lateral flexion
- `anti_rotation` - Anti-rotation

### exercise_skill_level
- `easy` - Beginner level
- `medium` - Intermediate level
- `hard` - Advanced level