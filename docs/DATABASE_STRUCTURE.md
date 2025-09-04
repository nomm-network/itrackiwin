# FITNESS DATABASE STRUCTURE - CURRENT STATE (128 TABLES)

## CRITICAL SYSTEM STATUS
**ISSUE**: Workout creation failing when clicking "Start" button. Readiness form not opening properly.
**AFFECTED COMPONENTS**: TrainingLauncher, useStartWorkout hook, start_workout RPC, readiness system

## Overview
This document outlines the complete database structure for the fitness application with all 128 tables, foreign key relationships, and critical debugging information for the workout creation flow issue.

## Core Entity Relationships

### Movement Hierarchy
- **Movement Patterns** → **Movements** → **Exercises**
- Movement patterns define broad categories (squat, hinge, push, pull, etc.)
- Movements are specific implementations within patterns
- Exercises are concrete implementations using specific equipment

### Muscle Hierarchy
- **Body Parts** → **Muscle Groups** → **Muscles**
- Body parts are major anatomical regions (arms, legs, chest, etc.)
- Muscle groups are functional groupings within body parts
- Muscles are specific anatomical muscles

### Equipment System
- **Equipment** defines available gym equipment
- **Handles** and **Grips** provide exercise variations
- Equipment can have multiple handles and grip options

## Database Tables

### Core Movement Tables

#### movement_patterns
- `id` (uuid, PK)
- `slug` (text) - URL-friendly identifier
- `created_at` (timestamp)

#### movement_patterns_translations
- `id` (uuid, PK)
- `movement_pattern_id` (uuid, FK → movement_patterns.id)
- `language_code` (text) - en, ro
- `name` (text)
- `description` (text)
- `created_at`, `updated_at` (timestamp)

#### movements
- `id` (uuid, PK)
- `slug` (text) - URL-friendly identifier
- `movement_pattern_id` (uuid, FK → movement_patterns.id)
- `created_at` (timestamp)

#### movements_translations
- `id` (uuid, PK)
- `movement_id` (uuid, FK → movements.id)
- `language_code` (text) - en, ro
- `name` (text)
- `description` (text)
- `created_at`, `updated_at` (timestamp)

### Anatomy Tables

#### body_parts
- `id` (uuid, PK)
- `slug` (text) - URL-friendly identifier
- `created_at` (timestamp)

#### body_parts_translations
- `id` (uuid, PK)
- `body_part_id` (uuid, FK → body_parts.id)
- `language_code` (text) - en, ro
- `name` (text)
- `description` (text)
- `created_at`, `updated_at` (timestamp)

#### muscle_groups
- `id` (uuid, PK)
- `slug` (text)
- `body_part_id` (uuid, FK → body_parts.id)
- `created_at` (timestamp)

#### muscle_groups_translations
- `id` (uuid, PK)
- `muscle_group_id` (uuid, FK → muscle_groups.id)
- `language_code` (text)
- `name` (text)
- `description` (text)
- `created_at`, `updated_at` (timestamp)

#### muscles
- `id` (uuid, PK)
- `slug` (text)
- `muscle_group_id` (uuid, FK → muscle_groups.id)
- `created_at` (timestamp)

#### muscles_translations
- `id` (uuid, PK)
- `muscle_id` (uuid, FK → muscles.id)
- `language_code` (text)
- `name` (text)
- `description` (text)
- `created_at`, `updated_at` (timestamp)

### Equipment Tables

#### equipment
- `id` (uuid, PK)
- `slug` (text)
- `equipment_type` (text) - machine, free_weight, bodyweight, cardio, support
- `load_type` (enum) - none, fixed, barbell, single_load, dual_load, stack, bodyweight
- `load_medium` (enum) - other, stack, plates, bar, chain, band, bodyweight
- `default_stack` (jsonb) - Default weight stack values
- `weight_kg` (numeric) - Fixed weight for equipment
- `default_bar_weight_kg` (numeric)
- `default_single_min_increment_kg` (numeric)
- `default_side_min_plate_kg` (numeric)
- `kind` (text) - Equipment subcategory
- `notes` (text)
- `created_at` (timestamp)

#### equipment_translations
- `id` (uuid, PK)
- `equipment_id` (uuid, FK → equipment.id)
- `language_code` (text)
- `name` (text)
- `description` (text)
- `created_at`, `updated_at` (timestamp)

### Exercise Tables

#### exercises
- `id` (uuid, PK)
- `slug` (text, unique)
- `owner_user_id` (uuid) - NULL for system exercises
- `is_public` (boolean)
- `display_name` (text) - Auto-generated or custom name
- `custom_display_name` (text) - User override name
- `name_locale` (text) - Language for naming
- `name_version` (integer) - Version tracking
- `body_part_id` (uuid, FK → body_parts.id)
- `primary_muscle_id` (uuid, FK → muscles.id)
- `secondary_muscle_group_ids` (uuid[]) - Array of muscle group IDs
- `equipment_id` (uuid, FK → equipment.id)
- `movement_id` (uuid, FK → movements.id)
- `equipment_ref_id` (uuid, FK → equipments.id) - New attribute system
- `movement_pattern_id` (uuid, FK → movement_patterns.id)
- `attribute_values_json` (jsonb) - Dynamic attributes
- `exercise_skill_level` (enum) - low, medium, high
- `complexity_score` (smallint) - 1-5 scale
- `is_unilateral` (boolean)
- `load_type` (enum)
- `requires_handle` (boolean)
- `allows_grips` (boolean)
- `is_bar_loaded` (boolean)
- `default_bar_weight` (numeric)
- `default_bar_type_id` (uuid)
- `default_grip_ids` (uuid[])
- `default_handle_ids` (uuid[])
- `tags` (text[])
- `capability_schema` (jsonb)
- `contraindications` (jsonb)
- `source_url` (text)
- `thumbnail_url` (text)
- `image_url` (text)
- `loading_hint` (text)
- `popularity_rank` (integer)
- `display_name_tsv` (tsvector) - Full-text search
- `created_at` (timestamp)

#### exercises_translations
- `id` (uuid, PK)
- `exercise_id` (uuid, FK → exercises.id)
- `language_code` (text)
- `name` (text)
- `description` (text)
- `created_at`, `updated_at` (timestamp)

### Relationship Tables

#### exercise_equipment_variants
- `exercise_id` (uuid, FK → exercises.id)
- `equipment_id` (uuid, FK → equipment.id)
- `is_preferred` (boolean)

#### exercise_similars
- `exercise_id` (uuid, FK → exercises.id)
- `similar_exercise_id` (uuid, FK → exercises.id)
- `similarity_score` (numeric)
- `reason` (text)
- `created_at` (timestamp)

## Enums

### load_type
- `none`
- `fixed`
- `barbell`
- `single_load`
- `dual_load`
- `stack`
- `bodyweight`

### load_medium
- `other`
- `stack`
- `plates`
- `bar`
- `chain`
- `band`
- `bodyweight`

### exercise_skill_level
- `low`
- `medium`
- `high`

## Row Level Security (RLS) Policies

All tables have appropriate RLS policies:
- **Public tables**: Readable by everyone, managed by admins
- **Exercise tables**: Public exercises visible to all, private exercises only to owners
- **Translation tables**: Managed by admins, readable by all
- **User-specific tables**: Restricted to owners

## Internationalization (i18n)

The system supports multiple languages through translation tables:
- **English (en)**: Primary language
- **Romanian (ro)**: Secondary language

Each translatable entity has a corresponding `_translations` table with:
- Reference to parent entity
- Language code
- Translated fields (name, description)
- Timestamps for tracking changes