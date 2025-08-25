import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useShouldShowReadiness(workoutId?: string, userId?: string) {
  return useQuery({
    queryKey: ['shouldShowReadiness', workoutId, userId],
    enabled: Boolean(workoutId && userId),
    queryFn: async () => {
      console.log('🔍 useShouldShowReadiness: STARTING QUERY', { workoutId, userId });
      
      // First check if view exists by querying it directly
      const { data: viewData, error: viewError } = await supabase
        .from('v_pre_checkin_exists')
        .select('*')
        .eq('workout_id', workoutId!)
        .eq('user_id', userId!)
        .maybeSingle();
        
      console.log('🔍 View query result:', { viewData, viewError });
      
      if (viewError) {
        console.warn('⚠️ View query failed, falling back to direct table query:', viewError);
        
        // Fallback to direct table query
        const { data: directData, error: directError } = await supabase
          .from('pre_workout_checkins')
          .select('*')
          .eq('workout_id', workoutId!)
          .eq('user_id', userId!)
          .maybeSingle();
          
        console.log('🔍 Direct table query result:', { directData, directError });
        
        if (directError) {
          console.error('❌ useShouldShowReadiness error:', directError);
          throw directError;
        }
        
        const shouldShow = !directData; // No record = should show readiness
        console.log('🎯 useShouldShowReadiness result (direct):', { shouldShow, data: directData });
        
        return shouldShow;
      }
      
      const shouldShow = !viewData; // No record = should show readiness
      console.log('🎯 useShouldShowReadiness result (view):', { shouldShow, data: viewData });
      
      return shouldShow;
    },
    staleTime: 30_000, // Shorter cache time for more responsive updates
  });
}