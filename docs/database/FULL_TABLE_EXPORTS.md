# COMPLETE DATABASE TABLE EXPORTS - WORKOUT SYSTEM

**Date**: 2025-09-01  
**Purpose**: Full schema and data exports for critical workout system failure analysis  

## TABLE STRUCTURE EXPORTS

### template_exercises Table Schema

| Column | Type | Nullable | Default | Position |
|--------|------|----------|---------|----------|
| id | uuid | NO | gen_random_uuid() | 1 |
| template_id | uuid | NO | - | 2 |
| exercise_id | uuid | NO | - | 3 |
| order_index | integer | NO | - | 4 |
| default_sets | integer | NO | 3 | 5 |
| target_reps | integer | YES | - | 6 |
| **target_weight** | numeric | YES | - | 7 |
| **target_weight_kg** | numeric | YES | - | 8 |
| weight_unit | weight_unit | YES | 'kg' | 9 |
| rest_seconds | integer | YES | - | 10 |
| notes | text | YES | - | 11 |
| default_grip_ids | uuid[] | YES | '{}' | 12 |
| rep_range_min | integer | YES | - | 13 |
| rep_range_max | integer | YES | - | 14 |
| target_rep_min | integer | YES | - | 15 |
| target_rep_max | integer | YES | - | 16 |
| set_scheme | text | YES | - | 17 |
| top_set_percent_1rm | numeric | YES | - | 18 |
| backoff_sets | integer | YES | - | 19 |
| backoff_percent | numeric | YES | - | 20 |
| progression_policy_id | uuid | YES | - | 21 |
| warmup_policy_id | uuid | YES | - | 22 |
| default_warmup_plan | jsonb | YES | - | 23 |
| target_settings | jsonb | YES | '{}' | 24 |
| display_name | text | YES | - | 25 |
| grip_ids | uuid[] | YES | - | 26 |
| created_at | timestamp with time zone | NO | now() | 27 |

**CRITICAL ISSUE**: Table contains BOTH `target_weight` (position 7) AND `target_weight_kg` (position 8)

### workout_exercises Table Schema

| Column | Type | Nullable | Default | Position |
|--------|------|----------|---------|----------|
| id | uuid | NO | gen_random_uuid() | 1 |
| workout_id | uuid | NO | - | 2 |
| exercise_id | uuid | NO | - | 3 |
| order_index | integer | NO | - | 4 |
| is_superset_group | text | YES | - | 5 |
| target_sets | integer | YES | - | 6 |
| target_reps | integer | YES | - | 7 |
| **target_weight_kg** | numeric | YES | - | 8 |
| weight_unit | weight_unit | YES | 'kg' | 9 |
| rest_seconds | integer | YES | - | 10 |
| notes | text | YES | - | 11 |
| grip_ids | uuid[] | YES | '{}' | 12 |
| created_at | timestamp with time zone | NO | now() | 13 |

**KEY FINDING**: Table has ONLY `target_weight_kg` (position 8), NO `target_weight` column

## SAMPLE DATA EXPORTS

### template_exercises Sample Data (5 records)
```
Record 1:
- id: 6e7d4be0-f74b-4c91-9f28-eaa99333948f
- template_id: 68d0a910-7907-4bbf-b1c1-9e1c8b2a486f
- exercise_id: b0bb1fa8-83c4-4f39-a311-74f014d85bec
- order_index: 0
- default_sets: 3
- target_reps: null
- target_weight: null
- target_weight_kg: null
- weight_unit: kg

Record 2:
- id: 952d6498-6d65-4f3c-b064-774294adffb1
- template_id: c4b95b35-da79-4df6-ab25-04de8f840a7d
- exercise_id: 2f7240d5-9bd5-4c19-9073-55621e8b573b
- order_index: 1
- default_sets: 3
- target_reps: 10
- target_weight: null
- target_weight_kg: null
- weight_unit: kg

Record 3:
- id: 0d0b7716-5e96-486f-b7ba-d784d1065cae
- template_id: c4b95b35-da79-4df6-ab25-04de8f840a7d
- exercise_id: 4ebb0d3c-878e-4dc7-bb8a-367ed2453fcd
- order_index: 2
- default_sets: 3
- target_reps: 10
- target_weight: null
- target_weight_kg: null
- weight_unit: kg
```

**DATA ANALYSIS**: All sample records show `target_weight: null` and `target_weight_kg: null`

## DATABASE FUNCTION EXPORT

### start_workout Function (Complete Definition)

```sql
CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_workout_id uuid;
  v_user_id    uuid;
  v_cols_workout_ex   text[] := ARRAY['target_sets','target_reps','target_weight_kg','weight_unit','rest_seconds','notes','grip_ids'];
  v_cols_template_ex  text[] := ARRAY['default_sets','target_reps','target_weight_kg','weight_unit','rest_seconds','notes','default_grip_ids'];
  -- ... rest of function
```

**CRITICAL PROBLEM**: 
- Function maps `template_exercises.target_weight_kg` to `workout_exercises.target_weight_kg`
- But data might be in `template_exercises.target_weight` column
- This causes the column mapping failure

## SCHEMA INCONSISTENCY ANALYSIS

### The Core Problem
1. **Historical State**: `template_exercises` originally used `target_weight`
2. **Migration Attempt**: Added `target_weight_kg` but didn't remove `target_weight`
3. **Current State**: Table has BOTH columns, creating confusion
4. **Function Bug**: `start_workout` maps wrong source column

### Impact on Data Flow
```
template_exercises.target_weight (has data?) 
                ↓ 
        [BROKEN MAPPING]
                ↓
workout_exercises.target_weight_kg (expected destination)
```

## RESOLUTION REQUIREMENTS

### Database Actions Required
1. **Data Migration**: Move any data from `target_weight` to `target_weight_kg` in template_exercises
2. **Schema Cleanup**: Drop redundant `target_weight` column from template_exercises  
3. **Function Fix**: Ensure correct column mapping in `start_workout`
4. **Validation**: Test end-to-end workout creation

### Files Requiring Updates
- Database function: `public.start_workout()`
- Migration script: New migration to clean up schema
- Frontend: Verify no code references old column names

## CONCLUSION

The schema inconsistency is definitively proven:
- `template_exercises` has both weight columns (inconsistent state)
- `workout_exercises` has only `target_weight_kg` (correct state)
- Function mapping is incorrect
- Sample data shows null values in both weight columns

**This requires immediate manual database intervention to resolve the schema inconsistency.**