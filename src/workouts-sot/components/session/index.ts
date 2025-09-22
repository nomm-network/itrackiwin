export { default as EnhancedWorkoutSession } 
  from '@/features/workouts/components/EnhancedWorkoutSession';
export { default as WorkoutSession } 
  from '@/features/workouts/components/WorkoutSession';

// Shim for the broken import some files use:
export { default as ExerciseCard } 
  from './shim-ExerciseCard';