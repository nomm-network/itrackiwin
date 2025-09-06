import { supabase } from '@/integrations/supabase/client';
import { WarmupFeedback } from './types';
import { recomputeWarmupPlan } from './recalc';

export async function submitWarmupFeedback(opts: {
  workoutExerciseId: string;
  exerciseId: string;
  userId: string;
  feedback: WarmupFeedback;
}): Promise<void> {
  const { workoutExerciseId, exerciseId, userId, feedback } = opts;

  // Convert feedback to bias delta
  const delta = feedback === 'not_enough' ? +1 : feedback === 'too_much' ? -1 : 0;

  // Update user's warmup bias for this exercise
  const { error } = await supabase.rpc('upsert_warmup_bias', {
    p_user_id: userId,
    p_exercise_id: exerciseId,
    p_delta: delta
  });

  if (error) throw error;

  // Recompute warmup plan with new bias
  await recomputeWarmupPlan({ workoutExerciseId, exerciseId, userId });
}