import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchExercises, 
  fetchExercise, 
  fetchWorkouts, 
  fetchWorkout,
  createWorkout,
  updateWorkout,
  createWorkoutSet,
  updateWorkoutSet,
  fitnessKeys 
} from '../services/queries.service';

// Exercise hooks
export const useExercises = (params: { search?: string; muscleId?: string; equipmentId?: string } = {}) => {
  return useQuery({
    queryKey: fitnessKeys.exercises(),
    queryFn: () => fetchExercises(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useExercise = (id: string) => {
  return useQuery({
    queryKey: fitnessKeys.exercise(id),
    queryFn: () => fetchExercise(id),
    enabled: !!id,
  });
};

// Workout hooks
export const useWorkouts = (userId: string) => {
  return useQuery({
    queryKey: fitnessKeys.workouts(),
    queryFn: () => fetchWorkouts(userId),
    enabled: !!userId,
  });
};

export const useWorkout = (id: string) => {
  return useQuery({
    queryKey: fitnessKeys.workout(id),
    queryFn: () => fetchWorkout(id),
    enabled: !!id,
  });
};

// Workout mutations
export const useCreateWorkout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fitnessKeys.workouts() });
    },
  });
};

export const useUpdateWorkout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => updateWorkout(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: fitnessKeys.workouts() });
      queryClient.invalidateQueries({ queryKey: fitnessKeys.workout(data.id) });
    },
  });
};

// Workout set mutations
export const useCreateWorkoutSet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createWorkoutSet,
    onSuccess: () => {
      // Invalidate all workouts since we don't have direct access to workout_id
      queryClient.invalidateQueries({ queryKey: fitnessKeys.workouts() });
    },
  });
};

export const useUpdateWorkoutSet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => updateWorkoutSet(id, updates),
    onSuccess: () => {
      // Invalidate all workouts since we don't have direct access to workout_id
      queryClient.invalidateQueries({ queryKey: fitnessKeys.workouts() });
    },
  });
};