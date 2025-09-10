import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WarmupPlan, WarmupFeedback } from '../types/warmup-unified';
import { useSmartWarmup } from './useSmartWarmup';

export const useWarmupManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getWarmupSetsCount } = useSmartWarmup();

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
      console.log('🔍 useWarmupManager: Saving feedback:', opts);
      
      // Save feedback and trigger warmup recalculation
      const { error: updateError } = await supabase
        .from('workout_exercises')
        .update({
          warmup_feedback: opts.feedback,
          warmup_feedback_at: new Date().toISOString()
        })
        .eq('id', opts.workoutExerciseId);

      if (updateError) {
        console.error('❌ useWarmupManager: Update error:', updateError);
        throw updateError;
      }

      console.log('✅ useWarmupManager: Feedback saved successfully');

      // Recalculate warmup with new feedback
      await recomputeWarmup({ workoutExerciseId: opts.workoutExerciseId });

      return true;
    } catch (err) {
      console.error('❌ useWarmupManager: Error in saveFeedback:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save warmup feedback';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [recomputeWarmup]);

  const getSmartWarmupSetsCount = useCallback(async (workoutExerciseId: string) => {
    try {
      console.log('🔥 useWarmupManager: Getting smart warmup sets count for:', workoutExerciseId);
      const setsCount = await getWarmupSetsCount(workoutExerciseId);
      console.log('✅ useWarmupManager: Smart warmup sets count:', setsCount);
      return setsCount;
    } catch (err) {
      console.error('❌ useWarmupManager: Error getting smart warmup count:', err);
      return 3; // Fallback to default
    }
  }, [getWarmupSetsCount]);

  return {
    recomputeWarmup,
    saveFeedback,
    getSmartWarmupSetsCount,
    isLoading,
    error
  };
};