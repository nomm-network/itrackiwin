# File Structure Guidelines

This document outlines the file structure conventions and patterns to follow when creating new files and implementing features in this project.

## Overview

The project follows a **feature-first architecture** with clear separation of concerns:

```
src/
├── app/                    # App-level configuration
├── shared/                 # Generic, reusable code
├── features/               # Feature modules (domain-driven)
├── admin/                  # Administrative interface
├── integrations/           # External service integrations
└── pages/                  # Legacy pages (being migrated)
```

## Core Principles

1. **Feature-first**: Group related functionality together
2. **Domain boundaries**: Features reflect business domains
3. **Module isolation**: Features can only import from shared, app, or other feature's public API
4. **Naming conventions**: Consistent file naming for easy navigation
5. **Barrel exports**: Control public APIs via index.ts files

## Directory Structure

### `/src/app/` - Application Core
Configuration and app-wide concerns:

```
app/
├── router/
│   ├── AppRoutes.tsx       # Main routing configuration
│   ├── paths.ts           # Route path constants
│   └── route-guards/      # Authentication & authorization guards
│       ├── Auth.guard.tsx
│       └── Admin.guard.tsx
├── providers/             # App-wide providers
│   └── QueryClientProvider.tsx
└── theme/                 # Design system
    └── tokens.css
```

### `/src/shared/` - Generic Utilities
**CRITICAL**: Keep this minimal and domain-agnostic:

```
shared/
├── components/            # Generic UI components only
│   └── layout/
├── hooks/                # Generic hooks
├── lib/                  # Utility functions
│   └── queryKeys.ts      # Centralized React Query keys
└── index.ts              # Barrel export
```

**Rules for shared/:**
- No domain-specific logic (no fitness, exercise, etc.)
- Must be reusable across ALL features
- No dependencies on feature modules

### `/src/features/` - Feature Modules
Domain-driven feature organization:

```
features/
├── health/
│   └── fitness/          # Example feature
│       ├── pages/        # Feature pages (*.page.tsx)
│       ├── components/   # Feature-specific components
│       ├── hooks/        # Feature-specific hooks (*.hook.ts)
│       ├── services/     # Data access layer
│       ├── i18n/         # Feature translations
│       ├── routes.tsx    # Feature routing
│       └── index.ts      # Public API barrel
├── social/
├── analytics/
└── ...
```

### `/src/admin/` - Administrative Interface
Cross-cutting admin functionality:

```
admin/
├── layout/               # Admin-specific layouts
│   └── AdminLayout.tsx
├── resources/            # Organized by resource type
│   ├── exercises/
│   ├── muscles/
│   ├── equipment/
│   └── translations/
├── routes.tsx           # Admin routing
└── index.ts             # Public API barrel
```

## File Naming Conventions

### Required Suffixes
- **Pages**: `*.page.tsx` (e.g., `Fitness.page.tsx`)
- **Route Guards**: `*.guard.tsx` (e.g., `Auth.guard.tsx`)
- **Hooks**: `*.hook.ts` (e.g., `useFitness.hook.ts`)
- **Services**: `*.service.ts` or `*.api.ts`
- **Components**: `*.component.tsx` (optional but recommended)
- **Store Slices**: `*.slice.ts`

### Examples
```
✅ CORRECT:
- ExerciseList.page.tsx
- useFitnessQueries.hook.ts
- fitness.service.ts
- Admin.guard.tsx

❌ INCORRECT:
- ExerciseListPage.tsx
- useFitnessQueries.ts
- fitnessService.ts
- AdminGuard.tsx
```

## Feature Module Structure

Each feature must follow this structure:

```
features/[domain]/[feature]/
├── pages/                # Feature pages
│   ├── FeatureName.page.tsx
│   ├── FeatureEdit.page.tsx
│   └── FeatureDetail.page.tsx
├── components/           # Feature-specific UI
│   ├── FeatureCard.component.tsx
│   └── FeatureForm.component.tsx
├── hooks/               # Feature hooks
│   ├── useFeature.hook.ts
│   └── useFeatureQueries.hook.ts
├── services/            # Data access
│   ├── feature.api.ts
│   ├── feature.service.ts
│   └── queries.service.ts
├── store/               # Feature state (optional)
│   └── feature.slice.ts
├── i18n/               # Feature translations
│   ├── en.json
│   └── ro.json
├── routes.tsx          # Feature routing
└── index.ts            # Public API barrel
```

## Import Rules & Module Boundaries

### Allowed Imports by Location

**Features can import:**
- Their own files: `./`, `../`
- Shared utilities: `@shared/*`, `@/shared/*`
- App config: `@app/*`, `@/app/*`
- Other features' public APIs: `@features/other-feature` (via index.ts only)
- External packages

**Features CANNOT import:**
- Direct paths into other features: `@features/other-feature/pages/*` ❌
- Admin modules: `@admin/*` ❌

**Admin can import:**
- Its own files
- Shared utilities
- App config
- Feature public APIs (when managing those resources)

### ESLint Enforcement
We enforce these rules via ESLint:

```js
"no-restricted-imports": ["error", {
  "patterns": [
    { 
      "group": ["src/features/*/*/*"], 
      "message": "Import via that feature's public index.ts" 
    }
  ]
}]
```

## Barrel Exports (index.ts)

Every feature and admin module must have an `index.ts` that exports only the public API:

```typescript
// features/health/fitness/index.ts
export { default as FitnessPage } from './pages/Fitness.page';
export { default as ExercisesPage } from './pages/Exercises.page';

// Components - Only expose what's needed outside
export { default as EffortSelector } from './components/EffortSelector';

// Hooks - Public API only
export { useExercises, useWorkouts } from './hooks/useFitnessQueries.hook';

// Services - Public API only
export { fitnessKeys } from './services/queries.service';

// Routes
export { FitnessRoutes } from './routes';
```

## Data Access Pattern

### Service Layer Structure
Each feature has a data access layer in `services/`:

```
services/
├── feature.api.ts       # Direct API calls
├── queries.service.ts   # React Query hooks
└── feature.service.ts   # Business logic (optional)
```

### Example Implementation
```typescript
// fitness.api.ts - Direct Supabase calls
export async function fetchExercises(params: { search?: string }) {
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .ilike("name", `%${params.search ?? ""}%`);
  
  if (error) throw error;
  return data;
}

// queries.service.ts - React Query hooks
export const useExercises = (search: string) =>
  useQuery({
    queryKey: fitnessKeys.exercises(search),
    queryFn: () => fetchExercises({ search })
  });

// Query keys
export const fitnessKeys = {
  all: ['fitness'] as const,
  exercises: (search?: string) => [...fitnessKeys.all, 'exercises', search] as const,
};
```

## Routing Patterns

### Feature Routing
Each feature defines its own routes:

```typescript
// features/health/fitness/routes.tsx
export const FitnessRoutes = (
  <Routes>
    <Route index element={<FitnessPage />} />
    <Route path="exercises" element={<ExercisesPage />} />
    <Route path="exercises/:id/edit" element={<ExerciseEditPage />} />
  </Routes>
);
```

### Route Integration
Main router delegates to feature routes:

```typescript
// app/router/AppRoutes.tsx
<Route path="/fitness/*" element={<AuthGuard />}>
  {FitnessRoutes}
</Route>
```

## Internationalization (i18n)

### Feature-Specific Translations
Each feature manages its own translations:

```
features/health/fitness/i18n/
├── en.json
└── ro.json
```

### Translation Keys
Use namespaced keys:

```json
{
  "fitness": {
    "exercises": {
      "title": "Exercises",
      "searchPlaceholder": "Search exercises..."
    }
  }
}
```

## Component Organization

### Shared vs Feature Components
- **Shared**: Generic UI (Button, Card, Input, etc.)
- **Feature**: Domain-specific (ExerciseCard, WorkoutTimer, etc.)

### Component Structure
```typescript
// Feature component example
export interface ExerciseCardProps {
  exercise: Exercise;
  onEdit?: (id: string) => void;
}

export const ExerciseCard = ({ exercise, onEdit }: ExerciseCardProps) => {
  // Component implementation
};

export default ExerciseCard;
```

## State Management

### Global vs Feature State
- **Global** (`src/store/app.ts`): App-wide state (auth, theme, etc.)
- **Feature** (`features/*/store/`): Feature-specific state

### Zustand Slices
```typescript
// features/health/fitness/store/workout.slice.ts
interface WorkoutState {
  activeWorkout: Workout | null;
  setActiveWorkout: (workout: Workout) => void;
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
  activeWorkout: null,
  setActiveWorkout: (workout) => set({ activeWorkout: workout }),
}));
```

## Testing Strategy (Future)

When adding tests, follow this structure:

```
features/health/fitness/
├── __tests__/
│   ├── pages/
│   ├── components/
│   ├── hooks/
│   └── services/
└── ...
```

## Migration Guidelines

### Moving Legacy Code
When moving files from `src/pages/` or `src/components/`:

1. **Identify the correct feature** based on domain
2. **Move to appropriate feature directory**
3. **Update imports** throughout the codebase
4. **Add to feature's index.ts** if it's part of public API
5. **Update routing** in feature's routes.tsx

### Creating New Features
1. **Create feature directory** under appropriate domain
2. **Set up standard structure** (pages, components, hooks, services)
3. **Create index.ts barrel export**
4. **Add routes.tsx** with feature routing
5. **Integrate routes** in main AppRoutes.tsx
6. **Add i18n files** if needed

## Common Mistakes to Avoid

❌ **DON'T:**
- Import directly into feature internals: `@features/fitness/pages/Fitness.page`
- Put domain logic in shared/: `shared/components/ExerciseCard`
- Create monolithic files: One huge component with everything
- Skip barrel exports: Direct exports from deep paths
- Mix admin and feature concerns

✅ **DO:**
- Use public APIs: `@features/fitness` (via index.ts)
- Keep shared/ generic: `shared/components/Card`
- Create focused components: Single responsibility
- Export via index.ts: Controlled public API
- Separate admin from features

## Design System Integration

### Use Semantic Tokens
Always use design system tokens from `index.css` and `tailwind.config.ts`:

```typescript
// ❌ WRONG - Direct colors
className="text-white bg-blue-500"

// ✅ CORRECT - Semantic tokens
className="text-primary bg-primary/10"
```

### Component Variants
Create variants using the design system:

```typescript
const buttonVariants = cva("base-styles", {
  variants: {
    variant: {
      primary: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
    }
  }
});
```

## Performance Considerations

### Code Splitting
- **Lazy load pages**: Use `lazy()` for all page components
- **Route-level splitting**: Each feature is a separate bundle
- **Suspense boundaries**: Wrap lazy components

### React Query Optimization
- **Consistent cache keys**: Use centralized key factories
- **Proper invalidation**: Invalidate related queries on mutations
- **Background refetching**: Configure appropriate stale times

---

## Quick Reference Checklist

When creating a new feature:

- [ ] Create feature directory under appropriate domain
- [ ] Set up standard folder structure (pages, components, hooks, services)
- [ ] Add naming conventions (*.page.tsx, *.hook.ts, etc.)
- [ ] Create barrel export (index.ts)
- [ ] Add feature routing (routes.tsx)
- [ ] Integrate in main router
- [ ] Add i18n files if needed
- [ ] Use only allowed imports
- [ ] Follow design system conventions
- [ ] Add to documentation if needed

When adding to existing feature:

- [ ] Follow existing file naming conventions
- [ ] Place in appropriate subfolder
- [ ] Update barrel export if public API
- [ ] Update routes if adding pages
- [ ] Use semantic design tokens
- [ ] Maintain module boundaries

---

This guide ensures consistent, maintainable, and scalable code organization across the entire project.