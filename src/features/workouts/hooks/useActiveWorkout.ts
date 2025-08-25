import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useActiveWorkout = () => {
  return useQuery({
    queryKey: ['active_workout'],
    queryFn: async () => {
      console.log('🔍 [useActiveWorkout] Fetching active workout...');
      
      const { data, error } = await supabase
        .from('workouts')
        .select('id, started_at, title, user_id')
        .is('ended_at', null)          // ended_at IS NULL
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      console.log('🔍 [useActiveWorkout] Query result:', { data, error });

      if (error) {
        console.error('❌ [useActiveWorkout] Error:', error);
        throw error;
      }
      
      console.log('✅ [useActiveWorkout] Active workout found:', data);
      return data; // null if none
    },
    refetchOnWindowFocus: true,
    staleTime: 10000, // 10 seconds - shorter for debugging
    retry: 1,
  });
};