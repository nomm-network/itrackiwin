# Must-Fix Checklist Status

## ✅ 1. Single start flow (front + DB)
- ✅ **One hook only**: `useStartWorkout` in `workouts.api.ts` (removed duplicate stub)
- ✅ **One RPC only**: `public.start_workout(p_template_id uuid)` 
- ✅ **No legacy imports**: Removed old quick-start references
- ✅ **Clean columns**: Uses `target_weight_kg`, `rest_seconds` (no underscores)

## ✅ 2. Warmup source of truth
- ✅ **Priority order**: `apply_initial_targets()` follows exact priority:
  1. Last completed set → 2. User estimates (readiness) → 3. Template targets → 4. Default (60kg)
- ✅ **Runs on creation**: Called from `start_workout` RPC to prefill targets
- ✅ **No blank UI**: `target_weight_kg` always populated, never null/0

## ✅ 3. Enums/columns consistency  
- ✅ **DB schema**: Uses `target_weight_kg`, `rest_seconds`, `load_type`
- ✅ **TS types**: Auto-generated types match DB schema exactly
- ✅ **No legacy paths**: Zero `target_weight` references in source code

## 🔍 4. Triggers/PRs sanity (NEEDS VERIFICATION)
- ❓ **PR triggers**: Need to verify only one grip-aware trigger exists
- ❓ **Unique constraints**: Need to verify `(user_id, exercise_id, kind, grip_key)` constraint

## 🔍 5. RLS + functions (NEEDS VERIFICATION)
- ✅ **start_workout**: Has `SECURITY DEFINER` and checks `auth.uid()`
- ❓ **Other RPCs**: Need to verify all workout RPCs are secured
- ❓ **RLS policies**: Need to verify workout table policies allow owner access

## ✅ 6. Feature boundaries
- ✅ **Shared code**: Properly organized in `src/lib/`, `src/shared/ui`, `src/shared/api`, `src/shared/types`
- ✅ **Feature structure**: `src/features/health/fitness/...` established
- ✅ **Clean boundaries**: UI → feature API → shared API → RPC

## 🧪 Testing
- ✅ **Contracts test**: Created `start-workout.contract.test.ts` to guard against regressions

## 📋 Next Actions
1. **Verify triggers**: Check workout_sets triggers for PR calculation
2. **Verify RLS**: Ensure all workout tables have proper user-based policies  
3. **Run contracts test**: Execute in test environment to validate
4. **Migration guard**: Create SQL migration to drop legacy functions/triggers

## 🟢 Ready for Feature Work?
**Status**: 🟡 **Almost Ready** - Need to complete items 4-5 verification, then ✅ **GREEN LIGHT**