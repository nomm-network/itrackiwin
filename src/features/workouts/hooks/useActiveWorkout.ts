import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useActiveWorkout = () => {
  return useQuery({
    queryKey: ['active_workout'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select('id, started_at, title')
        .is('ended_at', null)          // ended_at IS NULL
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data; // null if none
    },
    refetchOnWindowFocus: true,
    staleTime: 30000, // 30 seconds
  });
};