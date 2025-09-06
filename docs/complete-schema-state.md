# Complete Database Schema - Handle & Grip System

## Current Schema State (2025-08-29)

### Handles System

#### handles table
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| slug | text | YES | NULL |
| created_at | timestamp with time zone | NO | now() |

**Data:** 13 handles (straight-bar, ez-curl-bar, trap-bar, swiss-bar, lat-pulldown-bar, seated-row-bar, tricep-rope, single-handle, dual-d-handle, dip-handles, pull-up-bar, parallel-bars, suspension-straps)

#### handle_translations table  
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| handle_id | uuid | NO | NULL |
| language_code | text | NO | NULL |
| name | text | NO | NULL |
| description | text | YES | NULL |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |

**Foreign Keys:**
- `handle_id` → `public.handles.id`

**Data:** Translations for all handles in EN and RO

### Grips System

#### grips table
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| slug | text | YES | NULL |
| category | text | YES | NULL |
| is_compatible_with | uuid[] | YES | '{}' |
| created_at | timestamp with time zone | NO | now() |

**Data:** 7 grips total
- Hand position: overhand, underhand, neutral, mixed
- Width: close, medium, wide

#### grips_translations table
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| grip_id | uuid | NO | NULL |
| language_code | text | NO | NULL |
| name | text | NO | NULL |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |

**Foreign Keys:**
- `grip_id` → `public.grips.id`

**Data:** Translations for all grips in EN and RO

### Exercise Relationship Tables

#### exercise_handles table
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| exercise_id | uuid | NO | NULL |
| handle_id | uuid | NO | NULL |
| is_default | boolean | NO | false |
| created_at | timestamp with time zone | NO | now() |

**Foreign Keys:**
- `exercise_id` → `public.exercises.id`
- `handle_id` → `public.handles.id`

**Data:** 0 rows (no exercises created yet)

#### exercise_grips table
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| exercise_id | uuid | NO | NULL |
| grip_id | uuid | NO | NULL |
| is_default | boolean | NO | false |
| order_index | integer | NO | 1 |
| created_at | timestamp with time zone | NO | now() |

**Primary Key:** (exercise_id, grip_id)

**Foreign Keys:**
- `exercise_id` → `public.exercises.id`
- `grip_id` → `public.grips.id`

**Data:** 0 rows (no exercises created yet)

#### exercise_handle_grips table
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| exercise_id | uuid | NO | NULL |
| handle_id | uuid | NO | NULL |
| grip_id | uuid | NO | NULL |
| created_at | timestamp with time zone | NO | now() |

**Foreign Keys:**
- `exercise_id` → `public.exercises.id`
- `handle_id` → `public.handles.id`
- `grip_id` → `public.grips.id`

**Data:** 0 rows (no exercises created yet)

### Equipment Compatibility Tables

#### equipment_handle_grips table
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| equipment_id | uuid | NO | NULL |
| handle_id | uuid | NO | NULL |
| grip_id | uuid | NO | NULL |
| is_default | boolean | NO | false |
| created_at | timestamp with time zone | NO | now() |

**Foreign Keys:**
- `equipment_id` → `public.equipment.id`
- `handle_id` → `public.handles.id`
- `grip_id` → `public.grips.id`

**Data:** 100+ rows defining which handles/grips work with which equipment

### Equipment System

#### equipment table
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| slug | text | YES | NULL |
| equipment_type | text | NO | 'machine' |
| kind | text | YES | NULL |
| load_type | load_type | YES | 'none' |
| load_medium | load_medium | YES | 'other' |
| weight_kg | numeric | YES | NULL |
| default_bar_weight_kg | numeric | YES | NULL |
| default_side_min_plate_kg | numeric | YES | NULL |
| default_single_min_increment_kg | numeric | YES | NULL |
| default_stack | jsonb | YES | '[]' |
| notes | text | YES | NULL |
| created_at | timestamp with time zone | NO | now() |

## Problem Summary

1. **Handles exist:** 13 handles with translations ✅
2. **Grips exist:** 7 grips with translations ✅  
3. **Equipment compatibility:** 100+ equipment-handle-grip mappings ✅
4. **Exercise tables:** All empty because no exercises created yet ❌
5. **HandleGripSelector:** Queries exercise_handles (empty) instead of equipment_handle_grips ❌

## Required Data Flow for New Exercises

For **new exercise creation** (before exercise exists in DB):
1. Query `equipment_handle_grips` to get available handles for selected equipment
2. When handle selected, query `equipment_handle_grips` again to get compatible grips
3. Only save to `exercise_handles`/`exercise_grips` after exercise is successfully created

For **existing exercises** (after exercise exists in DB):
1. Query `exercise_handles` to get configured handles for exercise
2. Query `exercise_grips` or fallback to `equipment_handle_grips` for grips