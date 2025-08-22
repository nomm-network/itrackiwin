// Barrel exports for fitness feature - Public API only
export { default as FitnessPage } from './pages/Fitness.page';
export { default as ExercisesPage } from './pages/Exercises.page';
export { default as WorkoutSessionPage } from './pages/WorkoutSession.page';
export { default as TemplatesPage } from './pages/Templates.page';
export { default as HistoryPage } from './pages/History.page';

// Onboarding pages
export { default as OnboardingPage } from './pages/onboarding/Onboarding.page';
export { default as WelcomePage } from './pages/onboarding/Welcome.page';
export { default as SettingsPage } from './pages/onboarding/Settings.page';
export { default as FitnessProfilePage } from './pages/onboarding/FitnessProfile.page';

// Components - Only expose what's needed outside the feature
export { default as DynamicMetricsForm } from './components/DynamicMetricsForm';
export { default as EffortSelector } from './components/EffortSelector';

// Hooks - Public API only
export * from './hooks/useMetrics.hook';
export { 
  useExercises, 
  useExercise, 
  useWorkouts, 
  useWorkout,
  useCreateWorkout,
  useCreateWorkoutSet,
  useUpdateWorkoutSet
} from './hooks/useFitnessQueries.hook';

// Services - Public API only  
export * from './services/fitness.api';
export { fitnessKeys } from './services/queries.service';

// Routes
export { FitnessRoutes } from './routes';