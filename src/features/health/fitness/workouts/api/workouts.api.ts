import { supabase } from '@/integrations/supabase/client';

export type UUID = string;

export async function startWorkout(templateId?: UUID | null): Promise<UUID> {
  const { data, error } = await supabase.rpc('start_workout', {
    p_template_id: templateId ?? null,
  });
  if (error) throw new Error(`start_workout failed: ${error.message}`);
  return data as UUID;
}

export async function getWorkout(workoutId: UUID) {
  const { data, error } = await supabase
    .from('workouts')
    .select('id, user_id, template_id, started_at, ended_at, readiness_score')
    .eq('id', workoutId)
    .single();
  if (error) throw new Error(`getWorkout error: ${error.message}`);
  return data;
}

export async function getWorkoutExercises(workoutId: UUID) {
  const { data, error } = await supabase
    .from('workout_exercises')
    .select(`
      id, workout_id, exercise_id, order_index,
      target_sets, target_reps, target_weight_kg, weight_unit,
      rest_seconds, notes, grip_key,
      exercises:exercise_id ( id, slug, display_name )
    `)
    .eq('workout_id', workoutId)
    .order('order_index', { ascending: true });
  if (error) throw new Error(`getWorkoutExercises error: ${error.message}`);
  return data;
}

export async function getPrevForExercise(workoutId: UUID, exerciseId: UUID) {
  // last completed working set (your schema may have views; this is safe fallback)
  const { data, error } = await supabase
    .from('workout_sets')
    .select('weight_kg, reps, completed_at')
    .in('workout_exercise_id',
      supabase
        .from('workout_exercises')
        .select('id')
        .eq('workout_id', workoutId) as any
    )
    .order('completed_at', { ascending: false })
    .limit(1);
  if (error) throw new Error(`getPrevForExercise error: ${error.message}`);
  return data?.[0] ?? null;
}

export async function getSmartTargetForExercise(workoutId: UUID, exerciseId: UUID) {
  // For now, return a fallback warmup structure until the RPC is created
  // TODO: Create compute_initial_target RPC function
  try {
    const { data, error } = await supabase.rpc('fn_suggest_warmup', {
      p_exercise_id: exerciseId,
      p_working_weight: 60, // default working weight
    });
    if (error) throw error;
    
    // Transform the data to match expected structure
    return {
      target_weight_kg: 60,
      target_reps: 8,
      warmup: (data as any)?.warmup_sets || []
    };
  } catch (error) {
    // Fallback warmup if RPC fails
    return {
      target_weight_kg: 60,
      target_reps: 8,
      warmup: [
        { weight_kg: 24, reps: 12, rest_s: 60 },
        { weight_kg: 36, reps: 9, rest_s: 90 },
        { weight_kg: 48, reps: 6, rest_s: 120 }
      ]
    };
  }
}

export async function logSet(payload: {
  workout_exercise_id: UUID,
  set_index: number,
  weight_kg: number,
  reps: number,
  rpe?: number | null,
}) {
  const { data, error } = await supabase
    .from('workout_sets')
    .insert({
      workout_exercise_id: payload.workout_exercise_id,
      set_index: payload.set_index,
      weight_kg: payload.weight_kg,
      reps: payload.reps,
      rpe: payload.rpe ?? null,
      completed_at: new Date().toISOString(),
    })
    .select('id')
    .single();
  if (error) throw new Error(`logSet error: ${error.message}`);
  return data.id as UUID;
}