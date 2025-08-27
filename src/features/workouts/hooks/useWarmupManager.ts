import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WarmupPlan, WarmupFeedback } from '../types/warmup-unified';

export const useWarmupManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recomputeWarmup = useCallback(async (opts: {
    workoutExerciseId: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use the new database function to recalculate warmup
      const { error: rpcError } = await supabase
        .rpc('recalc_warmup_from_last_set', {
          p_workout_exercise_id: opts.workoutExerciseId
        });

      if (rpcError) throw rpcError;

      // Fetch the updated warmup plan
      const { data: workoutExercise, error: fetchError } = await supabase
        .from('workout_exercises')
        .select('warmup_plan')
        .eq('id', opts.workoutExerciseId)
        .single();

      if (fetchError) throw fetchError;

      return workoutExercise.warmup_plan as unknown as WarmupPlan;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to recompute warmup';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveFeedback = useCallback(async (opts: {
    workoutExerciseId: string;
    feedback: WarmupFeedback;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      // Save feedback and trigger warmup recalculation
      const { error: updateError } = await supabase
        .from('workout_exercises')
        .update({
          warmup_feedback: opts.feedback
        })
        .eq('id', opts.workoutExerciseId);

      if (updateError) throw updateError;

      // Recalculate warmup with new feedback
      await recomputeWarmup({ workoutExerciseId: opts.workoutExerciseId });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save warmup feedback';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [recomputeWarmup]);

  return {
    recomputeWarmup,
    saveFeedback,
    isLoading,
    error
  };
};