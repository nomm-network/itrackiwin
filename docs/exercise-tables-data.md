# Exercise Tables Data

Current state of exercise-related tables.

## Exercise Tables Status

### Exercises Table
- **Total Exercises**: 0
- **Status**: Empty - no exercises created yet

### Exercise Handles Table  
- **Total Mappings**: 0
- **Status**: Empty - no exercise-handle relationships

### Exercise Grips Table
- **Total Mappings**: 0  
- **Status**: Empty - no exercise-grip relationships

## Data Flow Architecture

### For New Exercise Creation
When creating new exercises, the system should:

1. **Query Equipment Compatibility**
   ```sql
   SELECT DISTINCT h.*, g.*
   FROM equipment_handle_grips ehg
   JOIN handles h ON h.id = ehg.handle_id  
   JOIN grips g ON g.id = ehg.grip_id
   WHERE ehg.equipment_id = :equipment_id
   ```

2. **Save Exercise Selections**
   ```sql
   -- After exercise creation
   INSERT INTO exercise_handles (exercise_id, handle_id, is_default)
   INSERT INTO exercise_grips (exercise_id, grip_id, is_default)  
   INSERT INTO exercise_handle_grips (exercise_id, handle_id, grip_id)
   ```

### For Existing Exercise Queries
Once exercises exist, queries should use:

```sql
-- Get exercise handles
SELECT h.* FROM exercise_handles eh
JOIN handles h ON h.id = eh.handle_id
WHERE eh.exercise_id = :exercise_id

-- Get exercise grips  
SELECT g.* FROM exercise_grips eg
JOIN grips g ON g.id = eg.grip_id  
WHERE eg.exercise_id = :exercise_id
```

## Required Code Updates

### Components That Need Exercise Data
- `HandleGripSelector`: Currently broken - requires exerciseId
- `useExerciseHandles`: Currently queries wrong table
- `GripSelector`: Currently queries exercise-specific tables

### Workflow Fix Required
1. **HandleGripSelector** should query `equipment_handle_grips` when no exerciseId
2. **Exercise creation flow** should save to exercise tables after creation
3. **Existing exercise flow** should query exercise tables

## Current Problem

The `HandleGripSelector` component in workouts is broken because:
- It requires an `exerciseId` parameter
- But no exercises exist in the database
- So it can't display any handles/grips for new exercise creation

## Solution Architecture

### Phase 1: Fix Component for New Exercises
- Update `HandleGripSelector` to accept `equipmentId` as alternative
- Query `equipment_handle_grips` when `exerciseId` is null
- Allow exercise creation with handle/grip selection

### Phase 2: Populate Exercise Data  
- Create exercise entries in database
- Populate `exercise_handles`, `exercise_grips`, `exercise_handle_grips`
- Use equipment compatibility as starting point

### Phase 3: Unified Component
- `HandleGripSelector` works for both new and existing exercises
- Seamless transition between equipment and exercise data
- Proper fallback mechanisms

## Notes

- Equipment data is fully populated and functional
- Handle-grip compatibility matrix is complete  
- Exercise tables await first exercise creation
- System is ready for exercise data population