# Fitness Feature

This feature handles all fitness-related functionality including exercises, workouts, templates, and analytics.

## Structure

- **pages/**: All fitness-related pages (FitnessPage, ExercisesPage, etc.)
- **components/**: Fitness-specific UI components
- **hooks/**: React hooks for fitness data and state management  
- **services/**: API calls and data fetching for fitness functionality
- **i18n/**: Internationalization files for fitness feature

## Adding a New Page

1. Create the page component in `pages/`
2. Add the route to `@/app/router/paths.ts`
3. Add the route to `@/app/router/AppRoutes.tsx`
4. Export from `index.ts` barrel file

## Data Sources

- Main tables: exercises, workouts, workout_sets, templates
- RPCs: Various fitness-related stored procedures
- Storage: Exercise images and media