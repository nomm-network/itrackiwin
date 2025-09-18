import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toCanonicalKg, createWeightData, type WeightData } from '@/lib/weightConversion';

interface SetMetrics {
  weight?: number;
  weight_unit?: 'kg' | 'lb';
  reps?: number;
  rpe?: number;
  duration_seconds?: number;
  distance?: number;
  notes?: string;
  effort?: string;
  settings?: Record<string, any>;
  load_meta?: Record<string, any>;
  rest_seconds?: number;
}

interface UnifiedSetLogOptions {
  workoutExerciseId: string;
  setIndex: number;
  metrics: SetMetrics;
  gripIds?: string[];
}

export const useUnifiedSetLogging = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logSet = useCallback(async (options: UnifiedSetLogOptions) => {
    setIsLoading(true);
    setError(null);

    try {
      // Normalize metrics to match database schema
      const normalizedMetrics: Record<string, any> = {};
      
      if (options.metrics.weight !== undefined) {
        const weightData = createWeightData(
          options.metrics.weight, 
          options.metrics.weight_unit || 'kg'
        );
        normalizedMetrics.weight = { number: weightData.weight_kg };
        normalizedMetrics.input_weight = { number: weightData.input_weight };
        normalizedMetrics.input_unit = { text: weightData.input_unit };
      }
      
      if (options.metrics.reps !== undefined) {
        normalizedMetrics.reps = { number: options.metrics.reps };
      }
      
      if (options.metrics.rpe !== undefined) {
        normalizedMetrics.rpe = { number: options.metrics.rpe };
      }
      
      if (options.metrics.duration_seconds !== undefined) {
        normalizedMetrics.duration_seconds = { number: options.metrics.duration_seconds };
      }
      
      if (options.metrics.distance !== undefined) {
        normalizedMetrics.distance = { number: options.metrics.distance };
      }
      
      if (options.metrics.notes) {
        normalizedMetrics.notes = { text: options.metrics.notes };
      }

      if (options.metrics.effort) {
        normalizedMetrics.effort = { text: options.metrics.effort };
      }

      if (options.metrics.settings) {
        normalizedMetrics.settings = { jsonb: options.metrics.settings };
      }

      if (options.metrics.load_meta !== undefined) {
        normalizedMetrics.load_meta = { jsonb: options.metrics.load_meta };
      }

      if (options.metrics.rest_seconds !== undefined) {
        normalizedMetrics.rest_seconds = { number: options.metrics.rest_seconds };
      }

      // Use the unified set logging function
      const { data: setId, error: rpcError } = await supabase.rpc('log_workout_set', {
        p_workout_exercise_id: options.workoutExerciseId,
        p_set_index: options.setIndex,
        p_metrics: normalizedMetrics,
        p_grip_ids: options.gripIds || null
      });

      if (rpcError) throw rpcError;

      // Trigger PR upsert after successful set insert
      if (options.metrics.weight && options.metrics.reps) {
        await upsertPersonalRecord({
          workoutExerciseId: options.workoutExerciseId,
          weight: options.metrics.weight,
          weightUnit: options.metrics.weight_unit || 'kg',
          reps: options.metrics.reps,
          gripIds: options.gripIds
        });
      }

      return setId;
    } catch (err) {
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

async function upsertPersonalRecord(options: {
  workoutExerciseId: string;
  weight: number;
  weightUnit: 'kg' | 'lb';
  reps: number;
  gripIds?: string[];
}) {
  // Get workout context
  const { data: workoutExercise, error: fetchError } = await supabase
    .from('workout_exercises')
    .select(`
      exercise_id,
      grip_key,
      workout:workouts!inner(user_id)
    `)
    .eq('id', options.workoutExerciseId)
    .single();

  if (fetchError || !workoutExercise) return;

  const userId = workoutExercise.workout.user_id;
  const exerciseId = workoutExercise.exercise_id;
  const gripKey = options.gripIds?.sort().join(',') || '';
  
  // Convert weight to canonical kg for comparison
  const weightKg = toCanonicalKg(options.weight, options.weightUnit);
  const estimated1RM = weightKg * (1 + options.reps / 30);

  // Upsert PRs with proper conflict resolution
  const prUpserts = [
    {
      user_id: userId,
      exercise_id: exerciseId,
      kind: 'heaviest',
      value: weightKg,
      unit: 'kg',
      grip_key: gripKey,
      achieved_at: new Date().toISOString()
    },
    {
      user_id: userId,
      exercise_id: exerciseId,
      kind: 'reps',
      value: options.reps,
      unit: 'reps',
      grip_key: gripKey,
      achieved_at: new Date().toISOString()
    },
    {
      user_id: userId,
      exercise_id: exerciseId,
      kind: '1RM',
      value: estimated1RM,
      unit: 'kg',
      grip_key: gripKey,
      achieved_at: new Date().toISOString()
    }
  ];

  for (const pr of prUpserts) {
    await supabase
      .from('personal_records')
      .upsert(pr, {
        onConflict: 'user_id,exercise_id,kind,grip_key',
        ignoreDuplicates: false
      });
  }
}