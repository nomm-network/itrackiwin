// Workouts Hooks Barrel Export  
// Typed hooks for easy API calls - FlutterFlow compatible

// Core workout operations - NEW API layer
export { useActiveWorkout, useGetWorkout, useStartQuickWorkout, useEndWorkout, useLogSet } from '../api/workouts.api';

// Performance queries - optimized for mobile
export { useLastSetForExercise, usePersonalRecord } from '../api/workouts.api';


// Legacy hooks (maintained for backward compatibility)
export { useWorkoutOpen } from '../../../hooks/useOptimizedWorkout';
export { useSetLog } from '../../../hooks/useOptimizedWorkout';
export { useExerciseSearch as useSearchExercises } from '../../../hooks/useOptimizedWorkout';
export { useUserLastSet } from '../../../hooks/useOptimizedWorkout';
export { useUserPR } from '../../../hooks/useOptimizedWorkout';