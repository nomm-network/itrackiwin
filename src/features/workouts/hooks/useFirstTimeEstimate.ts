import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type EstimateNeedResult = { needs: boolean };

export function useNeedsEstimate(userId?: string, exerciseId?: string, repTarget = 10) {
  return useQuery<EstimateNeedResult>({
    queryKey: ['needsEstimate', userId, exerciseId, repTarget],
    enabled: Boolean(userId && exerciseId),
    queryFn: async (): Promise<EstimateNeedResult> => {
      if (!userId || !exerciseId) {
        console.log('🔍 useNeedsEstimate: Missing userId or exerciseId', { userId, exerciseId });
        return { needs: false };
      }

      console.log('🔍 useNeedsEstimate: Checking for userId:', userId, 'exerciseId:', exerciseId);

      try {
        // 1) Check if user has past completed sets for this exercise
        const { data: pastSets, error: pastErr } = await supabase
          .from('workout_sets')
          .select(`
            id,
            workout_exercises!inner(
              exercise_id,
              workouts!inner(user_id)
            )
          `)
          .eq('workout_exercises.exercise_id', exerciseId)
          .eq('workout_exercises.workouts.user_id', userId)
          .eq('is_completed', true)
          .limit(1);

        if (pastErr) {
          console.error('🔍 useNeedsEstimate: Error checking past sets:', pastErr);
          return { needs: false };
        }

        if (pastSets && pastSets.length > 0) {
          console.log('🔍 useNeedsEstimate: Found past sets, no estimate needed');
          return { needs: false };
        }

        // 2) Check if estimate exists
        const estimateResponse = await (supabase as any)
          .from('user_exercise_estimates')
          .select('id')
          .eq('user_id', userId)
          .eq('exercise_id', exerciseId)
          .eq('rep_target', repTarget)
          .maybeSingle();
        
        const { data: estimate, error: estErr } = estimateResponse;

        if (estErr && estErr.code !== 'PGRST116') {
          console.error('🔍 useNeedsEstimate: Error checking estimate:', estErr);
          return { needs: false };
        }

        const needsEstimate = !estimate;
        console.log('🔍 useNeedsEstimate: Final result:', { needsEstimate, hasEstimate: !!estimate });
        
        return { needs: needsEstimate };
      } catch (error) {
        console.error('🔍 useNeedsEstimate: Unexpected error:', error);
        return { needs: false }; // Fail gracefully
      }
    },
    staleTime: 60_000,
    retry: 1,
  });
}