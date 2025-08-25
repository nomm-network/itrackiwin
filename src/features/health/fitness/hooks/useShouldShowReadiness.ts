import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useShouldShowReadiness(workoutId?: string, userId?: string) {
  return useQuery({
    queryKey: ['shouldShowReadiness', workoutId, userId],
    enabled: Boolean(workoutId && userId),
    queryFn: async () => {
      console.log('🔍 useShouldShowReadiness: checking', { workoutId, userId });
      
      // Use the pre-built view for efficiency and consistency
      const { data, error } = await supabase
        .from('v_pre_checkin_exists')
        .select('*')
        .eq('workout_id', workoutId!)
        .eq('user_id', userId!)
        .maybeSingle();
        
      if (error) {
        console.error('❌ useShouldShowReadiness error:', error);
        throw error;
      }
      
      const shouldShow = !data; // No record = should show readiness
      console.log('🎯 useShouldShowReadiness result:', { shouldShow, data });
      
      return shouldShow;
    },
    staleTime: 30_000, // Shorter cache time for more responsive updates
  });
}