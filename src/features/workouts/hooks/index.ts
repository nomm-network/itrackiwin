// Re-export existing hooks with consistent naming
export { useWorkoutOpen as useGetWorkout } from '../../../hooks/useOptimizedWorkout';
export { useSetLog as useLogSet } from '../../../hooks/useOptimizedWorkout';
export { useExerciseSearch as useSearchExercises } from '../../../hooks/useOptimizedWorkout';
export { useUserLastSet } from '../../../hooks/useOptimizedWorkout';
export { useUserPR } from '../../../hooks/useOptimizedWorkout';

// Export the main start workout hook from standalone file
export { useStartQuickWorkout } from './useStartQuickWorkout';

// Export active workout hook
export { useActiveWorkout } from './useActiveWorkout';