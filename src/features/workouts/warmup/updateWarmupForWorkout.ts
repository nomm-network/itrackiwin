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

export async function updateWarmupForWorkout(p: UpdateParams) {
  try {
    // 1) Pull current context we need (exercise_id, gym, recent set, feedback, template target)
    const { data: we, error: weErr } = await supabase
      .from('workout_exercises')
      .select(`
        id, exercise_id, workout_id, warmup_feedback
      `)
      .eq('id', p.workoutExerciseId)
      .single();
    if (weErr || !we) throw weErr ?? new Error('WE not found');

    const { data: w, error: wErr } = await supabase
      .from('workouts')
      .select(`id, user_id`)
      .eq('id', we.workout_id)
      .single();
    if (wErr || !w) throw wErr;

    // last completed set for this WE
    const { data: lastSet } = await supabase
      .from('workout_sets')
      .select(`weight, reps, notes, is_completed`)
      .eq('workout_exercise_id', p.workoutExerciseId)
      .eq('is_completed', true)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // 2) Decide working target with progressive logic
    const feel = p.lastFeel ?? null;
    const working = suggestTarget({
      lastWeight: lastSet?.weight ?? null,
      lastReps: lastSet?.reps ?? null,
      feel: feel as Feel,
      templateTargetReps: 10, // default target reps
      templateTargetWeight: 0, // will use last weight or default
    });

    // 3) Build warm-up based on current target + feedback + gym increments
    const minInc = await getGymMinIncrement(null); // use default for now
    const fb = p.feedback ?? we.warmup_feedback ?? null;

    const plan = buildWarmupPlan({
      workingWeightKg: working.weight,
      workingReps: working.reps,
      minIncrement: minInc,
      feedback: fb as Feedback,
    });

    // 4) Persist plan snapshot used by UI
    await supabase.from('workout_exercises')
      .update({
        warmup_plan: plan,
        warmup_updated_at: new Date().toISOString(),
      })
      .eq('id', p.workoutExerciseId);

    console.log('Updated warmup plan:', plan);
  } catch (error) {
    console.error('Error updating warmup for workout:', error);
    throw error;
  }
}