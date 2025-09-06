import { supabase } from '@/integrations/supabase/client';

export async function getMissingEstimateExerciseIds(exerciseIds: string[]) {
  if (!exerciseIds.length) return [];
  
  const { data } = await supabase
    .from('workout_sets')
    .select('workout_exercises!inner(exercise_id)')
    .eq('is_completed', true)
    .in('workout_exercises.exercise_id', exerciseIds);
  
  const haveHistory = new Set((data ?? []).map((x: any) => x.workout_exercises.exercise_id));
  return exerciseIds.filter(id => !haveHistory.has(id));
}