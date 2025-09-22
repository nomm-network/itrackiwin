# Bodyweight Form Issue Report

## Problem
Dips exercise (effort_mode: "reps", load_mode: "bodyweight_plus_optional") is not displaying the BodyweightSetForm but instead showing the WeightRepsSetForm.

## Investigation

### Database Data
The exercise data is correct in the database:
- Exercise ID: `6da86374-b133-4bf1-a159-fd9bbb715316` (Dips)
- effort_mode: `reps`
- load_mode: `bodyweight_plus_optional`

### Data Flow Analysis

1. **Database Query**: `get_workout_detail_optimized()` function includes effort_mode and load_mode ✅
2. **API Query**: `useGetWorkout` hook in `src/features/workouts/api/workouts.api.ts` includes effort_mode and load_mode ✅  
3. **Component Mapping**: `WorkoutSession.tsx` maps exercise data to MobileWorkoutSession ✅
4. **SmartSetForm Logic**: Should route bodyweight_plus_optional to BodyweightSetForm ✅

### Current SmartSetForm Logic
```tsx
// Reps-based branching by load
switch (load) {
  case "bodyweight_plus_optional":
  case "external_assist": 
    return <BodyweightSetForm ... />;
    
  case "machine_level":
  case "external_added":
  case "free_weight":
  case "none":
  case "band_level":
  default:
    return <WeightRepsSetForm ... />;
}
```

### Potential Issues

1. **Data Not Reaching SmartSetForm**: The exercise object passed to SmartSetForm might not contain the correct effort_mode/load_mode
2. **Type Mapping Issues**: There might be a mismatch between the interface types and actual data
3. **Component Hierarchy**: EnhancedSetEditor might be overriding the exercise data
4. **Multiple Data Sources**: The exercise data might be coming from multiple sources with conflicts

### Data Structure Expected vs Actual

**Expected by SmartSetForm:**
```tsx
exercise: {
  effort_mode: "reps",
  load_mode: "bodyweight_plus_optional"
}
```

**Actual from debug info:**
```tsx
exercise: {
  id: "6da86374-b133-4bf1-a159-fd9bbb715316",
  load_mode: "bodyweight_plus_optional", 
  effort_mode: "reps",
  // ... other fields
}
```

### Root Cause Analysis

The issue appears to be in the data mapping between components. The debug box shows the data is correct at the MobileWorkoutSession level, but it may not be reaching SmartSetForm properly.

### Recommended Investigation

1. Add debug logging in SmartSetForm to see what exercise data it receives
2. Add debug logging in EnhancedSetEditor to verify data flow
3. Check if the exercise object structure matches the expected interface
4. Verify that the correct component hierarchy is being used

### Required Console Logs

```tsx
// In SmartSetForm.tsx
console.log('🎯 SmartSetForm received exercise:', exercise);
console.log('🎯 SmartSetForm extracted - effort:', effort, 'load:', load);

// In EnhancedSetEditor.tsx  
console.log('🎯 EnhancedSetEditor received exercise:', exercise);
console.log('🎯 EnhancedSetEditor smartFormExercise:', smartFormExercise);
```
