import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface MissingEstimate {
  exercise_id: string;
  exercise_name: string;
}

export function useMissingEstimates(workoutId?: string, repTarget = 10) {
  const { user } = useAuth();
  
  return useQuery<MissingEstimate[]>({
    queryKey: ['missingEstimates', workoutId, user?.id, repTarget],
    enabled: Boolean(workoutId && user?.id),
    queryFn: async (): Promise<MissingEstimate[]> => {
      if (!workoutId || !user?.id) {
        console.log('🔍 useMissingEstimates: Missing workoutId or userId', { workoutId, userId: user?.id });
        return [];
      }

      console.log('🔍 useMissingEstimates: Checking for workoutId:', workoutId, 'userId:', user.id);

      try {
        // Get exercises in this workout that need estimates
        const { data: exercisesNeedingEstimates, error } = await supabase
          .from('workout_exercises')
          .select(`
            exercise_id,
            exercise:exercises(
              id
            )
          `)
          .eq('workout_id', workoutId);

        if (error) {
          console.error('🔍 useMissingEstimates: Error fetching workout exercises:', error);
          return [];
        }

        if (!exercisesNeedingEstimates || exercisesNeedingEstimates.length === 0) {
          console.log('🔍 useMissingEstimates: No exercises found in workout');
          return [];
        }

        const exerciseIds = exercisesNeedingEstimates.map(ex => ex.exercise_id);
        
        // Get exercise names separately
        const { data: exerciseTranslations, error: translationsError } = await supabase
          .from('exercises_translations')
          .select('exercise_id, name, language_code')
          .in('exercise_id', exerciseIds)
          .eq('language_code', 'en');

        if (translationsError) {
          console.error('🔍 useMissingEstimates: Error fetching exercise translations:', translationsError);
        }
        
        // Check which exercises already have estimates
        const { data: existingEstimates, error: estimatesError } = await supabase
          .from('user_exercise_estimates')
          .select('exercise_id')
          .eq('user_id', user.id)
          .eq('type', '10RM')
          .in('exercise_id', exerciseIds);

        if (estimatesError) {
          console.error('🔍 useMissingEstimates: Error checking existing estimates:', estimatesError);
          return [];
        }

        // Check which exercises have past completed sets
        const { data: exercisesWithHistory, error: historyError } = await supabase
          .from('workout_sets')
          .select(`
            workout_exercises!inner(
              exercise_id,
              workouts!inner(user_id)
            )
          `)
          .eq('workout_exercises.workouts.user_id', user.id)
          .eq('is_completed', true)
          .in('workout_exercises.exercise_id', exerciseIds);

        if (historyError) {
          console.error('🔍 useMissingEstimates: Error checking exercise history:', historyError);
          return [];
        }

        const exercisesWithHistoryIds = new Set(
          exercisesWithHistory?.map(s => s.workout_exercises.exercise_id) || []
        );
        const exercisesWithEstimatesIds = new Set(
          existingEstimates?.map(e => e.exercise_id) || []
        );

        // Filter exercises that need estimates (no history AND no estimate)
        const missing = exercisesNeedingEstimates
          .filter(ex => 
            !exercisesWithHistoryIds.has(ex.exercise_id) && 
            !exercisesWithEstimatesIds.has(ex.exercise_id)
          )
          .map(ex => {
            const translation = exerciseTranslations?.find(t => t.exercise_id === ex.exercise_id);
            return {
              exercise_id: ex.exercise_id,
              exercise_name: translation?.name || 'Unknown Exercise'
            };
          });

        console.log('🔍 useMissingEstimates: Found missing estimates:', missing);
        
        return missing;
      } catch (error) {
        console.error('🔍 useMissingEstimates: Unexpected error:', error);
        return [];
      }
    },
    staleTime: 60_000,
    retry: 1,
  });
}