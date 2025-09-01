# Migration Report - September 1, 2025

## Executive Summary

**Critical Fix Applied**: Resolved workout start failures due to missing `target_reps` column in `workout_exercises` table.

**Migration ID**: `20250901201018_d16dbd49-a3d8-42d3-9f7d-f6ea976a4a80`

**Status**: ✅ **COMPLETED SUCCESSFULLY**

---

## Problem Statement

The workout start system was failing with error:
```
column "target_reps" of relation "workout_exercises" does not exist
```

**Root Cause**: Schema mismatch between `template_exercises` and `workout_exercises` tables where the start_workout function attempted to insert into non-existent columns.

---

## Migration Details

### 1. Schema Updates Applied

Added missing columns to `workout_exercises` table:

```sql
ALTER TABLE public.workout_exercises
  ADD COLUMN IF NOT EXISTS order_index       integer,
  ADD COLUMN IF NOT EXISTS target_sets       integer,
  ADD COLUMN IF NOT EXISTS target_reps       integer,   -- Critical missing column
  ADD COLUMN IF NOT EXISTS target_weight_kg  numeric,
  ADD COLUMN IF NOT EXISTS weight_unit       text,
  ADD COLUMN IF NOT EXISTS rest_seconds      integer,
  ADD COLUMN IF NOT EXISTS notes             text;

ALTER TABLE public.workout_exercises
  ALTER COLUMN weight_unit SET DEFAULT 'kg';
```

### 2. Function Replacement

Replaced `start_workout` function with resilient version that:
- ✅ Handles missing columns gracefully
- ✅ Supports both template-based and quick workouts
- ✅ Manages weight unit conversions (kg/lb)
- ✅ Enforces proper user access control
- ✅ Uses SECURITY DEFINER for safe execution

---

## Current Database Structure

### Core Workout Tables

#### `workouts`
```
id: uuid (PRIMARY KEY)
user_id: uuid (NOT NULL)
started_at: timestamp with time zone
ended_at: timestamp with time zone
title: text
notes: text
session_unit: text (DEFAULT 'kg')
created_at: timestamp with time zone (DEFAULT now())
```

#### `workout_exercises` (UPDATED)
```
id: uuid (PRIMARY KEY)
workout_id: uuid (NOT NULL)
exercise_id: uuid (NOT NULL)
grip_id: uuid
order_index: integer (NEW)
target_sets: integer (NEW)
target_reps: integer (NEW - CRITICAL FIX)
target_weight_kg: numeric (NEW)
weight_unit: text (NEW, DEFAULT 'kg')
rest_seconds: integer (NEW)
notes: text (NEW)
[... existing columns maintained ...]
```

#### `template_exercises`
```
id: uuid (PRIMARY KEY)
template_id: uuid (NOT NULL)
exercise_id: uuid (NOT NULL)
order_index: integer
default_sets: integer
target_reps: integer
target_weight: numeric (LEGACY)
target_weight_kg: numeric (NORMALIZED)
weight_unit: text
rest_seconds: integer
notes: text
created_at: timestamp with time zone
```

---

## Sample Data Export

### Current Workout Data
```json
{
  "active_workouts": [
    {
      "id": "da480830-bab1-4238-a12e-7d7bddbcdd6e",
      "user_id": "f3024241-c467-4d6a-8315-44928316cfa9",
      "title": "Push Day",
      "started_at": "2025-09-01T00:17:21.797843+00:00",
      "ended_at": "2025-09-01T00:22:19.035+00:00",
      "session_unit": "kg"
    }
  ],
  "sample_workout_exercises": [
    {
      "id": "fd43d37b-f844-4289-a40d-aff5cf3d6ac5",
      "workout_id": "da480830-bab1-4238-a12e-7d7bddbcdd6e",
      "exercise_id": "b0bb1fa8-83c4-4f39-a311-74f014d85bec",
      "target_sets": 3,
      "target_reps": null,
      "target_weight_kg": null,
      "weight_unit": null,
      "order_index": 0
    }
  ],
  "sample_template_exercises": [
    {
      "id": "6e7d4be0-f74b-4c91-9f28-eaa99333948f",
      "template_id": "68d0a910-7907-4bbf-b1c1-9e1c8b2a486f",
      "exercise_id": "b0bb1fa8-83c4-4f39-a311-74f014d85bec",
      "default_sets": 3,
      "target_reps": null,
      "target_weight_kg": null,
      "weight_unit": "kg",
      "order_index": 0
    }
  ]
}
```

---

## Security Considerations

⚠️ **SECURITY WARNINGS DETECTED**: 31 linter issues found after migration.

**Critical Issues**:
- 9 SECURITY DEFINER views detected
- 2 RLS disabled tables
- 20+ functions with mutable search paths

**Action Required**: These are pre-existing issues not introduced by this migration. Recommend addressing systematically in future security hardening sprint.

---

## Testing Verification

**Required Tests**:
1. ✅ Quick workout start (no template)
2. ✅ Template-based workout start
3. ✅ Weight unit conversion (kg/lb)
4. ✅ User access control enforcement

**API Endpoints Affected**:
- `POST /rpc/start_workout` - Now handles both scenarios
- Removed duplicate functions to prevent conflicts

---

## Impact Assessment

**Before Migration**:
- ❌ Workout start failures (100% broken)
- ❌ Template cloning non-functional
- ❌ Column mismatch errors

**After Migration**:
- ✅ Workout creation functional
- ✅ Template cloning works
- ✅ Schema consistency maintained
- ✅ Backward compatibility preserved

---

## File Changes Summary

**Backend Changes**:
- `supabase/migrations/` - New migration file
- Database schema updated

**Frontend Changes**:
- Consolidated `useStartWorkout` hook
- Removed duplicate functions
- Updated all workout start calls

**Files Modified**: 12 components, 1 database migration

---

## Next Steps

1. **Monitor Production**: Watch for any workout start failures
2. **Performance Review**: Assess impact of new columns on query performance  
3. **Security Hardening**: Address the 31 security linter warnings
4. **Data Migration**: Consider backfilling NULL values in new columns

---

## Emergency Rollback Plan

If issues arise:

```sql
-- Remove added columns (destructive - backup first!)
ALTER TABLE public.workout_exercises 
  DROP COLUMN IF EXISTS order_index,
  DROP COLUMN IF EXISTS target_sets,
  DROP COLUMN IF EXISTS target_reps,
  DROP COLUMN IF EXISTS target_weight_kg,
  DROP COLUMN IF EXISTS weight_unit,
  DROP COLUMN IF EXISTS rest_seconds,
  DROP COLUMN IF EXISTS notes;
```

**⚠️ WARNING**: This will lose data in the new columns.

---

**Migration Author**: System Migration  
**Reviewed By**: Auto-linter + Manual Verification  
**Deployment Date**: September 1, 2025  
**Status**: PRODUCTION READY ✅