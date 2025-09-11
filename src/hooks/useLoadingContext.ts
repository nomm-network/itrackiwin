import { useQuery } from '@tanstack/react-query';
import { getCachedLoadingContext, LoadingContext } from '@/lib/loading/resolveLoading';
import { useUserProfile } from '@/hooks/useUserProfile';

export function useLoadingContext() {
  const { data: userProfile } = useUserProfile();

  return useQuery({
    queryKey: ['loading-context', userProfile?.id],
    queryFn: () => getCachedLoadingContext(userProfile?.id),
    enabled: !!userProfile?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useEquipmentResolver(
  exerciseId?: string, 
  loadType: 'dual_load' | 'single_load' | 'stack' = 'dual_load'
) {
  const { data: context, isLoading } = useLoadingContext();
  const { data: userProfile } = useUserProfile();

  const resolveWeight = async (targetWeight: number, unit: 'kg' | 'lb' = 'kg') => {
    if (!context || !userProfile?.id) {
      return {
        weight: targetWeight,
        unit,
        achievable: true,
        minIncrement: unit === 'kg' ? 2.5 : 5
      };
    }

    const { resolveWeightForExercise } = await import('@/lib/loading/equipmentResolver');
    return resolveWeightForExercise(targetWeight, unit, exerciseId, loadType, userProfile.id);
  };

  const getAvailableWeights = async (maxWeight: number = 200, unit: 'kg' | 'lb' = 'kg') => {
    if (!context || !userProfile?.id) return [];

    const { getAvailableWeights: getWeights } = await import('@/lib/loading/equipmentResolver');
    return getWeights(loadType, exerciseId, userProfile.id, maxWeight, unit);
  };

  return {
    context,
    isLoading,
    resolveWeight,
    getAvailableWeights
  };
}