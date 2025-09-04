# Project Structure

## Overview

The project follows a domain-driven, feature-based architecture that promotes modularity and maintainability.

## Root Structure

```
├── src/
│   ├── app/                    # Application shell and routing
│   ├── components/             # Global UI components
│   ├── features/               # Feature modules by domain
│   ├── hooks/                  # Global hooks
│   ├── integrations/           # External service integrations
│   ├── lib/                    # Utilities and configurations
│   ├── pages/                  # Route components
│   ├── shared/                 # Cross-domain utilities
│   ├── types/                  # Global type definitions
│   └── utils/                  # Helper functions
├── docs/                       # Documentation
├── public/                     # Static assets
└── supabase/                   # Database migrations and functions
```

## Feature Architecture

Features are organized by domain following the pattern:

```
src/features/{domain}/{subdomain}/
├── components/                 # Feature-specific components
├── hooks/                      # Feature-specific hooks
├── pages/                      # Feature route components
├── services/                   # API and business logic
├── types/                      # Feature type definitions
├── ui/                         # Exported UI components
└── index.ts                    # Feature barrel exports
```

## Health/Fitness Domain

The main fitness domain is structured as:

```
src/features/health/fitness/
├── workouts/                   # Workout management
│   ├── components/             # Workout UI components
│   ├── hooks/                  # Workout-specific hooks
│   ├── pages/                  # Workout route pages
│   └── ui/                     # Exported workout components
├── readiness/                  # Pre-workout assessments
│   ├── ui/                     # Readiness components
│   ├── hooks/                  # Readiness hooks
│   └── types/                  # Readiness type definitions
├── components/                 # Shared fitness components
├── services/                   # Fitness API services
├── hooks/                      # Shared fitness hooks
└── ui/                         # Main fitness UI exports
```

## Workout Components Structure

```
src/features/health/fitness/workouts/components/
├── ExerciseCard.tsx           # Exercise display and interaction
├── SetCard.tsx                # Individual set management
├── SetControls.tsx            # Set input controls
├── SetList.tsx                # List of sets for exercises
├── WarmupBlock.tsx            # Warmup step display
├── WarmupPanel.tsx            # Warmup management panel
├── WorkoutExerciseCard.tsx    # Exercise within workout context
├── WorkoutHeader.tsx          # Workout session header
├── WorkoutSetCard.tsx         # Set within workout context
├── WorkoutSetsBlock.tsx       # Block of sets display
└── StartWithDebug.tsx         # Debug workout starter
```

## Shared Components

```
src/shared/
├── components/                 # Reusable components
├── hooks/                      # Common hooks
├── types/                      # Shared type definitions
├── utils/                      # Utility functions
├── api/                        # Common API utilities
└── db/                         # Database utilities
```

## Import Patterns

### Internal Feature Imports
```typescript
// Within the same feature
import WorkoutSetCard from './WorkoutSetCard';
import { useWorkoutData } from '../hooks/useWorkoutData';

// Cross-feature imports
import { ReadinessCheckIn } from '../readiness/ui';
```

### External Imports
```typescript
// UI Components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Shared utilities
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

// Types
import { WorkoutSet } from '@/types/workout';
```

## Barrel Exports

Each feature module exports its public API through `index.ts` files:

```typescript
// src/features/health/fitness/workouts/index.ts
export { default as WorkoutPage } from './pages/WorkoutPage';
export { default as WorkoutSessionPage } from './pages/WorkoutSessionPage';
export * from './hooks';
export * from './ui';

// src/features/health/fitness/index.ts
export * from './workouts';
export * from './readiness';
export * from './components';
export * from './hooks';
```

## File Naming Conventions

- **Components**: PascalCase with descriptive names (`WorkoutSetCard.tsx`)
- **Hooks**: camelCase starting with `use` (`useWorkoutData.ts`)
- **Pages**: PascalCase with `.tsx` extension (`WorkoutPage.tsx`)
- **Types**: PascalCase interfaces and types (`WorkoutSet`, `ExerciseData`)
- **Utilities**: camelCase functions (`formatWeight`, `calculateOneRM`)

## Directory Guidelines

1. **Feature isolation**: Each feature should be self-contained
2. **Shared dependencies**: Common utilities go in `/shared`
3. **UI exports**: Only export components through `/ui` folders
4. **Type safety**: Define types close to their usage
5. **Barrel exports**: Use index files for clean imports