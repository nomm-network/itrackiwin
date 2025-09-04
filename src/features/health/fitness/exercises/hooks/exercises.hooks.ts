import { useQuery } from '@tanstack/react-query';
import { exercisesApi } from '../api/exercises.api';

export const useExercises = (filters?: {
  search?: string;
  muscleId?: string;
  equipmentId?: string;
}) => {
  return useQuery({
    queryKey: ['exercises', filters],
    queryFn: () => exercisesApi.getExercises(filters),
    staleTime: 300000,
  });
};

export const useExercise = (exerciseId: string) => {
  return useQuery({
    queryKey: ['exercise', exerciseId],
    queryFn: () => exercisesApi.getExercise(exerciseId),
    enabled: !!exerciseId,
    staleTime: 300000,
  });
};

export const useEffectiveMuscles = (
  exerciseId: string,
  gripIds?: string[],
  equipmentId?: string
) => {
  return useQuery({
    queryKey: ['effective-muscles', exerciseId, gripIds, equipmentId],
    queryFn: () => exercisesApi.getEffectiveMuscles(exerciseId, gripIds, equipmentId),
    enabled: !!exerciseId,
    staleTime: 300000,
  });
};