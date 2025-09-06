import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useActiveWorkout = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['activeWorkout', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      console.log('🔍 [useActiveWorkout] Fetching active workout for user:', user?.id);
      
      const { data, error } = await supabase
        .from('workouts')
        .select('id, user_id, started_at, ended_at, title')
        .eq('user_id', user!.id)
        .is('ended_at', null)
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
    staleTime: 15_000,
    retry: 1,
  });
};