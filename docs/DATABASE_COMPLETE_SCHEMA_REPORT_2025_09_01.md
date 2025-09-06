# COMPLETE DATABASE SCHEMA REPORT - 2025-09-01

## CRITICAL ERROR STATUS
**ERROR**: Column reference issue persists despite migration attempts.

```javascript
Failed to start workout: {
  code: '42703', 
  details: null, 
  hint: 'Perhaps you meant to reference the column "te.target_weight_kg".', 
  message: 'column te.target_weight does not exist'
}
```

**ANALYSIS**: The database function is still referencing `te.target_weight` instead of `te.target_weight_kg`, indicating:
1. Migration may not have been applied correctly
2. Old function definition still exists
3. Schema inconsistency between template_exercises and workout_exercises tables

---

## CLEANUP ACTIONS PERFORMED (2025-09-01)

### Database Migrations Applied:
1. **20250901224855**: Unified `start_workout()` function with schema-agnostic column handling
2. **20250901215533**: Cleanup of legacy workout start functions

### Frontend Cleanup:
1. **Removed Legacy Functions**:
   - `useCreateWorkoutFromTemplate()` from `useWorkoutCreationWithGrips.ts`
   - `useCloneTemplateToWorkout()` from `fitness.api.ts`
   - `useAdvancedWorkoutStart()` from `useWorkoutSuggestions.ts`

2. **Normalized Interfaces**: Created `src/features/workouts/types.ts` with unified type definitions

3. **Documentation**: Updated status documents in `/docs`

### Expected vs Actual Results:
- **Expected**: Single `start_workout()` function handling both old and new schemas
- **Actual**: Error persists, suggesting schema normalization incomplete

---

## CRITICAL SCHEMA ANALYSIS

### Template Exercises Table Structure
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| template_id | uuid | NO | - |
| exercise_id | uuid | NO | - |
| order_index | integer | NO | - |
| default_sets | integer | NO | 3 |
| target_reps | integer | YES | - |
| **target_weight_kg** | **numeric** | **YES** | **-** |
| weight_unit | text | NO | 'kg' |
| notes | text | YES | - |
| ... (25 total columns) |

### Workout Exercises Table Structure  
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| workout_id | uuid | NO | - |
| exercise_id | uuid | NO | - |
| order_index | integer | NO | - |
| target_sets | integer | YES | 3 |
| target_reps | integer | YES | - |
| **target_weight_kg** | **numeric** | **YES** | **-** |
| weight_unit | text | YES | 'kg' |
| notes | text | YES | - |
| grip_id | uuid | YES | - |
| ... (27 total columns) |

**KEY FINDING**: Both tables have `target_weight_kg` column. NO `target_weight` column exists.

---

## FOREIGN KEY RELATIONSHIPS

**STATUS**: No explicit foreign key constraints found in database.
**REASON**: RLS (Row Level Security) used instead of foreign key constraints.

Logical relationships exist:
- `template_exercises.template_id` → `workout_templates.id`
- `template_exercises.exercise_id` → `exercises.id`
- `workout_exercises.workout_id` → `workouts.id`
- `workout_exercises.exercise_id` → `exercises.id`

---

## DATA EXPORT SUMMARY

### Tables with Data:
- **workout_templates**: 1 record (Push Day template)
- **template_exercises**: 2 records (Back Extension, Lat Pulldown)
- **exercises**: 5+ records (system exercises)
- **grips**: 4 records (overhand, underhand, neutral, mixed)
- **equipment**: 10+ records (barbells, machines, etc.)

### Empty Tables (Due to Error):
- **workouts**: 0 records ❌
- **workout_exercises**: 0 records ❌

### Sample Data:
```json
// workout_templates
{
  "id": "5cf5f815-d516-4151-9216-d77e51dec8b2",
  "name": "Push Day", 
  "user_id": "f3024241-c467-4d6a-8315-44928316cfa9"
}

// template_exercises  
[
  {
    "id": "d19d0b41-0bc5-4bea-99a3-766b3f7a701d",
    "exercise_id": "a04e4569-89bf-4873-a406-0bba6b91ce6a",
    "target_reps": 10,
    "target_weight_kg": null,
    "weight_unit": "kg"
  },
  {
    "id": "745cc935-550f-4f70-8a58-690f8d72c54c", 
    "exercise_id": "4ebb0d3c-878e-4dc7-bb8a-367ed2453fcd",
    "target_reps": 10,
    "target_weight_kg": null,
    "weight_unit": "kg"
  }
]
```

---

## CURRENT FUNCTION ANALYSIS

### start_workout Function Status
**ISSUE CONFIRMED**: Function references non-existent column `te.target_weight`

```sql
-- Current function tries to access:
te.target_weight  ❌ (DOES NOT EXIST)

-- Should access:
te.target_weight_kg  ✅ (EXISTS)
```

**MIGRATION FAILURE**: Despite applying migration `20250901224855`, the function still contains incorrect column reference.

---

## RECOMMENDATIONS

1. **Immediate**: Verify which `start_workout` function is actually being called
2. **Schema Check**: Confirm `template_exercises` table column structure
3. **Migration Verification**: Ensure migrations were applied successfully
4. **Function Override**: May need to manually drop and recreate the function

---

## NEXT STEPS

1. Manual database inspection via Supabase console
2. Verify column existence in both tables
3. Check if multiple versions of `start_workout` function exist
4. Consider rollback to working state if schema corruption detected

**STATUS**: CRITICAL - Workout creation completely non-functional
**PRIORITY**: P0 - Immediate resolution required