import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useHandleRecommendedGrips(exerciseId?: string, handleId?: string) {
  return useQuery({
    queryKey: ['exercise-handle-grips', exerciseId, handleId],
    enabled: !!exerciseId && !!handleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercise_handle_grips')
        .select(`
          grip_id,
          grip:grips (id, slug, category)
        `)
        .eq('exercise_id', exerciseId)
        .eq('handle_id', handleId);
      if (error) throw error;
      return data || [];
    }
  });
}