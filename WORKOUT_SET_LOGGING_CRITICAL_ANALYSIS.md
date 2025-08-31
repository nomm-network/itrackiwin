# CRITICAL WORKOUT SET LOGGING FAILURE ANALYSIS

## EXECUTIVE SUMMARY

**STATUS: BROKEN** - Set logging completely fails on second attempt with constraint violation

**ERROR**: `duplicate key value violates unique constraint "personal_records_user_ex_kind_unique"`

**IMPACT**: Users cannot log multiple sets, core workout functionality is unusable

---

## ROOT CAUSE ANALYSIS

### The Problem
Despite multiple migration attempts, the old constraint `personal_records_user_ex_kind_unique` **is still active** in the database. This constraint only includes `(user_id, exercise_id, kind)` and does not account for grip variations.

### Why Multiple Fixes Failed
1. **Migration Incomplete**: Old constraint wasn't actually dropped despite migration commands
2. **Cached Database State**: Supabase may have cached the old schema structure
3. **Constraint Naming Conflict**: Multiple constraints may exist with similar names
4. **Database Replication Lag**: Changes may not have propagated fully

### Current State Breakdown
- ✅ **Trigger Function**: `upsert_prs_with_grips_after_set()` is correctly implemented
- ✅ **Grip Normalization**: `make_grip_key()` function exists and works
- ❌ **Database Constraint**: Old 3-column constraint still enforced
- ❌ **Set Logging**: Fails on any duplicate user+exercise+kind combination

---

## TECHNICAL DEEP DIVE

### Error Flow
1. User logs first set → SUCCESS (creates new PR record)
2. User logs second set → **CONSTRAINT VIOLATION** 
3. Trigger attempts to upsert PR with same `(user_id, exercise_id, kind)`
4. Old constraint rejects insert because it ignores `grip_key` column
5. Transaction rolls back, set logging fails

### Database Schema State
```sql
-- WHAT SHOULD EXIST (only this):
personal_records_user_exercise_kind_grip_key UNIQUE (user_id, exercise_id, kind, grip_key)

-- WHAT ACTUALLY EXISTS (problematic):
personal_records_user_ex_kind_unique UNIQUE (user_id, exercise_id, kind)  -- ❌ OLD CONSTRAINT
```

### Code Architecture Issues
The codebase has multiple overlapping set logging implementations:

1. **`useAdvancedSetLogging`** - Main implementation (currently used)
2. **`useUnilateralSets`** - Bilateral/unilateral specific
3. **`useSetLogging`** - Legacy RPC-based 
4. **`useWorkoutSetGrips`** - Grip-aware logging
5. **`useUnifiedSetLogging`** - Attempted unification

This creates confusion and makes debugging extremely difficult.

---

## IMMEDIATE BLOCKERS

### Database Level
- [ ] Old constraint `personal_records_user_ex_kind_unique` must be **forcibly removed**
- [ ] Verify only grip-aware constraint exists
- [ ] Clear any database cache/replication issues

### Application Level  
- [ ] Consolidate set logging to single implementation
- [ ] Remove duplicate/legacy logging hooks
- [ ] Implement proper error handling for constraint violations

---

## RECOVERY PLAN

### Phase 1: Emergency Database Fix
1. **Manual Database Intervention**
   - Direct SQL execution in Supabase console
   - Force drop all old constraints
   - Verify constraint state with `\d+ personal_records`

2. **Constraint Cleanup Script**
   ```sql
   -- Must be run directly in Supabase SQL editor
   SELECT conname, pg_get_constraintdef(c.oid) 
   FROM pg_constraint c 
   WHERE conrelid = 'personal_records'::regclass;
   
   -- Drop ALL old constraints, recreate only grip-aware one
   ```

### Phase 2: Code Consolidation
1. **Remove Legacy Hooks**
   - Delete `useSetLogging`, `useWorkoutSetGrips`, `useUnifiedSetLogging`
   - Keep only `useAdvancedSetLogging` and `useUnilateralSets`

2. **Centralize Error Handling**
   - Add constraint violation detection
   - Implement graceful fallbacks
   - Add user-friendly error messages

### Phase 3: Testing & Validation
1. **Multi-Set Testing**
   - Log 3+ sets for same exercise
   - Test with different grip combinations
   - Verify PR tracking works correctly

2. **Edge Case Testing**
   - NULL grip scenarios
   - Identical weight/reps combinations
   - Cross-workout PR detection

---

## RISK ASSESSMENT

### HIGH RISK
- **Data Loss**: Failed sets aren't recorded, workout progress lost
- **User Frustration**: Core functionality completely broken
- **Database Integrity**: Multiple constraint violations could corrupt data

### MEDIUM RISK
- **Performance Impact**: Failed transactions create database load
- **Cascade Failures**: Other features depending on PR data may break

### LOW RISK
- **UI Inconsistency**: Error messages not user-friendly
- **Logging Noise**: Console errors create debugging confusion

---

## LESSONS LEARNED

1. **Database Migrations**: Need direct SQL execution for constraint changes
2. **Code Architecture**: Too many overlapping implementations
3. **Testing**: Insufficient multi-set testing in development
4. **Rollback Strategy**: No clear path to revert changes

---

## NEXT STEPS

### Immediate (Do Now)
1. **Stop all set logging development** until database is fixed
2. **Manual database intervention** via Supabase console
3. **Verify constraint state** before any code changes

### Short Term (This Week)
1. **Consolidate set logging architecture**
2. **Implement comprehensive testing**
3. **Add proper error handling**

### Long Term (Next Sprint)
1. **Refactor personal records system**
2. **Add database migration testing**
3. **Create rollback procedures**

---

## APPENDIX

### Error Reproduction Steps
1. Start any workout
2. Log first set with weight/reps → ✅ Success
3. Log second set with same/different weight → ❌ Constraint violation
4. Check browser console for `personal_records_user_ex_kind_unique` error

### Database Diagnosis Queries
```sql
-- Check all constraints on personal_records
SELECT conname, pg_get_constraintdef(c.oid) 
FROM pg_constraint c 
JOIN pg_class t ON t.oid = c.conrelid 
WHERE t.relname = 'personal_records';

-- Check triggers on workout_sets  
SELECT trigger_name, action_timing, event_manipulation 
FROM information_schema.triggers 
WHERE event_object_table = 'workout_sets';
```

---

**CRITICAL**: Until the database constraint is fixed, the workout system is completely unusable for multi-set exercises.