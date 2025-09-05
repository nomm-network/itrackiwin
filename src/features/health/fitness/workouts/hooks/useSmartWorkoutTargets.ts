import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to compute smart targets and warmup for workout exercises
 * that might have missing target_weight_kg values
 */
export function useSmartWorkoutTargets() {
  const computeTargetsMutation = useMutation({
    mutationFn: async (workoutId: string) => {
      const { data, error } = await supabase.rpc('compute_targets_for_workout', {
        p_workout_id: workoutId
      });
      
      if (error) {
        console.error('[useSmartWorkoutTargets] Error computing targets:', error);
        throw error;
      }
      
      return data;
    },
  });

  const computeTargets = useCallback((workoutId: string) => {
    return computeTargetsMutation.mutateAsync(workoutId);
  }, [computeTargetsMutation]);

  return {
    computeTargets,
    isComputing: computeTargetsMutation.isPending,
    error: computeTargetsMutation.error,
  };
}