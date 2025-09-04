# Workout System

## Overview

The workout system provides comprehensive workout planning, execution, and tracking capabilities with real-time progress monitoring and intelligent recommendations.

## Architecture

```
src/features/health/fitness/workouts/
├── components/                 # UI components
├── hooks/                      # Business logic hooks
├── pages/                      # Route components
├── services/                   # API services
├── types/                      # Type definitions
└── ui/                         # Public component exports
```

## Core Concepts

### Workout Session Flow

1. **Workout Creation**: Start from template or create new
2. **Exercise Setup**: Configure exercises with targets
3. **Warmup**: Progressive warm-up based on working weight
4. **Set Execution**: Log sets with weight, reps, and feedback
5. **Progress Tracking**: Monitor performance over time

### Data Models

```typescript
interface WorkoutSet {
  id: string;
  set_index: number;
  weight: number;
  weight_unit: string;
  reps: number;
  is_completed: boolean;
}

interface WorkoutExercise {
  id: string;
  display_name: string;
  sets: WorkoutSet[];
  attribute_values_json?: {
    warmup?: WarmupStep[];
  };
}

interface Workout {
  id: string;
  name: string;
  status: 'planned' | 'active' | 'completed';
  exercises: WorkoutExercise[];
}
```

## Key Components

### WorkoutSetCard

Displays individual set information with completion controls:

```typescript
interface WorkoutSetCardProps {
  set: WorkoutSet;
  onComplete: (setId: string) => void;
  onEdit: (setId: string) => void;
}
```

**Features:**
- Set index and target display
- Weight and rep inputs
- Completion status tracking
- Edit capabilities

### WorkoutSetsBlock

Manages collection of sets for an exercise:

```typescript
interface WorkoutSetsBlockProps {
  sets: WorkoutSet[];
  onComplete: (setId: string) => void;
  onEdit: (setId: string) => void;
}
```

**Features:**
- Multiple set display
- Empty state handling
- Bulk operations support

### WorkoutExerciseCard

Complete exercise context within a workout:

```typescript
interface WorkoutExerciseCardProps {
  exercise: WorkoutExercise;
  onAddSet?: (exerciseId: string) => void;
  onCompleteSet?: (setId: string, data: any) => void;
}
```

**Features:**
- Exercise name and metadata
- Warmup integration
- Set management
- Progress indicators

## Warmup System

### Automatic Warmup Generation

```typescript
interface WarmupStep {
  percent: number;    // Percentage of working weight
  reps: number;      // Recommended reps
  rest_s: number;    // Rest time in seconds
  kg: number;        // Calculated weight
}

const generateWarmup = (workingWeight: number): WarmupStep[] => {
  return [
    { percent: 0.4, reps: 8, rest_s: 60, kg: workingWeight * 0.4 },
    { percent: 0.6, reps: 5, rest_s: 90, kg: workingWeight * 0.6 },
    { percent: 0.8, reps: 3, rest_s: 120, kg: workingWeight * 0.8 },
  ];
};
```

### WarmupBlock Component

```typescript
interface WarmupBlockProps {
  steps: WarmupStep[];
}
```

Displays warmup progression with:
- Weight calculations
- Rep recommendations
- Rest time guidance

## Set Management

### Set Logging

```typescript
const useLogSet = () => {
  return useMutation({
    mutationFn: async (setData: {
      workout_exercise_id: string;
      weight_kg: number;
      reps: number;
      effort_level?: number;
    }) => {
      const { data, error } = await supabase
        .from('workout_sets')
        .insert(setData);
      
      if (error) throw error;
      return data;
    },
  });
};
```

### Set Completion

```typescript
const handleSetComplete = async (setId: string) => {
  const { error } = await supabase
    .from('workout_sets')
    .update({ 
      is_completed: true,
      completed_at: new Date().toISOString()
    })
    .eq('id', setId);
    
  if (error) throw error;
};
```

## Progress Tracking

### Target Calculations

Smart target suggestions based on:
- Previous workout performance
- Readiness assessment scores
- Progressive overload principles

```typescript
interface SmartTargetInfo {
  target_weight_kg: number | null;
  readiness_score: number | null;
  base_source: 'recent_workout' | 'template' | 'estimate' | null;
  readiness_multiplier: number;
  warmup_steps: WarmupStep[] | null;
}
```

### Performance Metrics

Track workout effectiveness through:
- Volume progression (sets × reps × weight)
- Intensity improvements
- Recovery patterns
- Consistency metrics

## Equipment Integration

### Equipment-Specific Logic

```typescript
interface EquipmentConfig {
  load_type: 'single_load' | 'dual_load' | 'stack' | 'none';
  side_min_plate_kg?: number;
  single_min_increment_kg?: number;
}

const useWeightStep = (config: EquipmentConfig) => {
  return useQuery({
    queryKey: ['weight-step', config],
    queryFn: () => calculateNextWeightStep(config),
  });
};
```

### Bar and Plate Calculations

Automatic weight calculations for:
- Olympic barbells (20kg standard)
- Specialty bars (trap bar, safety bar, etc.)
- Plate loading optimization
- Micro-loading support

## Workout Templates

### Template Structure

```typescript
interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: TemplateExercise[];
}

interface TemplateExercise {
  exercise_id: string;
  target_sets: number;
  target_reps: number;
  target_weight_kg?: number;
  rest_seconds?: number;
}
```

### Template to Workout Conversion

```typescript
const startWorkoutFromTemplate = async (templateId: string) => {
  const { data, error } = await supabase.rpc('start_workout', {
    p_template_id: templateId
  });
  
  if (error) throw error;
  return data;
};
```

## Real-time Features

### Live Workout Updates

- Real-time set completion
- Progress synchronization
- Multi-device support
- Offline capability with sync

### Timer Integration

```typescript
const useRestTimer = (defaultSeconds: number = 120) => {
  const [timeLeft, setTimeLeft] = useState(defaultSeconds);
  const [isActive, setIsActive] = useState(false);
  
  // Timer logic
  
  return { timeLeft, isActive, start, pause, reset };
};
```

## Analytics and Insights

### Workout Analytics

- Session duration tracking
- Volume calculations
- Intensity monitoring
- Recovery assessment

### Performance Trends

- Progressive overload tracking
- Strength curve analysis
- Volume progression
- Consistency patterns

## API Integration

### Workout Hooks

```typescript
// Get active workout
const { data: activeWorkout } = useActiveWorkout();

// Start new workout
const { mutate: startWorkout } = useStartWorkout();

// Log workout set
const { mutate: logSet } = useLogSet();

// Complete workout
const { mutate: completeWorkout } = useCompleteWorkout();
```

### Error Handling

```typescript
const { error, isError } = useQuery({
  queryKey: ['workout', id],
  queryFn: fetchWorkout,
  onError: (error) => {
    toast.error(`Failed to load workout: ${error.message}`);
  },
});
```

## Mobile Optimization

### Touch-Friendly Controls

- Large tap targets (minimum 44px)
- Swipe gestures for set completion
- Optimized input methods
- Landscape mode support

### Performance Considerations

- Lazy loading of exercise data
- Optimistic updates for set logging
- Efficient re-rendering
- Memory management for long sessions

## Testing Strategy

### Unit Tests

```typescript
describe('Set Logging', () => {
  it('should log set with correct data', async () => {
    const setData = {
      workout_exercise_id: 'exercise-1',
      weight_kg: 100,
      reps: 10,
    };
    
    const result = await logSet(setData);
    expect(result).toBeDefined();
  });
});
```

### Integration Tests

- Workout flow testing
- API integration testing
- Component interaction testing
- Error scenario testing

## Future Enhancements

### Planned Features

1. **AI Coaching**: Intelligent form feedback
2. **Social Features**: Workout sharing and challenges
3. **Advanced Analytics**: ML-powered insights
4. **Wearable Integration**: Heart rate and biometric tracking
5. **Video Analysis**: Exercise form evaluation