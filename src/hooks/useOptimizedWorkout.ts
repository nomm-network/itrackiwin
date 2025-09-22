import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Hook for opening workout with all data in one call
export const useWorkoutOpen = (workoutId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['workout', workoutId, user?.id],
    enabled: !!workoutId && !!user?.id,
    queryFn: async () => {
      console.log('🔍 [useWorkoutOpen] Fetching workout with id:', workoutId, 'for user:', user?.id);
      
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          id, user_id, started_at, ended_at, title, notes,
          workout_exercises:workout_exercises (
            id, workout_id, exercise_id, order_index, notes,
            exercises (
              id, owner_user_id, image_url, equipment_id,
              primary_muscle_id, movement_pattern, loading_hint
            ),
            sets:workout_sets (*)
          )
        `)
        .eq('id', workoutId!)
        .eq('user_id', user!.id)
        .maybeSingle();

      console.log('🔍 [useWorkoutOpen] Query result:', { data, error });

      if (error) {
        console.error('❌ [useWorkoutOpen] Error:', error);
        throw error;
      }
      
      if (!data) {
        console.warn('⚠️ [useWorkoutOpen] Workout not found');
        throw new Error('Workout not found');
      }
      
      // Transform the data to match expected structure
      const transformedData = {
        ...data,
        exercises: data.workout_exercises || []
      };
      
      console.log('✅ [useWorkoutOpen] Workout loaded successfully', transformedData);
      return transformedData;
    },
    staleTime: 60_000,
  });
};

// Hook for getting user's last set for an exercise
export const useUserLastSet = (exerciseId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-last-set', exerciseId],
    queryFn: async () => {
      if (!exerciseId || !user?.id) return null;
      
      // TODO: Re-implement when get_user_last_set_for_exercise function is available
      // For now, return null
      return null;
    },
    enabled: !!exerciseId,
    staleTime: 60000, // 1 minute
  });
};

// Hook for getting user's PR for an exercise
export const useUserPR = (exerciseId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-pr', exerciseId],
    queryFn: async () => {
      if (!exerciseId || !user?.id) return null;
      
      // TODO: Re-implement when get_user_pr_for_exercise function is available
      // For now, return null
      return null;
    },
    enabled: !!exerciseId,
    staleTime: 300000, // 5 minutes for PRs
  });
};