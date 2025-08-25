import { supabase } from '@/integrations/supabase/client';

export async function saveWarmupFeedback(
  workoutExerciseId: string,
  payload: {
    feedback?: 'not_enough' | 'excellent' | 'too_much';
    quality?: 'not_enough' | 'excellent' | 'too_much';
    snapshot?: string | null;          // serialized plan shown in the card
    plan?: Record<string, any> | null; // structured plan if available
  }
) {
  const { data, error } = await supabase
    .from('workout_exercises')
    .update({
      warmup_feedback: payload.feedback ?? null,
      warmup_quality:  payload.quality  ?? null,
      warmup_snapshot: payload.snapshot ?? null,
      warmup_plan:     payload.plan     ?? null,
      warmup_updated_at: new Date().toISOString()
    })
    .eq('id', workoutExerciseId) // <-- IMPORTANT: use workout_exercise.id
    .select('id, warmup_feedback, warmup_quality')
    .single();

  if (error) throw error;
  return data;
}