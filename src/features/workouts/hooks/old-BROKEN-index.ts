// Workouts Hooks Barrel Export  
// Typed hooks for easy API calls - FlutterFlow compatible

// Core workout operations - NEW API layer
export { useActiveWorkout, useGetWorkout, useStartWorkout, useEndWorkout, useLogSet, useUpdateSet } from '@/workouts-sot/api';

// Performance queries - optimized for mobile
export { useLastSetForExercise, usePersonalRecord } from '@/workouts-sot/api';

// Exercise estimates
export { useExerciseEstimate } from './useExerciseEstimate';

// Smart workout features
export { useSmartWarmup } from './useSmartWarmup';
export { useReadinessTargets } from './useReadinessTargets';

// Legacy hooks (maintained for backward compatibility)
export { useWorkoutOpen } from '../../../hooks/useOptimizedWorkout';
export { useUserLastSet } from '../../../hooks/useOptimizedWorkout';
export { useUserPR } from '../../../hooks/useOptimizedWorkout';