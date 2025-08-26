import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WarmupPlan, WarmupFeedback, GymConfig } from '../types/warmup';
import { computeWarmupPlan, roundWarmupToGym } from '../utils/warmupPlanner';

export const useWarmupManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recomputeWarmup = useCallback(async (opts: {
    workoutExerciseId: string;
    workingWeight: number;
    mainRepRange: [number, number];
    feedback?: WarmupFeedback;
    gym: GymConfig;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      // Compute new warmup plan
      const plan = computeWarmupPlan({
        workingWeight: opts.workingWeight,
        mainRepRange: opts.mainRepRange,
        feedback: opts.feedback,
        gym: opts.gym
      });

      // Apply gym rounding
      const roundedPlan = roundWarmupToGym(plan, opts.gym);

      // Update in database
      const { error: updateError } = await supabase
        .from('workout_exercises')
        .update({ 
          warmup_plan: roundedPlan as any,
          warmup_updated_at: new Date().toISOString()
        })
        .eq('id', opts.workoutExerciseId);

      if (updateError) throw updateError;

      return roundedPlan;
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
    existingPlan?: WarmupPlan;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedPlan = opts.existingPlan ? {
        ...opts.existingPlan,
        tuned_from_feedback: opts.feedback
      } : null;

      const { error: updateError } = await supabase
        .from('workout_exercises')
        .update({
          warmup_feedback: opts.feedback,
          ...(updatedPlan && { warmup_plan: updatedPlan as any })
        })
        .eq('id', opts.workoutExerciseId);

      if (updateError) throw updateError;

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save warmup feedback';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    recomputeWarmup,
    saveFeedback,
    isLoading,
    error
  };
};