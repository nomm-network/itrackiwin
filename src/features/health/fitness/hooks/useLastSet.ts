import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type LastSet = {
  weight: number | null;
  reps: number | null;
  set_index: number;
  completed_at: string;
  notes: string | null;
  rpe: number | null;
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

      // 1) exact same set number
      console.log('🔍 useLastSet: Querying for exact set match with:', {
        userId,
        exerciseId,
        setIndex,
        queryFilters: {
          'workout_exercises.workouts.user_id': userId,
          'workout_exercises.exercise_id': exerciseId,
          'set_index': setIndex,
          'is_completed': true
        }
      });

      const sameSet = await supabase
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
        .eq('set_index', setIndex!)
        .eq('is_completed', true)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(1);

      console.log('🔍 useLastSet: Query result:', { data: sameSet.data, error: sameSet.error });

      if (sameSet.error) {
        console.error('❌ sameSet query error', sameSet.error);
        throw sameSet.error;
      }

      if (sameSet.data && sameSet.data.length > 0) {
        const row = sameSet.data[0];
        console.log('✅ useLastSet: same set match', row);
        return {
          weight: row.weight,
          reps: row.reps,
          set_index: row.set_index,
          completed_at: row.completed_at,
          notes: row.notes,
          rpe: row.rpe,
        };
      }

      console.log('📭 useLastSet: no exact set match found, not using fallback for set-specific targeting');
      return null;
    },
    staleTime: 5 * 60 * 1000,
  });
}