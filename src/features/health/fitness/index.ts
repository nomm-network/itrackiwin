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
export { ExperienceLevelSelector } from './components/ExperienceLevelSelector';
export { SexSelector } from './components/SexSelector';
export { SexBasedTrainingDemo } from './components/SexBasedTrainingDemo';
export { MuscleGroupPicker } from './components/MuscleGroupPicker';
export { MuscleGroupPriorityDemo } from './components/MuscleGroupPriorityDemo';
export { FitnessConfigurationHub } from './components/FitnessConfigurationHub';
export { TemplateGeneratorDialog } from './components/TemplateGeneratorDialog';
export { ExerciseSwapDialog } from './components/ExerciseSwapDialog';

// Hooks - Public API only
export * from './hooks/useMetrics.hook';
export * from './hooks/useExperienceLevels.hook';
export * from './hooks/useExperienceLevelConfigs.hook';
export * from './hooks/useFitnessProfile.hook';
export * from './hooks/useMuscleGroups.hook';
export * from './hooks/useMusclePriorities.hook';
export * from './hooks/useEquipmentCapabilities.hook';
export * from './hooks/useTemplateGenerator.hook';
export * from './hooks/useExerciseSubstitution.hook';
export * from './utils/sexBasedTraining';
export * from './utils/sexBasedTrainingTests';
export * from './utils/musclePriorityTests';
export * from './services/musclePriorityService';
export * from './services/equipmentCapabilities.service';
export * from './services/templateGenerator.service';
export * from './services/exerciseSubstitution.service';

// Recalibration engine
export { RecalibrationEngine } from './services/recalibrationEngine.service';
export { useRecalibration, useRecalibrationHistory } from './hooks/useRecalibration.hook';

// Warmup policy engine
export { WarmupPolicyEngine } from './services/warmupPolicyEngine.service';
export { useGenerateWarmup, useWarmupFeedback, useWarmupPreferences } from './hooks/useWarmupPolicy.hook';
export { WarmupPlanPanel } from './components/WarmupPlanPanel';

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