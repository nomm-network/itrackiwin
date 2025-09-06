# DETAILED WORKOUT SYSTEM FAILURE ANALYSIS

**Date**: 2025-09-01  
**Severity**: CRITICAL  
**Status**: Multiple Failed Repair Attempts  

## EXECUTIVE SUMMARY

The workout system has suffered complete failure due to inconsistent database schema between the `template_exercises` and `workout_exercises` tables. The `start_workout` PostgreSQL function attempts to map columns that don't exist, resulting in 100% failure rate for template-based workout creation.

## ERROR DETAILS

### Primary Error
```javascript
Failed to start workout: {
  code: '42703', 
  details: null, 
  hint: 'Perhaps you meant to reference the column "workout_exercises.target_weight_kg".', 
  message: 'column "target_weight" does not exist'
}
```

### Function Call Chain
1. **Frontend**: User clicks "Start Workout" in TemplateSelectionDialog.tsx
2. **Hook**: `useStartQuickWorkout.ts` executes `startWorkout()`
3. **Supabase**: RPC call to `start_workout(p_template_id)`
4. **Database**: PostgreSQL function fails on column mapping
5. **Result**: Complete failure, workout creation aborted

## DATABASE SCHEMA ANALYSIS

### template_exercises Table Structure
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| template_id | uuid | NO | - |
| exercise_id | uuid | NO | - |
| order_index | integer | NO | - |
| default_sets | integer | NO | 3 |
| target_reps | integer | YES | - |
| **target_weight** | numeric | YES | - |
| **target_weight_kg** | numeric | YES | - |
| weight_unit | weight_unit | YES | 'kg' |
| rest_seconds | integer | YES | - |
| notes | text | YES | - |
| default_grip_ids | uuid[] | YES | '{}' |

**CRITICAL FINDING**: Table has BOTH `target_weight` AND `target_weight_kg` columns!

### workout_exercises Table Structure  
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| workout_id | uuid | NO | - |
| exercise_id | uuid | NO | - |
| order_index | integer | NO | - |
| is_superset_group | text | YES | - |
| target_sets | integer | YES | - |
| target_reps | integer | YES | - |
| **target_weight_kg** | numeric | YES | - |
| weight_unit | weight_unit | YES | 'kg' |
| rest_seconds | integer | YES | - |
| notes | text | YES | - |
| grip_ids | uuid[] | YES | '{}' |

**CRITICAL FINDING**: Table has ONLY `target_weight_kg` column!

## FUNCTION ANALYSIS

### Current start_workout Function Logic
```sql
-- COLUMN MAPPING ARRAYS (CURRENT)
v_cols_workout_ex   := ARRAY['target_sets','target_reps','target_weight_kg',...];
v_cols_template_ex  := ARRAY['default_sets','target_reps','target_weight_kg',...];
```

**PROBLEM**: Function tries to map `template_exercises.target_weight_kg` to `workout_exercises.target_weight_kg`, but the actual data is in `template_exercises.target_weight`.

### Sample Data Analysis
From `template_exercises` table:
- Most records have `target_weight_kg: null`
- Most records have `target_weight: null` 
- **Schema is inconsistent and incomplete**

## CODE IMPACT ANALYSIS

### Frontend Files Affected
- `src/components/fitness/TemplateSelectionDialog.tsx` - Triggers workout creation
- `src/features/workouts/hooks/useStartQuickWorkout.ts` - Makes RPC call
- `src/features/workouts/components/StartOrContinue.tsx` - Handles workflow

### Database Files Affected
- Latest migration: `supabase/migrations/20250901193318_*.sql`
- Function: `public.start_workout()` - Core failing function

## FAILED REPAIR ATTEMPTS

1. **Migration 20250901193318**: Attempted to standardize to `target_weight_kg`
2. **Multiple column mapping fixes**: Function still references wrong columns
3. **Schema synchronization attempts**: Inconsistencies persist

## ROOT CAUSE CONCLUSION

**FUNDAMENTAL SCHEMA INCONSISTENCY**: 
- The `template_exercises` table was designed with `target_weight` 
- The `workout_exercises` table uses `target_weight_kg`
- Migration attempts have created a hybrid state with BOTH columns in template table
- The `start_workout` function mapping is incorrect

## IMMEDIATE REQUIRED ACTIONS

### 1. Database Emergency Repair
```sql
-- Investigate actual data distribution
SELECT 
  COUNT(*) as total,
  COUNT(target_weight) as has_target_weight,
  COUNT(target_weight_kg) as has_target_weight_kg
FROM template_exercises;

-- Migrate data from target_weight to target_weight_kg if needed
-- Drop redundant column after migration
-- Update start_workout function mapping
```

### 2. Function Repair
- Fix column mapping in `start_workout` function
- Ensure `template_exercises.target_weight` maps to `workout_exercises.target_weight_kg`
- Test end-to-end workout creation flow

### 3. System Validation
- Verify schema consistency across all workout-related tables
- Test template-based workout creation
- Validate data integrity

## SYSTEM DEPENDENCIES

### Blocked Functionality
- Template-based workout creation
- Quick workout starts  
- Program-based training
- Workout progression tracking

### User Impact
- Cannot start workouts from templates
- Complete loss of structured training capability
- Data loss risk for workout attempts
- System appears completely broken to users

## CONCLUSION

This is a **CRITICAL SYSTEM FAILURE** requiring immediate manual database intervention. Automated fixes have failed multiple times due to incorrect assumptions about the schema state. Direct database inspection and surgical correction is required.

**PRIORITY**: CRITICAL - BLOCKS ALL CORE WORKOUT FUNCTIONALITY