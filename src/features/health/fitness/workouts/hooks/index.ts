// Workout hooks
// Re-export hooks that were moved to api folder
export * from '../api/workouts.api';

// Export type for compatibility
export type MissingEstimate = {
  exercise_id: string;
  exercise_name: string;
};

export type EffortLevel = 'very_easy' | 'easy' | 'moderate' | 'hard' | 'very_hard';

// Temporary stub hooks until migration is complete
export const useMissingEstimates = (workoutId?: string) => ({
  data: [] as MissingEstimate[],
  isLoading: false
});

export const useWorkoutHasLoggedSets = (workoutId?: string) => ({
  data: false,
  isLoading: false
});

export const useStartWorkout = () => ({
  mutate: (data: any, callbacks?: any) => {
    console.log('useStartWorkout stub', data);
    callbacks?.onSuccess?.({ workoutId: 'stub-workout-id' });
  },
  isPending: false,
  isLoading: false
});

export const useExerciseEstimate = (exerciseId?: string) => ({
  data: null,
  isLoading: false
});