import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useExerciseEstimate(exerciseId?: string, type: 'rm10' | 'rm5' | 'other' = 'rm10') {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['exerciseEstimate', user?.id, exerciseId, type],
    enabled: Boolean(user?.id && exerciseId),
    queryFn: async () => {
      if (!user?.id || !exerciseId) {
        console.log('🔍 useExerciseEstimate: Missing userId or exerciseId', { userId: user?.id, exerciseId });
        return null;
      }

      console.log('🔍 useExerciseEstimate: Fetching estimate for:', { userId: user.id, exerciseId, type });

      try {
        const { data, error } = await supabase
          .from('user_exercise_estimates')
          .select('estimated_weight, unit, created_at')
          .eq('user_id', user.id)
          .eq('exercise_id', exerciseId)
          .eq('type', type)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('🔍 useExerciseEstimate: Error fetching estimate:', error);
          return null;
        }

        console.log('🔍 useExerciseEstimate: Found estimate:', data);
        return data;
      } catch (error) {
        console.error('🔍 useExerciseEstimate: Unexpected error:', error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}