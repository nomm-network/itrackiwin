import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  findAlternatives, 
  saveExercisePreference, 
  getUserExercisePreferences,
  type ExerciseAlternative,
  type ExerciseConstraints 
} from '../services/exerciseSubstitution.service';
import { useEquipmentCapabilities } from './useEquipmentCapabilities.hook';
import { toast } from 'sonner';

export function useExerciseAlternatives(
  exerciseId?: string, 
  targetMuscles?: string[],
  constraints?: ExerciseConstraints,
  userId?: string
) {
  const { data: equipmentCaps } = useEquipmentCapabilities(userId);

  return useQuery({
    queryKey: ['exercise-alternatives', exerciseId, targetMuscles, constraints],
    queryFn: () => findAlternatives(exerciseId!, equipmentCaps!, targetMuscles, constraints),
    enabled: !!exerciseId && !!equipmentCaps,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSaveExercisePreference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      templateId,
      originalExerciseId,
      preferredExerciseId
    }: {
      userId: string;
      templateId: string;
      originalExerciseId: string;
      preferredExerciseId: string;
    }) => {
      await saveExercisePreference(userId, templateId, originalExerciseId, preferredExerciseId);
    },
    onSuccess: () => {
      toast.success('Exercise preference saved');
      queryClient.invalidateQueries({ queryKey: ['exercise-preferences'] });
      queryClient.invalidateQueries({ queryKey: ['workout-templates'] });
    },
    onError: (error) => {
      console.error('Failed to save exercise preference:', error);
      toast.error('Failed to save exercise preference');
    }
  });
}

export function useExercisePreferences(userId?: string, templateId?: string) {
  return useQuery({
    queryKey: ['exercise-preferences', userId, templateId],
    queryFn: () => getUserExercisePreferences(userId!, templateId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}