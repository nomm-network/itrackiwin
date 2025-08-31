# Workout System Implementation Analysis

## Multiple Conflicting Implementations

### Set Logging Implementations (4 Different Approaches)

#### 1. useAdvancedSetLogging.ts (PRIMARY - BROKEN)
**File**: `src/hooks/useAdvancedSetLogging.ts`
**Status**: BROKEN - Constraint violation error
**Approach**: Uses Supabase RPC `set_log` function
**Issues**:
- Calls RPC function that triggers personal records constraint violation
- No proper error handling for constraint conflicts
- Complex weight calculation logic
- Grip handling logic intertwined with set logging

```typescript
// BROKEN CODE PATH
const { data, error: rpcError } = await supabase.rpc('set_log', {
  p_payload: payload
});
// FAILS WITH: duplicate key value violates unique constraint "personal_records_user_ex_kind_unique"
```

#### 2. useSetLogging.ts (SECONDARY)
**File**: `src/hooks/useSetLogging.ts`  
**Status**: Unknown - Not primary implementation
**Approach**: Direct database insert with separate payload structure
**Issues**:
- Duplicate functionality with useAdvancedSetLogging
- Different payload interface
- May have same constraint issues

#### 3. useWorkoutSetGrips.ts (GRIP-SPECIFIC)
**File**: `src/hooks/useWorkoutSetGrips.ts`
**Status**: Unknown - Also uses `set_log` RPC
**Approach**: Focuses on grip-aware set logging
**Issues**:
- Also calls the broken `set_log` RPC function
- Overlapping functionality with primary implementation

#### 4. useUnilateralSets.ts (UNILATERAL)
**File**: `src/features/workouts/hooks/useUnilateralSets.ts`
**Status**: May work - Direct database approach
**Approach**: Direct Supabase client insert, bypasses RPC
**Issues**:
- Limited to unilateral exercises only
- Direct insert may bypass business logic
- Doesn't handle personal records

### Warmup Feedback Implementations (5+ Different Approaches)

#### 1. useWarmupActions.ts (DIRECT DATABASE)
**File**: `src/features/workouts/warmup/useWarmupActions.ts`
**Approach**: Direct database update to `workout_exercises.warmup_feedback`
**Issues**:
- Direct field update without proper validation
- No integration with warmup plan system
- Uses old feedback values ('not_enough' vs 'too_little')

```typescript
// APPROACH 1: Direct database update
await supabase.from('workout_exercises')
  .update({ 
    warmup_feedback: params.feedback, 
    warmup_feedback_at: new Date().toISOString() 
  })
```

#### 2. useWarmupManager.ts (RPC-BASED)
**File**: `src/features/workouts/hooks/useWarmupManager.ts`
**Approach**: Uses RPC functions for warmup management
**Issues**:
- Complex RPC-based approach
- May conflict with direct database updates
- Different error handling pattern

#### 3. warmup.ts API (PLAN-BASED)
**File**: `src/features/workouts/api/warmup.ts`
**Approach**: Updates warmup plan JSON with feedback
**Issues**:
- Modifies warmup_plan JSON field instead of feedback field
- Different data structure than other approaches
- JSON field updates may not trigger proper validation

```typescript
// APPROACH 3: JSON plan update
warmup_plan: {
  ...currentPlan,
  feedback,
  feedback_at: new Date().toISOString()
}
```

#### 4. feedback.ts (BIAS-BASED)
**File**: `src/features/workouts/warmup/feedback.ts`
**Approach**: Updates user warmup bias preferences
**Issues**:
- Different scope - updates user preferences vs workout feedback
- Uses different RPC function (`upsert_warmup_bias`)
- May not update current workout feedback

#### 5. WarmupFeedback Component (UI-BASED)
**File**: `src/features/health/fitness/components/WarmupFeedback.tsx`
**Approach**: UI component that calls useWarmupManager
**Issues**:
- Depends on working warmup manager implementation
- UI-specific feedback flow
- Different feedback value mapping

## Database Function Issues

### set_log RPC Function
**Status**: BROKEN - Constraint violation
**Location**: Supabase database function
**Issue**: Uses old personal records constraint logic

```sql
-- BROKEN: Old constraint reference
INSERT INTO personal_records(user_id, exercise_id, kind, value, unit, achieved_at, workout_set_id)
VALUES (v_user_id, v_exercise_id, 'heaviest', NEW.weight, NEW.weight_unit, COALESCE(NEW.completed_at, now()), NEW.id)
ON CONFLICT (user_id, exercise_id, kind)  -- OLD CONSTRAINT
DO UPDATE SET ...
```

**Required Fix**: Update to use new constraint with grip_key:
```sql
-- FIXED: New constraint reference
ON CONFLICT (user_id, exercise_id, kind, COALESCE(grip_key, ''))
```

### Warmup RPC Functions
**Status**: Unknown - Multiple functions exist
**Functions**:
- `upsert_warmup_bias` - Used by feedback.ts
- Various warmup recomputation functions
- May have inconsistent behavior

## Code Architecture Problems

### 1. No Single Source of Truth
- **Set Logging**: 4 different approaches with different interfaces
- **Warmup Feedback**: 5+ different approaches with different data targets
- **Error Handling**: Inconsistent patterns across implementations

### 2. Race Conditions
- Multiple systems can update same database fields simultaneously
- No coordination between different implementation approaches
- Potential for data corruption from conflicting updates

### 3. Interface Inconsistencies
```typescript
// Different payload structures across implementations
// useAdvancedSetLogging
interface AdvancedSetData {
  workout_exercise_id: string;
  weight?: number;
  reps?: number;
  // ... many more fields
}

// useSetLogging  
interface SetLogPayload {
  workout_exercise_id: string;
  reps?: number;
  weight_total?: number;  // Different field name
  // ... different structure
}

// useWorkoutSetGrips
interface WorkoutSetData {
  workout_exercise_id: string;
  weight?: number;       // Same field name
  weight_unit?: string;  // Additional field
  // ... yet another structure
}
```

### 4. Error Handling Inconsistencies
- Some implementations throw errors
- Others return error states
- Different error message formats
- No unified error recovery strategy

## System Dependencies

### Critical Path Failures
```
User Action → Set Logging → Personal Records → CONSTRAINT VIOLATION → COMPLETE FAILURE
```

### Dependency Chain
1. **UI Components** depend on **Hook Implementations**
2. **Hook Implementations** depend on **Database Functions**  
3. **Database Functions** depend on **Constraint System**
4. **Constraint System** is BROKEN

### Cascade Effect
- Single constraint violation breaks ALL set logging
- Warmup feedback failures break workout progression
- Failed operations leave UI in inconsistent states
- Users lose workout data

## Recovery Strategy Requirements

### Phase 1: Emergency Database Repair
1. **Constraint Resolution**: Fix personal_records constraints completely
2. **Data Cleanup**: Remove duplicate/corrupted records
3. **Function Updates**: Update all RPC functions to use correct constraints

### Phase 2: Code Consolidation
1. **Single Set Logging Implementation**: Merge all approaches into one
2. **Single Warmup Feedback System**: Choose one approach, remove others
3. **Unified Error Handling**: Consistent error patterns across system
4. **Interface Standardization**: Common data structures for all operations

### Phase 3: Architecture Redesign
1. **Single Responsibility**: Each hook handles one specific concern
2. **Dependency Injection**: Proper separation of data access and business logic
3. **Error Boundaries**: Proper error isolation and recovery
4. **Testing Framework**: Comprehensive testing to prevent future regressions

## Current System State: CRITICAL FAILURE

### Working Components
- ✅ Exercise selection and display
- ✅ Workout session UI (read-only)
- ✅ Template system (read operations)

### Broken Components  
- ❌ Set logging (all implementations)
- ❌ Warmup feedback (all implementations)
- ❌ Personal records tracking
- ❌ Workout progression
- ❌ Data persistence (any write operations)

### Impact on Users
- **Complete Loss of Functionality**: Users cannot log any workout data
- **Data Loss**: Any workout attempts result in lost data
- **User Experience**: Broken workflows and error messages
- **System Trust**: Reliability completely compromised

**CONCLUSION**: The workout system requires immediate, comprehensive repair. The current multiple-implementation approach has created an unmaintainable system with critical failure points. A complete architectural overhaul is necessary to restore functionality.