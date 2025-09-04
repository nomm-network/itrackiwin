import { supabase } from '@/integrations/supabase/client';

export type WarmupFeedback = 'not_enough' | 'excellent' | 'too_much';

export async function updateWarmupFeedback(
  workoutExerciseId: string,
  feedback: WarmupFeedback
) {
  if (!workoutExerciseId) throw new Error('updateWarmupFeedback: missing workoutExerciseId');

  // Get current warmup plan to preserve existing data
  const currentPlan = await getCurrentWarmupPlan(workoutExerciseId);

  const { data, error } = await supabase
    .from('workout_exercises')
    .update({
      warmup_plan: {
        ...currentPlan,
        feedback,
        feedback_at: new Date().toISOString()
      }
    })
    .eq('id', workoutExerciseId)
    .select('id')
    .single();

  if (error) throw error;
  return data;
}

// Helper to safely read existing plan (so we don't blow away steps)
async function getCurrentWarmupPlan(workoutExerciseId: string): Promise<any> {
  const { data, error } = await supabase
    .from('workout_exercises')
    .select('warmup_plan')
    .eq('id', workoutExerciseId)
    .single();
  if (error) return {};
  return data?.warmup_plan ?? {};
}