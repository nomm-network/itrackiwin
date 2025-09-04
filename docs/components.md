# Component Architecture

## Design Principles

The application follows a component-driven architecture with these core principles:

1. **Single Responsibility**: Each component has one clear purpose
2. **Composition over Inheritance**: Build complex UIs from simple components
3. **Props Interface**: Clear, typed interfaces for all components
4. **Design System**: Consistent styling through design tokens

## Component Hierarchy

### Global Components (`/components`)

```
components/
├── ui/                         # shadcn/ui base components
│   ├── button.tsx              # Button variants and styles
│   ├── card.tsx                # Card layouts
│   ├── input.tsx               # Form inputs
│   └── ...                     # Other UI primitives
├── layout/                     # Layout components
│   ├── ProtectedMobileLayout.tsx
│   └── PageNav.tsx
└── ...                         # Other global components
```

### Feature Components

Feature components are organized within their respective domains:

```
src/features/health/fitness/workouts/components/
├── WorkoutSetCard.tsx          # Individual set display
├── WorkoutSetsBlock.tsx        # Collection of sets
├── WorkoutExerciseCard.tsx     # Exercise within workout
├── SetList.tsx                 # List management
└── ...
```

## Component Patterns

### 1. Presentational Components

Simple, stateless components that focus on rendering:

```typescript
interface WorkoutSetCardProps {
  set: WorkoutSet;
  onComplete: (setId: string) => void;
  onEdit: (setId: string) => void;
}

const WorkoutSetCard: React.FC<WorkoutSetCardProps> = ({ 
  set, 
  onComplete, 
  onEdit 
}) => {
  return (
    <Card className={cn(
      'flex items-center justify-between p-3 mb-2',
      set.is_completed ? 'bg-green-50 border-green-300' : 'bg-white'
    )}>
      {/* Component content */}
    </Card>
  );
};
```

### 2. Container Components

Components that manage state and business logic:

```typescript
const WorkoutExerciseCard: React.FC<WorkoutExerciseCardProps> = ({ 
  exercise, 
  onAddSet, 
  onCompleteSet 
}) => {
  const warmupSteps = exercise.attribute_values_json?.warmup ?? [];

  return (
    <div className="border rounded-lg p-4 mb-4 shadow-sm bg-white">
      <h2 className="font-semibold text-lg mb-2">{exercise.display_name}</h2>
      
      {warmupSteps && warmupSteps.length > 0 && (
        <WarmupBlock steps={warmupSteps} />
      )}
      
      <WorkoutSetsBlock 
        sets={exercise.sets || []} 
        onComplete={(setId) => onCompleteSet?.(setId, {})} 
        onEdit={(setId) => console.log('Edit set:', setId)} 
      />
    </div>
  );
};
```

### 3. Compound Components

Components that work together as a system:

```typescript
// Parent component
const SetList: React.FC<SetListProps> = ({ exercises, onUpdateSet }) => {
  return (
    <div>
      {exercises.map((exercise) => (
        <WorkoutSetsBlock
          key={exercise.id}
          sets={exercise.sets}
          onComplete={(setId) => onUpdateSet(setId, {})}
          onEdit={(setId) => onUpdateSet(setId, {})}
        />
      ))}
    </div>
  );
};
```

## Design System Integration

### Color System

```typescript
// Use semantic tokens instead of direct colors
className="bg-primary text-primary-foreground"  // ✅ Good
className="bg-blue-500 text-white"              // ❌ Avoid
```

### Component Variants

```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

## State Management Patterns

### 1. Local State

```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### 2. Server State (TanStack Query)

```typescript
const { data: workout, isLoading, error } = useQuery({
  queryKey: ['workout', workoutId],
  queryFn: () => fetchWorkout(workoutId),
});
```

### 3. Global State (Zustand)

```typescript
const useWorkoutStore = create<WorkoutState>((set) => ({
  activeWorkout: null,
  setActiveWorkout: (workout) => set({ activeWorkout: workout }),
}));
```

## Event Handling Patterns

### 1. Callback Props

```typescript
interface Props {
  onComplete: (setId: string) => void;
  onEdit: (setId: string) => void;
}

// Usage
<Button onClick={() => onComplete(set.id)}>
  Complete
</Button>
```

### 2. Event Handlers with Data

```typescript
const handleSetComplete = useCallback((setId: string, data: any) => {
  // Handle completion logic
  onCompleteSet?.(setId, data);
}, [onCompleteSet]);
```

## Error Handling

### Error Boundaries

```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <WorkoutSession />
</ErrorBoundary>
```

### Component-level Error Handling

```typescript
if (error) {
  return <div className="text-destructive">Error: {error.message}</div>;
}

if (isLoading) {
  return <Skeleton className="h-20 w-full" />;
}
```

## Testing Patterns

### Component Testing

```typescript
describe('WorkoutSetCard', () => {
  const mockSet: WorkoutSet = {
    id: '1',
    set_index: 1,
    weight: 100,
    weight_unit: 'kg',
    reps: 10,
    is_completed: false,
  };

  it('renders set information correctly', () => {
    render(
      <WorkoutSetCard 
        set={mockSet} 
        onComplete={jest.fn()} 
        onEdit={jest.fn()} 
      />
    );
    
    expect(screen.getByText('Set 1')).toBeInTheDocument();
    expect(screen.getByText('100 kg × 10 reps')).toBeInTheDocument();
  });
});
```

## Performance Optimization

### 1. Memoization

```typescript
const WorkoutSetCard = React.memo<WorkoutSetCardProps>(({ set, onComplete, onEdit }) => {
  return (
    // Component content
  );
});
```

### 2. Callback Optimization

```typescript
const handleComplete = useCallback((setId: string) => {
  onComplete(setId);
}, [onComplete]);
```

### 3. Lazy Loading

```typescript
const WorkoutSession = lazy(() => import('./pages/WorkoutSession'));
```

## Accessibility

### ARIA Labels

```typescript
<button 
  aria-label={`Complete set ${set.set_index}`}
  onClick={() => onComplete(set.id)}
>
  Complete
</button>
```

### Keyboard Navigation

```typescript
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    onComplete(set.id);
  }
};
```

## Component Documentation

Each component should include:

1. **Purpose**: What the component does
2. **Props Interface**: Typed props with descriptions
3. **Usage Example**: How to use the component
4. **Variants**: Available style variants
5. **Accessibility**: ARIA considerations