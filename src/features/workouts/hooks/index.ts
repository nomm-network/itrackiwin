// Re-export existing hooks with consistent naming
export { useWorkoutOpen as useGetWorkout } from '../../../hooks/useOptimizedWorkout';
export { useSetLog as useLogSet } from '../../../hooks/useOptimizedWorkout';
export { useExerciseSearch as useSearchExercises } from '../../../hooks/useOptimizedWorkout';
export { useUserLastSet } from '../../../hooks/useOptimizedWorkout';
export { useUserPR } from '../../../hooks/useOptimizedWorkout';

// Simple start workout hook using existing infrastructure
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useStartQuickWorkout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('workouts')
        .insert({
          name: 'Quick Workout',
          user_id: user.user.id,
          started_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
};