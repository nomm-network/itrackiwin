import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useShouldShowReadiness(workoutId?: string, userId?: string) {
  return useQuery({
    queryKey: ['workout-readiness', workoutId, userId],
    enabled: Boolean(workoutId && userId),
    staleTime: 0,
    gcTime: 0,
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
      
      // If we have view data, check the has_checkin field
      // If has_checkin is false, we should show readiness
      const shouldShow = viewData ? !viewData.has_checkin : true;
      console.log('🎯 useShouldShowReadiness result (view):', { shouldShow, data: viewData, hasCheckin: viewData?.has_checkin });
      
      return shouldShow;
    },
  });
}