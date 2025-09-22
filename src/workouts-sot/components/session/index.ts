export { default as EnhancedWorkoutSession } 
  from '@/features/workouts/components/EnhancedWorkoutSession';
export { default as WorkoutSession } 
  from '@/features/workouts/components/WorkoutSession';
export { default as TrainingLauncher } 
  from '@/features/workouts/components/TrainingLauncher';
export { default as StartOrContinue } 
  from '@/features/workouts/components/StartOrContinue';

// Shim for the broken import some files use:
export { default as ExerciseCard } 
  from './shim-ExerciseCard';