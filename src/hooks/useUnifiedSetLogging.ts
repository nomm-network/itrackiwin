import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toCanonicalKg, createWeightData, type WeightData } from '@/lib/weightConversion';
import { useBodyweight } from './useBodyweight';

interface LogSetParams {
  workoutExerciseId: string;
  setIndex?: number;
  metrics: {
    reps?: number;
    weight?: number;
    duration_seconds?: number;
    distance?: number;
    rpe?: number;
    notes?: string;
    effort: 'reps' | 'time' | 'distance' | 'calories';
  };
  gripIds?: string[];
}

export const useUnifiedSetLogging = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logSet = useCallback(async ({ workoutExerciseId, setIndex, metrics, gripIds }: LogSetParams) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get next set index if not provided
      const finalSetIndex = setIndex || await getNextSetIndex(workoutExerciseId);

      // Core payload for workout_sets
      const payload: any = {
        workout_exercise_id: workoutExerciseId,
        set_index: finalSetIndex,
        reps: metrics.reps,
        weight_kg: metrics.weight,
        input_weight: metrics.weight,
        input_unit: 'kg',
        duration_seconds: metrics.duration_seconds,
        distance: metrics.distance,
        rpe: metrics.rpe,
        notes: metrics.notes || '',
        load_meta: {},
        is_completed: true,
        completed_at: new Date().toISOString(),
        set_kind: 'normal' as const
      };

      console.log('🔍 Unified Set Logging payload:', payload);

      const { data: insertedSet, error: insertError } = await supabase
        .from('workout_sets')
        .insert(payload)
        .select('id')
        .single();

      if (insertError) {
        console.error('❌ Set insert failed:', insertError);
        throw insertError;
      }

      console.log('✅ Set logged successfully:', insertedSet.id);

      // Handle grips if provided (non-blocking)
      if (gripIds && gripIds.length > 0 && insertedSet.id) {
        const gripInserts = gripIds.map(gripId => ({
          workout_set_id: insertedSet.id,
          grip_id: gripId
        }));

        const { error: gripError } = await supabase
          .from('workout_set_grips')
          .insert(gripInserts);

        if (gripError) {
          console.warn('⚠️ Grips insert failed (non-blocking):', gripError);
        } else {
          console.log('✅ Grips logged successfully');
        }
      }

      // Async PR update (non-blocking)
      if (metrics.weight && metrics.reps) {
        updatePersonalRecord(workoutExerciseId, metrics.weight, metrics.reps).catch(err => {
          console.warn('⚠️ PR update failed (non-blocking):', err);
        });
      }

      return { success: true, setId: insertedSet.id };
    } catch (err) {
      console.error('❌ Unified set logging error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to log set';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    logSet,
    isLoading,
    error
  };
};

// Helper functions
async function getNextSetIndex(workoutExerciseId: string): Promise<number> {
  const { data, error } = await supabase
    .from('workout_sets')
    .select('set_index')
    .eq('workout_exercise_id', workoutExerciseId)
    .order('set_index', { ascending: false })
    .limit(1);

  if (error) throw error;
  return (data?.[0]?.set_index || 0) + 1;
}

async function updatePersonalRecord(workoutExerciseId: string, weight: number, reps: number) {
  // Get exercise info for PR context
  const { data: exerciseInfo } = await supabase
    .from('workout_exercises')
    .select('exercise_id, workout_id, workouts!inner(user_id)')
    .eq('id', workoutExerciseId)
    .single();

  if (!exerciseInfo) return;

  // Upsert PR (this can fail silently if constraints are violated)
  await supabase
    .from('personal_records')
    .upsert({
      user_id: exerciseInfo.workouts.user_id,
      exercise_id: exerciseInfo.exercise_id,
      kind: 'weight_reps',
      value: weight,
      reps: reps,
      achieved_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,exercise_id,kind,grip_key',
      ignoreDuplicates: false
    });
}