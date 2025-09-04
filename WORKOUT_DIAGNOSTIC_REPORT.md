# Workout System Diagnostic Report
**Generated:** 2025-01-04 14:04 UTC  
**Issue:** Workouts not starting again

## Executive Summary
- **CRITICAL ISSUE IDENTIFIED:** New workout exercises created with NULL target_weight_kg values
- **Root Cause:** `start_workout` RPC copies template exercises but template_exercises have NULL target_weight_kg
- **Impact:** UI shows empty targets, warmup calculation fails
- **Status:** Multiple workouts exist but latest workout (8c647ea0) has broken exercise data

## Database Tables Row Counts
| Table | Count | Status |
|-------|-------|--------|
| workouts | 3 | ✅ Has data |
| workout_exercises | 18 | ⚠️ Recent exercises have NULL targets |
| workout_sets | 36 | ✅ Has completed sets |
| workout_templates | 1 | ✅ Has template |
| template_exercises | 6 | ⚠️ All have NULL target_weight_kg |

## Current Workout State Analysis

### Latest Workout (8c647ea0-18b9-4a5a-8a0b-c37860df15f5)
- **Status:** ACTIVE (no ended_at)
- **Started:** 2025-09-04 14:02:16
- **User:** f3024241-c467-4d6a-8315-44928316cfa9
- **Template:** 4c3df220-64d3-43c2-8345-00a087ec3af4
- **Readiness Score:** 72

### Broken Exercise Data in Latest Workout
**ALL 6 exercises have NULL target_weight_kg:**
```
Exercise 1 (7dc0ef00): target_weight_kg=NULL, target_reps=10
Exercise 2 (8a6685c2): target_weight_kg=NULL, target_reps=10  
Exercise 3 (4ebb0d3c): target_weight_kg=NULL, target_reps=10
Exercise 4 (2f7240d5): target_weight_kg=NULL, target_reps=10
Exercise 5 (a41ac6a1): target_weight_kg=NULL, target_reps=10
Exercise 6 (6075c7cc): target_weight_kg=NULL, target_reps=10
```

## Template Data Analysis

### Template 4c3df220-64d3-43c2-8345-00a087ec3af4 ("Quads, Back & Biceps")
**ALL 6 template exercises have NULL target_weight_kg:**
```
template_exercise 3fcd45e5: exercise_id=7dc0ef00, target_weight_kg=NULL
template_exercise 8f8ee5d7: exercise_id=8a6685c2, target_weight_kg=NULL
template_exercise 9ebc2601: exercise_id=4ebb0d3c, target_weight_kg=NULL
template_exercise 5c342222: exercise_id=2f7240d5, target_weight_kg=NULL
template_exercise 86a59015: exercise_id=a41ac6a1, target_weight_kg=NULL
template_exercise 48f1a3b9: exercise_id=6075c7cc, target_weight_kg=NULL
```

## Working vs Broken Comparison

### Previous Working Workout (396c96b9 - September 2nd)
- **Status:** COMPLETED ✅
- **Target weights:** Properly set (60kg, etc.)
- **Warmup plans:** Generated and working
- **Sets logged:** 6 complete sets

### Current Broken Workout (8c647ea0 - September 4th)  
- **Status:** ACTIVE but BROKEN ❌
- **Target weights:** ALL NULL
- **Warmup plans:** NULL (can't calculate without targets)
- **Sets logged:** 0 sets

## Database Functions Analysis

### start_workout RPC Function
```sql
INSERT INTO public.workout_exercises
  (workout_id, exercise_id, order_index, target_sets, target_reps, target_weight_kg, weight_unit, notes)
SELECT
  v_workout,
  te.exercise_id,
  te.order_index,
  te.default_sets,
  te.target_reps,
  te.target_weight_kg,  -- ❌ THIS IS NULL IN TEMPLATE
  COALESCE(te.weight_unit, 'kg'),
  te.notes
FROM public.template_exercises te
WHERE te.template_id = p_template_id
```

**PROBLEM:** Function copies NULL target_weight_kg from template_exercises directly to workout_exercises.

### get_last_sets_for_exercises RPC Function
```sql
SELECT DISTINCT ON (we.exercise_id)
  we.exercise_id,
  ws.weight_kg as prev_weight_kg,
  ws.reps as prev_reps,
  to_char(ws.completed_at, 'YYYY-MM-DD') as prev_date,
  ws.weight_kg as base_weight_kg,  -- ❌ INCORRECT FIELD
  1.0::numeric as readiness_multiplier
```

**PROBLEM:** Function uses `ws.weight_kg` for `base_weight_kg` but should use historical base weight calculation.

## UI Code Analysis

### Frontend Target Calculation
The `pickFirstSetTarget` function expects:
```javascript
serverTargetKg: ex.target_weight_kg,           // ❌ NULL from DB
lastGoodBaseKg: lastRow?.base_weight_kg,       // ❌ Same as prev_weight_kg  
readinessMultiplier: lastRow?.readiness_multiplier, // Always 1.0
```

**Result:** All NULL inputs = NULL target = Empty UI

## Critical Issues Found

### 🚨 Issue 1: Template Data Corruption
- **Problem:** All template_exercises have NULL target_weight_kg
- **Impact:** New workouts start with no targets
- **Fix Required:** Populate template_exercises.target_weight_kg with actual values

### 🚨 Issue 2: Invalid Base Weight Calculation  
- **Problem:** get_last_sets_for_exercises returns working weight as base weight
- **Impact:** No progression calculation possible
- **Fix Required:** Calculate true base weight from historical performance

### 🚨 Issue 3: Missing Readiness Integration
- **Problem:** Readiness multiplier hardcoded to 1.0
- **Impact:** No readiness-based weight adjustment
- **Fix Required:** Implement proper readiness scoring

### 🚨 Issue 4: Database Field Mismatch
- **Problem:** workout_sets uses `weight_kg` but UI expects `weight` 
- **Impact:** Data retrieval inconsistencies
- **Fix Required:** Standardize field names

## Database Security Issues
**42 Linter Warnings Found** (mostly security definer views)
- Multiple security definer views detected
- RLS policy concerns
- Need security review

## Immediate Action Required

### 1. Fix Template Data (CRITICAL)
```sql
UPDATE template_exercises 
SET target_weight_kg = 60.0 
WHERE template_id = '4c3df220-64d3-43c2-8345-00a087ec3af4';
```

### 2. Fix Current Workout
```sql  
UPDATE workout_exercises 
SET target_weight_kg = 60.0
WHERE workout_id = '8c647ea0-18b9-4a5a-8a0b-c37860df15f5';
```

### 3. Fix get_last_sets_for_exercises RPC
Need to implement proper base weight calculation from user's PR history.

## Data Exports

### Workouts Table
```
ID: 8c647ea0-18b9-4a5a-8a0b-c37860df15f5
- created_at: 2025-09-04 14:02:16.258249+00
- started_at: 2025-09-04 14:02:16.258249+00  
- ended_at: NULL (ACTIVE)
- user_id: f3024241-c467-4d6a-8315-44928316cfa9
- template_id: 4c3df220-64d3-43c2-8345-00a087ec3af4
- readiness_score: 72

ID: 73a6f445-72d8-4817-bd06-e1ec8927c931
- created_at: 2025-09-02 12:02:47.477879+00
- ended_at: 2025-09-02 13:11:37.163+00 (COMPLETED)
- readiness_score: 69

ID: 396c96b9-6865-4252-b884-85bb02683614  
- created_at: 2025-09-02 02:31:31.996969+00
- ended_at: 2025-09-02 02:46:38.769+00 (COMPLETED)
- readiness_score: 69
```

### Workout Schema
```
workout_exercises columns:
- id (uuid, NOT NULL)
- workout_id (uuid, NOT NULL) 
- exercise_id (uuid, NOT NULL)
- target_weight_kg (numeric, NULLABLE) ⚠️
- target_reps (integer, NULLABLE)
- display_name (text, NULLABLE)
- warmup_plan (jsonb, NULLABLE)

workout_sets columns:  
- id (uuid, NOT NULL)
- workout_exercise_id (uuid, NOT NULL)
- weight_kg (numeric, NULLABLE) ⚠️
- weight (numeric, NULLABLE) ⚠️
- reps (integer, NULLABLE)
- completed_at (timestamp, NULLABLE)
```

## Conclusion
**The workout system is broken due to NULL target weights in template data. The start_workout RPC blindly copies these NULL values, making new workouts unusable. Immediate database fixes are required before any UI changes will work.**