import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type EstimateNeedResult = { needs: boolean };

export function useNeedsEstimate(userId?: string, exerciseId?: string, repTarget = 10) {
  return useQuery<EstimateNeedResult>({
    queryKey: ['needsEstimate', userId, exerciseId, repTarget],
    enabled: Boolean(userId && exerciseId),
    queryFn: async (): Promise<EstimateNeedResult> => {
      if (!userId || !exerciseId) return { needs: false };

      try {
        // Check if estimate exists with explicit type casting to avoid TS issues
        const response = await (supabase as any)
          .from('user_exercise_estimates')
          .select('id')
          .eq('user_id', userId)
          .eq('exercise_id', exerciseId)
          .eq('rep_target', repTarget)
          .maybeSingle();

        if (response.error && response.error.code !== 'PGRST116') {
          console.error('Error checking estimate:', response.error);
          return { needs: false };
        }

        // If no estimate exists, user needs to provide one
        return { needs: !response.data };
      } catch (error) {
        console.error('Error checking estimate needs:', error);
        return { needs: false }; // Fail gracefully
      }
    },
    staleTime: 60_000,
    retry: 1,
  });
}