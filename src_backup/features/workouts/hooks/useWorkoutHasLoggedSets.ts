import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export async function countLoggedSets(workoutId: string) {
  // 1) get workout_exercise ids
  const exRes = await supabase
    .from('workout_exercises')
    .select('id')
    .eq('workout_id', workoutId);

  if (exRes.error) throw exRes.error;

  const ids = exRes.data?.map(r => r.id) ?? [];
  if (ids.length === 0) return 0;

  // 2) count completed sets on those
  const setsRes = await supabase
    .from('workout_sets')
    .select('id', { count: 'exact', head: true })
    .eq('is_completed', true)
    .in('workout_exercise_id', ids);

  if (setsRes.error) throw setsRes.error;
  return setsRes.count ?? 0;
}

export function useWorkoutHasLoggedSets(workoutId?: string) {
  return useQuery({
    queryKey: ['workout-has-sets', workoutId],
    enabled: !!workoutId,
    queryFn: () => countLoggedSets(workoutId!),
  });
}