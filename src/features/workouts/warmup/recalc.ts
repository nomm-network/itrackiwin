import { supabase } from '@/integrations/supabase/client';
import { WarmupPlan, WarmupStep } from './types';

// Helper to get gym step increment
async function getGymStepKg(userId: string, exerciseId: string): Promise<number> {
  // Get user's gym equipment info to determine increment
  // For now, return a default - you can extend this based on equipment type
  return 2.5; // Default for most equipment
}

function roundToStep(x: number, step: number): number {
  return Math.round(x / step) * step;
}

export async function recomputeWarmupPlan(opts: {
  workoutExerciseId: string;
  exerciseId: string;
  userId: string;
}): Promise<WarmupPlan> {
  const { workoutExerciseId, exerciseId, userId } = opts;

  // 1) Find base weight = today's heaviest completed working set (fallback to last estimate)
  const { data: sets, error } = await supabase
    .from('workout_sets')
    .select('weight, reps, is_completed, set_index')
    .eq('workout_exercise_id', workoutExerciseId)
    .eq('is_completed', true)
    .not('weight', 'is', null)
    .order('weight', { ascending: false })
    .limit(1);
  
  if (error) throw error;

  let base = sets?.[0]?.weight ?? null;

  if (base == null) {
    // Fallback to a default weight since estimates table might not exist
    base = 60; // Default 60kg
  }

  // 2) Get user's warmup bias for this exercise
  const { data: pref } = await supabase
    .from('user_exercise_warmup_prefs')
    .select('ease_bias')
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
    .maybeSingle();

  const bias = Math.max(-2, Math.min(2, pref?.ease_bias ?? 0));

  // 3) Calculate step schema with bias adjustment
  const basePerc = [0.40, 0.60, 0.80];
  const reps = [10, 8, 5];
  const restSec = 60;

  // Apply bias: ±5% per step, bounded
  const percents = basePerc.map(p => Math.min(0.9, Math.max(0.2, p + bias * 0.05)));

  const stepKg = await getGymStepKg(userId, exerciseId);

  const steps: WarmupStep[] = percents.map((pct, i) => ({
    id: (['W1', 'W2', 'W3'] as const)[i],
    pct,
    reps: reps[i],
    restSec,
    targetWeight: roundToStep(base * pct, stepKg),
  }));

  const plan: WarmupPlan = {
    strategy: 'ramped',
    baseWeight: base,
    steps,
    updated_from: sets?.length ? 'current_working_set' : 'estimate',
    updatedAt: new Date().toISOString(),
  };

  // 4) Persist in workout_exercises
  const { error: upErr } = await supabase
    .from('workout_exercises')
    .update({ 
      warmup_plan: plan as any, 
      warmup_updated_at: new Date().toISOString() 
    })
    .eq('id', workoutExerciseId);
  
  if (upErr) throw upErr;

  return plan;
}