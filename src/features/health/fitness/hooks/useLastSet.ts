import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type LastSet = {
  weight: number | null;
  reps: number | null;
  set_index: number;
  completed_at: string;
  notes: string | null;
  rpe: number | null;
  feel?: string | null;
};

export function useLastSet(
  userId?: string,
  exerciseId?: string,
  setIndex?: number
) {
  return useQuery({
    queryKey: ['lastSet', userId, exerciseId, setIndex],
    enabled: Boolean(userId && exerciseId && Number.isFinite(setIndex)),
    queryFn: async (): Promise<LastSet | null> => {
      console.log('🔍 useLastSet called with params', { userId, exerciseId, setIndex });
      
      if (!userId || !exerciseId || !Number.isFinite(setIndex)) {
        console.log('❌ useLastSet: Invalid parameters', { userId, exerciseId, setIndex });
        return null;
      }

      // Get the most recent completed set for this exercise (ANY set index, not just specific one)
      console.log('🔍 useLastSet: Querying for most recent set for exercise (ANY set_index):', {
        userId,
        exerciseId,
        setIndex,
        queryFilters: {
          'workout_exercises.workouts.user_id': userId,
          'workout_exercises.exercise_id': exerciseId,
          'is_completed': true,
          'weight_not_null': true,
          'reps_not_null': true
        }
      });

      const lastSet = await supabase
        .from('workout_sets')
        .select(`
          weight, reps, set_index, completed_at, notes, rpe,
          workout_exercises!inner(
            exercise_id,
            workouts!inner(user_id)
          )
        `)
        .eq('workout_exercises.workouts.user_id', userId!)
        .eq('workout_exercises.exercise_id', exerciseId!)
        .eq('is_completed', true)
        .not('completed_at', 'is', null)
        .not('weight', 'is', null)
        .not('reps', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(1);

      console.log('🔍 useLastSet: Query result:', { data: lastSet.data, error: lastSet.error });

      if (lastSet.error) {
        console.error('❌ lastSet query error', lastSet.error);
        throw lastSet.error;
      }

      if (lastSet.data && lastSet.data.length > 0) {
        const row = lastSet.data[0];
        console.log('✅ useLastSet: found most recent set', row);
        return {
          weight: row.weight,
          reps: row.reps,
          set_index: row.set_index,
          completed_at: row.completed_at,
          notes: row.notes,
          rpe: row.rpe,
          feel: null // Will be derived from notes if needed
        };
      }

      console.log('📭 useLastSet: no previous sets found for this exercise (any set index)');
      return null;
    },
    staleTime: 5 * 60 * 1000,
  });
}