# Unified Workout System Implementation Guide

## ✅ CRITICAL FIXES APPLIED

### 1. Database Layer Fixed
- ✅ Dropped legacy `personal_records_user_ex_kind_unique` constraint
- ✅ Created proper `personal_records_user_ex_kind_grip_key_uniq` index with NULL-safe grip_key
- ✅ Fixed all RLS policies for workout tables
- ✅ Added unified `log_workout_set()` function
- ✅ Enhanced `user_exercise_warmups` table structure

### 2. App Layer Unified
- ✅ Created `useUnifiedSetLogging` - single source of truth for set logging
- ✅ Created `useUnifiedWarmupFeedback` - single source of truth for warmup feedback

## REQUIRED MIGRATION STEPS

### Step 1: Replace All Set Logging Implementations

**REMOVE THESE FILES/HOOKS:**
- `src/hooks/useSetLogging.ts`
- `src/hooks/useWorkoutSetGrips.ts` 
- `src/features/workouts/hooks/useUnilateralSets.ts`
- `src/hooks/useAdvancedSetLogging.ts`
- `src/features/workouts/hooks/useAdvancedSetLogging.ts`

**REPLACE WITH:**
```typescript
import { useUnifiedSetLogging } from '@/hooks/useUnifiedSetLogging';

// Usage:
const { logSet, isLoading, error } = useUnifiedSetLogging();

await logSet({
  workoutExerciseId: 'uuid',
  setIndex: 1,
  metrics: {
    weight: 100,
    weight_unit: 'kg',
    reps: 8,
    rpe: 7,
    notes: 'Good set'
  },
  gripIds: ['grip-uuid-1', 'grip-uuid-2'] // optional
});
```

### Step 2: Replace All Warmup Feedback Implementations

**REMOVE THESE FILES/HOOKS:**
- `src/features/workouts/warmup/useWarmupActions.ts`
- `src/features/workouts/hooks/useWarmupManager.ts`
- `src/features/workouts/warmup/feedback.ts`
- `src/features/workouts/api/warmup.ts`

**REPLACE WITH:**
```typescript
import { useUnifiedWarmupFeedback } from '@/hooks/useUnifiedWarmupFeedback';

// Usage:
const { saveFeedback, getFeedback, isLoading, error } = useUnifiedWarmupFeedback();

await saveFeedback({
  workoutExerciseId: 'uuid',
  feedback: 'excellent', // 'not_enough' | 'excellent' | 'too_much'
  warmupSetsDone: 3,
  notes: 'Perfect warmup'
});
```

## DATA FLOW - SINGLE PATH ONLY

### Set Logging Flow (ONE PATH)
1. User completes a set
2. Call `useUnifiedSetLogging.logSet()`
3. Function calls `log_workout_set()` RPC which:
   - Inserts to `workout_sets`
   - Inserts to `workout_set_metric_values` 
   - Inserts to `workout_set_grips` (if grips provided)
4. After successful insert, automatic PR upsert to `personal_records`
5. Uses new unique constraint: `(user_id, exercise_id, kind, COALESCE(grip_key, ''))`

### Warmup Feedback Flow (ONE PATH)
1. User provides warmup feedback
2. Call `useUnifiedWarmupFeedback.saveFeedback()`
3. Function upserts to `user_exercise_warmups` table
4. Single source of truth for all warmup data

## COMPONENT UPDATES REQUIRED

### Update These Components:
1. Any component using old set logging hooks
2. Any component using old warmup feedback hooks
3. Components in `src/features/health/fitness/components/`
4. Components in workout exercise flows

### Search & Replace Patterns:
```bash
# Find old set logging usage
grep -r "useSetLogging\|useWorkoutSetGrips\|useUnilateralSets\|useAdvancedSetLogging" src/

# Find old warmup feedback usage  
grep -r "useWarmupActions\|useWarmupManager\|submitWarmupFeedback\|updateWarmupFeedback" src/
```

## VERIFICATION QUERIES

After migration, verify with these queries:

```sql
-- Check set logging works
SELECT s.id, s.workout_exercise_id, s.set_index, s.is_completed
FROM workout_sets s
JOIN workout_exercises we ON we.id = s.workout_exercise_id
JOIN workouts w ON w.id = we.workout_id
WHERE w.user_id = auth.uid()
ORDER BY s.created_at DESC LIMIT 5;

-- Check metric values
SELECT smv.*, md.slug, md.value_type
FROM workout_set_metric_values smv
JOIN metric_defs md ON md.id = smv.metric_def_id
WHERE smv.workout_set_id = 'recent-set-id';

-- Check PRs
SELECT pr.*, e.display_name
FROM personal_records pr
JOIN exercises e ON e.id = pr.exercise_id
WHERE pr.user_id = auth.uid()
ORDER BY pr.achieved_at DESC LIMIT 5;

-- Check warmup feedback
SELECT * FROM user_exercise_warmups
WHERE user_id = auth.uid()
ORDER BY updated_at DESC LIMIT 5;
```

## CRITICAL SUCCESS FACTORS

1. **ZERO TOLERANCE**: No parallel implementations allowed
2. **ONE WRITE PATH**: All sets go through `useUnifiedSetLogging` only
3. **ONE FEEDBACK PATH**: All warmup feedback goes through `useUnifiedWarmupFeedback` only
4. **PROPER ERROR HANDLING**: Both hooks have comprehensive error states
5. **TYPE SAFETY**: Full TypeScript coverage for all interfaces

## ROLLBACK PLAN

If issues occur:
1. Restore database to pre-migration state
2. Revert to previous hook implementations
3. Debug specific constraint violations
4. Re-apply fixes incrementally

---

**Status: DATABASE READY ✅ | APP MIGRATION REQUIRED ⚠️**

The database layer is fixed and secure. The app layer needs to be migrated to use the unified hooks to restore full functionality.