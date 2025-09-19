# 🛠️ EMERGENCY RECOVERY ACTION PLAN
**Crisis Response Document**
**Generated: 2025-09-19 16:01 UTC**

## 🚨 IMMEDIATE ACTIONS REQUIRED

### 🔴 STOP ALL DEVELOPMENT
**Effective Immediately:**
- **HALT** all set logging feature development
- **HALT** all personal records modifications  
- **HALT** all database migration attempts
- **FOCUS** exclusively on emergency recovery

### 🗄️ DATABASE EMERGENCY INTERVENTION

#### Step 1: Manual Database Investigation (30 minutes)
**Required Access**: Supabase Dashboard SQL Editor

```sql
-- 1. Investigate actual constraints (hidden ones)
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'personal_records'::regclass;

-- 2. Check for index-based constraints
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'personal_records';

-- 3. Investigate triggers on personal_records
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'personal_records';
```

#### Step 2: Database Schema Reset (60 minutes)
**WARNING**: This requires backup of existing data

```sql
-- 1. BACKUP existing personal records
CREATE TABLE personal_records_backup_20250919 AS 
SELECT * FROM personal_records;

-- 2. DROP ALL constraints on personal_records
-- (Commands will be provided after investigation)

-- 3. RECREATE proper constraints
ALTER TABLE personal_records 
ADD CONSTRAINT personal_records_user_exercise_kind_grip_unique 
UNIQUE (user_id, exercise_id, kind, grip_key);

-- 4. UPDATE existing records with proper grip_key values
UPDATE personal_records 
SET grip_key = '' 
WHERE grip_key IS NULL;
```

#### Step 3: Verify Database Fix (15 minutes)
```sql
-- Test constraint behavior
INSERT INTO personal_records (user_id, exercise_id, kind, grip_key, value, unit) 
VALUES (
  'test-user-id',
  'test-exercise-id', 
  'heaviest',
  '',
  100.0,
  'kg'
);

-- Should succeed
INSERT INTO personal_records (user_id, exercise_id, kind, grip_key, value, unit) 
VALUES (
  'test-user-id',
  'test-exercise-id', 
  'heaviest',
  'overhand',
  110.0,
  'kg'
);

-- Should fail (same grip_key)
INSERT INTO personal_records (user_id, exercise_id, kind, grip_key, value, unit) 
VALUES (
  'test-user-id',
  'test-exercise-id', 
  'heaviest',
  '',
  120.0,
  'kg'
);

-- Cleanup test data
DELETE FROM personal_records WHERE user_id = 'test-user-id';
```

## 🔧 APPLICATION LAYER FIXES

### Phase 1: Code Consolidation (4 hours)

#### Delete Conflicting Implementations
```bash
# Remove these files completely:
src/features/health/fitness/hooks/useLogWorkoutSet.ts
src/features/health/fitness/hooks/useSetLogger.ts  
src/features/health/fitness/hooks/useEnhancedSetLogger.ts
src/features/health/fitness/hooks/useWarmupFeedback.ts
src/features/health/fitness/hooks/useWarmupFeedbackSubmission.ts
```

#### Consolidate to Single Implementation
**Keep ONLY**: Most robust set logging hook
**Requirement**: Must handle grip_key properly

#### Update All Components
```typescript
// Standard set logging interface
interface SetLoggingHook {
  logSet: (data: SetData) => Promise<void>;
  isLogging: boolean;
  error: Error | null;
  reset: () => void;
}

// Required error handling
interface SetData {
  weight: number;
  reps: number;
  rpe?: number;
  grip_key?: string; // CRITICAL: Must be included
  set_index: number;
  workout_exercise_id: string;
}
```

### Phase 2: Error Handling Implementation (2 hours)

#### Universal Error Handler
```typescript
const handleSetLoggingError = (error: any, context: string) => {
  // Log detailed error information
  console.error(`Set logging failed in ${context}:`, {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  });

  // User-friendly error message
  if (error.message?.includes('constraint')) {
    toast.error("Multiple sets detected. Please wait and try again.");
  } else if (error.message?.includes('network')) {
    toast.error("Connection issue. Please check your internet.");
  } else {
    toast.error("Set logging failed. Please try again.");
  }

  // Report to monitoring service
  reportError(error, context);
};
```

#### Component-Level Error Boundaries
```typescript
const SetLoggingErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary
      fallback={<div>Set logging temporarily unavailable</div>}
      onError={(error) => handleSetLoggingError(error, 'SetLogging')}
    >
      {children}
    </ErrorBoundary>
  );
};
```

### Phase 3: Mobile Session Fixes (2 hours)

#### MobileWorkoutSession Updates
```typescript
// Fix handleAddSet function
const handleAddSet = async () => {
  try {
    const setData: SetData = {
      weight: finalWeight,
      reps: newSetData.reps,
      set_index: nextSetIndex,
      workout_exercise_id: currentExercise.id,
      grip_key: '', // Ensure grip_key is always provided
      is_completed: true,
      rest_seconds: lastSet?.rest_seconds || 180
    };

    await onSetComplete(currentExercise.id, setData);
    // Success handling...
    
  } catch (error) {
    handleSetLoggingError(error, 'MobileWorkoutSession');
    // Do not clear inputs on error
    // Do not start rest timer on error
  }
};
```

## 📋 VERIFICATION CHECKLIST

### Database Verification
- [ ] Constraint investigation completed
- [ ] Phantom constraints identified and removed
- [ ] Proper unique constraint recreated
- [ ] Test inserts succeed/fail as expected
- [ ] Personal records data cleaned

### Application Verification  
- [ ] Single set logging implementation active
- [ ] All conflicting implementations removed
- [ ] Error handling implemented everywhere
- [ ] Mobile session updated and tested
- [ ] Desktop session updated and tested

### User Experience Verification
- [ ] Single set logs successfully
- [ ] Multiple sets log successfully
- [ ] Error messages are user-friendly
- [ ] Workout completion flow works
- [ ] Personal records update correctly

## 🎯 TESTING PROTOCOL

### Critical Path Testing
1. **Single Set Test**
   - Create new workout
   - Log first set
   - Verify personal record creation
   - Verify set data persistence

2. **Multi-Set Test**  
   - Log second set on same exercise
   - Verify no constraint violation
   - Verify personal record update
   - Verify workout progression

3. **Edge Case Testing**
   - Different grip combinations
   - Same weight/reps (should update achieved_at)
   - Network interruption during logging
   - App backgrounding during logging

### Success Criteria
- **0 constraint violations** in 100 test sets
- **<100ms response time** for set logging
- **>99% success rate** for set logging operations
- **User-friendly errors** for all failure modes

## 🚀 ROLLOUT STRATEGY

### Stage 1: Internal Testing (2 hours)
- Database fixes applied
- Application updates deployed to staging
- Core team testing of critical workflows

### Stage 2: Limited Beta (4 hours)  
- Deploy to small subset of users
- Monitor error rates and user feedback
- Rapid iteration on any remaining issues

### Stage 3: Full Deployment (24 hours)
- Deploy to all users
- Monitor system health metrics
- Customer support team briefed on potential issues

## 📊 MONITORING & ALERTS

### Key Metrics to Track
- **Constraint violation rate**: Target 0%
- **Set logging success rate**: Target >99%
- **Average response time**: Target <100ms
- **User completion rate**: Target >95%

### Alert Thresholds
- **CRITICAL**: >1% constraint violation rate
- **WARNING**: >5% set logging failure rate  
- **INFO**: Response time >200ms

## 🔄 ROLLBACK PLAN

### If Database Fixes Fail
1. Restore personal_records from backup
2. Revert to previous working constraint state
3. Implement application-level deduplication
4. Schedule proper migration for later

### If Application Fixes Fail
1. Revert to previous component versions
2. Disable set logging temporarily
3. Show maintenance message to users
4. Fix issues in staging environment

---

**This action plan should be executed by the development team lead with database admin support. All steps should be performed in staging environment first, then production.**