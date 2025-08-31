# Database Constraint Analysis Report

## Current Constraint State (AFTER FIXES)

### Personal Records Table Constraints
Based on direct database query, the current constraints are:

```sql
-- ✅ CORRECT: Primary Key
CONSTRAINT personal_records_pkey 
PRIMARY KEY (id)

-- ✅ CORRECT: User Foreign Key with Cascade Delete
CONSTRAINT personal_records_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE

-- ✅ CORRECT: Exercise Foreign Key
CONSTRAINT personal_records_exercise_id_fkey 
FOREIGN KEY (exercise_id) REFERENCES exercises(id)

-- ✅ CORRECT: Workout Set Foreign Key with Set Null
CONSTRAINT personal_records_workout_set_id_fkey 
FOREIGN KEY (workout_set_id) REFERENCES workout_sets(id) ON DELETE SET NULL

-- ✅ CORRECT: Unique Constraint INCLUDING grip_key
CONSTRAINT personal_records_user_ex_kind_grip_unique 
UNIQUE (user_id, exercise_id, kind, grip_key)
```

## Constraint Evolution History

### Original Problematic Constraint (REMOVED)
```sql
-- ❌ OLD: This caused the duplicate key errors
personal_records_user_ex_kind_unique: UNIQUE (user_id, exercise_id, kind)
-- Problem: Missing grip_key column
```

### Migration Applied
```sql
-- 1. Dropped old constraint
ALTER TABLE public.personal_records DROP CONSTRAINT IF EXISTS personal_records_user_ex_kind_unique;

-- 2. Cleaned up duplicate records
DELETE FROM public.personal_records pr1
WHERE EXISTS (
  SELECT 1 FROM public.personal_records pr2
  WHERE pr2.user_id = pr1.user_id
    AND pr2.exercise_id = pr1.exercise_id
    AND pr2.kind = pr1.kind
    AND pr2.value > pr1.value
    AND pr2.id != pr1.id
);

-- 3. Added correct constraint
ALTER TABLE public.personal_records 
ADD CONSTRAINT personal_records_user_ex_kind_grip_unique 
UNIQUE (user_id, exercise_id, kind, grip_key);
```

## Function Analysis

### Database Functions Referencing Personal Records

#### ✅ CORRECT Function: upsert_prs_with_grips_after_set()
```sql
-- This function correctly uses the grip_key constraint
ON CONFLICT (user_id, exercise_id, kind, grip_key)
DO UPDATE SET 
  value = EXCLUDED.value, 
  unit = EXCLUDED.unit, 
  achieved_at = EXCLUDED.achieved_at, 
  workout_set_id = EXCLUDED.workout_set_id
WHERE EXCLUDED.value > public.personal_records.value;
```

#### ❌ PROBLEMATIC Function: upsert_prs_after_set()
```sql
-- This function uses the OLD constraint that no longer exists
ON CONFLICT (user_id, exercise_id, kind)  -- ❌ MISSING grip_key
DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit, achieved_at = EXCLUDED.achieved_at, workout_set_id = EXCLUDED.workout_set_id
WHERE EXCLUDED.value > public.personal_records.value;
```

**CRITICAL ISSUE**: The old function is trying to use `ON CONFLICT (user_id, exercise_id, kind)` but this constraint doesn't exist anymore!

## Trigger Analysis

### Current Triggers on workout_sets Table
```sql
-- ✅ CORRECT: Uses grip-aware function
CREATE TRIGGER tr_upsert_prs_with_grips_after_set 
AFTER INSERT OR UPDATE ON public.workout_sets 
FOR EACH ROW EXECUTE FUNCTION upsert_prs_with_grips_after_set()

-- ❌ BROKEN: Uses old function without grip support
CREATE TRIGGER trg_upsert_prs_after_set 
AFTER INSERT OR UPDATE ON public.workout_sets 
FOR EACH ROW EXECUTE FUNCTION upsert_prs_after_set()

-- ❌ DUPLICATE: Same as first trigger
CREATE TRIGGER upsert_prs_with_grips_trigger 
AFTER INSERT OR UPDATE ON public.workout_sets 
FOR EACH ROW EXECUTE FUNCTION upsert_prs_with_grips_after_set()
```

**CRITICAL PROBLEM**: Multiple triggers are firing on the same event, and one of them (`trg_upsert_prs_after_set`) uses the old function that references a non-existent constraint.

## Impact Analysis

### What Happens When a Set is Logged:
1. **INSERT** into `workout_sets` table
2. **THREE TRIGGERS FIRE**:
   - `tr_upsert_prs_with_grips_after_set` ✅ Succeeds
   - `trg_upsert_prs_after_set` ❌ **FAILS with constraint error**
   - `upsert_prs_with_grips_trigger` ✅ Succeeds (duplicate)
3. **TRANSACTION ROLLS BACK** due to trigger failure
4. **NO SET IS SAVED**

### Error Message Generation:
The error `"duplicate key value violates unique constraint \"personal_records_user_ex_kind_unique\""` comes from the old trigger trying to use a constraint that no longer exists.

## Resolution Strategy

### Immediate Actions Required:
1. **Remove problematic triggers**:
   ```sql
   DROP TRIGGER IF EXISTS trg_upsert_prs_after_set ON workout_sets;
   DROP TRIGGER IF EXISTS upsert_prs_with_grips_trigger ON workout_sets;
   ```

2. **Keep only the correct trigger**:
   ```sql
   -- This one should remain:
   tr_upsert_prs_with_grips_after_set
   ```

3. **Remove obsolete function**:
   ```sql
   DROP FUNCTION IF EXISTS upsert_prs_after_set();
   ```

### Verification Steps:
1. Confirm only one trigger exists on `workout_sets`
2. Test set logging functionality
3. Verify personal records are created with grip_key
4. Ensure no constraint violations occur

## Data Integrity Considerations

### Current State:
- **Personal Records**: Empty table (all previous attempts failed)
- **Workout Sets**: Empty (cannot be created due to trigger conflicts)
- **Constraints**: Properly configured for grip-aware PR tracking

### Post-Fix State:
- **Personal Records**: Will populate correctly with grip-specific PRs
- **Workout Sets**: Will save successfully
- **Data Integrity**: Maintained through proper constraint design

## Testing Requirements

### Test Cases to Verify Fix:
1. **Single Grip Set**: Log set with one grip
2. **Multiple Grip Sets**: Log sets with different grips for same exercise
3. **PR Updates**: Verify PRs update correctly for each grip combination
4. **Constraint Validation**: Ensure unique constraint works properly

### Expected Behavior:
- Sets log successfully
- Personal records created with grip_key
- Multiple grips per exercise supported
- No constraint violations
- Proper data isolation between grip types