// Compatibility exports for existing components
import { startWorkout } from '../api/workouts.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

// Re-export direct functions for new code
export { startWorkout, getWorkout, getWorkoutExercises, logSet } from '../api/workouts.api';

// Types
export type EffortLevel = 'very_easy' | 'easy' | 'moderate' | 'hard' | 'very_hard' | 'max';
export interface MissingEstimate {
  exercise_id: string;
  exercise_name: string;
  display_name: string;
}

// Stub exports for missing hooks
export const useWorkoutHasLoggedSets = (workoutId?: string) => {
  return useQuery({
    queryKey: ['workout-has-sets', workoutId],
    enabled: !!workoutId,
    queryFn: async () => false, // stub
  });
};

export const useMissingEstimates = (workoutId?: string) => {
  return useQuery({
    queryKey: ['missing-estimates', workoutId],
    enabled: !!workoutId,
    queryFn: async (): Promise<MissingEstimate[]> => [], // stub
  });
};

// Hook wrappers for existing components that expect hooks
export const useStartWorkout = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (opts: { templateId?: string } = {}) => {
      const workoutId = await startWorkout(opts.templateId || null);
      return { workoutId };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workouts'] });
      qc.invalidateQueries({ queryKey: ['active-workout'] });
    },
  });
};

export const useActiveWorkout = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['active-workout', user?.id || ''],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('workouts')
        .select('id, user_id, started_at, ended_at, title')
        .eq('user_id', user.id)
        .is('ended_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    refetchOnWindowFocus: true,
    staleTime: 15_000,
    retry: 1,
  });
};