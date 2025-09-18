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
  load_mode?: string; // For validation purposes
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
      // Defensive validation (mirror form validation)
      if (options.metrics.effort === 'reps' && !options.metrics.reps) {
        throw new Error('Reps required for reps-based effort');
      }
      
      if (options.metrics.effort === 'time' && !options.metrics.duration_seconds) {
        throw new Error('Duration required for time-based effort');
      }
      
      if (options.metrics.effort === 'distance' && !options.metrics.distance) {
        throw new Error('Distance required for distance-based effort');
      }
      
      // Load mode validation is handled at the form level
      // The hook focuses on data mapping and basic effort validation

      // Build payload matching exact DB column names
      const payload: Record<string, any> = {
        workout_exercise_id: options.workoutExerciseId,
        set_index: options.setIndex,
        is_completed: true
      };

      // Map metrics to exact DB columns
      if (options.metrics.reps !== undefined) {
        payload.reps = options.metrics.reps;
      }
      
      if (options.metrics.duration_seconds !== undefined) {
        payload.duration_seconds = options.metrics.duration_seconds;
      }
      
      if (options.metrics.distance !== undefined) {
        payload.distance = options.metrics.distance;
      }
      
      if (options.metrics.weight !== undefined) {
        payload.weight_kg = options.metrics.weight; // Important: weight_kg, not weight
        payload.input_weight = options.metrics.weight; // Raw input value
        payload.input_unit = options.metrics.weight_unit || 'kg'; // UI echo
      }
      
      if (options.metrics.effort) {
        payload.effort = options.metrics.effort;
      }
      
      if (options.metrics.rpe !== undefined) {
        payload.rpe = options.metrics.rpe;
      }
      
      if (options.metrics.rest_seconds !== undefined) {
        payload.rest_seconds = options.metrics.rest_seconds;
      }
      
      if (options.metrics.notes) {
        payload.notes = options.metrics.notes;
      }
      
      // JSON fields - always send objects, never null
      payload.settings = options.metrics.settings || {};
      payload.load_meta = options.metrics.load_meta || {}; // NOT NULL constraint
      
      // Add grip handling if provided
      if (options.gripIds && options.gripIds.length > 0) {
        payload.grip_ids = options.gripIds;
      }

      // Use the set_log RPC function which handles the insert
      const { data: setId, error: rpcError } = await supabase.rpc('set_log', {
        p_payload: payload
      });

      if (rpcError) throw rpcError;

      // Trigger PR upsert after successful set insert (only for weight + reps)
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