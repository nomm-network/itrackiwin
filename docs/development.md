# Development Guidelines

## Code Standards

### TypeScript Configuration

The project uses strict TypeScript settings for type safety:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### ESLint Rules

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  rules: {
    'react/prop-types': 'off', // Using TypeScript for prop validation
    '@typescript-eslint/no-unused-vars': 'error',
    'react-hooks/exhaustive-deps': 'warn'
  }
};
```

## Component Development

### Component Structure

```typescript
// Standard component template
import React from 'react';
import { cn } from '@/lib/utils';

interface ComponentProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Component: React.FC<ComponentProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'base-styles',
        {
          'variant-default': variant === 'default',
          'variant-secondary': variant === 'secondary',
          'size-sm': size === 'sm',
          'size-md': size === 'md',
          'size-lg': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Component;
```

### Prop Interface Guidelines

```typescript
// Use descriptive interface names
interface WorkoutSetCardProps {
  set: WorkoutSet;
  onComplete: (setId: string) => void;
  onEdit: (setId: string) => void;
  isDisabled?: boolean;
  className?: string;
}

// Avoid generic names
interface Props { } // ❌ Too generic
interface SetProps { } // ❌ Not descriptive enough
```

### Event Handler Patterns

```typescript
// Use descriptive handler names
const handleSetComplete = useCallback((setId: string) => {
  onComplete(setId);
}, [onComplete]);

const handleWeightChange = useCallback((value: number) => {
  setWeight(value);
  onWeightChange?.(value);
}, [onWeightChange]);

// Avoid generic names
const handleClick = () => { }; // ❌ Not descriptive
const onClick = () => { }; // ❌ Better to be more specific
```

## Hook Development

### Custom Hook Patterns

```typescript
// Hook naming convention: use[Purpose]
export const useWorkoutTimer = (initialSeconds: number = 0) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  
  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    setSeconds(initialSeconds);
    setIsRunning(false);
  }, [initialSeconds]);
  
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isRunning]);
  
  return {
    seconds,
    isRunning,
    start,
    pause,
    reset,
    formattedTime: formatTime(seconds),
  };
};
```

### API Hook Patterns

```typescript
// Query hooks for data fetching
export const useWorkout = (workoutId: string) => {
  return useQuery({
    queryKey: ['workout', workoutId],
    queryFn: () => fetchWorkout(workoutId),
    enabled: !!workoutId,
    staleTime: 5 * 60 * 1000,
  });
};

// Mutation hooks for data modification
export const useCreateWorkout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
};
```

## State Management

### Local State Guidelines

```typescript
// Use descriptive state names
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [workoutData, setWorkoutData] = useState<Workout | null>(null);

// Group related state
const [formData, setFormData] = useState({
  weight: 0,
  reps: 0,
  effort: 5,
});

// Use reducers for complex state
interface WorkoutState {
  exercises: Exercise[];
  currentExercise: number;
  isActive: boolean;
  startTime: Date | null;
}

type WorkoutAction = 
  | { type: 'START_WORKOUT'; payload: { exercises: Exercise[] } }
  | { type: 'COMPLETE_SET'; payload: { exerciseId: string; setId: string } }
  | { type: 'NEXT_EXERCISE' }
  | { type: 'END_WORKOUT' };

const workoutReducer = (state: WorkoutState, action: WorkoutAction): WorkoutState => {
  switch (action.type) {
    case 'START_WORKOUT':
      return {
        ...state,
        exercises: action.payload.exercises,
        isActive: true,
        startTime: new Date(),
      };
    default:
      return state;
  }
};
```

### Global State (Zustand)

```typescript
interface WorkoutStore {
  activeWorkout: Workout | null;
  isTimerRunning: boolean;
  timerSeconds: number;
  
  // Actions
  setActiveWorkout: (workout: Workout | null) => void;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  activeWorkout: null,
  isTimerRunning: false,
  timerSeconds: 0,
  
  setActiveWorkout: (workout) => set({ activeWorkout: workout }),
  
  startTimer: () => {
    set({ isTimerRunning: true });
    
    const interval = setInterval(() => {
      const { isTimerRunning } = get();
      if (!isTimerRunning) {
        clearInterval(interval);
        return;
      }
      set(state => ({ timerSeconds: state.timerSeconds + 1 }));
    }, 1000);
  },
  
  stopTimer: () => set({ isTimerRunning: false }),
  resetTimer: () => set({ timerSeconds: 0, isTimerRunning: false }),
}));
```

## Error Handling

### Component Error Boundaries

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class WorkoutErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Workout component error:', error, errorInfo);
    // Log to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-destructive rounded-lg">
          <h2 className="text-lg font-semibold text-destructive">
            Something went wrong
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Please refresh the page and try again.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Async Error Handling

```typescript
// Hook for error handling
export const useErrorHandler = () => {
  const [error, setError] = useState<string | null>(null);
  
  const handleError = useCallback((error: unknown) => {
    console.error('Application error:', error);
    
    if (error instanceof Error) {
      setError(error.message);
    } else if (typeof error === 'string') {
      setError(error);
    } else {
      setError('An unexpected error occurred');
    }
    
    // Clear error after 5 seconds
    setTimeout(() => setError(null), 5000);
  }, []);
  
  const clearError = useCallback(() => setError(null), []);
  
  return { error, handleError, clearError };
};

// Usage in components
const WorkoutComponent = () => {
  const { error, handleError } = useErrorHandler();
  const { mutate: logSet } = useLogSet({
    onError: handleError,
  });
  
  if (error) {
    return <ErrorAlert message={error} />;
  }
  
  return <div>/* Component content */</div>;
};
```

## Testing

### Component Testing

```typescript
// WorkoutSetCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import WorkoutSetCard from './WorkoutSetCard';

const mockSet: WorkoutSet = {
  id: '1',
  set_index: 1,
  weight: 100,
  weight_unit: 'kg',
  reps: 10,
  is_completed: false,
};

describe('WorkoutSetCard', () => {
  const mockOnComplete = vi.fn();
  const mockOnEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders set information correctly', () => {
    render(
      <WorkoutSetCard 
        set={mockSet} 
        onComplete={mockOnComplete} 
        onEdit={mockOnEdit} 
      />
    );
    
    expect(screen.getByText('Set 1')).toBeInTheDocument();
    expect(screen.getByText('100 kg × 10 reps')).toBeInTheDocument();
  });

  it('calls onComplete when complete button is clicked', () => {
    render(
      <WorkoutSetCard 
        set={mockSet} 
        onComplete={mockOnComplete} 
        onEdit={mockOnEdit} 
      />
    );
    
    fireEvent.click(screen.getByText('Complete'));
    expect(mockOnComplete).toHaveBeenCalledWith('1');
  });

  it('does not show complete button for completed sets', () => {
    const completedSet = { ...mockSet, is_completed: true };
    
    render(
      <WorkoutSetCard 
        set={completedSet} 
        onComplete={mockOnComplete} 
        onEdit={mockOnEdit} 
      />
    );
    
    expect(screen.queryByText('Complete')).not.toBeInTheDocument();
  });
});
```

### Hook Testing

```typescript
// useWorkoutTimer.test.ts
import { renderHook, act } from '@testing-library/react';
import { useWorkoutTimer } from './useWorkoutTimer';

describe('useWorkoutTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with initial seconds', () => {
    const { result } = renderHook(() => useWorkoutTimer(30));
    
    expect(result.current.seconds).toBe(30);
    expect(result.current.isRunning).toBe(false);
  });

  it('starts and increments timer', () => {
    const { result } = renderHook(() => useWorkoutTimer(0));
    
    act(() => {
      result.current.start();
    });
    
    expect(result.current.isRunning).toBe(true);
    
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    expect(result.current.seconds).toBe(3);
  });
});
```

## Performance

### React.memo Usage

```typescript
// Memoize components that receive stable props
const WorkoutSetCard = React.memo<WorkoutSetCardProps>(({ 
  set, 
  onComplete, 
  onEdit 
}) => {
  return (
    // Component content
  );
});

// Custom comparison for complex props
const ExerciseCard = React.memo<ExerciseCardProps>(
  ({ exercise, onUpdate }) => {
    // Component content
  },
  (prevProps, nextProps) => {
    return (
      prevProps.exercise.id === nextProps.exercise.id &&
      prevProps.exercise.sets.length === nextProps.exercise.sets.length
    );
  }
);
```

### useCallback and useMemo

```typescript
const WorkoutExerciseCard = ({ exercise, onCompleteSet }) => {
  // Memoize expensive calculations
  const exerciseStats = useMemo(() => {
    return {
      totalVolume: exercise.sets.reduce((sum, set) => 
        sum + (set.weight * set.reps), 0
      ),
      completedSets: exercise.sets.filter(set => set.is_completed).length,
    };
  }, [exercise.sets]);
  
  // Memoize event handlers
  const handleSetComplete = useCallback((setId: string) => {
    onCompleteSet(setId, { exerciseId: exercise.id });
  }, [onCompleteSet, exercise.id]);
  
  return (
    <div>
      <div>Volume: {exerciseStats.totalVolume}kg</div>
      <div>Completed: {exerciseStats.completedSets}</div>
      {/* Rest of component */}
    </div>
  );
};
```

### Lazy Loading

```typescript
// Lazy load heavy components
const WorkoutAnalytics = lazy(() => import('./WorkoutAnalytics'));
const ExerciseLibrary = lazy(() => import('./ExerciseLibrary'));

// Use with Suspense
const App = () => {
  return (
    <Router>
      <Routes>
        <Route 
          path="/analytics" 
          element={
            <Suspense fallback={<AnalyticsLoading />}>
              <WorkoutAnalytics />
            </Suspense>
          } 
        />
      </Routes>
    </Router>
  );
};
```

## Git Workflow

### Commit Messages

```bash
# Format: type(scope): description

feat(workouts): add set completion tracking
fix(timer): resolve timer pause issue
docs(readme): update installation instructions
style(components): improve button hover states
refactor(hooks): extract workout logic to custom hook
test(sets): add tests for set logging
perf(queries): optimize workout data fetching
```

### Branch Naming

```bash
# Feature branches
feature/workout-timer
feature/exercise-library

# Bug fixes
fix/set-completion-bug
fix/timer-reset-issue

# Hotfixes
hotfix/critical-data-loss

# Releases
release/v1.2.0
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Changes
- [ ] Added new feature
- [ ] Fixed bug
- [ ] Updated documentation
- [ ] Added tests

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
```

## Deployment

### Environment Configuration

```bash
# .env.local
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# .env.production
VITE_SUPABASE_URL=production-url
VITE_SUPABASE_ANON_KEY=production-key
```

### Build Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-button'],
        },
      },
    },
  },
});
```

## Code Review Guidelines

### What to Look For

1. **Type Safety**: Proper TypeScript usage
2. **Performance**: Unnecessary re-renders, memory leaks
3. **Accessibility**: ARIA labels, keyboard navigation
4. **Security**: Input validation, RLS compliance
5. **Testing**: Test coverage for new features
6. **Documentation**: Code comments, README updates

### Review Checklist

- [ ] Code follows established patterns
- [ ] Types are properly defined
- [ ] Error handling is implemented
- [ ] Performance considerations addressed
- [ ] Tests are included
- [ ] Documentation is updated
- [ ] No console.log statements in production code
- [ ] Accessibility standards met