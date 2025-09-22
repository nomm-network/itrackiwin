# Workout Data Flow Analysis

## Current Data Flow

```
Database (exercises table)
  ↓ (effort_mode, load_mode)
get_workout_detail_optimized() function
  ↓ (includes effort_mode, load_mode in query)
useGetWorkout hook
  ↓ (fetches workout with exercise data)
WorkoutSession component
  ↓ (maps exercise data)
MobileWorkoutSession component
  ↓ (passes currentExercise)
EnhancedSetEditor component
  ↓ (processes exercise data)
SmartSetForm component
  ↓ (routes based on effort_mode/load_mode)
BodyweightSetForm OR WeightRepsSetForm
```

## Data Structure at Each Level

### Database Level
```sql
exercises: {
  id: uuid,
  effort_mode: text ('reps'|'time'|'distance'|'calories'),
  load_mode: text ('bodyweight_plus_optional'|'external_added'|'external_assist'|'machine_level'|'free_weight'|'none'|'band_level')
}
```

### API Response Level
```tsx
exercise: {
  id: string,
  effort_mode: string,
  load_mode: string,
  // ... other fields
}
```

### Component Interface Level
```tsx
// EnhancedSetEditor expects:
exercise: {
  effort_mode?: 'reps' | 'time' | 'distance' | 'calories';
  load_mode?: 'none' | 'bodyweight_plus_optional' | 'external_added' | 'external_assist' | 'machine_level' | 'band_level' | 'free_weight';
}

// SmartSetForm expects:
exercise: {
  effort_mode?: \"reps\" | \"time\" | \"distance\" | \"calories\";
  load_mode?: \"bodyweight_plus_optional\" | \"external_added\" | \"external_assist\" | \"machine_level\" | \"free_weight\" | \"none\" | \"band_level\";
}
```

## Potential Break Points

1. **Type Mismatch**: Database stores text, components expect specific union types
2. **Data Mapping**: Exercise data might be nested or transformed during mapping
3. **Interface Conflicts**: Different components might expect different data structures
4. **Fallback Logic**: Components might have fallback logic that overrides database values

## Missing Links

1. **Console Debugging**: No visible logging to track data transformation
2. **Type Validation**: No runtime type checking to ensure data integrity
3. **Error Handling**: No error handling for missing or invalid data

## Recommended Debugging Strategy

1. Add comprehensive logging at each transformation point
2. Validate data types at component boundaries  
3. Add fallback handling for missing data
4. Create type guards to ensure data integrity
