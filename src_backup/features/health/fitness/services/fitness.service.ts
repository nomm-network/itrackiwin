// Re-export from existing API location for backward compatibility
export * from './fitness.api';

// Define cache keys for React Query
export const fitnessKeys = {
  all: ['fitness'] as const,
  workouts: () => [...fitnessKeys.all, 'workouts'] as const,
  workout: (id: string) => [...fitnessKeys.workouts(), id] as const,
  exercises: () => [...fitnessKeys.all, 'exercises'] as const,
  exercise: (id: string) => [...fitnessKeys.exercises(), id] as const,
  metrics: () => [...fitnessKeys.all, 'metrics'] as const,
  metric: (id: string) => [...fitnessKeys.metrics(), id] as const,
  templates: () => [...fitnessKeys.all, 'templates'] as const,
  template: (id: string) => [...fitnessKeys.templates(), id] as const,
};