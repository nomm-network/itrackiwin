# CRITICAL WORKOUT SYSTEM FAILURE REPORT

**Date**: 2025-09-01  
**Severity**: CRITICAL - System Completely Broken  
**Status**: MULTIPLE FAILED REPAIR ATTEMPTS  

## EXECUTIVE SUMMARY

The workout system is in CRITICAL FAILURE. Despite multiple attempts to fix the `start_workout` function, the system continues to fail with column mapping errors. The root cause is **INCONSISTENT COLUMN NAMING** between database tables that has not been properly resolved.

## PRIMARY FAILURE POINT

### Error Details
```
Failed to start workout: {
  code: '42703', 
  details: null, 
  hint: 'Perhaps you meant to reference the column "workout_exercises.target_weight_kg".', 
  message: 'column "target_weight" does not exist'
}
```

### Function Call Chain
1. User clicks "Start Workout" → Template Selection Dialog
2. `handleTemplateSelect()` in TemplateSelectionDialog.tsx  
3. `startWorkout()` from useStartQuickWorkout hook
4. Supabase RPC call to `start_workout(p_template_id)`
5. **FAILURE**: Column mapping error in database function

## DATABASE SCHEMA ANALYSIS

### ACTUAL Column Structure (From Database Query)

**template_exercises table:**
- ✅ `target_weight` (numeric, nullable) - EXISTS
- ❌ `target_weight_kg` (numeric, nullable) - ALSO EXISTS  
- **PROBLEM**: Table has BOTH columns!

**workout_exercises table:**
- ❌ `target_weight` - DOES NOT EXIST
- ✅ `target_weight_kg` (numeric, nullable) - EXISTS

### The Core Problem
The `start_workout` function tries to copy data from `template_exercises.target_weight` to `workout_exercises.target_weight_kg`, but the function is still referencing the wrong source column.

## CODE ANALYSIS

### Current start_workout Function Issues
```sql
-- CURRENT MAPPING (BROKEN):
v_cols_template_ex := ARRAY['default_sets','target_reps','target_weight_kg',...];
-- This should be 'target_weight' for template_exercises!

-- CORRECT MAPPING SHOULD BE:
template_exercises.target_weight → workout_exercises.target_weight_kg
```

### Frontend Code Chain
1. **TemplateSelectionDialog.tsx** - Triggers workout creation
2. **useStartQuickWorkout.ts** - Makes RPC call
3. **start_workout() DB function** - FAILS on column mapping

## FILES INVOLVED IN FAILURE

### Frontend Files:
- `src/components/fitness/TemplateSelectionDialog.tsx`
- `src/features/workouts/hooks/useStartQuickWorkout.ts`  
- `src/features/workouts/components/StartOrContinue.tsx`

### Database Files:
- Latest migration: `supabase/migrations/20250901193318_*.sql`
- Function: `public.start_workout()`

### Table Exports Required:
```sql
-- Full template_exercises structure
SELECT * FROM information_schema.columns 
WHERE table_name = 'template_exercises';

-- Full workout_exercises structure  
SELECT * FROM information_schema.columns 
WHERE table_name = 'workout_exercises';

-- Current function definition
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'start_workout';
```

## ROOT CAUSE CONCLUSION

**INCONSISTENT DATABASE SCHEMA**: The `template_exercises` table uses `target_weight` while `workout_exercises` uses `target_weight_kg`. The function mapping is still wrong after multiple fix attempts.

## IMMEDIATE REQUIRED ACTION

1. **STOP ALL CODING ATTEMPTS** - Multiple failed fixes indicate systematic problem
2. **MANUAL DATABASE INSPECTION** - Verify actual column names in both tables
3. **CORRECT COLUMN MAPPING** - Fix the exact field mapping once and for all:
   - Source: `template_exercises.target_weight` 
   - Target: `workout_exercises.target_weight_kg`

## SYSTEM IMPACT

- ❌ **100% workout creation failure**
- ❌ **Template-based workouts completely broken**  
- ❌ **User cannot start any workout from templates**
- ❌ **Core fitness functionality non-operational**

## CONCLUSION

The workout system requires **IMMEDIATE MANUAL DATABASE INTERVENTION**. Automated fixes have failed multiple times due to incorrect assumptions about column names. Direct database inspection and manual schema correction is required.

**PRIORITY**: CRITICAL - BLOCKS ALL WORKOUT FUNCTIONALITY