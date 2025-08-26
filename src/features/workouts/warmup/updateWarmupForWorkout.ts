import { supabase } from '@/integrations/supabase/client';
import { buildWarmupPlan } from './calcWarmup';
import { suggestTarget } from '@/features/health/fitness/lib/targetSuggestions';

type Feel = '--' | '-' | '=' | '+' | '++';
type Feedback = 'not_enough' | 'excellent' | 'too_much';

type UpdateParams = {
  workoutExerciseId: string;
  userId: string;
  // Optional hints from the caller (saves an extra fetch if known)
  lastFeel?: Feel;
  feedback?: Feedback | null;
};

// Helper to get gym minimum increment
async function getGymMinIncrement(gymId?: string | null): Promise<number> {
  if (!gymId) return 2.5; // default increment
  
  // For now, return a sensible default. This could be enhanced to query actual gym equipment
  return 2.5;
}

// Helper to get heaviest completed set for this workout exercise
async function getHeaviestSetWeight(workoutExerciseId: string): Promise<number> {
  const { data } = await supabase
    .from('workout_sets')
    .select('weight')
    .eq('workout_exercise_id', workoutExerciseId)
    .eq('is_completed', true)
    .order('weight', { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.weight ?? 0;
}

export async function updateWarmupForWorkout(p: UpdateParams) {
  try {
    // 1) Get heaviest completed set weight for this exercise
    const heaviestWeight = await getHeaviestSetWeight(p.workoutExerciseId);
    
    // 2) Get workout exercise data for feedback and context
    const { data: we, error: weErr } = await supabase
      .from('workout_exercises')
      .select(`
        id, exercise_id, workout_id, warmup_feedback, target_sets
      `)
      .eq('id', p.workoutExerciseId)
      .single();
    if (weErr || !we) throw weErr ?? new Error('WE not found');

    // 3) Determine the top weight to use for warmup calculation
    // Prefer heaviest logged set, fallback to estimate
    let topWeight = heaviestWeight;
    if (topWeight === 0) {
      // If no sets logged yet, use a reasonable default or try to get estimate
      topWeight = 60; // 60kg default - could enhance to fetch from estimates
    }

    // 4) Get gym constraints
    const minInc = await getGymMinIncrement(null); // use default for now
    const fb = p.feedback ?? we.warmup_feedback ?? null;

    // 5) Build warm-up based on actual top weight + feedback + gym increments
    const plan = buildWarmupPlan({
      topWeightKg: topWeight,
      repsGoal: 8, // default target reps
      roundingKg: minInc,
      minWeightKg: 0,
      strategy: 'ramped',
      feedback: fb as Feedback,
    });

    // 6) Persist plan snapshot used by UI
    await supabase.from('workout_exercises')
      .update({
        warmup_plan: plan,
        warmup_updated_at: new Date().toISOString(),
      })
      .eq('id', p.workoutExerciseId);

    console.log('Updated warmup plan for', topWeight, 'kg:', plan);
  } catch (error) {
    console.error('Error updating warmup for workout:', error);
    throw error;
  }
}