import { supabase } from '@/integrations/supabase/client';
import { buildWarmupPlan } from './calcWarmup';
import { suggestTarget } from '@/features/health/fitness/lib/targetSuggestions';
import { parseFeelFromNotes, parseFeelFromRPE } from '@/features/health/fitness/lib/targetSuggestions';

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

// Helper to get the intelligent target weight using progressive overload system
async function getTargetWeight(workoutExerciseId: string, userId: string): Promise<number> {
  console.log('🔍 Getting target weight for workout exercise:', workoutExerciseId);
  
  // Get exercise ID first
  const { data: we } = await supabase
    .from('workout_exercises')
    .select('exercise_id')
    .eq('id', workoutExerciseId)
    .single();
    
  if (!we?.exercise_id) {
    console.log('⚠️ No exercise found, using default 60kg');
    return 60;
  }

  // Get the most recent completed set for this exercise (from any previous workout)
  const { data: lastSet } = await supabase
    .from('workout_sets')
    .select(`
      weight, reps, set_index, completed_at, notes, rpe,
      workout_exercises!inner(
        exercise_id,
        workouts!inner(user_id)
      )
    `)
    .eq('workout_exercises.workouts.user_id', userId)
    .eq('workout_exercises.exercise_id', we.exercise_id)
    .eq('is_completed', true)
    .not('completed_at', 'is', null)
    .not('weight', 'is', null)
    .not('reps', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  console.log('🏋️ Last set data:', lastSet);

  if (!lastSet) {
    console.log('⚠️ No previous sets found, using default 60kg');
    return 60;
  }

  // Use progressive overload system to calculate target
  const lastFeel = parseFeelFromNotes(lastSet.notes) || parseFeelFromRPE(lastSet.rpe);
  
  const target = suggestTarget({
    lastWeight: lastSet.weight,
    lastReps: lastSet.reps,
    feel: lastFeel,
    templateTargetReps: undefined,
    templateTargetWeight: undefined,
    stepKg: 2.5
  });
  
  console.log('🎯 Calculated target weight:', target.weight, 'kg (from', lastSet.weight, 'kg)');
  return target.weight;
}

export async function updateWarmupForWorkout(p: UpdateParams) {
  try {
    console.log('🚀 Starting warmup update for:', p.workoutExerciseId);
    
    // 1) Get intelligent target weight using progressive overload system
    const targetWeight = await getTargetWeight(p.workoutExerciseId, p.userId);
    
    // 2) Get workout exercise data for feedback and context
    const { data: we, error: weErr } = await supabase
      .from('workout_exercises')
      .select(`
        id, exercise_id, workout_id, warmup_feedback, target_sets
      `)
      .eq('id', p.workoutExerciseId)
      .single();
    if (weErr || !we) throw weErr ?? new Error('WE not found');

    console.log('🎯 Using target weight for warmup calculation:', targetWeight, 'kg');

    // 3) Get gym constraints
    const minInc = await getGymMinIncrement(null); // use default for now
    const fb = p.feedback ?? we.warmup_feedback ?? null;

    console.log('📝 Using feedback:', fb);

    // 4) Build warm-up based on intelligent target weight + feedback + gym increments
    const plan = buildWarmupPlan({
      topWeightKg: targetWeight,
      repsGoal: 8, // default target reps
      roundingKg: minInc,
      minWeightKg: 0,
      strategy: 'ramped',
      feedback: fb as Feedback,
    });

    console.log('📋 Generated warmup plan:', plan);

    // 5) Persist plan snapshot used by UI
    await supabase.from('workout_exercises')
      .update({
        warmup_plan: plan,
        warmup_updated_at: new Date().toISOString(),
      })
      .eq('id', p.workoutExerciseId);

    console.log('✅ Updated warmup plan for', targetWeight, 'kg successfully');
    return plan;
  } catch (error) {
    console.error('❌ Error updating warmup for workout:', error);
    throw error;
  }
}